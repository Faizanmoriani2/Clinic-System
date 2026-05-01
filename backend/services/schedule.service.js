import Availability from "../models/availability.model.js";
import Clinic from "../models/clinic.model.js";
import Exception from "../models/exception.model.js";
import ScheduleRule from "../models/scheduleRule.model.js";
import { generateSlots } from "./slot.service.js";

const DEFAULT_START_TIME = "10:00";
const DEFAULT_END_TIME = "17:00";

const getDateInfo = (date) => {
  const dayOfWeek = date.getUTCDay();
  const dayOfMonth = date.getUTCDate();
  const nthWeek = Math.ceil(dayOfMonth / 7);

  return { dayOfWeek, nthWeek };
};

export const getMatchingRule = (date, scheduleRules) => {
  const { dayOfWeek, nthWeek } = getDateInfo(date);

  const monthlyRule = scheduleRules.find(
    (rule) =>
      rule.type === "monthly_nth_day" &&
      rule.dayOfWeek === dayOfWeek &&
      rule.nthWeek === nthWeek
  );

  if (monthlyRule) {
    return monthlyRule;
  }

  return scheduleRules.find((rule) => rule.type === "weekly" && rule.dayOfWeek === dayOfWeek);
};

export const resolveDoctorAvailability = async (doctorId, date) => {
  const exception = await Exception.findOne({ doctorId, date }).populate("clinicId");

  if (exception?.isCancelled) {
    return { isAvailable: false, reason: exception.reason || "Doctor not available" };
  }

  if (exception?.clinicId && exception.startTime && exception.endTime) {
    return {
      isAvailable: true,
      clinicId: exception.clinicId._id,
      clinic: exception.clinicId,
      startTime: exception.startTime,
      endTime: exception.endTime,
      source: "exception",
    };
  }

  const scheduleRules = await ScheduleRule.find({ doctorId, isActive: true }).populate("clinicId");
  const matchedRule = getMatchingRule(date, scheduleRules);

  if (matchedRule) {
    return {
      isAvailable: true,
      clinicId: matchedRule.clinicId._id,
      clinic: matchedRule.clinicId,
      startTime: matchedRule.startTime,
      endTime: matchedRule.endTime,
      source: matchedRule.type,
      ruleId: matchedRule._id,
    };
  }

  const defaultClinic = await Clinic.findOne({ city: /^quetta$/i });

  if (!defaultClinic) {
    return { isAvailable: false, reason: "Doctor not available" };
  }

  return {
    isAvailable: true,
    clinicId: defaultClinic._id,
    clinic: defaultClinic,
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
    source: "fallback",
  };
};

export const getOrCreateAvailability = async (doctorId, date) => {
  const resolved = await resolveDoctorAvailability(doctorId, date);

  if (!resolved.isAvailable) {
    return { ...resolved, availability: null, slots: [] };
  }

  const slots = generateSlots(resolved.startTime, resolved.endTime);
  const availability = await Availability.findOneAndUpdate(
    { doctorId, date },
    {
      $setOnInsert: {
        doctorId,
        clinicId: resolved.clinicId,
        date,
        slots,
      },
    },
    { new: true, upsert: true }
  ).populate("clinicId");

  return {
    ...resolved,
    availability,
    clinic: availability.clinicId,
    slots: availability.slots,
    isFullyBooked: availability.slots.length > 0 && availability.slots.every((slot) => slot.isBooked),
  };
};
