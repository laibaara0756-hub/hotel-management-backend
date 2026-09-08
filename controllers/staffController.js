import User from "../models/User.js";
import bcrypt from "bcrypt";

// =====================================================
// CREATE STAFF
// =====================================================

const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
    } = req.body;

    // Required fields
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !role
    ) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    // Allowed staff roles
    const staffRoles = [
      "manager",
      "receptionist",
      "housekeeping",
      "maintenance",
    ];

    if (!staffRoles.includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid staff role",
      });
    }

    // Manager cannot create another manager
    if (
      req.user &&
      req.user.role === "manager" &&
      role === "manager"
    ) {
      return res.status(403).json({
        status: "error",
        message:
          "Managers cannot create another manager. You can only create receptionist, housekeeping, or maintenance staff.",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    // Hash password
    const passwordHashed = await bcrypt.hash(
      password,
      10
    );

    // Create staff
    const staff = await User.create({
      name,
      email,
      password: passwordHashed,
      phone,
      role,
      isActive: true,
    });

    return res.status(201).json({
      status: "success",
      message: "Staff Created Successfully!",

      staff: {
        id: staff._id,
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        isActive: staff.isActive,
      },
    });
  } catch (e) {
    console.log("Create Staff Error:", e);

    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// =====================================================
// GET ALL STAFF
// =====================================================

const getStaff = async (req, res) => {
  try {
    const staff = await User.find({
      role: {
        $in: [
          "manager",
          "receptionist",
          "housekeeping",
          "maintenance",
        ],
      },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      staff,
    });
  } catch (e) {
    console.log("Get Staff Error:", e);

    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// =====================================================
// GET STAFF BY ID
// =====================================================

const getStaffById = async (req, res) => {
  try {
    const staff = await User.findById(
      req.params.id
    ).select("-password");

    if (!staff) {
      return res.status(404).json({
        status: "error",
        message: "Staff not found",
      });
    }

    return res.status(200).json({
      status: "success",
      staff,
    });
  } catch (e) {
    console.log("Get Staff By ID Error:", e);

    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// =====================================================
// UPDATE STAFF
// =====================================================

const updateStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      isActive,
    } = req.body;

    // Allowed roles
    const staffRoles = [
      "manager",
      "receptionist",
      "housekeeping",
      "maintenance",
    ];

    // Validate role
    if (
      role &&
      !staffRoles.includes(role)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid staff role",
      });
    }

    // Manager cannot change someone to manager
    if (
      req.user &&
      req.user.role === "manager" &&
      role === "manager"
    ) {
      return res.status(403).json({
        status: "error",
        message:
          "Managers cannot assign manager role.",
      });
    }

    // Data to update
    const updateData = {
      name,
      email,
      phone,
      role,
    };

    // Only update isActive if boolean was sent
    if (
      typeof isActive === "boolean"
    ) {
      updateData.isActive = isActive;
    }

    const staff =
      await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    if (!staff) {
      return res.status(404).json({
        status: "error",
        message: "Staff not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Staff Updated Successfully!",
      staff,
    });
  } catch (e) {
    console.log("Update Staff Error:", e);

    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// =====================================================
// DEACTIVATE STAFF
// =====================================================
// IMPORTANT:
// Staff database se delete nahi hoga.
// Sirf isActive false hoga.
// =====================================================

const deactivateStaff = async (req, res) => {
  try {
    const staff =
      await User.findByIdAndUpdate(
        req.params.id,
        {
          isActive: false,
        },
        {
          new: true,
        }
      ).select("-password");

    if (!staff) {
      return res.status(404).json({
        status: "error",
        message: "Staff not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message:
        "Staff Deactivated Successfully!",
      staff,
    });
  } catch (e) {
    console.log(
      "Deactivate Staff Error:",
      e
    );

    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// =====================================================
// ACTIVATE STAFF
// =====================================================

const activateStaff = async (req, res) => {
  try {
    const staff =
      await User.findByIdAndUpdate(
        req.params.id,
        {
          isActive: true,
        },
        {
          new: true,
        }
      ).select("-password");

    if (!staff) {
      return res.status(404).json({
        status: "error",
        message: "Staff not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message:
        "Staff Activated Successfully!",
      staff,
    });
  } catch (e) {
    console.log(
      "Activate Staff Error:",
      e
    );

    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

export default {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deactivateStaff,
  activateStaff,
};
