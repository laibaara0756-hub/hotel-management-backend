import express from "express";

import maintenanceController from "../controllers/maintenanceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  updateMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
} = maintenanceController;

const router = express.Router();

// =====================================================
// CREATE MAINTENANCE REQUEST
// Admin / Manager / Receptionist / Maintenance / Housekeeping / Guest
// =====================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist",
    "maintenance",
    "housekeeping",
    "guest" // <-- Guest ko yahan add kar diya gaya hai
  ),
  createMaintenance
);

// =====================================================
// GET ALL MAINTENANCE REQUESTS
// Admin / Manager / Maintenance / Housekeeping / Guest
// =====================================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "maintenance",
    "housekeeping",
    "guest" // <-- Guest ko yahan bhi add kiya hai taake wo apni tickets dekh sakein
  ),
  getMaintenance
);

// =====================================================
// GET SINGLE MAINTENANCE REQUEST
// Admin / Manager / Maintenance / Guest
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "maintenance",
    "guest" // <-- Guest apne specific ticket ki detail dekh sake
  ),
  getMaintenanceById
);

// =====================================================
// UPDATE MAINTENANCE
// Admin / Manager / Maintenance
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "maintenance"
  ),
  updateMaintenance
);

// =====================================================
// UPDATE STATUS
// Pending → In Progress → Resolved
// =====================================================

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "maintenance"
  ),
  updateMaintenanceStatus
);

// =====================================================
// DELETE
// Admin / Manager only
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager"
  ),
  deleteMaintenance
);

export default router;