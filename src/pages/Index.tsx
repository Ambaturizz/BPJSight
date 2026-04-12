import { useState } from "react";
import LandingHero from "@/components/LandingHero";
import PatientLogin from "@/components/PatientLogin";
import HospitalLogin from "@/components/HospitalLogin";
import PatientDashboard from "@/components/PatientDashboard";
import HospitalDashboard from "@/components/HospitalDashboard";
import SmartClaimSubmission from "@/components/SmartClaimSubmission";

type View = "landing" | "patient-login" | "hospital-login" | "patient-dashboard" | "hospital-dashboard" | "hospital-submit-claim";

const Index = () => {
  const [view, setView] = useState<View>("landing");

  switch (view) {
    case "patient-login":
      return <PatientLogin onBack={() => setView("landing")} onLogin={() => setView("patient-dashboard")} />;
    case "hospital-login":
      return <HospitalLogin onBack={() => setView("landing")} onLogin={() => setView("hospital-dashboard")} />;
    case "patient-dashboard":
      return <PatientDashboard onBack={() => setView("landing")} />;
    case "hospital-dashboard":
      return <HospitalDashboard onBack={() => setView("landing")} onSubmitClaim={() => setView("hospital-submit-claim")} />;
    case "hospital-submit-claim":
      return <SmartClaimSubmission onBack={() => setView("hospital-dashboard")} onSuccess={() => setView("hospital-dashboard")} />;
    default:
      return <LandingHero onNavigate={(role) => setView(role === "patient" ? "patient-login" : "hospital-login")} />;
  }
};

export default Index;
