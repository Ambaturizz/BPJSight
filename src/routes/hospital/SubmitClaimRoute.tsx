import { useNavigate } from "react-router-dom";
import SmartClaimSubmission from "@/components/SmartClaimSubmission";

export default function SubmitClaimRoute() {
  const navigate = useNavigate();
  return (
    <SmartClaimSubmission
      onBack={() => navigate("/rumah-sakit/dashboard")}
      onSuccess={() => navigate("/rumah-sakit/dashboard")}
    />
  );
}
