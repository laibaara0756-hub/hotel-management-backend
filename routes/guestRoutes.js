import express from "express";
import guestController from "../controllers/guestController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// =====================================================
// CREATE GUEST PROFILE
// =====================================================
router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist"
  ),
  guestController.createGuest
);

// =====================================================
// GET ALL GUEST PROFILES
// =====================================================
router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist",
    "guest"
  ),
  guestController.getGuests
);

// =====================================================
// GET REGISTERED GUEST USERS
// WHO DON'T HAVE A GUEST PROFILE YET
//
// IMPORTANT:
// Ye route /:id se pehle hona chahiye.
// =====================================================
router.get(
  "/available-users",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist"
  ),
  guestController.getAvailableGuestUsers
);

// =====================================================
// GET SINGLE GUEST PROFILE
// =====================================================
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist"
  ),
  guestController.getGuest
);

// =====================================================
// UPDATE GUEST PROFILE
// =====================================================
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist"
  ),
  guestController.updateGuest
);

// =====================================================
// DELETE GUEST PROFILE
// =====================================================
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager"
  ),
  guestController.deleteGuest
);

export default router;
