import express from "express";
import newsletterController from "../controllers/newsletterController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/subscribe",
  (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Agar token nahi hai to guest ki tarah continue karo
    if (!authHeader) {
      req.user = null;
      return next();
    }

    // Token hai to normal auth middleware se verify karo
    return authMiddleware(req, res, next);
  },
  newsletterController.subscribeNewsletter
);

export default router;
