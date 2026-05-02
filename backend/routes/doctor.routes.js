import express from "express";
import {
  createDoctor,
  deleteDoctor,
  getDoctor,
  getDoctors,
  updateDoctor,
} from "../controllers/doctor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(getDoctors).post(protect, createDoctor);
router.route("/:id").get(getDoctor).patch(protect, updateDoctor).delete(protect, deleteDoctor);

export default router;
