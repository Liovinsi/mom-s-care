import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUserDashboardPath, normalizeRole } from "./roleRoutes";

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  if (roles?.length && !roles.includes(normalizeRole(user?.role))) {
    return <Navigate to={getCurrentUserDashboardPath(user)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
