import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
  console.log("Headers:", req.headers);
  console.log("Cookies:", req.cookies);

  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    //Si pas d'Authorization header, on tente avec les cookies
    token = req.cookies.token;
  }

  if (!token) {
    console.error("Erreur: Aucun token trouvé");
    return res.status(401).json({
      message: "Accès non autorisé. Connectez-vous!. Token manquant.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    console.error("Erreur: Token invalide ou expiré", error);
    return res.status(403).json({ message: "Token invalide ou expiré." });
  }
};
