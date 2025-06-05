import express from "express";
import { verifyToken } from "../Middleware/Auth.js";
import {
  createTask,
  getTasks,
  changeTaskStatus,
  deleteTask,
} from "../Controllers/TacheController.js";

const router = express.Router();

router.get("/lister", verifyToken, getTasks);
router.post("/creer", verifyToken, createTask);
router.put("/edit/:id", verifyToken, changeTaskStatus);
router.delete("/delete/:id", verifyToken, deleteTask);

export default router;
