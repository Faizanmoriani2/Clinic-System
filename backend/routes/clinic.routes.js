import express from "express";
import {
  createClinic,
  deleteClinic,
  getClinic,
  getClinics,
  updateClinic,
} from "../controllers/clinic.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(getClinics).post(protect, createClinic);
router.route("/:id").get(getClinic).patch(protect, updateClinic).delete(protect, deleteClinic);

export default router;
