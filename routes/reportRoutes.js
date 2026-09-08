import express from "express";
import reportController from "../controllers/reportController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// ==================== GET HOTEL REPORTS & ANALYTICS ====================
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    reportController.getReportAnalytics
);

export default router;