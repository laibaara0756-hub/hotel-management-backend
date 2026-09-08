import mongoose from "mongoose";

const guestServiceSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },
    // For Additional Services
    serviceType: {
      type: String,
      enum: ["Room Service", "Wake-up Call", "Transportation", "Laundry", "Other"],
    },
    description: {
      type: String,
      trim: true,
    },
    // <-- Yahan price field add kar diya hai
    price: {
      type: Number,
      default: 0,
    },
    serviceStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    // For Feedback & Ratings
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
    isFeedback: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("GuestService", guestServiceSchema);