import express from "express";
import {
  createScheduleRule,
  deleteScheduleRule,
  getScheduleRules,
  updateScheduleRule,
} from "../controllers/scheduleRule.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(getScheduleRules).post(protect, createScheduleRule);
router.route("/:id").patch(protect, updateScheduleRule).delete(protect, deleteScheduleRule);

export default router;
