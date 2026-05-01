import express from "express";
import {
  createClinic,
  deleteClinic,
  getClinic,
  getClinics,
  updateClinic,
} from "../controllers/clinic.controller.js";

const router = express.Router();

router.route("/").get(getClinics).post(createClinic);
router.route("/:id").get(getClinic).patch(updateClinic).delete(deleteClinic);

export default router;
