import { useNavigate } from "react-router-dom";
import LandingHero from "@/components/LandingHero";
import AboutPage from "@/components/AboutPage";
import FeaturesPage from "@/components/FeaturesPage";
import EHRPartners from "@/components/EHRPartners";

export function LandingRoute() {
  const navigate = useNavigate();
  const goPage = (p: "beranda" | "tentang" | "fitur") =>
    navigate(p === "beranda" ? "/" : `/${p}`);
  return (
    <LandingHero
      onNavigate={(role) => navigate(role === "patient" ? "/login/pasien" : "/login/rumah-sakit")}
      onNavPage={goPage}
      onOpenEHR={() => navigate("/ehr")}
    />
  );
}

export function AboutRoute() {
  const navigate = useNavigate();
  return (
    <AboutPage
      onBack={() => navigate("/")}
      onNavigate={(p) => navigate(p === "beranda" ? "/" : `/${p}`)}
    />
  );
}

export function FeaturesRoute() {
  const navigate = useNavigate();
  return (
    <FeaturesPage
      onBack={() => navigate("/")}
      onNavigate={(p) => navigate(p === "beranda" ? "/" : `/${p}`)}
    />
  );
}

export function EHRRoute() {
  const navigate = useNavigate();
  return <EHRPartners onBack={() => navigate("/")} />;
}


