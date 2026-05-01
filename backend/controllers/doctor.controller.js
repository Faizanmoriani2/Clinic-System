import Doctor from "../models/doctor.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.status(201).json({ success: true, data: doctor });
});

export const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find().sort({ createdAt: -1 });
  res.json({ success: true, data: doctors });
});

export const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  res.json({ success: true, data: doctor });
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: doctor });
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Doctor deleted" });
});
