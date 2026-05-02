import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { api, authStore } from "../lib/api";

type AuthResponse = {
  success: boolean;
  token: string;
  data: { id: string; username: string };
};

export function AdminLogin() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (authStore.isLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>(
        mode === "login" ? "/auth/login" : "/auth/register",
        { username, password }
      );
      authStore.setToken(response.token);
      toast.success(mode === "login" ? "Welcome back" : "Admin account created");
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Admin access</h1>
            <p className="text-sm text-slate-500">Manage doctors, clinics, schedules, and content.</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-md py-2 ${mode === "login" ? "bg-white font-medium shadow-sm" : "text-slate-500"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-md py-2 ${mode === "register" ? "bg-white font-medium shadow-sm" : "text-slate-500"}`}
          >
            First admin
          </button>
        </div>

        <label className="mb-2 block text-sm font-medium">Username</label>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-emerald-500"
          placeholder="admin"
        />

        <label className="mb-2 block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-5 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-emerald-500"
          placeholder="Minimum 6 characters"
        />

        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white disabled:opacity-70"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Login" : "Create admin"}
        </button>
      </form>
    </main>
  );
}
