import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CalendarClock, FileText, Loader2, LogOut, MapPin, MessageSquare, Plus, Stethoscope, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { api, ApiList, authStore } from "../lib/api";
import type { Appointment, Blog, Clinic, Doctor, Patient, ScheduleRule, Testimonial } from "../lib/types";
import { todayKey } from "../lib/dates";

type Tab = "overview" | "doctors" | "clinics" | "rules" | "appointments" | "content";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [doctorRes, clinicRes, ruleRes, appointmentRes, patientRes, blogRes, testimonialRes] = await Promise.all([
        api.get<ApiList<Doctor>>("/doctors"),
        api.get<ApiList<Clinic>>("/clinics"),
        api.get<ApiList<ScheduleRule>>("/schedule-rules"),
        api.get<ApiList<Appointment>>("/appointments", true),
        api.get<ApiList<Patient>>("/patients", true),
        api.get<ApiList<Blog>>("/blogs"),
        api.get<ApiList<Testimonial>>("/testimonials"),
      ]);
      setDoctors(doctorRes.data);
      setClinics(clinicRes.data);
      setRules(ruleRes.data);
      setAppointments(appointmentRes.data);
      setPatients(patientRes.data);
      setBlogs(blogRes.data);
      setTestimonials(testimonialRes.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(
    () => [
      { label: "Doctors", value: doctors.length, icon: Stethoscope },
      { label: "Clinics", value: clinics.length, icon: MapPin },
      { label: "Appointments", value: appointments.length, icon: CalendarClock },
      { label: "Patients", value: patients.length, icon: Users },
    ],
    [appointments.length, clinics.length, doctors.length, patients.length]
  );

  const logout = () => {
    authStore.clear();
    navigate("/admin/login", { replace: true });
  };

  return (
    <main className="pb-10">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">Admin dashboard</h1>
            <p className="text-sm text-slate-500">Protected clinic management area.</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {(["overview", "doctors", "clinics", "rules", "appointments", "content"] as Tab[]).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm capitalize ${
                tab === item ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading dashboard
          </div>
        ) : (
          <>
            {tab === "overview" && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4">
                      <stat.icon className="mb-3 h-5 w-5 text-emerald-600" />
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-semibold">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <AppointmentTable appointments={appointments.slice(0, 8)} onStatus={load} />
              </div>
            )}

            {tab === "doctors" && <DoctorsPanel doctors={doctors} onDone={load} />}
            {tab === "clinics" && <ClinicsPanel clinics={clinics} onDone={load} />}
            {tab === "rules" && <RulesPanel doctors={doctors} clinics={clinics} rules={rules} onDone={load} />}
            {tab === "appointments" && <AppointmentTable appointments={appointments} onStatus={load} />}
            {tab === "content" && (
              <ContentPanel blogs={blogs} testimonials={testimonials} onDone={load} />
            )}
          </>
        )}
      </div>
    </main>
  );
}

function DoctorsPanel({ doctors, onDone }: { doctors: Doctor[]; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", specialization: "", bio: "", experienceYears: "0", phone: "", whatsapp: "" });
  return (
    <Panel title="Doctors" icon={Stethoscope}>
      <form
        onSubmit={(event) => submitForm(event, "/doctors", { ...form, experienceYears: Number(form.experienceYears) }, onDone, () =>
          setForm({ name: "", specialization: "", bio: "", experienceYears: "0", phone: "", whatsapp: "" })
        )}
        className="grid gap-3 md:grid-cols-2"
      >
        <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="Specialization" value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} />
        <Input label="Experience years" type="number" value={form.experienceYears} onChange={(v) => setForm({ ...form, experienceYears: v })} />
        <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Input label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
        <Input label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} />
        <SubmitButton />
      </form>
      <SimpleList items={doctors.map((d) => `${d.name} - ${d.specialization}`)} />
    </Panel>
  );
}

