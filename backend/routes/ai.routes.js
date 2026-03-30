import express from "express";
import {
  startPlan,
  continuePlan,
  handlePrompt,
  getMemoryController,
  deleteMemoryController

} from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
console.log("test333")
router.post("/start", protect ,startPlan);
router.post("/chat", protect, continuePlan);
router.post("/agent", protect, handlePrompt);
router.get("/memory", protect, getMemoryController);
router.delete("/memory", protect, deleteMemoryController);
export default router;