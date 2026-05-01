import ScheduleRule from "../models/scheduleRule.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createScheduleRule = asyncHandler(async (req, res) => {
  const rule = await ScheduleRule.create(req.body);
  res.status(201).json({ success: true, data: rule });
});

export const getScheduleRules = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.doctorId) filter.doctorId = req.query.doctorId;
  if (req.query.clinicId) filter.clinicId = req.query.clinicId;

  const rules = await ScheduleRule.find(filter)
    .populate("doctorId clinicId")
    .sort({ type: 1, dayOfWeek: 1 });

  res.json({ success: true, data: rules });
});

export const updateScheduleRule = asyncHandler(async (req, res) => {
  const rule = await ScheduleRule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: rule });
});

export const deleteScheduleRule = asyncHandler(async (req, res) => {
  await ScheduleRule.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Schedule rule deleted" });
});
