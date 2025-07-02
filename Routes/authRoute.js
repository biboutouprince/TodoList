import express from "express";
import { githubLogin, githubCallback } from "../Controllers/authController.js";
import { googleLogin, googleCallback } from "../Controllers/authController.js";

const router = express.Router();

router.get("/auth/github", githubLogin);
router.get("/auth/github/callback", githubCallback);

router.get("/auth/google", googleLogin);
router.get("/auth/google/callback", googleCallback);

export default router;
