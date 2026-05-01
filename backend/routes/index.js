import express from "express";
import appointmentRoutes from "./appointment.routes.js";
import authRoutes from "./auth.routes.js";
import availabilityRoutes from "./availability.routes.js";
import blogRoutes from "./blog.routes.js";
import clinicRoutes from "./clinic.routes.js";
import doctorRoutes from "./doctor.routes.js";
import exceptionRoutes from "./exception.routes.js";
import patientRoutes from "./patient.routes.js";
import scheduleRuleRoutes from "./scheduleRule.routes.js";
import testimonialRoutes from "./testimonial.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/clinics", clinicRoutes);
router.use("/schedule-rules", scheduleRuleRoutes);
router.use("/exceptions", exceptionRoutes);
router.use("/availability", availabilityRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/patients", patientRoutes);
router.use("/blogs", blogRoutes);
router.use("/testimonials", testimonialRoutes);

export default router;
