import Newsletter from "../models/Newsletter.js";

const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    // Email required
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        status: "error",
        message: "Please enter a valid email address",
      });
    }

    // Check duplicate email
    const existingSubscriber = await Newsletter.findOne({
      email: normalizedEmail,
    });

    if (existingSubscriber) {
      return res.status(409).json({
        status: "error",
        message: "This email is already subscribed",
      });
    }

    // Logged-in user ki ID JWT se
    const userId = req.user?.id || null;

    const subscriber = await Newsletter.create({
      email: normalizedEmail,
      userId,
    });

    return res.status(201).json({
      status: "success",
      message: "Successfully subscribed to seasonal offers!",
      subscriber: {
        id: subscriber._id,
        email: subscriber.email,
        userId: subscriber.userId,
      },
    });
  } catch (error) {
    console.log("Newsletter Subscribe Error:", error);

    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

export default {
  subscribeNewsletter,
};
