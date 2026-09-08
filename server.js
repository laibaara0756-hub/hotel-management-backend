
import express from "express";
import dotenv from "dotenv";
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
app.use(cors());
app.use(express.json());

// ==================== DATABASE ====================
connectDB();

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

