import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
  console.log("Headers:", req.headers);
  console.log("Cookies:", req.cookies);

  let token = null;

  //Priorité : Cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.error("Erreur: Aucun token trouvé");
    return res.status(401).json({
      message: "Accès non autorisé. Connectez-vous ! Token manquant.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erreur: Token invalide ou expiré", error);
    return res.status(403).json({ message: "Token invalide ou expiré." });
  }
};
