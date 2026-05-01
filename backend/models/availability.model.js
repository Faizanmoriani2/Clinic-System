import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
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
    date: { type: Date, required: true, index: true },
    slots: { type: [slotSchema], default: [] },
  },
  { timestamps: true }
);

availabilitySchema.index({ doctorId: 1, date: 1 }, { unique: true });

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
