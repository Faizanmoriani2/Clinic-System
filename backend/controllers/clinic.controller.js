import Clinic from "../models/clinic.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createClinic = asyncHandler(async (req, res) => {
  const clinic = await Clinic.create(req.body);
  res.status(201).json({ success: true, data: clinic });
});

export const getClinics = asyncHandler(async (req, res) => {
  const clinics = await Clinic.find().sort({ city: 1 });
  res.json({ success: true, data: clinics });
});

export const getClinic = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findById(req.params.id);
  res.json({ success: true, data: clinic });
});

export const updateClinic = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: clinic });
});

export const deleteClinic = asyncHandler(async (req, res) => {
  await Clinic.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Clinic deleted" });
});
