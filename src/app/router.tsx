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
  { path: "/login/rs", element: <Boundary><HospitalLoginRoute /></Boundary> },
  {
    path: "/pasien",
    element: (
      <ProtectedRoute role="patient">
        <Boundary><PatientDashboardRoute /></Boundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/rs",
    element: (
      <ProtectedRoute role="hospital">
        <Boundary><HospitalDashboardRoute /></Boundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/rs/ajukan",
    element: (
      <ProtectedRoute role="hospital">
        <Boundary><SubmitClaimRoute /></Boundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/rs/klaim/:claimId",
    element: (
      <ProtectedRoute role="hospital">
        <Boundary><ClaimDetailRoute /></Boundary>
      </ProtectedRoute>
    ),
  },
  { path: "/dashboard", element: <Navigate to="/" replace /> },
  { path: "*", element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
