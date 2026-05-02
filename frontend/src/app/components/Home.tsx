import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiList } from "../lib/api";
import type { Blog, Clinic, Doctor, Testimonial } from "../lib/types";

export function Home() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<ApiList<Doctor>>("/doctors"),
      api.get<ApiList<Clinic>>("/clinics"),
      api.get<ApiList<Blog>>("/blogs"),
      api.get<ApiList<Testimonial>>("/testimonials"),
    ])
      .then(([doctorRes, clinicRes, blogRes, testimonialRes]) => {
        setDoctors(doctorRes.data);
        setClinics(clinicRes.data);
        setBlogs(blogRes.data);
        setTestimonials(testimonialRes.data);
      })
      .catch(() => toast.error("Could not load clinic data. Please check the backend server."));
  }, []);

  const doctor = doctors[0];
  const whatsapp = useMemo(
    () => clinics[0]?.contactNumber || doctor?.whatsapp || doctor?.phone || "",
    [clinics, doctor]
  );

  const openWhatsApp = () => {
    const phone = whatsapp.replace(/\D/g, "");
    if (!phone) {
      toast.error("WhatsApp number is not configured yet");
      return;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent("Hello, I want to book an appointment.")}`,
      "_blank"
    );
  };

  return (
    <main className="pb-24 sm:pb-0">
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-12">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Allergy care in Quetta, Sukkur, and Ghotki
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Book allergy specialist visits with live clinic availability.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Choose a city, date, and slot. The system checks the doctor schedule, saves the booking, and opens WhatsApp for confirmation.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/booking"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white shadow-lg shadow-emerald-900/10"
              >
                Book appointment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={openWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-800"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                WhatsApp clinic
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Wind className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Primary doctor</p>
                  <h2 className="text-xl font-semibold">{doctor?.name || "Add doctor from admin"}</h2>
                  <p className="mt-1 text-sm text-slate-600">{doctor?.specialization || "Allergy Specialist"}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3">
                  <Clock className="mb-2 h-4 w-4 text-emerald-600" />
                  <p className="text-slate-500">Usual timing</p>
                  <p className="font-medium">10:00 to 17:00</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <CalendarDays className="mb-2 h-4 w-4 text-emerald-600" />
                  <p className="text-slate-500">Slot interval</p>
                  <p className="font-medium">30 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Clinics</h2>
          <Link to="/schedule" className="text-sm font-medium text-emerald-700">
            Check schedule
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {clinics.map((clinic) => (
            <article key={clinic._id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-emerald-700">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{clinic.city}</span>
              </div>
              <h3 className="font-semibold">{clinic.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{clinic.address}</p>
              {clinic.contactNumber && (
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="h-4 w-4" />
                  {clinic.contactNumber}
                </p>
              )}
            </article>
          ))}
          {clinics.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 md:col-span-3">
              No clinics yet. Log in as admin and add Quetta, Sukkur, and Ghotki clinics.
            </div>
          )}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <Sparkles className="mb-3 h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold">Rule-based scheduling</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">First Saturday routes to Sukkur, every Sunday to Ghotki, and other days to Quetta.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <MessageCircle className="mb-3 h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold">WhatsApp confirmation</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Booking is saved first, then the patient gets a ready-to-send WhatsApp message.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold">Admin controlled</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Doctors, clinics, rules, exceptions, blogs, and testimonials are managed from a protected dashboard.</p>
          </div>
        </div>
      </section>

      {(testimonials.length > 0 || blogs.length > 0) && (
        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Patient feedback</h2>
            <div className="space-y-3">
              {testimonials.slice(0, 3).map((item) => (
                <article key={item._id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex gap-1 text-emerald-600">
                    {Array.from({ length: item.rating }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm leading-6 text-slate-700">{item.message}</p>
                  <p className="mt-2 text-sm font-medium">{item.patientName}</p>
                </article>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-xl font-semibold">Latest blogs</h2>
            <div className="space-y-3">
              {blogs.slice(0, 3).map((blog) => (
                <article key={blog._id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm text-emerald-700">{blog.tags?.join(", ") || "Clinic update"}</p>
                  <h3 className="mt-1 font-semibold">{blog.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{blog.content}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
