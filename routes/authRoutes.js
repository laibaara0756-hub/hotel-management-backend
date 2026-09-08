import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", authController.Signup);
router.post("/login", authController.Login);

export default router;