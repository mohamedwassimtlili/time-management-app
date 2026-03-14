// filepath: /home/mohamedwassim/dev/time-management-app/backend/routes/collection.routes.js
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
} from "../controllers/collection.controller.js";

const router = express.Router();

router.use(protect);

router.post("/", createCollection);
router.get("/", getCollections);
router.get("/:id", getCollectionById);
router.put("/:id", updateCollection);
router.delete("/:id", deleteCollection);

export default router;
