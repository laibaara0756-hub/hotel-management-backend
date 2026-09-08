import Room from "../models/Room.js";
import GuestService from "../models/GuestService.js";
import Reservation from "../models/Reservation.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      size,
      beds,
      pricePerNight,
      capacity,
      floor,
      status,
      description,
    } = req.body;

    if (!roomNumber || !roomType || !size || !beds || !pricePerNight || !capacity || floor === undefined) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        status: "error",
        message: "All required fields are required",
      });
    }

    const room = await Room.findOne({ roomNumber });

    if (room) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        status: "error",
        message: "Room already exists",
      });
    }

    let imageUrl = "";
    if (req.file) {
      const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: "hotel_management/rooms",
      });
      imageUrl = cloudinaryResponse.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const newRoom = await Room.create({
      roomNumber,
      roomType,
      size,
      beds,
      pricePerNight,
      capacity,
      floor,
      status,
      description,
      image: imageUrl,
    });

    res.status(201).json({
      status: "success",
      message: "Room Created Successfully!",
      room: newRoom,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.log(error);

    res.status(500).json({
      status: "error",
      message: error.message || "Server Error",
    });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();

    res.status(200).json({
      status: "success",
      rooms,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    // 1. Pehle is room ki saari reservations nikalhein
    const reservations = await Reservation.find({ room: room._id }).select("_id");
    const reservationIds = reservations.map((res) => res._id);

    // 2. Phir un reservations ke khilaaf GuestServices (feedback/reviews) dhoondein
    const reviews = await GuestService.find({
      reservation: { $in: reservationIds },
      isFeedback: true,
    }).populate("guest", "firstName lastName avatar name");

    // 3. Frontend ke mutabiq format karke bhej dein
    const formattedReviews = reviews.map((rev) => ({
      _id: rev._id,
      name: rev.guest?.firstName ? `${rev.guest.firstName} ${rev.guest.lastName || ""}` : (rev.guest?.name || "Verified Guest"),
      avatar: rev.guest?.avatar,
      rating: rev.rating,
      comment: rev.review,
      createdAt: rev.createdAt,
    }));

    res.status(200).json({
      status: "success",
      room: {
        ...room.toObject(),
        reviews: formattedReviews,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: "hotel_management/rooms",
      });
      updateData.image = cloudinaryResponse.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!room) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Room Updated Successfully!",
      room,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.log(error);

    res.status(500).json({
      status: "error",
      message: error.message || "Server Error",
    });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Room Deleted Successfully!",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

export default {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
};