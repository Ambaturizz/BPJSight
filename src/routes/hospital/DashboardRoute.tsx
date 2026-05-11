import { useNavigate } from "react-router-dom";
import HospitalDashboard from "@/components/HospitalDashboard";

export default function HospitalDashboardRoute() {
  const navigate = useNavigate();
  return (
    <HospitalDashboard
      onBack={() => navigate("/")}
      onSubmitClaim={() => navigate("/rs/ajukan")}
    />
  );
}
