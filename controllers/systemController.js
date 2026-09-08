import SystemSetting from "../models/SystemSetting.js";
import Room from "../models/Room.js";
import Reservation from "../models/Reservation.js";

// =====================================================
// GET SETTINGS
// =====================================================
const getSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();

    if (!settings) {
      settings = await SystemSetting.create({
        hotelName: "LuxuryStay Hospitality",
        taxRate: 10,
        currency: "USD",
        checkInTime: "14:00",
        checkOutTime: "12:00",
        yearsOfService: 5,
        guestSatisfaction: 98,
        happyGuestsBase: 1200,
        aboutTitle: "Hospitality Built Around The Guest, Not The Building",
        aboutDescription: "LuxuryStay Hospitality began with a single property and a short list of promises: answer quickly, remember preferences, and never make a guest ask twice. Eighteen years later the list has not changed, only the number of properties keeping it.",
        historyText: "Today our teams run a modern hotel management platform behind the scenes, tracking room status, housekeeping tasks, maintenance requests and billing in real time, so what the guest experiences is simply a stay that works.",
      });
    }

    return res.status(200).json({
      status: "success",
      settings,
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE SETTINGS
// =====================================================
const updateSettings = async (req, res) => {
  try {
    const {
      hotelName,
      taxRate,
      currency,
      checkInTime,
      checkOutTime,
      yearsOfService,
      guestSatisfaction,
      happyGuestsBase,
      aboutTitle,
      aboutDescription,
      historyText,
      deluxeKing,
      executiveSuite,
      premierTwin,
      coupleRetreat,
      familyGardenSuite,
      presidentialSuite,
      serviceCharge,
      cityLevy,
    } = req.body;

    if (!hotelName || !hotelName.trim()) {
      return res.status(400).json({ status: "error", message: "Hotel name is required" });
    }

    if (taxRate === undefined || taxRate === null || taxRate === "" || Number.isNaN(Number(taxRate))) {
      return res.status(400).json({ status: "error", message: "Valid tax rate is required" });
    }

    let settings = await SystemSetting.findOne();

    if (!settings) {
      settings = new SystemSetting({
        hotelName: hotelName.trim(),
        taxRate: Number(taxRate),
        currency: currency?.trim() || "USD",
        checkInTime: checkInTime || "14:00",
        checkOutTime: checkOutTime || "12:00",
        yearsOfService: yearsOfService !== undefined ? Number(yearsOfService) : 5,
        guestSatisfaction: guestSatisfaction !== undefined ? Number(guestSatisfaction) : 98,
        happyGuestsBase: happyGuestsBase !== undefined ? Number(happyGuestsBase) : 1200,
        aboutTitle: aboutTitle || "Hospitality Built Around The Guest, Not The Building",
        aboutDescription: aboutDescription || "LuxuryStay Hospitality began with a single property and a short list of promises: answer quickly, remember preferences, and never make a guest ask twice. Eighteen years later the list has not changed, only the number of properties keeping it.",
        historyText: historyText || "Today our teams run a modern hotel management platform behind the scenes, tracking room status, housekeeping tasks, maintenance requests and billing in real time, so what the guest experiences is simply a stay that works.",
        deluxeKing: Number(deluxeKing) || 189,
        executiveSuite: Number(executiveSuite) || 349,
        premierTwin: Number(premierTwin) || 159,
        coupleRetreat: Number(coupleRetreat) || 219,
        familyGardenSuite: Number(familyGardenSuite) || 289,
        presidentialSuite: Number(presidentialSuite) || 690,
        serviceCharge: Number(serviceCharge) || 45,
        cityLevy: Number(cityLevy) || 2,
      });
    } else {
      settings.hotelName = hotelName.trim();
      settings.taxRate = Number(taxRate);
      if (currency) settings.currency = currency.trim();
      if (checkInTime) settings.checkInTime = checkInTime;
      if (checkOutTime) settings.checkOutTime = checkOutTime;
      if (yearsOfService !== undefined) settings.yearsOfService = Number(yearsOfService);
      if (guestSatisfaction !== undefined) settings.guestSatisfaction = Number(guestSatisfaction);
      if (happyGuestsBase !== undefined) settings.happyGuestsBase = Number(happyGuestsBase);
      if (aboutTitle) settings.aboutTitle = aboutTitle;
      if (aboutDescription) settings.aboutDescription = aboutDescription;
      if (historyText) settings.historyText = historyText;
      if (deluxeKing !== undefined) settings.deluxeKing = Number(deluxeKing);
      if (executiveSuite !== undefined) settings.executiveSuite = Number(executiveSuite);
      if (premierTwin !== undefined) settings.premierTwin = Number(premierTwin);
      if (coupleRetreat !== undefined) settings.coupleRetreat = Number(coupleRetreat);
      if (familyGardenSuite !== undefined) settings.familyGardenSuite = Number(familyGardenSuite);
      if (presidentialSuite !== undefined) settings.presidentialSuite = Number(presidentialSuite);
      if (serviceCharge !== undefined) settings.serviceCharge = Number(serviceCharge);
      if (cityLevy !== undefined) settings.cityLevy = Number(cityLevy);
    }

    await settings.save();

    return res.status(200).json({
      status: "success",
      message: "System Settings Updated Successfully!",
      settings,
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// =====================================================
// GET STATS (Dynamic Counter Stats from Database)
// =====================================================
const getStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const totalReservations = await Reservation.countDocuments();
    
    let settings = await SystemSetting.findOne();
    const years = settings?.yearsOfService ?? 5;
    const satisfaction = settings?.guestSatisfaction ?? 98;
    const baseHappy = settings?.happyGuestsBase ?? 1200;

    const happyGuestsCount = totalReservations > 0 ? totalReservations + baseHappy : baseHappy;

    const stats = [
      { label: "Luxury Rooms", value: totalRooms > 0 ? totalRooms : 6, suffix: "+" },
      { label: "Years Of Service", value: years, suffix: "+" },
      { label: "Guest Satisfaction", value: satisfaction, suffix: "%" },
      { label: "Happy Guests", value: happyGuestsCount, suffix: "+" }
    ];

    return res.status(200).json({
      status: "success",
      stats,
    });
  } catch (error) {
    console.error("GET STATS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export default {
  getSettings,
  updateSettings,
  getStats,
};