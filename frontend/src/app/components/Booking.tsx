import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { ArrowLeft, CheckCircle2, Loader2, Mail, MapPin, MessageCircle, Phone, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { api, ApiList, ApiOne } from "../lib/api";
import { formatLongDate, todayKey, toTwelveHour } from "../lib/dates";
import type { Availability, Clinic, Doctor } from "../lib/types";

type BookingResponse = {
  success: boolean;
  data: unknown;
  whatsappUrl: string;
};

export function Booking() {
  const location = useLocation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctorId, setDoctorId] = useState(location.state?.doctorId || "");
  const [selectedCity, setSelectedCity] = useState(location.state?.city || "");
  const [selectedDate, setSelectedDate] = useState(location.state?.date || todayKey());
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });

  useEffect(() => {
    Promise.all([api.get<ApiList<Doctor>>("/doctors"), api.get<ApiList<Clinic>>("/clinics")])
      .then(([doctorRes, clinicRes]) => {
        setDoctors(doctorRes.data);
        setClinics(clinicRes.data);
        setDoctorId((current: string) => current || doctorRes.data[0]?._id || "");
        setSelectedCity((current: string) => current || clinicRes.data[0]?.city || "");
      })
      .catch(() => toast.error("Could not load booking setup"));
  }, []);

  useEffect(() => {
    if (!doctorId || !selectedDate) return;

    setLoading(true);
    setSelectedTime("");
    api
      .get<ApiOne<Availability>>(`/availability?doctorId=${doctorId}&date=${selectedDate}`)
      .then((res) => {
        setAvailability(res.data);
        if (res.data.clinic?.city) {
          setSelectedCity(res.data.clinic.city);
        }
      })
      .catch((error) => {
        setAvailability(null);
        toast.error(error.message);
      })
      .finally(() => setLoading(false));
  }, [doctorId, selectedDate]);

  const cities = useMemo(() => Array.from(new Set(clinics.map((clinic) => clinic.city))), [clinics]);
  const activeDoctor = doctors.find((doctor) => doctor._id === doctorId);
  const availableSlots = availability?.slots.filter((slot) => !slot.isBooked) || [];

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitBooking = async () => {
    if (!doctorId || !selectedDate || !selectedTime || !form.name.trim() || !form.phone.trim()) {
      toast.error("Please select a slot and enter name and phone");
      return;
    }

    if (!availability?.isAvailable) {
      toast.error("Doctor is not available on this date");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post<BookingResponse>("/appointments", {
        doctorId,
        city: selectedCity,
        date: selectedDate,
        time: selectedTime,
        name: form.name,
        phone: form.phone,
        email: form.email,
        notes: form.notes,
      });

      toast.success("Appointment saved. Opening WhatsApp confirmation.");
      if (response.whatsappUrl) {
        window.open(response.whatsappUrl, "_blank");
      }

      const refreshed = await api.get<ApiOne<Availability>>(
        `/availability?doctorId=${doctorId}&date=${selectedDate}`
      );
      setAvailability(refreshed.data);
      setSelectedTime("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pb-24 sm:pb-10">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <Link to="/" className="rounded-lg bg-slate-100 p-2 text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Book appointment</h1>
            <p className="text-sm text-slate-500">Save your slot and confirm through WhatsApp.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium">Doctor</label>
            <select
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-emerald-500"
            >
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <label className="mb-2 block text-sm font-medium">City</label>
              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-emerald-500"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {availability?.clinic?.city && availability.clinic.city !== selectedCity && (
                <p className="mt-2 text-xs text-amber-700">
                  The doctor is scheduled in {availability.clinic.city} on this date.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <label className="mb-2 block text-sm font-medium">Date</label>
              <input
                type="date"
                min={todayKey()}
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-semibold">Patient details</h2>
            <div className="space-y-3">
              <Field icon={User} placeholder="Full name" value={form.name} onChange={(value) => handleChange("name", value)} />
              <Field icon={Phone} placeholder="Phone number, e.g. 03001234567" value={form.phone} onChange={(value) => handleChange("phone", value)} />
              <Field icon={Mail} placeholder="Email optional" value={form.email} onChange={(value) => handleChange("email", value)} />
              <textarea
                value={form.notes}
                onChange={(event) => handleChange("notes", event.target.value)}
                placeholder="Notes optional"
                className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading slots
            </div>
          ) : availability?.isAvailable ? (
            <>
              <div className="rounded-lg bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">Scheduled clinic</p>
                <h2 className="mt-1 text-xl font-semibold">{availability.clinic?.name}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {availability.clinic?.city} - {formatLongDate(selectedDate)}
                </p>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Available time</h3>
                  <span className="text-sm text-slate-500">{availableSlots.length} open</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availability.slots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={slot.isBooked}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                        selectedTime === slot.time
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : slot.isBooked
                          ? "border-slate-200 bg-slate-100 text-slate-400 line-through"
                          : "border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      {toTwelveHour(slot.time)}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTime && (
                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
                  <p className="mb-2 flex items-center gap-2 font-medium text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Booking summary
                  </p>
                  <p>{activeDoctor?.name}</p>
                  <p>{availability.clinic?.city} clinic</p>
                  <p>
                    {formatLongDate(selectedDate)} at {toTwelveHour(selectedTime)}
                  </p>
                </div>
              )}

              <button
                onClick={submitBooking}
                disabled={submitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-medium text-white disabled:opacity-70"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
                Book via WhatsApp
              </button>
            </>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-6 text-center">
              <p className="font-semibold">Doctor not available</p>
              <p className="mt-2 text-sm text-slate-500">
                {availability?.reason || "Choose a doctor and date to load slots."}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  icon: Icon,
  placeholder,
  value,
  onChange,
}: {
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 outline-none focus:border-emerald-500"
      />
    </div>
  );
}
