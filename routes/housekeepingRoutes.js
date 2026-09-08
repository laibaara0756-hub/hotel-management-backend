import express from "express";

import housekeepingController from "../controllers/housekeepingController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// =====================================================
// CREATE HOUSEKEEPING TASK
// Admin / Manager / Housekeeping
// =====================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
   "receptionist",
   "housekeeping" 

  ),
  housekeepingController.createHousekeeping
);

// =====================================================
// GET ALL HOUSEKEEPING TASKS
// Admin / Manager / Housekeeping
// =====================================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "housekeeping"
  ),
  housekeepingController.getHousekeeping
);

// =====================================================
// GET SINGLE HOUSEKEEPING TASK
// Admin / Manager / Housekeeping
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "housekeeping"
  ),
  housekeepingController.getHousekeepingById
);

// =====================================================
// UPDATE HOUSEKEEPING TASK
// Admin / Manager / Housekeeping
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "housekeeping"
  ),
  housekeepingController.updateHousekeeping
);

// =====================================================
// DELETE HOUSEKEEPING TASK
// Admin / Manager ONLY
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager"
  ),
  housekeepingController.deleteHousekeeping
);

// =====================================================
// EXPORT
// =====================================================

export default router;
