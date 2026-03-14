import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { 
  createSession, 
  getSessions, 
  updateSession, 
  deleteSession,
  createSessions 
} from "../controllers/session.controller.js";

const router = express.Router();

router.use(protect); // Protect all routes

router.post("/", createSession);
router.get("/", getSessions);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);
router.post("/bulk", createSessions);

export default router;
