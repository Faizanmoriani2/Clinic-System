import express from "express";
import {
  generateNextThirtyDays,
  getAvailability,
} from "../controllers/availability.controller.js";

const router = express.Router();

router.get("/", getAvailability);
router.post("/generate-next-30-days", generateNextThirtyDays);

export default router;