function ClinicsPanel({ clinics, onDone }: { clinics: Clinic[]; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", city: "", address: "", googleMapLink: "", contactNumber: "" });
  return (
    <Panel title="Clinics" icon={MapPin}>
      <form onSubmit={(e) => submitForm(e, "/clinics", form, onDone, () => setForm({ name: "", city: "", address: "", googleMapLink: "", contactNumber: "" }))} className="grid gap-3 md:grid-cols-2">
        <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <Input label="Google map link" value={form.googleMapLink} onChange={(v) => setForm({ ...form, googleMapLink: v })} />
        <Input label="Contact number" value={form.contactNumber} onChange={(v) => setForm({ ...form, contactNumber: v })} />
        <SubmitButton />
      </form>
      <SimpleList items={clinics.map((c) => `${c.city} - ${c.name}`)} />
    </Panel>
  );
}

function RulesPanel({ doctors, clinics, rules, onDone }: { doctors: Doctor[]; clinics: Clinic[]; rules: ScheduleRule[]; onDone: () => void }) {
  const [form, setForm] = useState({ doctorId: "", clinicId: "", type: "weekly", dayOfWeek: "0", nthWeek: "1", startTime: "10:00", endTime: "17:00" });
  const payload = {
    doctorId: form.doctorId || doctors[0]?._id,
    clinicId: form.clinicId || clinics[0]?._id,
    type: form.type,
    dayOfWeek: Number(form.dayOfWeek),
    nthWeek: form.type === "monthly_nth_day" ? Number(form.nthWeek) : undefined,
    isActive: true,
    startTime: form.startTime,
    endTime: form.endTime,
  };

  return (
    <Panel title="Schedule rules" icon={CalendarClock}>
      <form onSubmit={(e) => submitForm(e, "/schedule-rules", payload, onDone)} className="grid gap-3 md:grid-cols-2">
        <Select label="Doctor" value={form.doctorId} onChange={(v) => setForm({ ...form, doctorId: v })} options={doctors.map((d) => ({ value: d._id, label: d.name }))} />
        <Select label="Clinic" value={form.clinicId} onChange={(v) => setForm({ ...form, clinicId: v })} options={clinics.map((c) => ({ value: c._id, label: `${c.city} - ${c.name}` }))} />
        <Select label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={[{ value: "weekly", label: "Weekly" }, { value: "monthly_nth_day", label: "Monthly nth day" }]} />
        <Select label="Day" value={form.dayOfWeek} onChange={(v) => setForm({ ...form, dayOfWeek: v })} options={dayNames.map((d, i) => ({ value: String(i), label: d }))} />
        {form.type === "monthly_nth_day" && <Input label="Nth week" type="number" value={form.nthWeek} onChange={(v) => setForm({ ...form, nthWeek: v })} />}
        <Input label="Start time" value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} />
        <Input label="End time" value={form.endTime} onChange={(v) => setForm({ ...form, endTime: v })} />
        <SubmitButton />
      </form>
      <SimpleList items={rules.map((r) => `${r.type} - ${dayNames[r.dayOfWeek]} - ${r.startTime} to ${r.endTime}`)} />
      <ExceptionForm doctors={doctors} clinics={clinics} onDone={onDone} />
      <GenerateForm doctors={doctors} />
    </Panel>
  );
}

function ExceptionForm({ doctors, clinics, onDone }: { doctors: Doctor[]; clinics: Clinic[]; onDone: () => void }) {
  const [form, setForm] = useState({ doctorId: "", clinicId: "", date: todayKey(), isCancelled: false, startTime: "10:00", endTime: "17:00", reason: "" });
  return (
    <form
      onSubmit={(e) => submitForm(e, "/exceptions", { ...form, doctorId: form.doctorId || doctors[0]?._id, clinicId: form.clinicId || clinics[0]?._id }, onDone)}
      className="mt-5 grid gap-3 border-t border-slate-200 pt-5 md:grid-cols-2"
    >
      <h3 className="font-semibold md:col-span-2">Add exception</h3>
      <Select label="Doctor" value={form.doctorId} onChange={(v) => setForm({ ...form, doctorId: v })} options={doctors.map((d) => ({ value: d._id, label: d.name }))} />
      <Select label="Clinic" value={form.clinicId} onChange={(v) => setForm({ ...form, clinicId: v })} options={clinics.map((c) => ({ value: c._id, label: c.city }))} />
      <Input label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
      <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-3 text-sm"><input type="checkbox" checked={form.isCancelled} onChange={(e) => setForm({ ...form, isCancelled: e.target.checked })} /> Cancel visit</label>
      <Input label="Start time" value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} />
      <Input label="End time" value={form.endTime} onChange={(v) => setForm({ ...form, endTime: v })} />
      <Input label="Reason" value={form.reason} onChange={(v) => setForm({ ...form, reason: v })} />
      <SubmitButton label="Save exception" />
    </form>
  );
}

