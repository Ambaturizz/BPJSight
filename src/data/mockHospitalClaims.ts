import { REQUIRED_CLAIM_DOCUMENTS } from "@/constants/claims";
import type {
  ClaimDocument,
  DocumentStatus,
  HospitalClaim,
} from "@/types/claim";

export const REQUIRED_DOCS = REQUIRED_CLAIM_DOCUMENTS;

const PATIENTS = [
  "Aurora Senja",
  "Kenzie Althaf",
  "Alesha Zefanya",
  "Kenzo Dirgantara",
  "Clarissa Larasati",
  "Gibran Bumi",
  "Keisya Aurelia",
  "Naufal Atharrazka",
  "Freya Aninditha",
  "Zayyan Arkhanza",
];

const DIAGNOSES: { name: string; icd10: string; amount: number }[] = [
  { name: "Jantung Koroner", icd10: "I25.1", amount: 12_500_000 },
  { name: "Diabetes Tipe 2", icd10: "E11.9", amount: 3_200_000 },
  { name: "Fraktur Femur", icd10: "S72.0", amount: 18_700_000 },
  { name: "Appendisitis", icd10: "K35.8", amount: 5_100_000 },
  { name: "Pneumonia", icd10: "J18.9", amount: 8_900_000 },
  { name: "Demam Berdarah", icd10: "A91", amount: 4_300_000 },
  { name: "Asma Akut", icd10: "J45.9", amount: 2_800_000 },
  { name: "Hernia Inguinalis", icd10: "K40.9", amount: 15_200_000 },
  { name: "Gagal Ginjal", icd10: "N18.5", amount: 22_100_000 },
  { name: "Stroke Ringan", icd10: "I63.9", amount: 11_600_000 },
];

const DPJPS = [
  "dr. Anjasmara, Sp.JP",
  "dr. Brilian, Sp.PD",
  "dr. Citra, Sp.OT",
  "dr. Dirga, Sp.B",
  "dr. Elsa, Sp.P",
  "dr. Farhan, Sp.A",
  "dr. Gita, Sp.P",
  "dr. Hadi, Sp.B",
  "dr. Indira, Sp.PD",
  "dr. Joshua, Sp.S",
];

function dateNDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.max(days, 0));
  return date.toISOString();
}

function buildDocs(level: DocumentStatus, seed: number): ClaimDocument[] {
  const uploadedCount = level === "Lengkap" ? REQUIRED_DOCS.length : level === "Sebagian" ? 5 : 3;
  const verifiedCount = level === "Lengkap" ? REQUIRED_DOCS.length : level === "Sebagian" ? 3 : 1;

  return REQUIRED_DOCS.map((doc, index) => {
    const uploaded = index < uploadedCount;
    const verified = index < verifiedCount;
    return {
      key: doc.key,
      label: doc.label,
      optional: doc.optional,
      uploaded,
      verified,
      reviewStatus: verified ? "verified" : uploaded ? "waiting_verification" : "missing",
      fileName: uploaded ? `${doc.key.replaceAll("_", "-")}-klaim-${seed}.pdf` : undefined,
      uploadedAt: uploaded ? dateNDaysAgo(seed + index) : undefined,
    };
  });
}

const STATUSES: { docs: DocumentStatus; status: HospitalClaim["status"] }[] = [
  { docs: "Tidak Lengkap", status: "berisiko" },
  { docs: "Lengkap", status: "aman" },
  { docs: "Sebagian", status: "berisiko" },
  { docs: "Lengkap", status: "aman" },
  { docs: "Sebagian", status: "sedang" },
  { docs: "Lengkap", status: "aman" },
  { docs: "Sebagian", status: "sedang" },
  { docs: "Tidak Lengkap", status: "berisiko" },
  { docs: "Tidak Lengkap", status: "berisiko" },
  { docs: "Sebagian", status: "sedang" },
];

function buildRiskFactors(level: DocumentStatus, diagnosis: string, amount: number): string[] {
  const factors: string[] = [];

  if (level !== "Lengkap") {
    factors.push("Dokumen pendukung belum diverifikasi.");
  }

  if (level === "Tidak Lengkap") {
    factors.push("Dokumen resume medis belum lengkap.");
  }

  if (["Fraktur Femur", "Hernia Inguinalis", "Gagal Ginjal", "Jantung Koroner"].includes(diagnosis)) {
    factors.push("Kode diagnosis belum selaras dengan tindakan.");
  }

  if (amount >= 12_000_000) {
    factors.push("Nilai klaim lebih tinggi dari rata-rata kasus serupa.");
  }

  return factors;
}

