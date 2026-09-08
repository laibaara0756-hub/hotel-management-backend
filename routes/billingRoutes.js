import express from "express";
import billingController from "../controllers/billingController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// Create Bill
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager", "receptionist"),
  billingController.createBilling
);


// Get All Bills
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager", "receptionist", "guest"),
  billingController.getBillings
);


// Get Invoice
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager", "receptionist", "guest"),
  billingController.getInvoice
);


// Update Payment Status
router.put(
  "/:id/payment",
  authMiddleware,
  roleMiddleware("admin", "manager", "receptionist"),
  billingController.updatePayment
);


// Send Invoice Email to Guest (Added)
router.post(
  "/:id/email",
  authMiddleware,
  roleMiddleware("admin", "manager", "receptionist"),
  billingController.emailInvoice // Make sure this controller function exists in billingController.js
);


// Delete Invoice (Added)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  billingController.deleteBilling // Make sure this controller function exists in billingController.js
);


export default router;