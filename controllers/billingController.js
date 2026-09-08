import Billing from "../models/Billing.js";
import Reservation from "../models/Reservation.js";
import GuestService from "../models/GuestService.js";
import sendEmail from "../utils/sendEmail.js";

// =====================================================
// CREATE BILL (Auto-fetches completed guest services)
// =====================================================

const createBilling = async (req, res) => {
  try {
    const {
      reservation,
      additionalServices = [],
    } = req.body;

    if (!reservation) {
      return res.status(400).json({
        status: "error",
        message: "Reservation is required",
      });
    }

    const existingBilling =
      await Billing.findOne({
        reservation,
      });

    if (existingBilling) {
      return res.status(400).json({
        status: "error",
        message:
          "Bill already exists for this reservation.",
        billing: existingBilling,
      });
    }

    const data =
      await Reservation.findById(
        reservation
      )
        .populate("room")
        .populate("guest");

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Reservation not found",
      });
    }

    if (!data.room) {
      return res.status(404).json({
        status: "error",
        message:
          "Room not found for this reservation",
      });
    }

    const checkIn =
      new Date(data.checkIn);

    const checkOut =
      new Date(data.checkOut);

    const durationOfStay = Math.ceil(
      (checkOut - checkIn) /
        (1000 * 60 * 60 * 24)
    );

    if (durationOfStay <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid stay duration",
      });
    }

    const roomRate =
      Number(data.room.pricePerNight);

    if (
      Number.isNaN(roomRate) ||
      roomRate < 0
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid room price",
      });
    }

    const roomCharges =
      roomRate * durationOfStay;

    // =================================================
    // AUTO-FETCH COMPLETED SERVICES FROM GUEST SERVICES
    // =================================================
    const completedServices = await GuestService.find({
      reservation: reservation,
      $or: [
        { status: { $regex: /^completed$/i } },
        { serviceStatus: { $regex: /^completed$/i } }
      ]
    });

    const fetchedServices = completedServices.map(s => ({
      name: s.serviceType || s.description || "Service",
      amount: Number(s.price || s.amount || 500)
    }));

    const combinedServices = [...additionalServices, ...fetchedServices];

    let additionalServicesTotal = 0;

    if (Array.isArray(combinedServices)) {
      combinedServices.forEach(
        (service) => {
          additionalServicesTotal +=
            Number(service.amount || 0);
        }
      );
    }

    const totalAmount =
      roomCharges +
      additionalServicesTotal;

    const billing =
      await Billing.create({
        reservation,
        roomRate,
        durationOfStay,
        roomCharges,
        additionalServices: combinedServices,
        additionalServicesTotal,
        totalAmount,
        paymentStatus: "Pending",
      });

    return res.status(201).json({
      status: "success",
      message:
        "Bill Generated Successfully!",
      billing,
    });
  } catch (error) {
    console.log(
      "CREATE BILL ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Billing Failed",
    });
  }
};

// =====================================================
// GET ALL BILLING RECORDS (Dynamically syncs services)
// =====================================================

const getBillings = async (req, res) => {
  try {
    let billings = [];

    if (
      req.user.role === "admin" ||
      req.user.role === "manager" ||
      req.user.role === "receptionist"
    ) {
      billings =
        await Billing.find()
          .populate({
            path: "reservation",
            populate: [
              {
                path: "guest",
                select: "-password",
              },
              {
                path: "room",
              },
            ],
          })
          .sort({
            createdAt: -1,
          });
    } else if (req.user.role === "guest") {
      const guestId = req.user._id || req.user.id;

      const allBills = await Billing.find()
        .populate({
          path: "reservation",
          populate: [
            { path: "guest", select: "-password" },
            { path: "room" },
          ],
        })
        .sort({ createdAt: -1 });

      billings = allBills.filter(b => {
        const resGuestId = 
          b.reservation?.guest?._id?.toString() || 
          b.reservation?.guest?.toString();
        
        const directGuestId = b.guest?.toString();

        return (
          resGuestId === guestId?.toString() || 
          directGuestId === guestId?.toString()
        );
      });
    }

    for (let billing of billings) {
      if (billing.reservation && billing.reservation._id) {
        const completedServices = await GuestService.find({
          reservation: billing.reservation._id,
          $or: [
            { status: { $regex: /^completed$/i } },
            { serviceStatus: { $regex: /^completed$/i } }
          ]
        });

        const fetchedServices = completedServices.map(s => ({
          name: s.serviceType || s.description || "Service",
          amount: Number(s.price || s.amount || 500)
        }));

        if (fetchedServices.length > 0) {
          let additionalServicesTotal = 0;
          fetchedServices.forEach(s => {
            additionalServicesTotal += Number(s.amount || 0);
          });
          billing.additionalServices = fetchedServices;
          billing.additionalServicesTotal = additionalServicesTotal;
          billing.totalAmount = (billing.roomCharges || 0) + additionalServicesTotal;
        }
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Billing List",
      billings,
    });
  } catch (error) {
    console.log(
      "GET BILLINGS ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        "Billing Fetch Failed",
    });
  }
};

// =====================================================
// GET SINGLE INVOICE
// =====================================================

