import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    // Guest ka login User account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    // Contact Information
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Guest Details
    nationality: {
      type: String,
      trim: true,
      default: "",
    },

    preferences: {
      type: String,
      trim: true,
      default: "",
    },

    // Guest Profile Active/Inactive
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Guest", guestSchema);
