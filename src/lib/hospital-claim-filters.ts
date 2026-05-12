import type { HospitalClaim } from "@/types/claim";
import type { HospitalClaimFiltersState } from "@/components/hospital/ClaimFilters";

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function getSubmittedTime(claim: HospitalClaim): number {
  const time = new Date(claim.submittedAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function applyHospitalClaimFilters(claims: HospitalClaim[], filters: HospitalClaimFiltersState): HospitalClaim[] {
  const q = normalizeText(filters.query);
  const minRisk = Math.min(filters.riskMin, filters.riskMax);
  const maxRisk = Math.max(filters.riskMin, filters.riskMax);

  return claims
    .filter((claim) => {
      const matchesQuery =
        !q ||
        normalizeText(claim.patient).includes(q) ||
        normalizeText(claim.diagnosis).includes(q) ||
        normalizeText(claim.id).includes(q) ||
        normalizeText(claim.icd10).includes(q);

      const matchesRiskStatus = filters.riskStatus === "all" || claim.status === filters.riskStatus;
      const matchesDocumentStatus = filters.documentStatus === "all" || claim.docs === filters.documentStatus;
      const matchesRiskRange = claim.risk >= minRisk && claim.risk <= maxRisk;

      return matchesQuery && matchesRiskStatus && matchesDocumentStatus && matchesRiskRange;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case "risk_asc":
          return a.risk - b.risk;
        case "amount_desc":
          return b.amountIDR - a.amountIDR;
        case "amount_asc":
          return a.amountIDR - b.amountIDR;
        case "date_desc":
          return getSubmittedTime(b) - getSubmittedTime(a);
        case "risk_desc":
        default:
          return b.risk - a.risk;
      }
    });
}


