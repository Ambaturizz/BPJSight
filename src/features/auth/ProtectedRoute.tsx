import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import type { Role } from "@/types/user";

interface Props {
  role?: Role;
  children: ReactNode;
}

export function ProtectedRoute({ role, children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const loginPath = role === "hospital" ? "/login/rumah-sakit" : "/login/pasien";
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }
  if (role && user.role !== role) {
    const home = user.role === "patient" ? "/pasien/dashboard" : "/rumah-sakit/dashboard";
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}
