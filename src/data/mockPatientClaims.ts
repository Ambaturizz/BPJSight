import { CLAIM_TIMELINE_STEPS, REQUIRED_CLAIM_DOCUMENTS } from "@/constants/claims";
import type { PatientClaim, PatientClaimDocument } from "@/types/claim";

function baseDocuments(variant: "safe" | "risk" | "done"): PatientClaimDocument[] {
  const dates = ["2024-03-28", "2024-03-28", "2024-03-29", "2024-03-29", "2024-03-30", "2024-03-30", "2024-03-31"];

  return REQUIRED_CLAIM_DOCUMENTS.map((document, index) => {
    const isRiskMissing = variant === "risk" && ["resume_medis", "procedure_proof"].includes(document.key);
    const isRiskReview = variant === "risk" && ["lab_radiology", "icd10_code"].includes(document.key);
    const status: PatientClaimDocument["status"] =
      variant === "done" ? "verified" : isRiskMissing ? "missing" : isRiskReview ? "review" : "verified";

    return {
      key: document.key,
      label: document.label,
      optional: document.optional,
      status,
      updatedAt: status === "missing" ? "-" : dates[index] ?? dates[0],
      fileName:
        status === "missing"
          ? undefined
          : `${document.key.replaceAll("_", "-")}-${variant === "done" ? "final" : "draft"}.pdf`,
      mimeType: status === "missing" ? undefined : "application/pdf",
      fileSize: status === "missing" ? undefined : 420_000 + index * 72_000,
    };
  });
}

export const mockPatientClaims: PatientClaim[] = [
  {
    id: "KLM-2024-001",
    title: "Rawat Jalan - Poli Jantung",
    hospital: "RS Polisi MBG",
    date: "28 Mar 2024",
    amount: "Rp 1.250.000",
    status: "diproses",
    steps: [...CLAIM_TIMELINE_STEPS],
    currentStep: 2,
    risk: null,
    riskScore: 24,
    riskLevel: "rendah",
    aiConfidence: 86,
    timeline: [
      { title: "Klaim diajukan", description: "Klaim diterima oleh sistem BPJSight.", at: "2024-03-28T08:15:00+07:00", status: "completed" },
      { title: "Dokumen diverifikasi", description: "SEP, rekam medis, dan dokumen penunjang sedang dicek.", at: "2024-03-28T10:30:00+07:00", status: "completed" },
      { title: "Diproses rumah sakit", description: "Tim klaim RS sedang menunggu validasi akhir.", at: "2024-03-29T09:00:00+07:00", status: "current" },
      { title: "Menunggu keputusan", description: "Status akhir akan muncul setelah verifikasi selesai.", at: "-", status: "pending" },
    ],
    documents: baseDocuments("safe"),
    riskReasons: [],
    riskFactors: [],
    recommendations: [
      "Pantau status klaim secara berkala melalui dashboard.",
      "Simpan bukti kunjungan dan hasil pemeriksaan sampai klaim selesai.",
    ],
    recommendedActions: [
      "Pantau status klaim secara berkala melalui dashboard.",
      "Simpan bukti kunjungan dan hasil pemeriksaan sampai klaim selesai.",
    ],
  },
  {
    id: "KLM-2024-002",
    title: "Rawat Inap - Bedah Minor",
    hospital: "RS Polisi MBG",
    date: "15 Mar 2024",
    amount: "Rp 8.500.000",
    status: "berisiko",
    steps: [...CLAIM_TIMELINE_STEPS],
    currentStep: 1,
    risk: "Diagnosis dan tindakan belum terdokumentasi konsisten di semua dokumen. Hubungi RS untuk melengkapi dokumentasi sebelum proses verifikasi berlanjut.",
    riskScore: 78,
    riskLevel: "tinggi",
    aiConfidence: 82,
    timeline: [
      { title: "Klaim diajukan", description: "Klaim rawat inap diterima sistem.", at: "2024-03-15T11:20:00+07:00", status: "completed" },
      { title: "Validasi dokumen", description: "Sistem menemukan dokumen medis yang belum lengkap.", at: "2024-03-15T15:10:00+07:00", status: "current" },
      { title: "Perbaikan dokumen", description: "Resume medis dan bukti tindakan perlu dilengkapi.", at: "-", status: "pending" },
      { title: "Keputusan akhir", description: "Menunggu verifikasi ulang setelah dokumen diperbaiki.", at: "-", status: "pending" },
    ],
    documents: baseDocuments("risk"),
    riskReasons: [
      "Dokumen resume medis belum lengkap.",
      "Kode diagnosis belum selaras dengan tindakan.",
      "Dokumen pendukung belum diverifikasi.",
    ],
    riskFactors: [
      "Dokumen resume medis belum lengkap.",
      "Kode diagnosis belum selaras dengan tindakan.",
      "Nilai klaim lebih tinggi dari rata-rata kasus serupa.",
      "Dokumen pendukung belum diverifikasi.",
    ],
    recommendations: [
      "Hubungi admin klaim RS untuk meminta unggah resume medis DPJP.",
      "Pastikan diagnosis, tindakan, dan tanggal rawat inap konsisten di semua dokumen.",
      "Cek kembali status dalam 1–2 hari kerja setelah dokumen diperbaiki.",
    ],
    recommendedActions: [
      "Lengkapi resume medis.",
      "Periksa ulang kode ICD-10.",
      "Upload dokumen pendukung.",
      "Minta validasi dokter penanggung jawab.",
    ],
  },
  {
    id: "KLM-2024-003",
    title: "Rawat Jalan - Poli Mata",
    hospital: "RS Polisi MBG",
    date: "5 Mar 2024",
    amount: "Rp 650.000",
    status: "selesai",
    steps: [...CLAIM_TIMELINE_STEPS],
    currentStep: 3,
    risk: null,
    riskScore: 8,
    riskLevel: "rendah",
    aiConfidence: 91,
    timeline: [
      { title: "Klaim diajukan", description: "Klaim rawat jalan diterima sistem.", at: "2024-03-05T09:00:00+07:00", status: "completed" },
      { title: "Dokumen diverifikasi", description: "Seluruh dokumen dasar sudah sesuai.", at: "2024-03-05T13:45:00+07:00", status: "completed" },
      { title: "Diproses", description: "Klaim selesai diverifikasi oleh rumah sakit.", at: "2024-03-06T10:15:00+07:00", status: "completed" },
      { title: "Selesai", description: "Klaim disetujui dan ditutup.", at: "2024-03-07T14:05:00+07:00", status: "completed" },
    ],
    documents: baseDocuments("done"),
    riskReasons: [],
    riskFactors: [],
    recommendations: [
      "Unduh atau simpan ringkasan klaim untuk arsip pribadi.",
      "Tidak ada tindakan lanjutan yang diperlukan saat ini.",
    ],
    recommendedActions: [
      "Simpan ringkasan klaim untuk arsip pribadi.",
      "Tidak ada tindakan lanjutan yang diperlukan saat ini.",
    ],
  },
];


