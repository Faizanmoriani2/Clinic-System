import { Link, NavLink, Outlet } from "react-router";
import { CalendarCheck, FileText, LayoutDashboard, Stethoscope } from "lucide-react";

export function Root() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Stethoscope className="h-5 w-5" />
            </span>
            <span className="truncate font-semibold">Allergy Clinic</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink
              to="/schedule"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 ${isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600"}`
              }
            >
              Schedule
            </NavLink>
            <NavLink
              to="/booking"
              className={({ isActive }) =>
                `hidden rounded-lg px-3 py-2 sm:inline-flex ${
                  isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600"
                }`
              }
            >
              Booking
            </NavLink>
            <NavLink
              to="/blogs"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 ${isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600"}`
              }
            >
              <FileText className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Blogs</span>
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 ${isActive ? "bg-slate-900 text-white" : "text-slate-600"}`
              }
            >
              <LayoutDashboard className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          </nav>
        </div>
      </header>
      <Outlet />
      <Link
        to="/booking"
        className="fixed bottom-4 left-4 right-4 z-30 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white shadow-lg shadow-emerald-900/20 sm:hidden"
      >
        <CalendarCheck className="h-5 w-5" />
        Book Appointment
      </Link>
    </div>
  );
}
