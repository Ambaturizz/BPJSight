export type ClaimStatus =
  | "aman"
  | "sedang"
  | "berisiko"
  | "ditolak"
  | "selesai"
  | "diproses";

export type DocumentStatus = "Lengkap" | "Sebagian" | "Tidak Lengkap";

/**
 * Backward compatibility untuk file lama.
 */
export type DocStatus = DocumentStatus;

export type RiskLevel = "rendah" | "sedang" | "tinggi";

export type ClaimTimelineStep =
  | "Diajukan"
  | "Diverifikasi"
  | "Diproses"
  | "Selesai";

export type ClaimTimelineStatus = "completed" | "current" | "pending" | "rejected";

export type ClaimDocumentReviewStatus =
  | "missing"
  | "waiting_verification"
  | "verified"
  | "revision_requested";

export interface ClaimTimelineItem {
  title: string;
  description: string;
  at: string;
  status: ClaimTimelineStatus;
}

export interface ClaimDocument {
  key: string;
  label: string;
  uploaded: boolean;
  verified: boolean;
  optional?: boolean;
  fileName?: string;
  uploadedAt?: string;
  reviewStatus?: ClaimDocumentReviewStatus;
  note?: string;
}

export interface PatientClaimDocument {
  key: string;
  label: string;
  status: "verified" | "review" | "missing";
  updatedAt: string;
  optional?: boolean;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface ClaimAuditEntry {
  at: string;
  actor: string;
  action: string;
}

export interface PatientClaim {
  id: string;
  title: string;
  hospital: string;
  date: string;
  amount: string;
  status: ClaimStatus;
  steps: ClaimTimelineStep[];
  currentStep: number;
  risk: string | null;
  riskScore: number | null;
  riskLevel: RiskLevel;
  aiConfidence: number | null;
  timeline: ClaimTimelineItem[];
  documents: PatientClaimDocument[];
  /** Legacy alias. Pakai riskFactors untuk UI baru. */
  riskReasons: string[];
  /** Legacy alias. Pakai recommendedActions untuk UI baru. */
  recommendations: string[];
  riskFactors: string[];
  recommendedActions: string[];
}

export interface HospitalClaim {
  id: string;
  patient: string;
  nik: string;
  bpjs: string;
  diagnosis: string;
  icd10: string;
  amountIDR: number;
  submittedAt: string;
  status: ClaimStatus;
  risk: number;
  riskLevel?: RiskLevel;
  confidence: number;
  docs: DocumentStatus;
  documents: ClaimDocument[];
  audit: ClaimAuditEntry[];
  fhirBundleId: string;
  dpjp: string;
  /** Legacy alias. Pakai riskFactors untuk UI baru. */
  riskReasons: string[];
  riskFactors: string[];
  verifierNotes: string[];
  revisionRequests: string[];
  recommendedActions: string[];
}

/**
 * Backward compatibility untuk useClaimFilters, scoring, dan ClaimDetailRoute.
 */
export type Claim = HospitalClaim;


