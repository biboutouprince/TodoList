import express from "express";
import { verifyToken } from "../Middleware/Auth.js";
import {
  creerTache,
  listerTaches,
  modifierTache,
  supprimerTache,
} from "../Controllers/TacheController.js";

const router = express.Router();

router.get("/", verifyToken, listerTaches);
router.post("/creer", verifyToken, creerTache);
router.put("/edit/:id", verifyToken, modifierTache);
router.delete("/delete/:id", verifyToken, supprimerTache);

export default router;
