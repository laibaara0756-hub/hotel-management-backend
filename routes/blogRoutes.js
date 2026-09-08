import express from "express";
import blogController from "../controllers/blogController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET all blogs (PUBLIC)
router.get("/", blogController.getBlogs);

// GET single blog (PUBLIC)
router.get("/:id", blogController.getBlogById);

// CREATE blog (Protected - Sirf Admin aur Manager)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  blogController.createBlog
);

// UPDATE blog (Protected - Sirf Admin aur Manager)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  blogController.updateBlog
);

// DELETE blog (Protected - Sirf Admin aur Manager)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  blogController.deleteBlog
);

export default router;
