import { useMemo } from "react";
import { HOSPITAL_CLAIMS } from "@/data/mockHospitalClaims";
import type { Claim } from "@/types/claim";
import { scoreClaim } from "@/features/risk/scoring";

/**
 * Hook lama tetap sinkron untuk menjaga kompatibilitas
 * dengan ClaimDetailRoute.
 */
export function useClaims(): Claim[] {
  return useMemo(() => {
    return HOSPITAL_CLAIMS.map((claim) => {
      const risk = scoreClaim(claim);

      return {
        ...claim,
        risk: risk.score,
        confidence: risk.confidence,
      };
    });
  }, []);
}

export function useClaim(id: string | undefined): Claim | undefined {
  const claims = useClaims();

  return useMemo(
    () => claims.find((claim) => claim.id === id),
    [claims, id]
  );
}


