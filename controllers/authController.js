import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ==================== LOGIN ====================

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and Password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        status: "error",
        message:
          "Your account has been deactivated. Please contact the administrator.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid Password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Login response
    return res.status(200).json({
      status: "success",
      message: "Login Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// ==================== SIGNUP ====================
const Signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 8 characters long",
      });
    }

    // Check existing user
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    // Hash password
    const passwordHashed = await bcrypt.hash(password, 10);

    // Create Guest user
    const newUser = await User.create({
      name,
      email,
      password: passwordHashed,
      phone,
      role: "guest",
    });

    // Signup response
    return res.status(201).json({
      status: "success",
      message: "User Registered Successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// ==================== EXPORT ====================

export default {
  Login,
  Signup,
};