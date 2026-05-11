import { useNavigate } from "react-router-dom";
import SmartClaimSubmission from "@/components/SmartClaimSubmission";

export default function SubmitClaimRoute() {
  const navigate = useNavigate();
  return (
    <SmartClaimSubmission
      onBack={() => navigate("/rs")}
      onSuccess={() => navigate("/rs")}
    />
  );
}
