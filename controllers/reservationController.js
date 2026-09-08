import Reservation from "../models/Reservation.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import Billing from "../models/Billing.js";

// =====================================================
// CREATE RESERVATION
// New reservation = Pending
// =====================================================

const createReservation = async (req, res) => {
  try {
    let {
      guest,
      room,
      checkIn,
      checkOut,
      paymentMethod,
    } = req.body;

    if (req.user && req.user._id) {
      if (req.user.role === "guest") {
        guest = req.user._id;
      }
    }

    if (!guest || !room || !checkIn || !checkOut) {
      return res.status(400).json({
        status: "error",
        message: "Guest, Room, Check-in and Check-out are required",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid check-in or check-out date",
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        status: "error",
        message: "Check-out date must be after check-in date",
      });
    }

    const guestUser = await User.findById(guest);

    if (!guestUser) {
      return res.status(404).json({
        status: "error",
        message: "Guest not found",
      });
    }

    if (guestUser.role !== "guest") {
      return res.status(400).json({
        status: "error",
        message: "Only guest users can make reservations.",
      });
    }

    const roomExists = await Room.findById(room);

    if (!roomExists) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    if (
      roomExists.status === "Occupied" ||
      roomExists.status === "Maintenance"
    ) {
      return res.status(400).json({
        status: "error",
        message: `Room is currently ${roomExists.status} and cannot be reserved.`,
      });
    }

    const overlappingReservation =
      await Reservation.findOne({
        room,
        status: {
          $in: ["Pending", "Confirmed", "Checked In"],
        },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      });

    if (overlappingReservation) {
      return res.status(400).json({
        status: "error",
        message: "Room is already reserved for the selected dates.",
      });
    }

    const reservation = await Reservation.create({
      guest,
      room,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      paymentMethod: paymentMethod || "Credit / Debit Card",
      status: "Pending",
    });

    return res.status(201).json({
      status: "success",
      message: "Reservation Created Successfully!",
      reservation,
    });
  } catch (error) {
    console.log("CREATE RESERVATION ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Reservation Create Failed",
    });
  }
};

// =====================================================
// GET ALL RESERVATIONS
// =====================================================

const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("guest", "-password")
      .populate("room")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      reservations,
    });
  } catch (error) {
    console.log("GET RESERVATIONS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Reservations Fetch Failed",
    });
  }
};

// =====================================================
// GET SINGLE RESERVATION
// =====================================================

const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("guest", "-password")
      .populate("room");

    if (!reservation) {
      return res.status(404).json({
        status: "error",
        message: "Reservation not found",
      });
    }

    return res.status(200).json({
      status: "success",
      reservation,
    });
  } catch (error) {
    console.log("GET RESERVATION ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Reservation Fetch Failed",
    });
  }
};

// =====================================================
// CONFIRM RESERVATION
// =====================================================

const confirmReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: "error",
        message: "Reservation not found",
      });
    }

    if (reservation.status !== "Pending") {
      return res.status(400).json({
        status: "error",
        message: "Only pending reservation can be confirmed.",
      });
    }

    const room = await Room.findById(reservation.room);

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    if (room.status === "Occupied" || room.status === "Maintenance") {
      return res.status(400).json({
        status: "error",
        message: `Room is currently ${room.status} and cannot be confirmed.`,
      });
    }

    reservation.status = "Confirmed";
    await reservation.save();

    return res.status(200).json({
      status: "success",
      message: "Reservation Confirmed Successfully!",
      reservation,
    });
  } catch (error) {
    console.log("CONFIRM RESERVATION ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Reservation Confirmation Failed",
    });
  }
};

// =====================================================
// CHECK-IN
// =====================================================

const checkInReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: "error",
        message: "Reservation not found",
      });
    }

    if (reservation.status !== "Confirmed") {
      return res.status(400).json({
        status: "error",
        message: "Only confirmed reservation can be checked in.",
      });
    }

    const room = await Room.findById(reservation.room);

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    if (room.status !== "Available") {
      return res.status(400).json({
        status: "error",
        message: `Room is currently ${room.status}. Room must be Available for check-in.`,
      });
    }

    room.status = "Occupied";
    await room.save();

    reservation.status = "Checked In";
    await reservation.save();

    return res.status(200).json({
      status: "success",
      message: "Guest Checked In Successfully!",
      reservation,
      room,
    });
  } catch (error) {
    console.log("CHECK-IN ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Check-In Failed",
    });
  }
};

// =====================================================
// CHECK-OUT
// =====================================================

const checkOutReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: "error",
        message: "Reservation not found",
      });
    }

    if (reservation.status !== "Checked In") {
      return res.status(400).json({
        status: "error",
        message: "Guest is not checked in.",
      });
    }

    const room = await Room.findById(reservation.room);

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    const checkInDate = new Date(reservation.checkIn);
    const checkOutDate = new Date(reservation.checkOut);

    const durationOfStay = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    if (durationOfStay <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid stay duration.",
      });
    }

    const roomRate = Number(room.pricePerNight);

    if (Number.isNaN(roomRate) || roomRate < 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid room price.",
      });
    }

    const roomCharges = roomRate * durationOfStay;

    let billing = await Billing.findOne({
      reservation: reservation._id,
    });

    if (!billing) {
      billing = await Billing.create({
        reservation: reservation._id,
        roomRate,
        durationOfStay,
        roomCharges,
        additionalServices: [],
        additionalServicesTotal: 0,
        totalAmount: roomCharges,
        paymentStatus: "Pending",
      });
    }

    reservation.status = "Checked Out";
    await reservation.save();

    room.status = "Cleaning";
    await room.save();

    return res.status(200).json({
      status: "success",
      message: "Guest Checked Out Successfully! Bill Generated Automatically. Room is now Cleaning.",
      reservation,
      room,
      billing,
    });
  } catch (error) {
    console.log("CHECK-OUT ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Check-Out Failed",
    });
  }
};

// =====================================================
// UPDATE RESERVATION
// =====================================================

const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: "error",
        message: "Reservation not found",
      });
    }

    if (
      reservation.status === "Checked Out" &&
      req.body.status &&
      req.body.status !== "Checked Out"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Checked Out reservation cannot be reopened.",
      });
    }

    if (
      reservation.status === "Checked In" &&
      req.body.status &&
      req.body.status !== "Checked In"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Checked In reservation must be checked out using Check-Out.",
      });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("guest", "-password")
      .populate("room");

    return res.status(200).json({
      status: "success",
      message: "Reservation Updated Successfully!",
      reservation: updatedReservation,
    });
  } catch (error) {
    console.log("UPDATE RESERVATION ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Reservation Update Failed",
    });
  }
};

// =====================================================
// DELETE RESERVATION
// =====================================================

const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: "error",
        message: "Reservation not found",
      });
    }

    if (reservation.status === "Checked In") {
      return res.status(400).json({
        status: "error",
        message: "Guest is currently checked in. Check-out first.",
      });
    }

    await Reservation.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: "success",
      message: "Reservation Deleted Successfully!",
    });
  } catch (error) {
    console.log("DELETE RESERVATION ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Reservation Delete Failed",
    });
  }
};

export default {
  createReservation,
  getReservations,
  getReservation,
  confirmReservation,
  checkInReservation,
  checkOutReservation,
  updateReservation,
  deleteReservation,
};