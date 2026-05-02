const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "clinic_admin_token";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export const authStore = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => Boolean(localStorage.getItem(TOKEN_KEY)),
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = authStore.getToken();
  if (options.auth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Something went wrong");
  }

  return payload;
}

export const api = {
  get: <T>(path: string, auth = false) => apiRequest<T>(path, { method: "GET", auth }),
  post: <T>(path: string, body: unknown, auth = false) =>
    apiRequest<T>(path, { method: "POST", body: JSON.stringify(body), auth }),
  patch: <T>(path: string, body: unknown, auth = false) =>
    apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body), auth }),
  delete: <T>(path: string, auth = false) => apiRequest<T>(path, { method: "DELETE", auth }),
};

export type ApiList<T> = { success: boolean; data: T[] };
export type ApiOne<T> = { success: boolean; data: T };
