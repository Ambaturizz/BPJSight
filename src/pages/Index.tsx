import { useState } from "react";
import LandingHero from "@/components/LandingHero";
import PatientDashboard from "@/components/PatientDashboard";
import HospitalDashboard from "@/components/HospitalDashboard";

type View = "landing" | "patient" | "hospital";

const Index = () => {
  const [view, setView] = useState<View>("landing");

  if (view === "patient") return <PatientDashboard onBack={() => setView("landing")} />;
  if (view === "hospital") return <HospitalDashboard onBack={() => setView("landing")} />;
  return <LandingHero onNavigate={(role) => setView(role)} />;
};

export default Index;
