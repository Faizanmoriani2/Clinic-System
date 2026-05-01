import Exception from "../models/exception.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { parseDateOnly } from "../utils/date.js";

export const createException = asyncHandler(async (req, res) => {
  const date = parseDateOnly(req.body.date);
  const exception = await Exception.findOneAndUpdate(
    { doctorId: req.body.doctorId, date },
    { ...req.body, date },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(201).json({ success: true, data: exception });
});

export const getExceptions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.doctorId) filter.doctorId = req.query.doctorId;

  const exceptions = await Exception.find(filter).populate("doctorId clinicId").sort({ date: 1 });
  res.json({ success: true, data: exceptions });
});

export const deleteException = asyncHandler(async (req, res) => {
  await Exception.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Exception deleted" });
});
