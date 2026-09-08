import Room from "../models/Room.js";          
import Reservation from "../models/Reservation.js"; 
import Billing from "../models/Billing.js";        


const getReportAnalytics = async (req, res) => {
  try {
    
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ 
      $or: [
        { status: "Occupied" },
        { status: "Reserved" }
      ] 
    });
    const availableRooms = await Room.countDocuments({ status: "Available" });
    const cleaningRooms = await Room.countDocuments({ status: "Cleaning" });
    
    
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;

    
    const revenueData = await Billing.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    const totalReservations = await Reservation.countDocuments();
    const pendingReservations = await Reservation.countDocuments({ status: "Pending" });
    const confirmedReservations = await Reservation.countDocuments({ status: "Confirmed" });
    const checkedInReservations = await Reservation.countDocuments({ status: "Checked In" });
    const checkedOutReservations = await Reservation.countDocuments({ status: "Checked Out" });
    const cancelledReservations = await Reservation.countDocuments({ status: "Cancelled" });

    return res.status(200).json({
      status: "success",
      analytics: {
        rooms: {
          total: totalRooms,
          occupied: occupiedRooms,
          available: availableRooms,
          cleaning: cleaningRooms,
          occupancyRate: `${occupancyRate}%`
        },
        financials: {
          totalRevenue
        },
        reservations: {
          total: totalReservations,
          pending: pendingReservations,
          confirmed: confirmedReservations,
          checkedIn: checkedInReservations,
          checkedOut: checkedOutReservations,
          cancelled: cancelledReservations
        }
      }
    });

  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

export default {
  getReportAnalytics,
};