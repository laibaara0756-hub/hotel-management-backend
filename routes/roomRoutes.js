import express from "express";
import roomController from "../controllers/roomController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../config/upload.js";

const router = express.Router();

// Get All Rooms (PUBLIC - Bina login ke koi bhi dekh sakta hai)
router.get(
    "/",
    roomController.getRooms
);

// Get Single Room (PUBLIC - Agar single room detail bhi public rakhni ho)
router.get(
    "/:id",
    roomController.getRoomById
);

// Create Room (Protected - Sirf Admin aur Manager ke liye)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    upload.single("image"),
    roomController.createRoom
);

// Update Room (Protected - Sirf Admin aur Manager ke liye)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    upload.single("image"),
    roomController.updateRoom
);

// Delete Room (Protected - Sirf Admin aur Manager ke liye)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    roomController.deleteRoom
);

export default router;