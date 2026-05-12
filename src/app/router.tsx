import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { LandingRoute, AboutRoute, FeaturesRoute, EHRRoute } from "@/routes/landing";
import NotFound from "@/pages/NotFound";

const PatientLoginRoute = lazy(() => import("@/routes/auth/PatientLoginRoute"));
const HospitalLoginRoute = lazy(() => import("@/routes/auth/HospitalLoginRoute"));
const PatientDashboardRoute = lazy(() => import("@/routes/patient/DashboardRoute"));
const HospitalDashboardRoute = lazy(() => import("@/routes/hospital/DashboardRoute"));
const SubmitClaimRoute = lazy(() => import("@/routes/hospital/SubmitClaimRoute"));
const ClaimDetailRoute = lazy(() => import("@/routes/hospital/ClaimDetailRoute"));

const Boundary = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>}>
    {children}
  </Suspense>
);

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
      <ProtectedRoute role="patient">
        <Boundary><PatientDashboardRoute /></Boundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/rumah-sakit/dashboard",
    element: (
      <ProtectedRoute role="hospital">
        <Boundary><HospitalDashboardRoute /></Boundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/rumah-sakit/ajukan",
    element: (
      <ProtectedRoute role="hospital">
        <Boundary><SubmitClaimRoute /></Boundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/rumah-sakit/klaim/:claimId",
    element: (
      <ProtectedRoute role="hospital">
        <Boundary><ClaimDetailRoute /></Boundary>
      </ProtectedRoute>
    ),
  },
  // Backward-compat redirects from previous short paths
  { path: "/login/rs", element: <Navigate to="/login/rumah-sakit" replace /> },
  { path: "/pasien", element: <Navigate to="/pasien/dashboard" replace /> },
  { path: "/rs", element: <Navigate to="/rumah-sakit/dashboard" replace /> },
  { path: "/rs/ajukan", element: <Navigate to="/rumah-sakit/ajukan" replace /> },
  { path: "/rs/klaim/:claimId", element: <Navigate to="/rumah-sakit/dashboard" replace /> },
  { path: "/dashboard", element: <Navigate to="/" replace /> },
  { path: "*", element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
