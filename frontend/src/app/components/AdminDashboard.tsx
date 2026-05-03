import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CalendarClock, FileText, Loader2, LogOut, MapPin, MessageSquare, Pencil, Plus, Save, Stethoscope, Trash2, Users, X } from "lucide-react";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const reset = () => {
    setForm({ name: "", specialization: "", bio: "", experienceYears: "0", phone: "", whatsapp: "" });
    setEditingId(null);
  };
  const startEdit = (doctor: Doctor) => {
    setEditingId(doctor._id);
    setForm({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      bio: doctor.bio || "",
      experienceYears: String(doctor.experienceYears ?? 0),
      phone: doctor.phone || "",
      whatsapp: doctor.whatsapp || "",
    });
  };
  const body = { ...form, experienceYears: Number(form.experienceYears) };

  return (
    <Panel title="Doctors" icon={Stethoscope}>
      <form
        onSubmit={(event) =>
          editingId
            ? submitUpdate(event, `/doctors/${editingId}`, body, onDone, reset)
            : submitForm(event, "/doctors", body, onDone, reset)
        }
        className="grid gap-3 md:grid-cols-2"
      >
        <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="Specialization" value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} />
        <Input label="Experience years" type="number" value={form.experienceYears} onChange={(v) => setForm({ ...form, experienceYears: v })} />
        <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Input label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
        <Input label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} />
        <FormActions editing={Boolean(editingId)} onCancel={reset} />
      </form>
      <RecordList
        empty="No doctors yet."
        items={doctors.map((doctor) => ({
          id: doctor._id,
          title: doctor.name,
          detail: `${doctor.specialization} - ${doctor.experienceYears ?? 0} years`,
          onEdit: () => startEdit(doctor),
          onDelete: () => deleteRecord(`/doctors/${doctor._id}`, "Delete this doctor?", onDone),
        }))}
      />
    </Panel>
  );
}

function ClinicsPanel({ clinics, onDone }: { clinics: Clinic[]; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", city: "", address: "", googleMapLink: "", contactNumber: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const reset = () => {
    setForm({ name: "", city: "", address: "", googleMapLink: "", contactNumber: "" });
    setEditingId(null);
  };
  const startEdit = (clinic: Clinic) => {
    setEditingId(clinic._id);
    setForm({
      name: clinic.name || "",
      city: clinic.city || "",
      address: clinic.address || "",
      googleMapLink: clinic.googleMapLink || "",
      contactNumber: clinic.contactNumber || "",
    });
  };

  return (
    <Panel title="Clinics" icon={MapPin}>
      <form
        onSubmit={(e) =>
          editingId
            ? submitUpdate(e, `/clinics/${editingId}`, form, onDone, reset)
            : submitForm(e, "/clinics", form, onDone, reset)
        }
        className="grid gap-3 md:grid-cols-2"
      >
        <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <Input label="Google map link" value={form.googleMapLink} onChange={(v) => setForm({ ...form, googleMapLink: v })} />
        <Input label="Contact number" value={form.contactNumber} onChange={(v) => setForm({ ...form, contactNumber: v })} />
        <FormActions editing={Boolean(editingId)} onCancel={reset} />
      </form>
      <RecordList
        empty="No clinics yet."
        items={clinics.map((clinic) => ({
          id: clinic._id,
          title: `${clinic.city} - ${clinic.name}`,
          detail: clinic.address,
          onEdit: () => startEdit(clinic),
          onDelete: () => deleteRecord(`/clinics/${clinic._id}`, "Delete this clinic?", onDone),
        }))}
      />
    </Panel>
  );
}

