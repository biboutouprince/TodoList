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
export const inscrireUtilisateur = async (req, res) => {
  const { nom, email, password, role } = req.body;

  try {
    if (!nom || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const emailLowerCase = email.toLowerCase();
    const utilisateurExiste = await prisma.user.findUnique({
      where: { email: emailLowerCase },
    });

    if (utilisateurExiste) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà." });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const nouvelUtilisateur = await prisma.user.create({
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
export const loginUtilisateur = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const utilisateur = await prisma.user.findUnique({
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.status(200).json({
      message: "Connexion réussie",
      token,
      role: utilisateur.role,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur", error: error.toString() });
  }
};
