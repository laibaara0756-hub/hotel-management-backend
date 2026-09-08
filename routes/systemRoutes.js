import express from "express";
import systemController from "../controllers/systemController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public route for homepage statistics (No Auth required)
router.get("/stats", systemController.getStats);

// Public route for Get Settings (No Auth required, so About page & website can fetch titles/stats)
router.get("/", systemController.getSettings);

// Update Settings (Admin only - Protected)
router.put(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  systemController.updateSettings
);

export default router;