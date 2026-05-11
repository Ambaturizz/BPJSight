import { useMemo } from "react";
import { CLAIMS } from "@/data/claims.mock";
import type { Claim } from "@/types/claim";
import { scoreClaim } from "@/features/risk/scoring";

/** All claims with AI risk computed deterministically. */
export function useClaims(): Claim[] {
  return useMemo(() => {
    return CLAIMS.map((c) => {
      const r = scoreClaim(c);
      return { ...c, risk: r.score, confidence: r.confidence };
    });
  }, []);
}

export function useClaim(id: string | undefined): Claim | undefined {
  const claims = useClaims();
  return useMemo(() => claims.find((c) => c.id === id), [claims, id]);
}
