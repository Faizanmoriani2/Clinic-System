import mongoose from "mongoose";

const exceptionSchema = new mongoose.Schema(
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
      default: null,
    },
    date: { type: Date, required: true, index: true },
    isCancelled: { type: Boolean, default: false },
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
    reason: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

exceptionSchema.index({ doctorId: 1, date: 1 }, { unique: true });

const Exception = mongoose.model("Exception", exceptionSchema);

export default Exception;
