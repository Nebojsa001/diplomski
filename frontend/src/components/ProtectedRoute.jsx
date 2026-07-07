import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="page-loading">Učitavanje...</div>;
  }

  // nije ulogovan
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  //  role check (ako je definisan)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <Outlet />;
}
