import Guest from "../models/Guest.js";
import User from "../models/User.js";

// =====================================================
// CREATE GUEST PROFILE
// Admin / Manager / Receptionist existing guest user
// ki profile create karega
// =====================================================
const createGuest = async (req, res) => {
  try {
    const {
      user,
      firstName,
      lastName,
      email,
      phone,
      address,
      nationality,
      preferences,
    } = req.body;

    // Required fields
    if (
      !user ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "User, First Name, Last Name, Email, Phone and Address are required",
      });
    }

    // Check user account
    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: "Guest user account not found",
      });
    }

    // Only guest users can have guest profiles
    if (
      existingUser.role?.toString().toLowerCase() !==
      "guest"
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Selected user does not have guest role",
      });
    }

    // Check if profile already exists
    const existingGuest = await Guest.findOne({
      $or: [
        {
          user: existingUser._id,
        },
        {
          email: email,
        },
      ],
    });

    if (existingGuest) {
      return res.status(400).json({
        status: "error",
        message:
          "Guest profile already exists",
      });
    }

    // Create guest profile
    const newGuest = await Guest.create({
      user: existingUser._id,
      firstName,
      lastName,
      email,
      phone,
      address,
      nationality,
      preferences,
    });

    // Populate user
    const populatedGuest =
      await Guest.findById(
        newGuest._id
      ).populate(
        "user",
        "name email phone role isActive"
      );

    return res.status(201).json({
      status: "success",
      message:
        "Guest profile created successfully",
      guest: populatedGuest,
    });
  } catch (error) {
    console.error(
      "CREATE GUEST ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        "Guest profile creation failed",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL GUEST PROFILES
// =====================================================
const getGuests = async (req, res) => {
  try {
    const guests = await Guest.find()
      .populate(
        "user",
        "name email phone role isActive"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      status: "success",
      guests,
    });
  } catch (error) {
    console.error(
      "GET GUESTS ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Guests fetch failed",
    });
  }
};

// =====================================================
// GET ALL REGISTERED GUEST USERS
//
// IMPORTANT:
//
// Reservation ke liye ye endpoint use hoga.
//
// Guest Profile bana ho ya na bana ho,
// agar User ka role "guest" hai to woh yahan aayega.
//
// Example:
//
// User:
// name: mudabbir ali
// email: mudabbira101@gmail.com
// role: guest
//
// Ye reservation dropdown mein:
// mudabbir ali
//
// show karega.
// =====================================================
const getAvailableGuestUsers = async (
  req,
  res
) => {
  try {
    const guestUsers =
      await User.find({
        role: "guest",
        isActive: true,
      })
        .select(
          "_id name email phone role isActive"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      status: "success",
      users: guestUsers,
    });
  } catch (error) {
    console.error(
      "GET GUEST USERS ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        "Guest users fetch failed",
    });
  }
};

// =====================================================
// GET SINGLE GUEST PROFILE
// =====================================================
const getGuest = async (req, res) => {
  try {
    const guest =
      await Guest.findById(
        req.params.id
      ).populate(
        "user",
        "name email phone role isActive"
      );

    if (!guest) {
      return res.status(404).json({
        status: "error",
        message: "Guest not found",
      });
    }

    return res.status(200).json({
      status: "success",
      guest,
    });
  } catch (error) {
    console.error(
      "GET GUEST ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Guest fetch failed",
    });
  }
};

// =====================================================
// UPDATE GUEST PROFILE
// =====================================================
const updateGuest = async (req, res) => {
  try {
    const guest =
      await Guest.findByIdAndUpdate(
        req.params.id,
        {
          firstName:
            req.body.firstName,

          lastName:
            req.body.lastName,

          email:
            req.body.email,

          phone:
            req.body.phone,

          address:
            req.body.address,

          nationality:
            req.body.nationality,

          preferences:
            req.body.preferences,
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "user",
        "name email phone role isActive"
      );

    if (!guest) {
      return res.status(404).json({
        status: "error",
        message: "Guest not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message:
        "Guest updated successfully",
      guest,
    });
  } catch (error) {
    console.error(
      "UPDATE GUEST ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Guest update failed",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE GUEST PROFILE
// =====================================================
const deleteGuest = async (req, res) => {
  try {
    const guest =
      await Guest.findByIdAndDelete(
        req.params.id
      );

    if (!guest) {
      return res.status(404).json({
        status: "error",
        message: "Guest not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message:
        "Guest profile deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE GUEST ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Guest delete failed",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================
export default {
  createGuest,
  getGuests,
  getAvailableGuestUsers,
  getGuest,
  updateGuest,
  deleteGuest,
};
