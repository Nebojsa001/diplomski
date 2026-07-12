import { Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import UserProfile from "@/pages/UserProfile";
import NotFound from "@/pages/NotFound";

function ProtectedLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* AUTH REQUIRED (ALL LOGGED USERS) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<UserProfile />} />
        </Route>
      </Route>

      {/* DOCTOR ONLY ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/doctor-dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
