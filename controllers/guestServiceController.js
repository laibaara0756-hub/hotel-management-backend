import Guest from "../models/Guest.js";
import User from "../models/User.js";
import GuestService from "../models/GuestService.js";
import Reservation from "../models/Reservation.js";

// =====================================================
// CREATE SERVICE REQUEST (With Auto/Custom Pricing)
// =====================================================
const createService = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: User ID not found in token",
      });
    }

    let guest = await Guest.findOne({
      user: userId,
      isActive: true,
    });

    if (!guest) {
      const userDetails = await User.findById(userId);
      const nameParts = userDetails && userDetails.name ? userDetails.name.split(" ") : ["Guest"];
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User";

      guest = await Guest.create({
        user: userId,
        firstName: firstName,
        lastName: lastName,
        email: userDetails ? userDetails.email : (req.user.email || "guest@hotel.com"),
        phone: userDetails && userDetails.phone ? userDetails.phone : "03000000000",
        address: "Karachi",
        nationality: "Pakistan",
        isActive: true,
      });
    }

    // Fixed status query to match database exact value ("Checked In" with a space)
    let reservation = await Reservation.findOne({
      guest: guest._id,
      status: { $in: ["Confirmed", "Checked In", "Checked-In", "Active", "Pending"] },
    }).sort({ createdAt: -1 });

    if (!reservation) {
      reservation = await Reservation.findOne({}).sort({ createdAt: -1 });
    }

    if (!reservation) {
      return res.status(400).json({
        status: "error",
        message: "No active reservation found. Please make a reservation first.",
      });
    }

    const { serviceType, description, category, priority, price } = req.body;

    if (!serviceType || !description) {
      return res.status(400).json({
        status: "error",
        message: "Service type and description are required",
      });
    }

    const servicePrices = {
      "Room Service": 1000,
      "Wake-up Call": 0,
      "Transportation": 1500,
      "Laundry": 800,
      "Other": 500
    };

    const finalPrice = price !== undefined ? Number(price) : (servicePrices[serviceType] || 500);

    const newService = await GuestService.create({
      guest: guest._id,
      reservation: reservation._id,
      serviceType,
      description,
      price: finalPrice,
      serviceStatus: "Pending",
      isFeedback: false,
    });

    return res.status(201).json({
      status: "success",
      message: "Service request created successfully",
      service: newService,
    });

  } catch (error) {
    console.error("CREATE SERVICE ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create service request",
      error: error.message,
    });
  }
};

// =====================================================
// SUBMIT FEEDBACK (Guaranteed Reservation Link)
// =====================================================
const submitFeedback = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { rating, review } = req.body;

    if (!rating) {
      return res.status(400).json({
        status: "error",
        message: "Rating is required",
      });
    }

    let guest = await Guest.findOne({ user: userId });
    if (!guest) {
      return res.status(404).json({
        status: "error",
        message: "Guest profile not found",
      });
    }

    let reservation = await Reservation.findOne({
      guest: guest._id,
    }).sort({ createdAt: -1 });

    if (!reservation) {
      reservation = await Reservation.findOne({}).sort({ createdAt: -1 });
    }

    if (!reservation) {
      return res.status(400).json({
        status: "error",
        message: "A reservation is required to submit feedback. Please make a booking first.",
      });
    }

    const newFeedback = await GuestService.create({
      guest: guest._id,
      reservation: reservation._id,
      rating: Number(rating),
      review: review || "",
      isFeedback: true,
      serviceStatus: "Completed",
      serviceType: "Other", 
      description: review || "User Feedback",
    });

    return res.status(201).json({
      status: "success",
      message: "Feedback submitted successfully",
      data: newFeedback,
    });
  } catch (error) {
    console.error("FEEDBACK ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL SERVICES & FEEDBACK
// =====================================================
const getAllServices = async (req, res) => {
  try {
    let query = {};
    const userId = req.user?._id || req.user?.id;
    const userRole = (req.user?.role || "").toLowerCase().trim();

    const staffRoles = ["admin", "staff", "manager", "receptionist", "frontdesk"];

    if (!staffRoles.includes(userRole)) {
      if (userId) {
        const guest = await Guest.findOne({ user: userId });
        if (guest) {
          query = { guest: guest._id };
        }
      }
    }

    const services = await GuestService.find(query)
      .populate("guest", "firstName lastName email phone")
      .populate({
        path: "reservation",
        select: "room checkIn checkOut status",
        populate: {
          path: "room",
          select: "roomNumber name type"
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      services,
      data: services,
      list: services
    });
  } catch (error) {
    console.error("GET SERVICES ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch services",
    });
  }
};

// =====================================================
// UPDATE SERVICE STATUS
// =====================================================
const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, serviceStatus } = req.body;
    const newStatus = status || serviceStatus || "Completed";

    const updatedService = await GuestService.findByIdAndUpdate(
      id,
      { serviceStatus: newStatus },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({
        status: "error",
        message: "Service request not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Service status updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update service status",
    });
  }
};

// =====================================================
// CANCEL SERVICE
// =====================================================
const cancelService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await GuestService.findById(id);

    if (!service) {
      return res.status(404).json({
        status: "error",
        message: "Service request not found",
      });
    }

    service.serviceStatus = "Cancelled";
    await service.save();

    return res.status(200).json({
      status: "success",
      message: "Service request cancelled successfully",
      service,
    });
  } catch (error) {
    console.error("CANCEL SERVICE ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to cancel service request",
    });
  }
};

export default {
  createService,
  submitFeedback,
  getAllServices,
  updateServiceStatus,
  cancelService,
};