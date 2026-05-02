import express from "express";
import {
  createBlog,
  deleteBlog,
  getBlogBySlug,
  getBlogs,
  updateBlog,
} from "../controllers/blog.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(getBlogs).post(protect, createBlog);
router.get("/slug/:slug", getBlogBySlug);
router.route("/:id").patch(protect, updateBlog).delete(protect, deleteBlog);

export default router;
