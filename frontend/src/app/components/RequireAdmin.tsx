import { Navigate, Outlet, useLocation } from "react-router";
import { authStore } from "../lib/api";

export function RequireAdmin() {
  const location = useLocation();

  if (!authStore.isLoggedIn()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
