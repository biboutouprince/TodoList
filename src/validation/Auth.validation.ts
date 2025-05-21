// src/validation/auth.validation.ts
import { body } from "express-validator";

export const signupValidator = [
  body("nom").notEmpty().withMessage("Le nom est requis"),

  body("email").isEmail().withMessage("Email invalide"),

  body("password")
    .isLength({ min: 4 })
    .withMessage("Le mot de passe doit contenir au moins 4 caractères"),

  body("role")
    .optional()
    .isIn(["ADMIN", "USER"])
    .withMessage("Le rôle doit être soit ADMIN soit USER"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Email invalide"),

  body("password").notEmpty().withMessage("Le mot de passe est requis"),
];
