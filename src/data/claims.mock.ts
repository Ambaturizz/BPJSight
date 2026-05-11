import type { Claim, ClaimDocument, DocStatus } from "@/types/claim";

const REQUIRED_DOCS: { key: string; label: string }[] = [
  { key: "bpjs_card", label: "Fotocopy Kartu BPJS" },
  { key: "ktp_kk", label: "Fotocopy KTP/KK" },
  { key: "sep", label: "Surat Eligibilitas Peserta (SEP)" },
  { key: "rawat_inap", label: "Surat Pengantar Rawat Inap" },
  { key: "casemix", label: "Lembar Verifikasi Casemix" },
  { key: "ina_cbg", label: "Lembar INA-CBG's" },
  { key: "rekam_medis", label: "Catatan Medis Pasien" },
  { key: "gawat_darurat", label: "Lembar Assessment Gawat Darurat" },
  { key: "resume_medis", label: "Resume Medis (TTD DPJP)" },
  { key: "lab", label: "Hasil Laboratorium / Penunjang Medis" },
];

const PATIENTS = [
  "Aurora Senja", "Kenzie Althaf", "Alesha Zefanya", "Kenzo Dirgantara",
  "Clarissa Larasati", "Gibran Bumi", "Keisya Aurelia", "Naufal Atharrazka",
  "Freya Aninditha", "Zayyan Arkhanza",
];

const DIAGNOSES: { name: string; icd10: string; amount: number }[] = [
  { name: "Jantung Koroner",   icd10: "I25.1", amount: 12_500_000 },
  { name: "Diabetes Tipe 2",   icd10: "E11.9", amount:  3_200_000 },
  { name: "Fraktur Femur",     icd10: "S72.0", amount: 18_700_000 },
  { name: "Appendisitis",      icd10: "K35.8", amount:  5_100_000 },
  { name: "Pneumonia",         icd10: "J18.9", amount:  8_900_000 },
  { name: "Demam Berdarah",    icd10: "A91",   amount:  4_300_000 },
  { name: "Asma Akut",         icd10: "J45.9", amount:  2_800_000 },
  { name: "Hernia Inguinalis", icd10: "K40.9", amount: 15_200_000 },
  { name: "Gagal Ginjal",      icd10: "N18.5", amount: 22_100_000 },
  { name: "Stroke Ringan",     icd10: "I63.9", amount: 11_600_000 },
];

const DPJPS = [
  "dr. Anjasmara, Sp.JP", "dr. Brilian, Sp.PD", "dr. Citra, Sp.OT",
  "dr. Dirga, Sp.B", "dr. Elsa, Sp.P", "dr. Farhan, Sp.A",
  "dr. Gita, Sp.P", "dr. Hadi, Sp.B", "dr. Indira, Sp.PD", "dr. Joshua, Sp.S",
];

function buildDocs(level: DocStatus): ClaimDocument[] {
  const verifiedCount =
    level === "Lengkap" ? 10 : level === "Sebagian" ? 6 : 3;
  return REQUIRED_DOCS.map((d, i) => ({
    ...d,
    uploaded: i < verifiedCount + 1,
    verified: i < verifiedCount,
  }));
}

const STATUSES: { docs: DocStatus; status: Claim["status"] }[] = [
  { docs: "Tidak Lengkap", status: "berisiko" },
  { docs: "Lengkap",       status: "aman" },
  { docs: "Sebagian",      status: "berisiko" },
  { docs: "Lengkap",       status: "aman" },
  { docs: "Sebagian",      status: "sedang" },
  { docs: "Lengkap",       status: "aman" },
  { docs: "Sebagian",      status: "sedang" },
  { docs: "Tidak Lengkap", status: "berisiko" },
  { docs: "Tidak Lengkap", status: "berisiko" },
  { docs: "Sebagian",      status: "sedang" },
];

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const CLAIMS: Claim[] = PATIENTS.map((patient, i) => {
  const dx = DIAGNOSES[i];
  const meta = STATUSES[i];
  const documents = buildDocs(meta.docs);
  return {
    id: String(i + 1),
    patient,
    nik: `327${String(1000_0000_0000 + i).padStart(13, "0")}`,
    bpjs: `000${String(1234567890 + i).padStart(10, "0")}`,
    diagnosis: dx.name,
    icd10: dx.icd10,
    amountIDR: dx.amount,
    submittedAt: dateNDaysAgo(i * 2 + 1),
    status: meta.status,
    risk: 0, // computed lazily by scorer
    confidence: 0,
    docs: meta.docs,
    documents,
    dpjp: DPJPS[i],
    fhirBundleId: `urn:uuid:bpjsight-${i + 1}`,
    audit: [
      { at: dateNDaysAgo(i * 2 + 1), actor: "Admin RS MBG", action: "Klaim diajukan" },
      { at: dateNDaysAgo(i * 2),     actor: "Sistem",       action: "Validasi dokumen otomatis" },
      { at: dateNDaysAgo(i * 2 - 1), actor: "Verifikator",  action: meta.status === "berisiko" ? "Diminta perbaikan dokumen" : "Lolos pra-verifikasi" },
    ],
  };
});

export { REQUIRED_DOCS };
