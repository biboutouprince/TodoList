import express from "express";
import {
  afficherAccueil,
  inscrireUtilisateur,
  loginUtilisateur,
  logoutUtilisateur,
  requestResetPassword,
  resetPassword,
} from "../Controllers/UserController.js";
import {
  signupValidator,
  loginValidator,
} from "../src/validation/Auth.validation.ts";
import { validateRequest } from "../src/middleware/ValidateRequest.ts";

const router = express.Router();

router.get("/", afficherAccueil);
router.post("/signup", signupValidator, validateRequest, inscrireUtilisateur);
router.post("/login", loginValidator, validateRequest, loginUtilisateur);
router.post("/logout", logoutUtilisateur);
router.post("/request-reset-password", requestResetPassword);
router.post("/reset-password", signupValidator, resetPassword);

export default router;
