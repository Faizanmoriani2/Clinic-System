import express from "express";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from "../controllers/testimonial.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(getTestimonials).post(protect, createTestimonial);
router.route("/:id").patch(protect, updateTestimonial).delete(protect, deleteTestimonial);

export default router;
