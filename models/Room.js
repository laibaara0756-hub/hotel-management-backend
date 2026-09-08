import mongoose from "mongoose";

const roomSchema = mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    roomType: {
      type: String,
      enum: [
        "Single",
        "Double",
        "Deluxe",
        "Suite",
      ],
      required: true,
    },

    size: {
      type: String,
      enum: [
        "38 m²",
        "42 m²",
        "45 m²",
        "68 m²",
        "75 m²",
        "140 m²",
      ],
      required: true,
    },

    // Beds ko bhi enum bana diya gaya hai
    beds: {
      type: String,
      enum: [
        "1 Single Bed",
        "2 Single Beds",
        "1 Queen Bed",
        "1 King Bed",
        "1 King + Sofa Bed",
        "1 King + 2 Singles",
      ],
      required: true,
    },

    pricePerNight: {
      type: Number,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
    },

    floor: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Available",
        "Reserved",
        "Occupied",
        "Cleaning",
        "Maintenance",
      ],
      default: "Available",
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Room", roomSchema);