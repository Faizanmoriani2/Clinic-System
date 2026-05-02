import express from "express";
import { getPatientByPhone, getPatients } from "../controllers/patient.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getPatients);
router.get("/phone/:phone", protect, getPatientByPhone);

export default router;
