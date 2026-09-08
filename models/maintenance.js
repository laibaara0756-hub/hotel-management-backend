import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
    {
        roomNumber: {
            type: String,
            required: true
        },

        issueType: {
            type: String,
            enum: [
                "AC",
                "Plumbing",
                "Electricity",
                "Furniture",
                "Internet",
                "Other"
            ],
            required: true
        },

        description: {
            type: String,
            required: true
        },

        reportedBy: {
            type: String,
            required: true
        },

        assignedStaff: {
            type: String,
            required: true
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },

        status: {
            type: String,
            enum: ["Pending", "In Progress", "Resolved"],
            default: "Pending"
        },

        estimatedCost: {
            type: Number,
            default: 0
        },

        resolutionNotes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Maintenance", maintenanceSchema);