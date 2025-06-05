import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET non défini dans les variables d'environnement.");
}

//Page d’accueil utilisateur
export const afficherAccueil = (req, res) => {
  res.status(200).json({
    message: "Bienvenue sur la plateforme",
    actions: ["Inscription", "Connexion"],
  });
};

//Inscription utilisateur (admin ou user)
export const register = async (req, res) => {
  const { nom, email, password, role } = req.body;

  try {
    if (!nom || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const emailLowerCase = email.toLowerCase();
    const utilisateurExiste = await prisma.User.findUnique({
      where: { email: emailLowerCase },
    });

    if (utilisateurExiste) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà." });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const nouvelUtilisateur = await prisma.User.create({
      data: {
        nom,
        email: emailLowerCase,
        password: hashedPassword,
        role: role?.toUpperCase() === "ADMIN" ? "ADMIN" : "USER", // Sécurisation du rôle
      },
    });

    res.status(201).json({
      message: "Utilisateur inscrit avec succès",
      utilisateur: nouvelUtilisateur,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur", error: error.toString() });
  }
};

//Connexion utilisateur (admin ou user)
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const utilisateur = await prisma.User.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (
      !utilisateur ||
      !(await bcryptjs.compare(password, utilisateur.password))
    ) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      {
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 3600000,
    });

    res.status(200).json({
      message: "Connexion réussie",
      token,
      role: utilisateur.role,
      user: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur", error: error.toString() });
  }
};

// Obtenir l'utilisateur actuellement connecté
export const getCurrentUser = async (req, res) => {
  try {
    const { id } = req.user;

    const utilisateur = await prisma.User.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.status(200).json({ utilisateur });
  } catch (error) {
    console.error("Erreur dans getCurrentUser:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur", error: error.toString() });
  }
};

//deconnexion utilisateur (admin ou user)
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });
  res.status(200).json({ message: "Déconnexion réussie" });
};

//demande de reinitialisation de password
export const requestResetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    const utilisateur = await prisma.User.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const resetToken = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email },
      JWT_SECRET,
      { expiresIn: "15m" } // Token temporaire
    );

    // À faire : envoyer par email
    console.log(
      `Lien de réinitialisation : http://localhost:3000/reset-password?token=${resetToken}`
    );

    res.status(200).json({
      message: "Lien de réinitialisation envoyé (simulé dans console)",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur", error: error.toString() });
  }
};

//nouveau password
export const resetPassword = async (req, res) => {
  const { token, nouveauPassword } = req.body;

  try {
    if (!token || !nouveauPassword) {
      return res
        .status(400)
        .json({ message: "Token et nouveau mot de passe requis" });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const hashedPassword = await bcryptjs.hash(nouveauPassword, 10);

    await prisma.User.update({
      where: { id: payload.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Lien expiré, veuillez recommencer" });
    }
    res
      .status(500)
      .json({ message: "Erreur serveur", error: error.toString() });
  }
};
