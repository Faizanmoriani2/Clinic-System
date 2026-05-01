import express from "express";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from "../controllers/testimonial.controller.js";

const router = express.Router();

router.route("/").get(getTestimonials).post(createTestimonial);
router.route("/:id").patch(updateTestimonial).delete(deleteTestimonial);

export default router;
