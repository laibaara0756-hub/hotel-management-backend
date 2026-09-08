
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import housekeepingRoutes from "./routes/housekeepingRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import guestServiceRoutes from "./routes/guestServiceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// ==================== MIDDLEWARE ====================
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, new Error("CORS policy error: Origin not allowed."));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ==================== DATABASE & MIDDLEWARE ====================
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ==================== HEALTH / ROOT ROUTE ====================
app.get("/", async (req, res) => {
  await connectDB();

  const dbStatusMap = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };

  const dbState = mongoose.connection.readyState;
  const dbStatus = dbStatusMap[dbState] || "Unknown";

  res.status(200).json({
    status: "success",
    message: "Hotel Management System Backend API is running",
    server: {
      status: "Running",
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
    },
    database: {
      status: dbStatus,
      connected: dbState === 1,
    },
  });
});

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/housekeeping", housekeepingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/guest-services", guestServiceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", systemRoutes);

// ==================== NEWSLETTER ====================
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/blogs", blogRoutes);

// ==================== SERVER ====================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

