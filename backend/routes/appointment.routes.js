import express from "express";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointmentStatus,
} from "../controllers/appointment.controller.js";

const router = express.Router();

router.route("/").get(getAppointments).post(createAppointment);
router.route("/:id").patch(updateAppointmentStatus).delete(deleteAppointment);

export default router;
