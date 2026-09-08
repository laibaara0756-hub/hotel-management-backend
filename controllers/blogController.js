import Blog from "../models/Blog.js";

// ===============================
// GET ALL BLOGS
// ===============================
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      isPublished: true,
    })
      .populate(
        "roomId",
        "roomNumber roomType image pricePerNight capacity beds size"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      blogs,
    });
  } catch (error) {
    console.log("Get blogs error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch blogs",
    });
  }
};

// ===============================
// GET SINGLE BLOG
// ===============================
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "roomId",
      "roomNumber roomType image pricePerNight capacity beds size"
    );

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      status: "success",
      blog,
    });
  } catch (error) {
    console.log("Get blog error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch blog",
    });
  }
};

// ===============================
// CREATE BLOG
// ===============================
const createBlog = async (req, res) => {
  try {
    const {
      title,
      category,
      date,
      excerpt,
      roomId,
      isPublished,
    } = req.body;

    if (!title || !category || !date || !excerpt || !roomId) {
      return res.status(400).json({
        status: "error",
        message: "Title, category, date, excerpt and room are required",
      });
    }

    const blog = await Blog.create({
      title,
      category,
      date,
      excerpt,
      roomId,
      isPublished:
        typeof isPublished === "boolean" ? isPublished : true,
    });

    const populatedBlog = await Blog.findById(blog._id).populate(
      "roomId",
      "roomNumber roomType image pricePerNight capacity beds size"
    );

    return res.status(201).json({
      status: "success",
      message: "Blog created successfully",
      blog: populatedBlog,
    });
  } catch (error) {
    console.log("Create blog error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to create blog",
    });
  }
};

// ===============================
// UPDATE BLOG
// ===============================
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "roomId",
      "roomNumber roomType image pricePerNight capacity beds size"
    );

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.log("Update blog error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update blog",
    });
  }
};

// ===============================
// DELETE BLOG
// ===============================
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.log("Delete blog error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete blog",
    });
  }
};

export default {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
