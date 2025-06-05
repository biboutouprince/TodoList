import express from "express";
import {
  afficherAccueil,
  register,
  login,
  logout,
  requestResetPassword,
  resetPassword,
  getCurrentUser,
} from "../Controllers/UserController.js";
import { verifyToken } from "../Middleware/Auth.js";

const router = express.Router();

router.get("/", afficherAccueil);
router.post("/signup", register);
router.post("/login", login);
router.get("/me", verifyToken, getCurrentUser);
router.post("/logout", logout);
router.post("/request-reset-password", requestResetPassword);
router.post("/reset-password", resetPassword);

export default router;
