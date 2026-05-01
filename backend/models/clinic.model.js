import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true, trim: true },
    googleMapLink: { type: String, trim: true, default: "" },
    contactNumber: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const Clinic = mongoose.model("Clinic", clinicSchema);

export default Clinic;
