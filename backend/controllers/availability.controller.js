import Doctor from "../models/doctor.model.js";
import { getOrCreateAvailability } from "../services/schedule.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addDays, parseDateOnly, toDateKey } from "../utils/date.js";
import ApiError from "../utils/apiError.js";

const resolveDoctorId = async (doctorId) => {
  if (doctorId) {
    return doctorId;
  }

  const doctor = await Doctor.findOne().sort({ createdAt: 1 });
  if (!doctor) {
    throw new ApiError(404, "No doctor found");
  }

  return doctor._id;
};

export const getAvailability = asyncHandler(async (req, res) => {
  const date = parseDateOnly(req.query.date);
  if (!date) {
    throw new ApiError(400, "A valid date is required");
  }

  const doctorId = await resolveDoctorId(req.query.doctorId);
  const availability = await getOrCreateAvailability(doctorId, date);

  res.json({
    success: true,
    data: {
      date: toDateKey(date),
      isAvailable: availability.isAvailable,
      reason: availability.reason,
      clinic: availability.clinic,
      slots: availability.slots,
      isFullyBooked: availability.isFullyBooked || false,
      source: availability.source,
    },
  });
});

export const generateNextThirtyDays = asyncHandler(async (req, res) => {
  const doctorId = await resolveDoctorId(req.body.doctorId || req.query.doctorId);
  const startDate = parseDateOnly(req.body.startDate || req.query.startDate) || parseDateOnly(new Date());
  const generated = [];

  for (let index = 0; index < 30; index += 1) {
    const date = addDays(startDate, index);
    const availability = await getOrCreateAvailability(doctorId, date);

    generated.push({
      date: toDateKey(date),
      isAvailable: availability.isAvailable,
      clinic: availability.clinic,
      slotsCount: availability.slots.length,
      isFullyBooked: availability.isFullyBooked || false,
    });
  }

  res.status(201).json({ success: true, data: generated });
});
