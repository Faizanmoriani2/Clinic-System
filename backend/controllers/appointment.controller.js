import Appointment from "../models/appointment.model.js";
import Availability from "../models/availability.model.js";
import Patient from "../models/patient.model.js";
import { buildWhatsAppUrl } from "../services/slot.service.js";
import { getOrCreateAvailability } from "../services/schedule.service.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { parseDateOnly, toDateKey } from "../utils/date.js";

export const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, city, date: rawDate, time, name, phone, email, notes } = req.body;
  const date = parseDateOnly(rawDate);

  if (!doctorId || !date || !time || !name || !phone) {
    throw new ApiError(400, "doctorId, date, time, name, and phone are required");
  }

  const availabilityResult = await getOrCreateAvailability(doctorId, date);
  if (!availabilityResult.isAvailable) {
    throw new ApiError(400, availabilityResult.reason || "Doctor not available");
  }

  const resolvedClinic = availabilityResult.clinic;
  if (clinicId && String(clinicId) !== String(resolvedClinic._id)) {
    throw new ApiError(400, "Selected clinic does not match the doctor's schedule for this date");
  }

  if (city && resolvedClinic.city.toLowerCase() !== String(city).toLowerCase()) {
    throw new ApiError(400, `Doctor is available in ${resolvedClinic.city} on this date`);
  }

  const slotExists = availabilityResult.slots.some((slot) => slot.time === time);
  if (!slotExists) {
    throw new ApiError(400, "Selected time is not available");
  }

  const updatedAvailability = await Availability.findOneAndUpdate(
    {
      doctorId,
      date,
      "slots.time": time,
      "slots.isBooked": false,
    },
    { $set: { "slots.$.isBooked": true } },
    { new: true }
  );

  if (!updatedAvailability) {
    throw new ApiError(409, "This slot is already booked");
  }

  const patient = await Patient.findOneAndUpdate(
    { phone },
    { $set: { name, email: email || "" }, $setOnInsert: { phone } },
    { new: true, upsert: true, runValidators: true }
  );

  const appointment = await Appointment.create({
    doctorId,
    clinicId: resolvedClinic._id,
    patientId: patient._id,
    date,
    time,
    notes,
  });

  const populatedAppointment = await Appointment.findById(appointment._id).populate(
    "doctorId clinicId patientId"
  );

  const whatsAppPhone = resolvedClinic.contactNumber || populatedAppointment.doctorId.whatsapp;
  const whatsappUrl = whatsAppPhone
    ? buildWhatsAppUrl({
        phone: whatsAppPhone,
        name,
        city: resolvedClinic.city,
        date: toDateKey(date),
        time,
      })
    : "";

  res.status(201).json({
    success: true,
    data: populatedAppointment,
    whatsappUrl,
  });
});

export const getAppointments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.doctorId) filter.doctorId = req.query.doctorId;
  if (req.query.clinicId) filter.clinicId = req.query.clinicId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.date) filter.date = parseDateOnly(req.query.date);

  const appointments = await Appointment.find(filter)
    .populate("doctorId clinicId patientId")
    .sort({ date: 1, time: 1 });

  res.json({ success: true, data: appointments });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const previousStatus = appointment.status;
  appointment.status = req.body.status || appointment.status;
  appointment.notes = req.body.notes ?? appointment.notes;
  await appointment.save();

  if (appointment.status === "cancelled" && previousStatus !== "cancelled") {
    await Availability.findOneAndUpdate(
      { doctorId: appointment.doctorId, date: appointment.date, "slots.time": appointment.time },
      { $set: { "slots.$.isBooked": false } }
    );
  }

  res.json({ success: true, data: appointment });
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (appointment) {
    await Availability.findOneAndUpdate(
      { doctorId: appointment.doctorId, date: appointment.date, "slots.time": appointment.time },
      { $set: { "slots.$.isBooked": false } }
    );
  }

  res.json({ success: true, message: "Appointment deleted" });
});
