import type { ClaimTimelineStep } from "@/types/claim";

export const CLAIM_TIMELINE_STEPS: ClaimTimelineStep[] = [
  "Diajukan",
  "Diverifikasi",
  "Diproses",
  "Selesai",
];

export const REQUIRED_CLAIM_DOCUMENTS: { key: string; label: string; optional?: boolean }[] = [
  { key: "ktp_nik", label: "KTP/NIK terverifikasi" },
  { key: "bpjs_card", label: "Kartu BPJS" },
  { key: "referral_letter", label: "Surat rujukan" },
  { key: "resume_medis", label: "Resume medis" },
  { key: "lab_radiology", label: "Hasil lab/radiologi jika ada", optional: true },
  { key: "procedure_proof", label: "Bukti tindakan" },
  { key: "icd10_code", label: "Kode diagnosis ICD-10" },
];
