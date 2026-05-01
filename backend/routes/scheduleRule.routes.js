import express from "express";
import {
  createScheduleRule,
  deleteScheduleRule,
  getScheduleRules,
  updateScheduleRule,
} from "../controllers/scheduleRule.controller.js";

const router = express.Router();

router.route("/").get(getScheduleRules).post(createScheduleRule);
router.route("/:id").patch(updateScheduleRule).delete(deleteScheduleRule);

export default router;
