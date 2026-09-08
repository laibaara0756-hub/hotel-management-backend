import Maintenance from "../models/Maintenance.js";

// =====================================================
// CREATE MAINTENANCE REQUEST
// =====================================================

const createMaintenance = async (req, res) => {
  try {
    const {
      roomNumber,
      issueType,
      description,
      reportedBy,
      assignedStaff,
      priority,
      estimatedCost,
    } = req.body;

    // Required fields
    if (
      !roomNumber ||
      !issueType ||
      !description ||
      !reportedBy ||
      !assignedStaff
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Room number, issue type, description, reported by and assigned staff are required",
      });
    }

    const maintenance = await Maintenance.create({
      roomNumber,
      issueType,
      description,
      reportedBy,
      assignedStaff,
      priority: priority || "Medium",
      estimatedCost: Number(estimatedCost) || 0,
      status: "Pending",
      resolutionNotes: "",
    });

    return res.status(201).json({
      success: true,
      message:
        "Maintenance request created successfully",
      data: maintenance,
    });
  } catch (error) {
    console.log(
      "CREATE MAINTENANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL MAINTENANCE REQUESTS
// =====================================================

const getMaintenance = async (req, res) => {
  try {
    const maintenance =
      await Maintenance.find().sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: maintenance.length,
      data: maintenance,
    });
  } catch (error) {
    console.log(
      "GET MAINTENANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE MAINTENANCE REQUEST
// =====================================================

const getMaintenanceById = async (
  req,
  res
) => {
  try {
    const maintenance =
      await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message:
          "Maintenance request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    console.log(
      "GET MAINTENANCE BY ID ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE MAINTENANCE
// =====================================================

const updateMaintenance = async (
  req,
  res
) => {
  try {
    const maintenance =
      await Maintenance.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message:
          "Maintenance request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Maintenance request updated successfully",
      data: maintenance,
    });
  } catch (error) {
    console.log(
      "UPDATE MAINTENANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE MAINTENANCE STATUS
// Pending → In Progress → Resolved
// =====================================================

const updateMaintenanceStatus = async (
  req,
  res
) => {
  try {
    const {
      status,
      resolutionNotes,
    } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Resolved",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid maintenance status",
      });
    }

    const maintenance =
      await Maintenance.findById(
        req.params.id
      );

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message:
          "Maintenance request not found",
      });
    }

    // Status update
    maintenance.status = status;

    // Resolution notes save
    if (resolutionNotes !== undefined) {
      maintenance.resolutionNotes =
        resolutionNotes;
    }

    await maintenance.save();

    return res.status(200).json({
      success: true,
      message:
        "Maintenance status updated successfully",
      data: maintenance,
    });
  } catch (error) {
    console.log(
      "UPDATE MAINTENANCE STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE MAINTENANCE
// Admin / Manager
// =====================================================

const deleteMaintenance = async (
  req,
  res
) => {
  try {
    const maintenance =
      await Maintenance.findByIdAndDelete(
        req.params.id
      );

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message:
          "Maintenance request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Maintenance request deleted successfully",
    });
  } catch (error) {
    console.log(
      "DELETE MAINTENANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  updateMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
};