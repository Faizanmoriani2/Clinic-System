import express from "express";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointmentStatus,
} from "../controllers/appointment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, getAppointments).post(createAppointment);
router.route("/:id").patch(protect, updateAppointmentStatus).delete(protect, deleteAppointment);

export default router;
