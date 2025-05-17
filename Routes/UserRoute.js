import express from "express";
import {
  afficherAccueil,
  inscrireUtilisateur,
  loginUtilisateur,
} from "../Controllers/UserController.js";

const router = express.Router();

router.get("/", afficherAccueil);
router.post("/signup", inscrireUtilisateur);
router.post("/login", loginUtilisateur);

export default router;
