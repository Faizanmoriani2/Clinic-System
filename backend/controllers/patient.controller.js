import Patient from "../models/patient.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find().sort({ createdAt: -1 });
  res.json({ success: true, data: patients });
});

export const getPatientByPhone = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ phone: req.params.phone });
  res.json({ success: true, data: patient });
});