function GenerateForm({ doctors }: { doctors: Doctor[] }) {
  const [doctorId, setDoctorId] = useState("");
  const generate = async () => {
    try {
      await api.post("/availability/generate-next-30-days", { doctorId: doctorId || doctors[0]?._id, startDate: todayKey() }, true);
      toast.success("Next 30 days generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    }
  };
  return (
    <div className="mt-5 rounded-lg bg-slate-50 p-4">
      <h3 className="mb-3 font-semibold">Pre-generate availability</h3>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Select label="Doctor" value={doctorId} onChange={setDoctorId} options={doctors.map((d) => ({ value: d._id, label: d.name }))} />
        <button onClick={generate} className="self-end rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white">Generate 30 days</button>
      </div>
    </div>
  );
}

function AppointmentTable({ appointments, onStatus }: { appointments: Appointment[]; onStatus: () => void }) {
  const updateStatus = async (id: string, status: Appointment["status"]) => {
    try {
      await api.patch(`/appointments/${id}`, { status }, true);
      toast.success("Appointment updated");
      onStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update appointment");
    }
  };
  return (
    <Panel title="Appointments" icon={CalendarClock}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2">Patient</th>
              <th>Phone</th>
              <th>Clinic</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((item) => (
              <tr key={item._id} className="border-t border-slate-100">
                <td className="py-3">{item.patientId?.name}</td>
                <td>{item.patientId?.phone}</td>
                <td>{item.clinicId?.city}</td>
                <td>{item.date?.slice(0, 10)}</td>
                <td>{item.time}</td>
                <td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize">{item.status}</span></td>
                <td className="flex gap-2 py-2">
                  <button onClick={() => updateStatus(item._id, "confirmed")} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">Confirm</button>
                  <button onClick={() => updateStatus(item._id, "cancelled")} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No appointments yet.</p>}
      </div>
    </Panel>
  );
}

function ContentPanel({ blogs, testimonials, onDone }: { blogs: Blog[]; testimonials: Testimonial[]; onDone: () => void }) {
  const [blog, setBlog] = useState({ title: "", slug: "", content: "", featuredImage: "", tags: "" });
  const [testimonial, setTestimonial] = useState({ patientName: "", message: "", rating: "5" });
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Blogs" icon={FileText}>
        <form onSubmit={(e) => submitForm(e, "/blogs", { ...blog, tags: blog.tags.split(",").map((t) => t.trim()).filter(Boolean) }, onDone)} className="space-y-3">
          <Input label="Title" value={blog.title} onChange={(v) => setBlog({ ...blog, title: v })} />
          <Input label="Slug" value={blog.slug} onChange={(v) => setBlog({ ...blog, slug: v })} />
          <Input label="Featured image" value={blog.featuredImage} onChange={(v) => setBlog({ ...blog, featuredImage: v })} />
          <Textarea label="Content" value={blog.content} onChange={(v) => setBlog({ ...blog, content: v })} />
          <Input label="Tags comma separated" value={blog.tags} onChange={(v) => setBlog({ ...blog, tags: v })} />
          <SubmitButton />
        </form>
        <SimpleList items={blogs.map((b) => b.title)} />
      </Panel>
      <Panel title="Testimonials" icon={MessageSquare}>
        <form onSubmit={(e) => submitForm(e, "/testimonials", { ...testimonial, rating: Number(testimonial.rating) }, onDone)} className="space-y-3">
          <Input label="Patient name" value={testimonial.patientName} onChange={(v) => setTestimonial({ ...testimonial, patientName: v })} />
          <Textarea label="Message" value={testimonial.message} onChange={(v) => setTestimonial({ ...testimonial, message: v })} />
          <Input label="Rating" type="number" value={testimonial.rating} onChange={(v) => setTestimonial({ ...testimonial, rating: v })} />
          <SubmitButton />
        </form>
        <SimpleList items={testimonials.map((t) => `${t.patientName} - ${t.rating}/5`)} />
      </Panel>
    </div>
  );
}

async function submitForm(event: FormEvent, path: string, body: unknown, onDone: () => void, reset?: () => void) {
  event.preventDefault();
  try {
    await api.post(path, body, true);
    toast.success("Saved successfully");
    reset?.();
    onDone();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Save failed");
  }
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input value={value} type={type} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-emerald-500" />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-emerald-500" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-emerald-500">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function SubmitButton({ label = "Save" }: { label?: string }) {
  return (
    <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white md:self-end">
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

function SimpleList({ items }: { items: string[] }) {
  return (
    <div className="mt-5 space-y-2">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{item}</div>
      ))}
      {items.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No records yet.</p>}
    </div>
  );
}
