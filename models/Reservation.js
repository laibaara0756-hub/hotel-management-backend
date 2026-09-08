import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Credit / Debit Card", "Cash", "Pay At Hotel", "Bank Transfer"],
      default: "Credit / Debit Card",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Checked In",
        "Checked Out",
        "Cancelled",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Reservation", reservationSchema);