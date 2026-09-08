import express from "express";
import guestServiceController from "../controllers/guestServiceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create Service Request (Hits /api/guest-services/service)
router.post(
  "/service",
  authMiddleware,
  roleMiddleware("guest"),
  guestServiceController.createService
);

// Submit Feedback (Hits /api/guest-services/feedback)
router.post(
  "/feedback",
  authMiddleware,
  roleMiddleware("guest"),
  guestServiceController.submitFeedback
);

// Get All Services / Feedback (Hits /api/guest-services)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager", "receptionist", "housekeeping", "maintenance", "guest"),
  guestServiceController.getAllServices
);

// Update Service Status (Hits /api/guest-services/:id/status)
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "manager", "receptionist", "housekeeping"),
  guestServiceController.updateServiceStatus
);

// Cancel Service (Hits /api/guest-services/:id/cancel)
router.put(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("admin", "manager", "receptionist", "guest"),
  guestServiceController.cancelService
);

export default router;