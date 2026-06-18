export type Id = string;

export type Doctor = {
  _id: Id;
  name: string;
  specialization: string;
  bio?: string;
  experienceYears?: number;
  profileImage?: string;
  phone?: string;
  whatsapp?: string;
};

export type Clinic = {
  _id: Id;
  name: string;
  city: string;
  address: string;
  googleMapLink?: string;
  contactNumber?: string;
};

export type Slot = {
  time: string;
  isBooked: boolean;
};

export type Availability = {
  date: string;
  isAvailable: boolean;
  reason?: string;
  clinic?: Clinic;
  slots: Slot[];
  isFullyBooked: boolean;
  source?: string;
};

export type Appointment = {
  _id: Id;
  doctorId: Doctor;
  clinicId: Clinic;
  patientId: Patient;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
};

export type Patient = {
  _id: Id;
  name: string;
  phone: string;
  email?: string;
};

export type Blog = {
  _id: Id;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  tags?: string[];
};

export type Testimonial = {
  _id: Id;
  patientName: string;
  message: string;
  rating: number;
};

export type Exception = {
  _id: Id;
  doctorId: Doctor | Id | null;
  clinicId?: Clinic | Id | null;
  date: string;
  isCancelled: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
};

export type ScheduleRule = {
  _id: Id;
  doctorId: Doctor | Id;
  clinicId: Clinic | Id;
  type: "weekly" | "monthly_nth_day";
  dayOfWeek: number;
  nthWeek?: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
};
