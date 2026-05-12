import { API_DELAY_MS } from "@/constants/app";
import { mockBenefits } from "@/data/mockBenefits";
import { HOSPITAL_CLAIMS } from "@/data/mockHospitalClaims";
import { mockPatientClaims } from "@/data/mockPatientClaims";
import { mockStats } from "@/data/mockStats";
import { scoreClaim } from "@/features/risk/scoring";
import type { Benefit, DashboardStat } from "@/types/dashboard";
import type { HospitalClaim, PatientClaim } from "@/types/claim";

function delay<T>(data: T, ms = API_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), ms);
  });
}

function clonePatientClaim(claim: PatientClaim): PatientClaim {
  return {
    ...claim,
    steps: [...claim.steps],
    timeline: claim.timeline.map((item) => ({ ...item })),
    documents: claim.documents.map((document) => ({ ...document })),
    riskReasons: [...claim.riskReasons],
    recommendations: [...claim.recommendations],
    riskFactors: [...claim.riskFactors],
    recommendedActions: [...claim.recommendedActions],
  };
}

function cloneHospitalClaim(claim: HospitalClaim): HospitalClaim {
  return {
    ...claim,
    documents: claim.documents.map((document) => ({ ...document })),
    audit: claim.audit.map((entry) => ({ ...entry })),
    riskReasons: [...claim.riskReasons],
    riskFactors: [...claim.riskFactors],
    verifierNotes: [...claim.verifierNotes],
    revisionRequests: [...claim.revisionRequests],
    recommendedActions: [...claim.recommendedActions],
  };
}

async function getPatientClaims(): Promise<PatientClaim[]> {
  return delay(mockPatientClaims.map(clonePatientClaim));
}

async function getPatientClaimById(id: string): Promise<PatientClaim | undefined> {
  const claims = await getPatientClaims();
  return claims.find((claim) => claim.id === id);
}

async function getHospitalClaims(): Promise<HospitalClaim[]> {
  const claims = HOSPITAL_CLAIMS.map((claim) => {
    const cloned = cloneHospitalClaim(claim);
    const risk = scoreClaim(cloned);

    return {
      ...cloned,
      risk: risk.score,
      riskLevel: risk.level,
      confidence: risk.confidence,
    };
  });

  return delay(claims);
}

async function getHospitalClaimById(id: string): Promise<HospitalClaim | undefined> {
  const claims = await getHospitalClaims();
  return claims.find((claim) => claim.id === id);
}

async function getBenefits(): Promise<Benefit[]> {
  return delay([...mockBenefits], 350);
}

async function getDashboardStats(): Promise<DashboardStat[]> {
  return delay([...mockStats], 350);
}

export const claimsService = {
  getPatientClaims,
  getPatientClaimById,
  getHospitalClaims,
  getHospitalClaimById,
  getBenefits,
  getDashboardStats,
};


