import mongoose from "mongoose";

const housekeepingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function() {
        return !this.isMaintenanceIssue;
      },
    },

    cleaningDate: {
      type: Date,
      required: true,
    },

    cleaningTime: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
      ],
      default: "Pending",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    isMaintenanceIssue: {
      type: Boolean,
      default: false,
    },

    // Yeh field add karne se Housekeeping task direct Maintenance collection se link ho jayega
    maintenanceReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Maintenance",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Housekeeping",
  housekeepingSchema
);