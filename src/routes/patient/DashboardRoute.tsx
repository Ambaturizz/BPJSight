import { useNavigate } from "react-router-dom";
import PatientDashboard from "@/components/PatientDashboard";

export default function PatientDashboardRoute() {
  const navigate = useNavigate();
  return <PatientDashboard onBack={() => navigate("/")} />;
}