function buildRecommendedActions(level: DocumentStatus, amount: number): string[] {
  const actions: string[] = [];

  if (level !== "Lengkap") {
    actions.push("Upload dokumen pendukung.");
  }

  if (level === "Tidak Lengkap") {
    actions.push("Lengkapi resume medis.");
  }

  if (amount >= 12_000_000) {
    actions.push("Periksa ulang kode ICD-10.");
  }

  actions.push("Minta validasi dokter penanggung jawab.");

  return actions;
}

function buildRiskReasons(level: DocumentStatus, diagnosis: string, amount: number): string[] {
  const factors = buildRiskFactors(level, diagnosis, amount);

  if (factors.length === 0) {
    return ["Tidak ada anomali utama. Klaim tetap perlu verifikasi akhir sebelum dikirim."];
  }

  return factors;
}

function buildVerifierNotes(level: DocumentStatus, diagnosis: string): string[] {
  if (level === "Lengkap") {
    return [
      `Dokumen pendukung diagnosis ${diagnosis} sudah lengkap untuk pra-verifikasi.`,
      "Lanjutkan pengecekan kesesuaian coding INA-CBG sebelum submit final.",
    ];
  }

  if (level === "Sebagian") {
    return [
      "Beberapa dokumen sudah terunggah, tetapi belum seluruhnya verified.",
      "Prioritaskan review pada resume medis, surat rujukan, dan kode diagnosis ICD-10.",
    ];
  }

  return [
    "Klaim belum siap dikirim karena dokumen wajib belum lengkap.",
    "Minta unit terkait memperbaiki dokumen sebelum verifikasi ulang.",
  ];
}

function buildRevisionRequests(level: DocumentStatus): string[] {
  if (level === "Lengkap") {
    return ["Tidak ada revisi dokumen utama saat ini."];
  }

  if (level === "Sebagian") {
    return [
      "Lengkapi tanda tangan DPJP pada resume medis.",
      "Pastikan surat rujukan dan kode diagnosis memakai tanggal pelayanan yang sama.",
    ];
  }

  return [
    "Unggah ulang resume medis DPJP.",
    "Lengkapi surat rujukan, hasil penunjang, dan bukti tindakan.",
    "Pastikan identitas peserta hanya ditampilkan dalam format masking pada preview internal.",
  ];
}

export const HOSPITAL_CLAIMS: HospitalClaim[] = PATIENTS.map((patient, index) => {
  const diagnosis = DIAGNOSES[index];
  const meta = STATUSES[index];
  const submittedDaysAgo = index * 2 + 1;
  const riskFactors = buildRiskFactors(meta.docs, diagnosis.name, diagnosis.amount);
  const recommendedActions = buildRecommendedActions(meta.docs, diagnosis.amount);

  return {
    id: String(index + 1),
    patient,
    nik: `327${String(1000_0000_0000 + index).padStart(13, "0")}`,
    bpjs: `000${String(1234567890 + index).padStart(10, "0")}`,
    diagnosis: diagnosis.name,
    icd10: diagnosis.icd10,
    amountIDR: diagnosis.amount,
    submittedAt: dateNDaysAgo(submittedDaysAgo),
    status: meta.status,
    risk: 0,
    riskLevel: "rendah",
    confidence: 0,
    docs: meta.docs,
    documents: buildDocs(meta.docs, index + 1),
    dpjp: DPJPS[index],
    fhirBundleId: `urn:uuid:bpjsight-${index + 1}`,
    riskReasons: buildRiskReasons(meta.docs, diagnosis.name, diagnosis.amount),
    riskFactors,
    verifierNotes: buildVerifierNotes(meta.docs, diagnosis.name),
    revisionRequests: buildRevisionRequests(meta.docs),
    recommendedActions,
    audit: [
      {
        at: dateNDaysAgo(submittedDaysAgo),
        actor: "Admin RS MBG",
        action: "Klaim diajukan",
      },
      {
        at: dateNDaysAgo(index * 2),
        actor: "Sistem",
        action: "Validasi dokumen otomatis",
      },
      {
        at: dateNDaysAgo(index * 2 - 1),
        actor: "Verifikator",
        action:
          meta.status === "berisiko"
            ? "Diminta perbaikan dokumen"
            : "Lolos pra-verifikasi",
      },
    ],
  };
});
