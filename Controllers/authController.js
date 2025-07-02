import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import BetterAuth from "better-auth";

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const auth = new BetterAuth({
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUri: process.env.OAUTH_REDIRECT_URI,
  },
});

// Importation des modules nécessaires pour l'authentification GitHub
export const githubLogin = async (req, res) => {
  const url = auth.github.getAuthUrl();
  res.redirect(url);
};

export const githubCallback = async (req, res) => {
  try {
    const code = req.query.code;
    const githubUser = await auth.github.getUser(code);

    if (!githubUser.email) {
      return res.status(400).json({ message: "Email GitHub non accessible." });
    }

    // Vérifie si l'utilisateur existe déjà
    let user = await prisma.User.findUnique({
      where: { email: githubUser.email.toLowerCase() },
    });

    // Sinon, créer un nouvel utilisateur
    if (!user) {
      user = await prisma.User.create({
        data: {
          nom: githubUser.name || githubUser.login,
          email: githubUser.email.toLowerCase(),
          password: "", // Pas de mot de passe car social login
          role: "USER",
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    // Redirection vers le frontend
    res.redirect("http://localhost:8080");
  } catch (error) {
    console.error("Erreur GitHub OAuth:", error);
    res.status(500).json({ message: "Erreur OAuth", error: error.toString() });
  }
};

// Importation des modules nécessaires pour l'authentification Google
const authgoogle = new BetterAuth({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  },
});

export const googleLogin = async (req, res) => {
  const url = authgoogle.google.getAuthUrl({
    scope: ["profile", "email"],
  });
  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    const code = req.query.code;
    const googleUser = await authgoogle.google.getUser(code);

    if (!googleUser.email) {
      return res
        .status(400)
        .json({ message: "Impossible d'obtenir l'email Google." });
    }

    let user = await prisma.User.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    });

    if (!user) {
      user = await prisma.User.create({
        data: {
          nom: googleUser.name,
          email: googleUser.email.toLowerCase(),
          password: "", // pas de mot de passe pour social login
          role: "USER",
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    // Redirection vers le frontend
    res.redirect("http://localhost:8080");
  } catch (error) {
    console.error("Erreur Google OAuth:", error);
    res.status(500).json({ message: "Erreur OAuth", error: error.toString() });
  }
};
