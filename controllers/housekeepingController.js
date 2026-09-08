import Housekeeping from "../models/Housekeeping.js";
import Maintenance from "../models/Maintenance.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

// =====================================================
// CREATE HOUSEKEEPING TASK
// =====================================================

const createHousekeeping = async (req, res) => {
  try {
    const {
      room,
      assignedStaff,
      cleaningDate,
      cleaningTime,
      priority,
      notes,
      isMaintenanceIssue,
      issueType,
      maintenanceDescription,
      maintenanceStaff,
    } = req.body;

    if (!room) {
      return res.status(400).json({
        success: false,
        message: "Room is required",
      });
    }

    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    let housekeeping = await Housekeeping.findOne({
      room,
      status: { $in: ["Pending", "In Progress"] },
    });

    const isHousekeepingUser = req.user && req.user.role === "housekeeping";

    if (housekeeping && (isHousekeepingUser || isMaintenanceIssue)) {
      housekeeping.isMaintenanceIssue = true;
      if (notes) housekeeping.notes = notes;
      if (priority) housekeeping.priority = priority;
      await housekeeping.save();
    } else {
      if (!assignedStaff && !isMaintenanceIssue) {
        return res.status(400).json({
          success: false,
          message: "Assigned staff, cleaning date and cleaning time are required",
        });
      }

      let targetStaffId = assignedStaff;
      if (isHousekeepingUser && maintenanceStaff) {
        targetStaffId = maintenanceStaff;
      }

      if (targetStaffId) {
        const staff = await User.findById(targetStaffId);
        if (!staff) {
          return res.status(404).json({ success: false, message: "Staff member not found" });
        }
        if (!staff.isActive) {
          return res.status(400).json({ success: false, message: "Selected staff member is inactive" });
        }
      }

      housekeeping = await Housekeeping.create({
        room,
        assignedStaff: isMaintenanceIssue ? null : targetStaffId,
        cleaningDate: cleaningDate || new Date(),
        cleaningTime: cleaningTime || "12:00",
        priority: priority || "Medium",
        notes: notes || "",
        isMaintenanceIssue: isMaintenanceIssue || isHousekeepingUser,
        status: "Pending",
      });
    }

    if ((isMaintenanceIssue || isHousekeepingUser) && !housekeeping.maintenanceReference) {
      const reporter = req.user ? await User.findById(req.user.id) : null;
      
      const maintenanceRecord = await Maintenance.create({
        roomNumber: roomExists.roomNumber || roomExists._id.toString(),
        issueType: issueType || "Other",
        description: maintenanceDescription || notes || "Maintenance issue reported via housekeeping",
        reportedBy: reporter ? reporter.name : "Housekeeping Staff",
        assignedStaff: maintenanceStaff || assignedStaff || null,
        priority: priority || housekeeping.priority || "Medium",
        status: "Pending",
      });

      housekeeping.maintenanceReference = maintenanceRecord._id;
      await housekeeping.save();
    }

    const populatedTask = await Housekeeping.findById(housekeeping._id)
      .populate("room")
      .populate("assignedStaff", "-password")
      .populate("maintenanceReference");

    return res.status(201).json({
      success: true,
      message: "Housekeeping and maintenance task handled successfully",
      data: populatedTask,
    });
  } catch (error) {
    console.log("CREATE HOUSEKEEPING ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// GET ALL HOUSEKEEPING TASKS
// =====================================================

const getHousekeeping = async (req, res) => {
  try {
    let filter = {};

    if (req.user && req.user.role === "housekeeping") {
      filter.assignedStaff = req.user.id;
    }

    const housekeeping = await Housekeeping.find(filter)
      .populate("room")
      .populate("assignedStaff", "-password")
      .populate("maintenanceReference")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: housekeeping.length,
      data: housekeeping,
    });
  } catch (error) {
    console.log("GET HOUSEKEEPING ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// GET SINGLE HOUSEKEEPING TASK
// =====================================================

const getHousekeepingById = async (req, res) => {
  try {
    const housekeeping = await Housekeeping.findById(req.params.id)
      .populate("room")
      .populate("assignedStaff", "-password")
      .populate("maintenanceReference");

    if (!housekeeping) {
      return res.status(404).json({ success: false, message: "Housekeeping task not found" });
    }

    if (
      req.user &&
      req.user.role === "housekeeping" &&
      housekeeping.assignedStaff?._id?.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this task",
      });
    }

    return res.status(200).json({ success: true, data: housekeeping });
  } catch (error) {
    console.log("GET HOUSEKEEPING BY ID ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// UPDATE HOUSEKEEPING TASK
// =====================================================

const updateHousekeeping = async (req, res) => {
  try {
    const housekeeping = await Housekeeping.findById(req.params.id);

    if (!housekeeping) {
      return res.status(404).json({ success: false, message: "Housekeeping task not found" });
    }

    if (req.user && req.user.role === "housekeeping") {
      if (housekeeping.assignedStaff && housekeeping.assignedStaff.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update your assigned housekeeping tasks",
        });
      }

      const allowedFields = ["status", "notes", "isMaintenanceIssue", "issueType", "maintenanceDescription"];
      const requestedFields = Object.keys(req.body);

      const invalidField = requestedFields.find((field) => !allowedFields.includes(field));

      if (invalidField) {
        return res.status(403).json({
          success: false,
          message: "Housekeeping staff can only update status, notes and maintenance details",
        });
      }
    }

    const newStatus = req.body.status;
    if (newStatus && !["Pending", "In Progress", "Completed"].includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Invalid housekeeping status" });
    }

    if (req.body.status !== undefined) housekeeping.status = req.body.status;
    if (req.body.notes !== undefined) housekeeping.notes = req.body.notes;
    
    if (req.body.isMaintenanceIssue !== undefined) {
      housekeeping.isMaintenanceIssue = req.body.isMaintenanceIssue;
    }

    if (
      req.user &&
      ["admin", "manager", "receptionist"].includes(req.user.role)
    ) {
      if (req.body.room !== undefined) {
        const roomExists = await Room.findById(req.body.room);
        if (!roomExists) return res.status(404).json({ success: false, message: "Room not found" });
        housekeeping.room = req.body.room;
      }

      if (req.body.assignedStaff !== undefined) {
        const staff = await User.findById(req.body.assignedStaff);
        if (!staff || !staff.isActive) {
          return res.status(400).json({ success: false, message: "Invalid or inactive staff member" });
        }
        
        if (housekeeping.isMaintenanceIssue && staff.role !== "maintenance") {
          return res.status(400).json({ success: false, message: "Maintenance issues can only be assigned to maintenance staff" });
        }
        if (!housekeeping.isMaintenanceIssue && staff.role !== "housekeeping") {
          return res.status(400).json({ success: false, message: "Housekeeping tasks can only be assigned to housekeeping staff" });
        }

        housekeeping.assignedStaff = housekeeping.isMaintenanceIssue ? null : req.body.assignedStaff;
      }

      if (req.body.cleaningDate !== undefined) housekeeping.cleaningDate = req.body.cleaningDate;
      if (req.body.cleaningTime !== undefined) housekeeping.cleaningTime = req.body.cleaningTime;
      if (req.body.priority !== undefined) {
        if (!["Low", "Medium", "High"].includes(req.body.priority)) {
          return res.status(400).json({ success: false, message: "Invalid priority" });
        }
        housekeeping.priority = req.body.priority;
      }
    }

    await housekeeping.save();

    if (housekeeping.isMaintenanceIssue && !housekeeping.maintenanceReference) {
      const roomInfo = await Room.findById(housekeeping.room);
      const staffInfo = req.body.assignedStaff ? await User.findById(req.body.assignedStaff) : (req.user ? await User.findById(req.user.id) : null);

      const maintenanceRecord = await Maintenance.create({
        roomNumber: roomInfo ? roomInfo.roomNumber : housekeeping.room.toString(),
        issueType: req.body.issueType || "Other",
        description: req.body.maintenanceDescription || housekeeping.notes || "Maintenance required",
        reportedBy: staffInfo ? staffInfo.name : "Staff",
        assignedStaff: req.body.assignedStaff || null,
        priority: housekeeping.priority,
        status: "Pending",
      });

      housekeeping.maintenanceReference = maintenanceRecord._id;
      await housekeeping.save();
    } 
    else if (!housekeeping.isMaintenanceIssue && housekeeping.maintenanceReference) {
      await Maintenance.findByIdAndDelete(housekeeping.maintenanceReference);
      housekeeping.maintenanceReference = null;
      await housekeeping.save();
    }

    const room = await Room.findById(housekeeping.room);
    if (room) {
      if (housekeeping.status === "Completed") {
        room.status = "Available";
        await room.save();
      } else if (["In Progress", "Pending"].includes(housekeeping.status)) {
        if (room.status !== "Occupied" && room.status !== "Maintenance") {
          room.status = "Cleaning";
          await room.save();
        }
      }
    }

    const updatedHousekeeping = await Housekeeping.findById(housekeeping._id)
      .populate("room")
      .populate("assignedStaff", "-password")
      .populate("maintenanceReference");

    return res.status(200).json({
      success: true,
      message: "Housekeeping task updated successfully",
      data: updatedHousekeeping,
    });
  } catch (error) {
    console.log("UPDATE HOUSEKEEPING ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// DELETE HOUSEKEEPING TASK
// =====================================================

const deleteHousekeeping = async (req, res) => {
  try {
    const housekeeping = await Housekeeping.findById(req.params.id);
    if (!housekeeping) {
      return res.status(404).json({ success: false, message: "Housekeeping task not found" });
    }

    if (req.user && req.user.role === "housekeeping") {
      return res.status(403).json({ success: false, message: "Housekeeping staff cannot delete tasks" });
    }

    if (housekeeping.maintenanceReference) {
      await Maintenance.findByIdAndDelete(housekeeping.maintenanceReference);
    }

    await Housekeeping.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Housekeeping task deleted successfully" });
  } catch (error) {
    console.log("DELETE HOUSEKEEPING ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  createHousekeeping,
  getHousekeeping,
  getHousekeepingById,
  updateHousekeeping,
  deleteHousekeeping,
};