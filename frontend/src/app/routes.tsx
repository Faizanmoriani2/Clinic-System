import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Schedule } from "./components/Schedule";
import { Booking } from "./components/Booking";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { RequireAdmin } from "./components/RequireAdmin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "schedule", Component: Schedule },
      { path: "booking", Component: Booking },
      { path: "admin/login", Component: AdminLogin },
      {
        path: "admin",
        Component: RequireAdmin,
        children: [{ index: true, Component: AdminDashboard }],
      },
    ],
  },
]);
