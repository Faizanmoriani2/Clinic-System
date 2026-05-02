import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CalendarDays, Clock, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { api, ApiList, ApiOne } from "../lib/api";
import { addDays, formatDate, todayKey, toTwelveHour } from "../lib/dates";
import type { Availability, Doctor } from "../lib/types";

const nextDays = Array.from({ length: 14 }, (_, index) => addDays(todayKey(), index));

export function Schedule() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<ApiList<Doctor>>("/doctors")
      .then((res) => {
        setDoctors(res.data);
        setDoctorId(res.data[0]?._id || "");
      })
      .catch(() => toast.error("Could not load doctors"));
  }, []);

  useEffect(() => {
    if (!doctorId || !selectedDate) return;

    setLoading(true);
    api
      .get<ApiOne<Availability>>(`/availability?doctorId=${doctorId}&date=${selectedDate}`)
      .then((res) => setAvailability(res.data))
      .catch((error) => {
        setAvailability(null);
        toast.error(error.message);
      })
      .finally(() => setLoading(false));
  }, [doctorId, selectedDate]);

  const availableSlots = useMemo(
    () => availability?.slots.filter((slot) => !slot.isBooked) || [],
    [availability]
  );

  return (
    <main className="pb-24 sm:pb-10">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <Link to="/" className="rounded-lg bg-slate-100 p-2 text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Doctor availability</h1>
            <p className="text-sm text-slate-500">Check the live schedule before booking.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Doctor</label>
            <select
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-emerald-500"
            >
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={selectedDate}
              min={todayKey()}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              Next 14 days
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
              {nextDays.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`rounded-lg border px-3 py-3 text-left text-sm transition ${
                    selectedDate === date
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <span className="block font-medium">{formatDate(date)}</span>
                  <span className="text-xs text-slate-500">{date}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Checking availability
            </div>
          ) : availability?.isAvailable ? (
            <div>
              <div className="rounded-lg bg-emerald-50 p-4 text-emerald-900">
                <p className="text-sm font-medium">Available at</p>
                <h2 className="mt-1 text-2xl font-semibold">{availability.clinic?.name}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  {availability.clinic?.city} - {availability.clinic?.address}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <Clock className="mb-2 h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-slate-500">Available slots</p>
                  <p className="text-xl font-semibold">{availableSlots.length}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <CalendarDays className="mb-2 h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-slate-500">Rule source</p>
                  <p className="text-xl font-semibold capitalize">{availability.source || "schedule"}</p>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="mb-3 font-semibold">Slots</h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {availability.slots.map((slot) => (
                    <span
                      key={slot.time}
                      className={`rounded-lg border px-3 py-2 text-center text-sm ${
                        slot.isBooked
                          ? "border-slate-200 bg-slate-100 text-slate-400 line-through"
                          : "border-emerald-200 bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {toTwelveHour(slot.time)}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                to="/booking"
                state={{ doctorId, date: selectedDate, city: availability.clinic?.city }}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white"
              >
                Book this date
              </Link>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-6 text-center">
              <p className="font-semibold">Doctor not available</p>
              <p className="mt-2 text-sm text-slate-500">
                {availability?.reason || "Select a doctor and date to check clinic availability."}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
