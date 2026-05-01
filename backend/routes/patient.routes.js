import express from "express";
import { getPatientByPhone, getPatients } from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/", getPatients);
router.get("/phone/:phone", getPatientByPhone);

export default router;