const getInvoice = async (req, res) => {
  try {
    let billing = await Billing.findById(
      req.params.id
    ).populate({
      path: "reservation",
      populate: [
        {
          path: "guest",
          select: "-password",
        },
        {
          path: "room",
        },
      ],
    });

    if (!billing) {
      return res.status(404).json({
        status: "error",
        message: "Invoice not found",
      });
    }

    if (!billing.reservation) {
      return res.status(400).json({
        status: "error",
        message:
          "Reservation not found for this invoice",
      });
    }

    if (req.user.role === "guest") {
      const invoiceGuestId =
        billing.reservation.guest?._id?.toString();

      const loggedInGuestId =
        req.user._id?.toString();

      if (
        !invoiceGuestId ||
        !loggedInGuestId ||
        invoiceGuestId !== loggedInGuestId
      ) {
        return res.status(403).json({
          status: "error",
          message:
            "You are not authorized to view this invoice",
        });
      }
    }

    const completedServices = await GuestService.find({
      reservation: billing.reservation._id,
      $or: [
        { status: { $regex: /^completed$/i } },
        { serviceStatus: { $regex: /^completed$/i } }
      ]
    });

    const fetchedServices = completedServices.map(s => ({
      name: s.serviceType || s.description || "Service",
      amount: Number(s.price || s.amount || 500)
    }));

    let additionalServicesTotal = 0;
    fetchedServices.forEach(s => {
      additionalServicesTotal += Number(s.amount || 0);
    });

    billing.additionalServices = fetchedServices;
    billing.additionalServicesTotal = additionalServicesTotal;
    billing.totalAmount = (billing.roomCharges || 0) + additionalServicesTotal;

    return res.status(200).json({
      status: "success",
      message: "Invoice Details",

      invoice: {
        _id: billing._id,
        reservation:
          billing.reservation?._id || null,
        guest:
          billing.reservation?.guest || null,
        room:
          billing.reservation?.room || null,
        checkIn:
          billing.reservation?.checkIn || null,
        checkOut:
          billing.reservation?.checkOut || null,
        roomRate:
          billing.roomRate || 0,
        durationOfStay:
          billing.durationOfStay || 0,
        roomCharges:
          billing.roomCharges || 0,
        additionalServices:
          billing.additionalServices || [],
        additionalServicesTotal:
          billing.additionalServicesTotal || 0,
        totalAmount:
          billing.totalAmount || 0,
        paymentStatus:
          billing.paymentStatus || "Pending",
        createdAt:
          billing.createdAt || null,
      },
    });
  } catch (error) {
    console.error(
      "GET INVOICE ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Invoice Fetch Failed",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE PAYMENT STATUS
// =====================================================

const updatePayment = async (req, res) => {
  try {
    const {
      paymentStatus,
    } = req.body;

    if (
      !paymentStatus ||
      !["Pending", "Paid"].includes(
        paymentStatus
      )
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Payment status must be Pending or Paid",
      });
    }

    const billing =
      await Billing.findByIdAndUpdate(
        req.params.id,
        {
          paymentStatus,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!billing) {
      return res.status(404).json({
        status: "error",
        message:
          "Bill not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message:
        "Payment Updated Successfully!",
      billing,
    });
  } catch (error) {
    console.log(
      "UPDATE PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        "Payment Update Failed",
    });
  }
};

// =====================================================
// EMAIL INVOICE (Integrated with Nodemailer)
// =====================================================

const emailInvoice = async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id).populate({
      path: "reservation",
      populate: [
        { path: "guest", select: "email firstName lastName name" },
        { path: "room" }
      ]
    });

    if (!billing) {
      return res.status(404).json({
        status: "error",
        message: "Invoice not found",
      });
    }

    const guest = billing.reservation?.guest;
    const guestEmail = guest?.email;

    if (!guestEmail) {
      return res.status(400).json({
        status: "error",
        message: "No email address found for this guest",
      });
    }

    const guestName = guest.firstName || guest.name || "Valued Guest";
    const roomTitle = billing.reservation?.room?.title || billing.reservation?.room?.roomNumber || "Luxury Room";
    
    // HTML Email Template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #c5a059; text-align: center;">LuxuryStay Hospitality</h2>
        <p>Dear <b>${guestName}</b>,</p>
        <p>Here is your invoice summary for your stay with us:</p>
        
        <hr style="border: none; border-top: 1px solid #eee;" />
        
        <p><b>Room:</b> ${roomTitle}</p>
        <p><b>Room Charges:</b> $${billing.roomCharges || 0}</p>
        <p><b>Additional Services Total:</b> $${billing.additionalServicesTotal || 0}</p>
        <h3>Total Amount: $${billing.totalAmount || 0}</h3>
        <p><b>Payment Status:</b> <span style="color: ${billing.paymentStatus === 'Paid' ? 'green' : 'orange'};">${billing.paymentStatus}</span></p>
        
        <hr style="border: none; border-top: 1px solid #eee;" />
        
        <p style="text-align: center; color: #777; font-size: 12px;">Thank you for choosing LuxuryStay Hospitality. We hope to see you again!</p>
      </div>
    `;

    // Send email using utility
    const isSent = await sendEmail({
      to: guestEmail,
      subject: `Your Invoice Details - LuxuryStay`,
      html: emailHtml,
      text: `Hello ${guestName}, Your total bill amount is $${billing.totalAmount}. Payment Status: ${billing.paymentStatus}. Thank you for staying with LuxuryStay.`
    });

    if (!isSent) {
      return res.status(500).json({
        status: "error",
        message: "Failed to send email via SMTP",
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Invoice successfully sent to ${guestEmail}!`,
    });
  } catch (error) {
    console.log("EMAIL INVOICE ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to send invoice email",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE BILLING
// =====================================================

const deleteBilling = async (req, res) => {
  try {
    const billing = await Billing.findByIdAndDelete(req.params.id);

    if (!billing) {
      return res.status(404).json({
        status: "error",
        message: "Bill not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Invoice deleted successfully!",
    });
  } catch (error) {
    console.log("DELETE BILLING ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete invoice",
    });
  }
};

export default {
  createBilling,
  getBillings,
  getInvoice,
  updatePayment,
  emailInvoice,
  deleteBilling,
};