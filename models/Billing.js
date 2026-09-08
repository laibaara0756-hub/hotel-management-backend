import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },

    roomRate: {
      type: Number,
      required: true,
    },

    durationOfStay: {
      type: Number,
      required: true,
    },

    roomCharges: {
      type: Number,
      required: true,
    },

    additionalServices: [
      {
        name: {
          type: String,
          required: true,
        },

        amount: {
          type: Number,
          required: true,
        },
      },
    ],

    additionalServicesTotal: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Billing", billingSchema);