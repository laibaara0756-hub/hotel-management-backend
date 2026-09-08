import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
      default: "LuxuryStay Hospitality",
    },
    taxRate: {
      type: Number,
      required: true,
      default: 10,
    },
    currency: {
      type: String,
      default: "USD",
    },
    checkInTime: {
      type: String,
      default: "14:00",
    },
    checkOutTime: {
      type: String,
      default: "12:00",
    },
    yearsOfService: {
      type: Number,
      default: 5,
    },
    guestSatisfaction: {
      type: Number,
      default: 98,
    },
    happyGuestsBase: {
      type: Number,
      default: 1200,
    },
    // About Page Dynamic Text Fields (New Additions)
    aboutTitle: {
      type: String,
      default: "Hospitality Built Around The Guest, Not The Building",
    },
    aboutDescription: {
      type: String,
      default: "LuxuryStay Hospitality began with a single property and a short list of promises: answer quickly, remember preferences, and never make a guest ask twice. Eighteen years later the list has not changed, only the number of properties keeping it.",
    },
    historyText: {
      type: String,
      default: "Today our teams run a modern hotel management platform behind the scenes, tracking room status, housekeeping tasks, maintenance requests and billing in real time, so what the guest experiences is simply a stay that works.",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SystemSetting", systemSettingSchema);