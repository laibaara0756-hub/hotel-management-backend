import express from "express";
import staffController from "../controllers/staffController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// =====================================================
// CREATE STAFF
// POST /api/staff
// =====================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  staffController.createStaff
);

// =====================================================
// GET ALL STAFF
// GET /api/staff
// =====================================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager", "housekeeping", "guest"),
  staffController.getStaff
);

// =====================================================
// GET SINGLE STAFF
// GET /api/staff/:id
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  staffController.getStaffById
);

// =====================================================
// UPDATE STAFF
// PUT /api/staff/:id
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  staffController.updateStaff
);

// =====================================================
// DEACTIVATE STAFF
// DELETE /api/staff/:id
//
// IMPORTANT:
// Database se staff DELETE nahi hoga.
// Sirf isActive = false hoga.
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  staffController.deactivateStaff
);

// =====================================================
// ACTIVATE STAFF
// PUT /api/staff/:id/activate
//
// isActive = true
// =====================================================

router.put(
  "/:id/activate",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  staffController.activateStaff
);

export default router;