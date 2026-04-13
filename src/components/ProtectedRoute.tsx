import { Navigate } from "react-router-dom";
import { getAuthUser, isAuthSessionActive } from "@/lib/auth";
import { Role } from "@/types/petcare";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: Role;
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  if (!isAuthSessionActive()) {
    return <Navigate to="/login" replace />;
  }

  const user = getAuthUser();
  if (role && user?.role !== role) {
    return <Navigate to={`/${user?.role || "login"}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
