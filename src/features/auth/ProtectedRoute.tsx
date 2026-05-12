import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import LoadingState from "@/components/feedback/LoadingState";
import { useAuth } from "./AuthProvider";
import type { Role, UserRole } from "@/types/user";

interface ProtectedRouteProps {
  allowedRole?: UserRole;
  /** Backward compatibility untuk router lama. */
  role?: Role;
  children: ReactNode;
}

function LoadingSession() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <LoadingState title="Memeriksa sesi..." description="Mohon tunggu sebentar." />
    </div>
  );
}

export function ProtectedRoute({ allowedRole, role, children }: ProtectedRouteProps) {
  const requiredRole = allowedRole ?? role;
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSession />;

  if (!isAuthenticated || !currentUser) {
    const loginPath = requiredRole === "hospital" ? "/login/rumah-sakit" : "/login/pasien";
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    const correctDashboard = currentUser.role === "patient" ? "/pasien/dashboard" : "/rumah-sakit/dashboard";
    return <Navigate to={correctDashboard} replace />;
  }

  return <>{children}</>;
}


