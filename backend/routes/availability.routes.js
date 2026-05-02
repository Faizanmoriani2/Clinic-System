import express from "express";
import {
  generateNextThirtyDays,
  getAvailability,
} from "../controllers/availability.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAvailability);
router.post("/generate-next-30-days", protect, generateNextThirtyDays);

export default router;
