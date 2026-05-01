import express from "express";
import {
  createBlog,
  deleteBlog,
  getBlogBySlug,
  getBlogs,
  updateBlog,
} from "../controllers/blog.controller.js";

const router = express.Router();

router.route("/").get(getBlogs).post(createBlog);
router.get("/slug/:slug", getBlogBySlug);
router.route("/:id").patch(updateBlog).delete(deleteBlog);

export default router;
