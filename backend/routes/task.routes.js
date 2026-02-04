import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  createBulkTasks,
  createUserTask,
  deleteTasksByUser,
  deleteUserTask,
  DeleteAll,
  getTasksByUser,
  updateUserTask,
  createBulkUserTasks,
  deleteUserTasksByMonth
} from "../controllers/task.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`🔍 Task route hit: ${req.method} ${req.path}`);
  next();
});

// POST routes - specific paths first
router.post("/user/bulk", protect, createBulkUserTasks);
router.post("/user", protect, createUserTask);
router.post("/bulk", createBulkTasks);
router.post("/", createTask);

// GET routes - specific paths first
router.get("/user", protect, getTasksByUser);
router.get("/:id", getTaskById);
router.get("/", getTasks);

// PATCH routes - specific paths first
router.patch("/user", protect, updateUserTask);
router.patch("/:id", updateTask);

// DELETE routes - specific paths first
router.delete("/user/month/:year/:month", protect, deleteUserTasksByMonth);
router.delete("/user", protect, deleteUserTask);
router.delete("/:id", deleteTask);
router.delete("/", DeleteAll);

export default router;