function RulesPanel({ doctors, clinics, rules, onDone }: { doctors: Doctor[]; clinics: Clinic[]; rules: ScheduleRule[]; onDone: () => void }) {
  const [form, setForm] = useState({ doctorId: "", clinicId: "", type: "weekly", dayOfWeek: "0", nthWeek: "1", isActive: true, startTime: "10:00", endTime: "17:00" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const reset = () => {
    setForm({ doctorId: "", clinicId: "", type: "weekly", dayOfWeek: "0", nthWeek: "1", isActive: true, startTime: "10:00", endTime: "17:00" });
    setEditingId(null);
  };
  const startEdit = (rule: ScheduleRule) => {
    setEditingId(rule._id);
    setForm({
      doctorId: getRecordId(rule.doctorId),
      clinicId: getRecordId(rule.clinicId),
      type: rule.type,
      dayOfWeek: String(rule.dayOfWeek),
      nthWeek: String(rule.nthWeek ?? 1),
      isActive: rule.isActive,
      startTime: rule.startTime,
      endTime: rule.endTime,
    });
  };
  const payload = {
    doctorId: form.doctorId || doctors[0]?._id,
    clinicId: form.clinicId || clinics[0]?._id,
    type: form.type,
    dayOfWeek: Number(form.dayOfWeek),
    nthWeek: form.type === "monthly_nth_day" ? Number(form.nthWeek) : undefined,
    isActive: form.isActive,
    startTime: form.startTime,
    endTime: form.endTime,
  };

  return (
    <Panel title="Schedule rules" icon={CalendarClock}>
      <form
        onSubmit={(e) =>
          editingId
            ? submitUpdate(e, `/schedule-rules/${editingId}`, payload, onDone, reset)
            : submitForm(e, "/schedule-rules", payload, onDone, reset)
        }
        className="grid gap-3 md:grid-cols-2"
      >
        <Select label="Doctor" value={form.doctorId} onChange={(v) => setForm({ ...form, doctorId: v })} options={doctors.map((d) => ({ value: d._id, label: d.name }))} />
        <Select label="Clinic" value={form.clinicId} onChange={(v) => setForm({ ...form, clinicId: v })} options={clinics.map((c) => ({ value: c._id, label: `${c.city} - ${c.name}` }))} />
        <Select label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={[{ value: "weekly", label: "Weekly" }, { value: "monthly_nth_day", label: "Monthly nth day" }]} />
        <Select label="Day" value={form.dayOfWeek} onChange={(v) => setForm({ ...form, dayOfWeek: v })} options={dayNames.map((d, i) => ({ value: String(i), label: d }))} />
        {form.type === "monthly_nth_day" && <Input label="Nth week" type="number" value={form.nthWeek} onChange={(v) => setForm({ ...form, nthWeek: v })} />}
        <Input label="Start time" value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} />
        <Input label="End time" value={form.endTime} onChange={(v) => setForm({ ...form, endTime: v })} />
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-3 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active rule
        </label>
        <FormActions editing={Boolean(editingId)} onCancel={reset} />
      </form>
      <RecordList
        empty="No schedule rules yet."
        items={rules.map((rule) => ({
          id: rule._id,
          title: `${rule.type === "weekly" ? "Weekly" : `Week ${rule.nthWeek}`} - ${dayNames[rule.dayOfWeek]}`,
          detail: `${getClinicLabel(rule.clinicId, clinics)} - ${rule.startTime} to ${rule.endTime} - ${rule.isActive ? "Active" : "Inactive"}`,
          onEdit: () => startEdit(rule),
          onDelete: () => deleteRecord(`/schedule-rules/${rule._id}`, "Delete this schedule rule?", onDone),
        }))}
      />
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ status: Appointment["status"]; notes: string }>({ status: "pending", notes: "" });
  const startEdit = (appointment: Appointment) => {
    setEditingId(appointment._id);
    setForm({ status: appointment.status, notes: appointment.notes || "" });
  };
  const reset = () => {
    setEditingId(null);
    setForm({ status: "pending", notes: "" });
  };
  const updateStatus = async (id: string, status: Appointment["status"]) => {
    try {
      await api.patch(`/appointments/${id}`, { status }, true);
      toast.success("Appointment updated");
      onStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update appointment");
    }
  };
  const updateAppointment = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingId) return;

    try {
      await api.patch(`/appointments/${editingId}`, form, true);
      toast.success("Appointment updated");
      reset();
      onStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update appointment");
    }
  };

  return (
    <Panel title="Appointments" icon={CalendarClock}>
      {editingId && (
        <form onSubmit={updateAppointment} className="mb-4 grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-[220px_1fr_auto]">
          <Select
            label="Status"
            value={form.status}
            onChange={(value) => setForm({ ...form, status: value as Appointment["status"] })}
            options={[
              { value: "pending", label: "Pending" },
              { value: "confirmed", label: "Confirmed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
          <Input label="Notes" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} />
          <div className="flex gap-2 self-end">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white">
              <Save className="h-4 w-4" />
              Save
            </button>
            <button type="button" onClick={reset} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium">
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      )}
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
              <th>Notes</th>
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
                <td className="max-w-48 truncate">{item.notes || "-"}</td>
                <td className="flex flex-wrap gap-2 py-2">
                  <button onClick={() => updateStatus(item._id, "confirmed")} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">Confirm</button>
                  <button onClick={() => updateStatus(item._id, "cancelled")} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">Cancel</button>
                  <IconButton label="Edit" onClick={() => startEdit(item)} icon={Pencil} />
                  <IconButton label="Delete" danger onClick={() => deleteRecord(`/appointments/${item._id}`, "Delete this appointment?", onStatus)} icon={Trash2} />
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
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const resetTestimonial = () => {
    setTestimonial({ patientName: "", message: "", rating: "5" });
    setEditingTestimonialId(null);
  };
  const startTestimonialEdit = (item: Testimonial) => {
    setEditingTestimonialId(item._id);
    setTestimonial({ patientName: item.patientName, message: item.message, rating: String(item.rating) });
  };
  const testimonialBody = { ...testimonial, rating: Number(testimonial.rating) };

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
        <RecordList
          empty="No blogs yet."
          items={blogs.map((item) => ({
            id: item._id,
            title: item.title,
            detail: item.slug,
            onDelete: () => deleteRecord(`/blogs/${item._id}`, "Delete this blog?", onDone),
          }))}
        />
      </Panel>
      <Panel title="Testimonials" icon={MessageSquare}>
        <form
          onSubmit={(e) =>
            editingTestimonialId
              ? submitUpdate(e, `/testimonials/${editingTestimonialId}`, testimonialBody, onDone, resetTestimonial)
              : submitForm(e, "/testimonials", testimonialBody, onDone, resetTestimonial)
          }
          className="space-y-3"
        >
          <Input label="Patient name" value={testimonial.patientName} onChange={(v) => setTestimonial({ ...testimonial, patientName: v })} />
          <Textarea label="Message" value={testimonial.message} onChange={(v) => setTestimonial({ ...testimonial, message: v })} />
          <Input label="Rating" type="number" value={testimonial.rating} onChange={(v) => setTestimonial({ ...testimonial, rating: v })} />
          <FormActions editing={Boolean(editingTestimonialId)} onCancel={resetTestimonial} />
        </form>
        <RecordList
          empty="No testimonials yet."
          items={testimonials.map((item) => ({
            id: item._id,
            title: item.patientName,
            detail: `${item.rating}/5 - ${item.message}`,
            onEdit: () => startTestimonialEdit(item),
            onDelete: () => deleteRecord(`/testimonials/${item._id}`, "Delete this testimonial?", onDone),
          }))}
        />
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

async function submitUpdate(event: FormEvent, path: string, body: unknown, onDone: () => void, reset?: () => void) {
  event.preventDefault();
  try {
    await api.patch(path, body, true);
    toast.success("Updated successfully");
    reset?.();
    onDone();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Update failed");
  }
}

async function deleteRecord(path: string, message: string, onDone: () => void) {
  if (!window.confirm(message)) {
    return;
  }

  try {
    await api.delete(path, true);
    toast.success("Deleted successfully");
    onDone();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Delete failed");
  }
}

function getRecordId(record: Doctor | Clinic | string) {
  return typeof record === "string" ? record : record._id;
}

function getClinicLabel(record: Clinic | string, clinics: Clinic[]) {
  if (typeof record !== "string") {
    return `${record.city} - ${record.name}`;
  }

  const clinic = clinics.find((item) => item._id === record);
  return clinic ? `${clinic.city} - ${clinic.name}` : record;
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

function FormActions({ editing, onCancel }: { editing: boolean; onCancel: () => void }) {
  return (
    <div className="flex flex-wrap gap-2 md:self-end">
      <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white">
        {editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {editing ? "Update" : "Save"}
      </button>
      {editing && (
        <button type="button" onClick={onCancel} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700">
          <X className="h-4 w-4" />
          Cancel
        </button>
      )}
    </div>
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

function IconButton({ label, icon: Icon, onClick, danger = false }: { label: string; icon: LucideIcon; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${
        danger ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function RecordList({
  items,
  empty,
}: {
  empty: string;
  items: Array<{ id: string; title: string; detail?: string; onEdit?: () => void; onDelete?: () => void }>;
}) {
  return (
    <div className="mt-5 space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-3 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{item.title}</p>
            {item.detail && <p className="mt-1 truncate text-xs text-slate-500">{item.detail}</p>}
          </div>
          <div className="flex shrink-0 gap-2">
            {item.onEdit && <IconButton label="Edit" icon={Pencil} onClick={item.onEdit} />}
            {item.onDelete && <IconButton label="Delete" icon={Trash2} danger onClick={item.onDelete} />}
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">{empty}</p>}
    </div>
  );
}
