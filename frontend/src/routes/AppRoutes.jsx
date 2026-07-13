import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import UserProfile from "@/pages/UserProfile";
import PatientReports from "@/pages/patient/PatientReports";
import DoctorReports from "@/pages/doctor/DoctorReports";
import NotFound from "@/pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* AUTH REQUIRED (ALL LOGGED USERS) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<UserProfile />} />
          <Route path="/reports" element={<PatientReports />} />
        </Route>
      </Route>

      {/* DOCTOR ONLY ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/doctor-dashboard" element={<Dashboard />} />
          <Route path="/doctor-reports" element={<DoctorReports />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
