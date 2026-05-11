export type ClaimStatus = "aman" | "sedang" | "berisiko" | "ditolak" | "selesai" | "diproses";
export type DocStatus = "Lengkap" | "Sebagian" | "Tidak Lengkap";

export interface ClaimDocument {
  key: string;
  label: string;
  uploaded: boolean;
  verified: boolean;
}

export interface ClaimAuditEntry {
  at: string; // ISO
  actor: string;
  action: string;
}

export interface Claim {
  /** Sequential number 1..N (display id) */
  id: string;
  patient: string;
  nik: string;
  bpjs: string;
  diagnosis: string;
  icd10: string;
  amountIDR: number;
  submittedAt: string; // ISO
  status: ClaimStatus;
  /** AI risk 0..100 */
  risk: number;
  /** Confidence 0..100 */
  confidence: number;
  docs: DocStatus;
  documents: ClaimDocument[];
  audit: ClaimAuditEntry[];
  fhirBundleId: string;
  dpjp: string;
}
