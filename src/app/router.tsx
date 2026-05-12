import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import { lazy, Suspense, type ReactNode } from "react";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { LandingRoute, AboutRoute, FeaturesRoute, EHRRoute } from "@/routes/landing";
import NotFound from "@/pages/NotFound";

const PatientLoginRoute = lazy(() => import("@/routes/auth/PatientLoginRoute"));
const HospitalLoginRoute = lazy(() => import("@/routes/auth/HospitalLoginRoute"));
const PatientDashboardRoute = lazy(() => import("@/routes/patient/DashboardRoute"));
const HospitalDashboardRoute = lazy(() => import("@/routes/hospital/DashboardRoute"));
const SubmitClaimRoute = lazy(() => import("@/routes/hospital/SubmitClaimRoute"));
const PatientClaimDetail = lazy(() => import("@/pages/PatientClaimDetail"));
const HospitalClaimDetail = lazy(() => import("@/pages/HospitalClaimDetail"));

const Boundary = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Memuat...</div>}>
    {children}
  </Suspense>
);

function LegacyHospitalClaimRedirect() {
  const { claimId } = useParams<{ claimId: string }>();
  return <Navigate to={`/rumah-sakit/klaim/${claimId ?? ""}`} replace />;
}

const router = createBrowserRouter([
  { path: "/", element: <LandingRoute /> },
  { path: "/tentang", element: <AboutRoute /> },
  { path: "/fitur", element: <FeaturesRoute /> },
  { path: "/ehr", element: <EHRRoute /> },
  { path: "/login/pasien", element: <Boundary><PatientLoginRoute /></Boundary> },
  { path: "/login/rumah-sakit", element: <Boundary><HospitalLoginRoute /></Boundary> },
  {
    path: "/pasien/dashboard",
    element: (
      <ProtectedRoute allowedRole="patient">
        <Boundary><PatientDashboardRoute /></Boundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/pasien/klaim/:claimId",
    element: (
      <ProtectedRoute allowedRole="patient">
        <Boundary><PatientClaimDetail /></Boundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/rumah-sakit/dashboard",
    element: (
      <ProtectedRoute allowedRole="hospital">
        <Boundary><HospitalDashboardRoute /></Boundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/rumah-sakit/ajukan",
    element: (
      <ProtectedRoute allowedRole="hospital">
        <Boundary><SubmitClaimRoute /></Boundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/rumah-sakit/klaim/:claimId",
    element: (
      <ProtectedRoute allowedRole="hospital">
        <Boundary><HospitalClaimDetail /></Boundary>
      </ProtectedRoute>
    ),
  },
  { path: "/login/rs", element: <Navigate to="/login/rumah-sakit" replace /> },
  { path: "/pasien", element: <Navigate to="/pasien/dashboard" replace /> },
  { path: "/rs", element: <Navigate to="/rumah-sakit/dashboard" replace /> },
  { path: "/rs/ajukan", element: <Navigate to="/rumah-sakit/ajukan" replace /> },
  { path: "/rs/klaim/:claimId", element: <LegacyHospitalClaimRedirect /> },
  { path: "/dashboard", element: <Navigate to="/" replace /> },
  { path: "*", element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

