import express from "express";
import reservationController from "../controllers/reservationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// =====================================================
// CREATE RESERVATION
// =====================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist",
    "guest"
  ),
  reservationController.createReservation
);

// =====================================================
// GET ALL RESERVATIONS
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
  reservationController.getReservations
);

// =====================================================
// GET SINGLE RESERVATION
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist",
    "guest"
  ),
  reservationController.getReservation
);

// =====================================================
// UPDATE RESERVATION
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist"
  ),
  reservationController.updateReservation
);

// =====================================================
// DELETE RESERVATION
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager"
  ),
  reservationController.deleteReservation
);

// =====================================================
// CONFIRM RESERVATION
// Pending → Confirmed
// =====================================================

router.put(
  "/:id/confirm",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist"
  ),
  reservationController.confirmReservation
);

// =====================================================
// CHECK-IN
// Confirmed → Checked In
// Room → Occupied
// =====================================================

router.put(
  "/:id/checkin",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist"
  ),
  reservationController.checkInReservation
);

// =====================================================
// CHECK-OUT
// Checked In → Checked Out
// Room → Cleaning
// =====================================================

router.put(
  "/:id/checkout",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "receptionist"
  ),
  reservationController.checkOutReservation
);

export default router;
