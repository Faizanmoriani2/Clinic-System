import mongoose from "mongoose";

const scheduleRuleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["weekly", "monthly_nth_day"],
      required: true,
    },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    nthWeek: { type: Number, min: 1, max: 5 },
    isActive: { type: Boolean, default: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

scheduleRuleSchema.index({ doctorId: 1, type: 1, dayOfWeek: 1, nthWeek: 1 });

const ScheduleRule = mongoose.model("ScheduleRule", scheduleRuleSchema);

export default ScheduleRule;
