import express from "express";
import {
  afficherAccueil,
  inscrireUtilisateur,
  loginUtilisateur,
  logoutUtilisateur,
} from "../Controllers/UserController.js";

const router = express.Router();

router.get("/", afficherAccueil);
router.post("/signup", inscrireUtilisateur);
router.post("/login", loginUtilisateur);
router.post("/logout", logoutUtilisateur);

export default router;
