import { useState, useEffect } from "react";
import LandingHero from "@/components/LandingHero";
import PatientLogin from "@/components/PatientLogin";
import HospitalLogin from "@/components/HospitalLogin";
import PatientDashboard from "@/components/PatientDashboard";
import HospitalDashboard from "@/components/HospitalDashboard";
import SmartClaimSubmission from "@/components/SmartClaimSubmission";
import AboutPage from "@/components/AboutPage";
import FeaturesPage from "@/components/FeaturesPage";
import EHRPartners from "@/components/EHRPartners";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";

type View =
  | "landing"
  | "tentang"
  | "fitur"
  | "ehr"
  | "patient-login"
  | "hospital-login"
  | "patient-dashboard"
  | "hospital-dashboard"
  | "hospital-submit-claim";

const Index = () => {
  const [view, setView] = useState<View>("landing");
  const { session, refresh } = useSession(() => {
    toast.warning("Sesi berakhir karena tidak aktif. Silakan masuk kembali.");
    setView("landing");
  });

  // Restore dashboard if returning user has saved session
  useEffect(() => {
    if (view === "landing" && session) {
      setView(session.role === "patient" ? "patient-dashboard" : "hospital-dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Route protection: kick out unauthenticated users from protected views
  const protectedViews: View[] = ["patient-dashboard", "hospital-dashboard", "hospital-submit-claim"];
  useEffect(() => {
    if (protectedViews.includes(view) && !session) {
      setView("landing");
    }
  }, [view, session]);

  const goPage = (page: "beranda" | "tentang" | "fitur") => {
    setView(page === "beranda" ? "landing" : page);
  };

  const goLanding = () => { refresh(); setView("landing"); };

  switch (view) {
    case "patient-login":
      return <PatientLogin onBack={() => setView("landing")} onLogin={() => { refresh(); setView("patient-dashboard"); }} />;
    case "hospital-login":
      return <HospitalLogin onBack={() => setView("landing")} onLogin={() => { refresh(); setView("hospital-dashboard"); }} />;
    case "patient-dashboard":
      return <PatientDashboard onBack={goLanding} />;
    case "hospital-dashboard":
      return <HospitalDashboard onBack={goLanding} onSubmitClaim={() => setView("hospital-submit-claim")} />;
    case "hospital-submit-claim":
      return <SmartClaimSubmission onBack={() => setView("hospital-dashboard")} onSuccess={() => setView("hospital-dashboard")} />;
    case "tentang":
      return <AboutPage onBack={() => setView("landing")} onNavigate={goPage} />;
    case "fitur":
      return <FeaturesPage onBack={() => setView("landing")} onNavigate={goPage} />;
    case "ehr":
      return <EHRPartners onBack={() => setView("landing")} />;
    default:
      return (
        <LandingHero
          onNavigate={(role) => setView(role === "patient" ? "patient-login" : "hospital-login")}
          onNavPage={goPage}
          onOpenEHR={() => setView("ehr")}
        />
      );
  }
};

export default Index;
