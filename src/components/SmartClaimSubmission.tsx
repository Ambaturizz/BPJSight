import { useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Shield, ArrowLeft, Upload, FileText, X, CheckCircle2,
  AlertTriangle, ClipboardCheck, Bell, Loader2, ChevronRight,
  Building2, Calendar, Stethoscope, Activity, User, CreditCard, Heart
} from "lucide-react";
import { AppLayout } from "./AppLayout";

interface SmartClaimSubmissionProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: "uploading" | "done" | "error";
}

interface DocumentSlot {
  key: string;
  label: string;
  file: UploadedFile | null;
}

interface ClaimForm {
  patientName: string;
  nik: string;
  bpjsNumber: string;
  diagnosis: string;
  hospitalName: string;
  treatmentType: "rawat-jalan" | "rawat-inap" | "";
  date: string;
}

// Preview struktur data berbasis FHIR untuk kebutuhan demo
interface FHIRPatient {
  resourceType: "Patient";
  id: string;
  identifier: { system: string; value: string }[];
  name: { use: string; text: string }[];
  birthDate: string;
}

interface FHIRClaim {
  resourceType: "Claim";
  id: string;
  status: "active" | "draft";
  type: { coding: { system: string; code: string; display: string }[] };
  patient: { reference: string; display: string };
  created: string;
  provider: { reference: string; display: string };
  diagnosis: { sequence: number; diagnosisCodeableConcept: { coding: { system: string; code: string; display: string }[] } }[];
  supportingInfo: { sequence: number; category: { coding: { system: string; code: string; display: string }[] }; valueString: string }[];
  procedure?: { sequence: number; procedureCodeableConcept: { coding: { system: string; code: string; display: string }[] } }[];
  total?: { value: number; currency: string };
}

type Step = "docs" | "form" | "fhir-preview" | "review" | "success";

const DOCUMENT_SLOTS: { key: string; label: string }[] = [
  { key: "bpjs-card", label: "Fotocopy Kartu BPJS" },
  { key: "ktp-kk", label: "Fotocopy KTP/KK" },
  { key: "sep", label: "Surat Egibilitas Peserta (SEP)" },
  { key: "surat-rawat-inap", label: "Surat Pengantar Rawat Inap" },
  { key: "casemix", label: "Lembar Verifikasi Casemix" },
  { key: "ina-cbgs", label: "Lembar INA CBG's" },
  { key: "catatan-medis", label: "Lembar Catatan Medis Pasien" },
  { key: "assessment-gd", label: "Lembar Assessment Gawat Darurat" },
  { key: "resume-medis", label: "Resume Medis (ditandatangani DPJP)" },
  { key: "lab-penunjang", label: "Hasil Laboratorium/Pemeriksaan Penunjang" },
];

const DIAGNOSES = [
  { code: "J18.9", name: "Pneumonia", display: "J18.9 - Pneumonia" },
  { code: "E11.9", name: "Type 2 Diabetes Mellitus", display: "E11.9 - Type 2 Diabetes" },
  { code: "I10", name: "Essential (Primary) Hypertension", display: "I10 - Essential Hypertension" }
];

const PROCEDURES = [
  { code: "99.18", name: "Injection or Infusion of therapeutic substance", display: "99.18 - Infusion" },
  { code: "89.52", name: "Electrocardiogram (ECG)", display: "89.52 - ECG" },
  { code: "90.59", name: "Other microscopic examination of blood", display: "90.59 - Lab blood test" }
];

const INITIAL_FORM: ClaimForm = {
  patientName: "",
  nik: "",
  bpjsNumber: "",
  diagnosis: "J18.9 - Pneumonia",
  hospitalName: "RS Polisi MBG",
  treatmentType: "",
  date: new Date().toISOString().split("T")[0],
};

const SmartClaimSubmission = ({ onBack, onSuccess }: SmartClaimSubmissionProps) => {
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("J18.9");
  const [procedure, setProcedure] = useState("99.18");
  const [hospitalClass, setHospitalClass] = useState<"A" | "B" | "C">("B");
  const [severityLevel, setSeverityLevel] = useState<"I" | "II" | "III">("I");
  const [fhirTab, setFhirTab] = useState<"visual" | "json">("visual");

  const [step, setStep] = useState<Step>("docs");
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [documents, setDocuments] = useState<DocumentSlot[]>(
    DOCUMENT_SLOTS.map((d) => ({ ...d, file: null }))
  );
  const [form, setForm] = useState<ClaimForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [fhirBundle, setFhirBundle] = useState<{ patient: FHIRPatient; claim: FHIRClaim } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const nikValid = form.nik.length === 16 && /^\d+$/.test(form.nik);
  const bpjsValid = form.bpjsNumber.length === 13 && /^\d+$/.test(form.bpjsNumber);
  const allDocsDone = documents.every((d) => d.file?.status === "done");
  const formComplete = form.patientName && nikValid && bpjsValid && form.diagnosis && form.hospitalName && form.treatmentType && form.date;

  const currentDoc = documents[currentDocIndex];

  // Helper functions for INA-CBG and Auditor
  const getBaseTariff = (type: string) => {
    return type === "rawat-inap" ? 4500000 : type === "rawat-jalan" ? 450000 : 0;
  };

  const getSeverityMultiplier = (level: string) => {
    switch (level) {
      case "I": return 1.0;
      case "II": return 1.4;
      case "III": return 1.8;
      default: return 1.0;
    }
  };

  const getClassMultiplier = (cls: string) => {
    switch (cls) {
      case "A": return 1.2;
      case "B": return 1.0;
      case "C": return 0.8;
      default: return 1.0;
    }
  };

  const calculateTariff = () => {
    const base = getBaseTariff(form.treatmentType);
    const severity = getSeverityMultiplier(severityLevel);
    const cls = getClassMultiplier(hospitalClass);
    return base * severity * cls;
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const getAuditWarnings = () => {
    const warnings: { type: string; msg: string }[] = [];

    // Procedure warnings
    if (procedure === "89.52") {
      warnings.push({
        type: "[PENTING]",
        msg: "Pemeriksaan EKG (89.52) memerlukan lampiran lembar Resume Medis DPJP bertandatangan basah beserta hasil print-out interpretasi klinis EKG demi mencegah dispute administrasi."
      });
    } else if (procedure === "99.18") {
      warnings.push({
        type: "[INFO]",
        msg: "Prosedur Infus/Injeksi (99.18) disarankan mencantumkan perincian obat cair pada Verifikasi Casemix untuk mempermudah audit kesesuaian obat PRB/Non-PRB."
      });
    } else if (procedure === "90.59") {
      warnings.push({
        type: "[INFO]",
        msg: "Pemeriksaan Darah (90.59) harus melampirkan salinan cetak hasil laboratorium resmi dari Faskes Penunjang."
      });
    }

    // Diagnosis warnings
    if (primaryDiagnosis === "J18.9") {
      warnings.push({
        type: "[INFO]",
        msg: "Diagnosis Pneumonia (J18.9) mewajibkan unggah hasil rontgen dada (Thorax AP/PA) dan lembar catatan klinis harian yang memuat grafik demam dan frekuensi napas."
      });
    } else if (primaryDiagnosis === "E11.9") {
      warnings.push({
        type: "[INFO]",
        msg: "Diabetes Mellitus Tipe 2 (E11.9) memerlukan pencatatan riwayat HbA1c terakhir atau rekapitulasi harian GDP/GD2PP pada lembar Verifikasi Casemix."
      });
    } else if (primaryDiagnosis === "I10") {
      warnings.push({
        type: "[INFO]",
        msg: "Hipertensi Esensial (I10) harus disertai pencatatan tekanan darah sistolik/diastolik pada lembar Catatan Medis saat pasien masuk perawatan."
      });
    }

    // Severity warnings
    if (severityLevel === "III") {
      warnings.push({
        type: "[PERINGATAN]",
        msg: "Severity Level III (Berat) mendeteksi risiko audit tinggi dari verifikator BPJS. Pastikan diagnosis sekunder memuat komplikasi multi-organ yang jelas dan didukung catatan ICU/HCU."
      });
    } else if (severityLevel === "II") {
      warnings.push({
        type: "[INFO]",
        msg: "Severity Level II (Sedang) memerlukan minimal satu diagnosis sekunder aktif yang berkorelasi langsung dengan durasi perawatan pasien."
      });
    } else {
      warnings.push({
        type: "[BERSIH]",
        msg: "Koding administratif dasar terlihat konsisten. Lanjutkan ke langkah berikutnya untuk melangsungkan validasi format FHIR."
      });
    }

    return warnings;
  };

  const simulateUpload = useCallback((file: File) => {
    const docKey = DOCUMENT_SLOTS[currentDocIndex].key;
    const uploaded: UploadedFile = { file, progress: 0, status: "uploading" };
    setDocuments((prev) =>
      prev.map((d) => (d.key === docKey ? { ...d, file: uploaded } : d))
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDocuments((prev) =>
          prev.map((d) =>
            d.key === docKey ? { ...d, file: { ...uploaded, progress: 100, status: "done" } } : d
          )
        );
      } else {
        setDocuments((prev) =>
          prev.map((d) =>
            d.key === docKey ? { ...d, file: { ...uploaded, progress } } : d
          )
        );
      }
    }, 150);
  }, [currentDocIndex]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      simulateUpload(file);
    }
  }, [simulateUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateUpload(file);
  }, [simulateUpload]);

  const removeFile = (docKey: string) => {
    setDocuments((prev) => prev.map((d) => (d.key === docKey ? { ...d, file: null } : d)));
  };

  const goNextDoc = () => {
    if (currentDocIndex < 9) setCurrentDocIndex((i) => i + 1);
  };
  const goPrevDoc = () => {
    if (currentDocIndex > 0) setCurrentDocIndex((i) => i - 1);
  };

  const generateFHIRBundle = (): { patient: FHIRPatient; claim: FHIRClaim } => {
    const patientId = `patient-${form.nik}`;
    const patient: FHIRPatient = {
      resourceType: "Patient",
      id: patientId,
      identifier: [
        { system: "urn:demo:bpjsight:nik", value: form.nik },
        { system: "https://bpjsight.demo/fhir/sid/bpjs-number", value: form.bpjsNumber },
      ],
      name: [{ use: "official", text: form.patientName }],
      birthDate: "1990-01-01",
    };

    const claim: FHIRClaim = {
      resourceType: "Claim",
      id: `claim-${Date.now()}`,
      status: "active",
      type: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/claim-type",
          code: form.treatmentType === "rawat-inap" ? "institutional" : "professional",
          display: form.treatmentType === "rawat-inap" ? "Rawat Inap" : "Rawat Jalan",
        }],
      },
      patient: { reference: `Patient/${patientId}`, display: form.patientName },
      created: form.date,
      provider: { reference: "Organization/rs-demo-jakarta", display: form.hospitalName },
      diagnosis: [{
        sequence: 1,
        diagnosisCodeableConcept: {
          coding: [{
            system: "http://hl7.org/fhir/sid/icd-10",
            code: primaryDiagnosis,
            display: DIAGNOSES.find(d => d.code === primaryDiagnosis)?.name || form.diagnosis,
          }],
        },
      }],
      procedure: [{
        sequence: 1,
        procedureCodeableConcept: {
          coding: [{
            system: "http://hl7.org/fhir/sid/icd-9-cm",
            code: procedure,
            display: PROCEDURES.find(p => p.code === procedure)?.name || "",
          }]
        }
      }],
      total: {
        value: calculateTariff(),
        currency: "IDR"
      },
      supportingInfo: documents.filter(d => d.file).map((d, i) => ({
        sequence: i + 1,
        category: {
          coding: [{
            system: "https://bpjsight.demo/fhir/CodeSystem/claim-document-type",
            code: d.key,
            display: d.label,
          }],
        },
        valueString: d.file!.file.name,
      })),
    };

    return { patient, claim };
  };

  const proceedToFHIR = () => {
    const bundle = generateFHIRBundle();
    setFhirBundle(bundle);
    const score = Math.floor(Math.random() * 30) + 5; // A bit lower risk if everything matches perfectly!
    setRiskScore(score);
    setStep("fhir-preview");
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep("success");
    }, 2500);
  };

  const riskLevel = (score: number) => {
    if (score >= 70) return { label: "Tinggi", color: "text-destructive", bg: "bg-destructive/15 border-destructive/25", gradient: "from-warning to-destructive", desc: "Risiko administratif tinggi. Pastikan resume medis, bukti tindakan, dan kode ICD-10 konsisten sebelum review lanjutan." };
    if (score >= 40) return { label: "Sedang", color: "text-warning", bg: "bg-warning/15 border-warning/25", gradient: "from-success to-warning", desc: "Risiko administratif sedang. Periksa kembali lembar verifikasi casemix, INA-CBG, dan dokumen pendukung." };
    return { label: "Rendah", color: "text-success", bg: "bg-success/15 border-success/25", gradient: "from-success to-success", desc: "Risiko administratif rendah pada data demo. Tetap lakukan verifikasi manual sesuai prosedur rumah sakit." };
  };

  const stepLabels: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: "docs", label: "Upload Dokumen", icon: Upload },
    { key: "form", label: "Data Klaim", icon: FileText },
    { key: "fhir-preview", label: "Data & Risiko", icon: Heart },
    { key: "review", label: "Kirim", icon: CheckCircle2 },
  ];
  const stepOrder: Step[] = ["docs", "form", "fhir-preview", "review"];
  const currentStepIdx = stepOrder.indexOf(step);

  // Success screen
  if (step === "success") {
    return (
      <AppLayout className="hospital-portal">
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="animate-fade-in-up max-w-md w-full p-8 text-center border-border/60" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full gradient-primary  mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Klaim Demo Berhasil Disimpan</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Klaim telah masuk ke alur demo BPJSight. Dokumen verifikasi tercatat sebagai data simulasi untuk kebutuhan demonstrasi.
          </p>
          <div className="mt-6 rounded-xl bg-muted/40 p-4 text-left space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pasien</span><span className="font-bold text-foreground">{form.patientName}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Dokumen</span><span className="font-semibold text-foreground">{documents.filter(d => d.file).length}/10 terlampir</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Format</span><Badge className="bg-primary/15 text-primary border border-primary/25 text-xs font-semibold">Preview FHIR</Badge></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><Badge className="bg-info/15 text-info border border-info/25 text-xs font-semibold">Demo tersimpan</Badge></div>
          </div>
          <Button onClick={onSuccess} className="mt-6 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 border-0 ">
            Kembali ke Dashboard
          </Button>
        </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout className="hospital-portal">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/60 glass-card px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground tracking-tight">BPJSight</span>
          </div>
          <Badge variant="outline" className="ml-1 text-primary border-primary/30 font-semibold text-xs">Pengajuan Klaim Demo</Badge>
          <div className="ml-auto">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        {/* Stepper */}
        <div className="animate-fade-in-up mb-8">
          <div className="flex items-center justify-between mb-6">
            {stepLabels.map((s, i) => {
              const isActive = i === currentStepIdx;
              const isDone = i < currentStepIdx;
              return (
                <div key={s.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                      isDone ? "bg-primary text-primary-foreground hover:bg-primary/90 " :
                      isActive ? "border-2 border-primary text-primary bg-primary/10" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {isDone ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                    </div>
                    <span className={`mt-2 text-xs font-semibold hidden sm:block ${isActive || isDone ? "text-primary" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < stepLabels.length - 1 && <div className={`h-0.5 w-full mx-2 rounded-full ${isDone ? "gradient-primary" : "bg-muted"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Document Upload - One at a time */}
        {step === "docs" && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">Upload Dokumen Klaim</h1>
              <p className="text-sm text-muted-foreground mt-1">Unggah dokumen klaim satu per satu untuk simulasi validasi administratif (format PDF).</p>
            </div>

            {/* Progress overview */}
            <Card className="border-border/60 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-foreground">Progress Dokumen</span>
                <span className="text-sm font-bold text-primary">{documents.filter(d => d.file?.status === "done").length}/10</span>
              </div>
              <Progress value={(documents.filter(d => d.file?.status === "done").length / 10) * 100} className="h-2 mb-4" />
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {documents.map((doc, i) => (
                  <button
                    key={doc.key}
                    onClick={() => setCurrentDocIndex(i)}
                    className={`flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                      i === currentDocIndex
                        ? "border-2 border-primary bg-primary/15 text-primary"
                        : doc.file?.status === "done"
                        ? "bg-success/15 text-success border border-success/25"
                        : "bg-muted/40 text-muted-foreground border border-border/40 hover:border-primary/30"
                    }`}
                  >
                    {doc.file?.status === "done" ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </button>
                ))}
              </div>
            </Card>

            {/* Current document upload */}
            <Card
              className="border-border/60 overflow-hidden transition-all duration-200"
              style={{ boxShadow: 'var(--shadow-card)' }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <div className="p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm">
                      {currentDocIndex + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{currentDoc.label}</h3>
                      <p className="text-xs text-muted-foreground">Dokumen ke-{currentDocIndex + 1} dari 10 • Format PDF</p>
                    </div>
                  </div>
                  {currentDoc.file?.status === "done" && (
                    <button onClick={() => removeFile(currentDoc.key)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {!currentDoc.file ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-8 transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <Upload className="h-7 w-7" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">Drag & drop atau klik untuk upload</p>
                      <p className="text-xs text-muted-foreground mt-1">Hanya file PDF • Maks 10MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </button>
                ) : currentDoc.file.status === "uploading" ? (
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{currentDoc.file.file.name}</p>
                        <p className="text-xs text-muted-foreground">Mengunggah...</p>
                      </div>
                    </div>
                    <Progress value={currentDoc.file.progress} className="h-2" />
                  </div>
                ) : (
                  <div className="rounded-xl border border-success/25 bg-success/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{currentDoc.file.file.name}</p>
                        <p className="text-xs text-muted-foreground">{(currentDoc.file.file.size / 1024).toFixed(0)} KB • PDF</p>
                      </div>
                      <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Navigation between docs */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={goPrevDoc} disabled={currentDocIndex === 0} className="rounded-xl">
                <ArrowLeft className="h-4 w-4" /> Dokumen Sebelumnya
              </Button>
              {currentDocIndex < 9 ? (
                <Button onClick={goNextDoc} disabled={!currentDoc.file || currentDoc.file.status !== "done"} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 border-0 ">
                  Dokumen Selanjutnya <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setStep("form")} disabled={!allDocsDone} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 border-0  px-6">
                  <ClipboardCheck className="h-4 w-4" /> Lanjut ke Data Klaim <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Document checklist */}
            <Card className="border-border/60 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-sm font-bold text-foreground mb-3">Checklist Dokumen</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {documents.map((doc, i) => (
                  <button
                    key={doc.key}
                    onClick={() => setCurrentDocIndex(i)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      i === currentDocIndex ? "bg-primary/10 border border-primary/30" : "bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    {doc.file?.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground/40 text-[9px] font-bold text-muted-foreground shrink-0">
                        {i + 1}
                      </div>
                    )}
                    <span className={`text-xs font-medium truncate ${doc.file?.status === "done" ? "text-foreground" : "text-muted-foreground"}`}>
                      {doc.label}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Form */}
        {step === "form" && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">Data Klaim Pasien</h1>
              <p className="text-sm text-muted-foreground mt-1">Lengkapi informasi pasien dan diagnosis untuk pengisian INA-CBGs & Audit Koding</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Form Input: Left Column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField icon={User} label="Nama Pasien" value={form.patientName} onChange={(v) => setForm(f => ({ ...f, patientName: v }))} />
                  <FormField icon={CreditCard} label="NIK" value={form.nik} onChange={(v) => setForm(f => ({ ...f, nik: v.replace(/\D/g, "").slice(0, 16) }))}
                    validation={form.nik ? (nikValid ? { valid: true, msg: "NIK valid (16 digit)" } : { valid: false, msg: `${form.nik.length}/16 digit` }) : undefined}
                  />
                  <FormField icon={Shield} label="No. BPJS" value={form.bpjsNumber} onChange={(v) => setForm(f => ({ ...f, bpjsNumber: v.replace(/\D/g, "").slice(0, 13) }))}
                    validation={form.bpjsNumber ? (bpjsValid ? { valid: true, msg: "No. BPJS valid (13 digit)" } : { valid: false, msg: `${form.bpjsNumber.length}/13 digit` }) : undefined}
                  />
                  <FormField icon={Building2} label="Nama Rumah Sakit" value={form.hospitalName} onChange={(v) => setForm(f => ({ ...f, hospitalName: v }))} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Tipe Perawatan */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Activity className="h-4 w-4 text-primary" /> Tipe Perawatan
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "rawat-jalan", label: "Rawat Jalan" },
                        { value: "rawat-inap", label: "Rawat Inap" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, treatmentType: opt.value as "rawat-jalan" | "rawat-inap" }))}
                          className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                            form.treatmentType === opt.value
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tanggal Perawatan */}
                  <FormField icon={Calendar} label="Tanggal Perawatan" value={form.date} onChange={(v) => setForm(f => ({ ...f, date: v }))} type="date" />
                </div>

                <hr className="border-border/40 my-2" />

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Primary Diagnosis (ICD-10) */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Stethoscope className="h-4 w-4 text-primary" /> Diagnosis Utama (ICD-10)
                    </label>
                    <select
                      value={primaryDiagnosis}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPrimaryDiagnosis(val);
                        const selected = DIAGNOSES.find(d => d.code === val);
                        if (selected) {
                          setForm(f => ({ ...f, diagnosis: selected.display }));
                        }
                      }}
                      className="w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-sm font-semibold text-foreground focus:border-primary/50 focus:outline-none"
                    >
                      {DIAGNOSES.map((d) => (
                        <option key={d.code} value={d.code} className="text-foreground bg-background">
                          {d.display}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Procedure (ICD-9-CM) */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Activity className="h-4 w-4 text-primary" /> Prosedur/Tindakan (ICD-9-CM)
                    </label>
                    <select
                      value={procedure}
                      onChange={(e) => setProcedure(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-sm font-semibold text-foreground focus:border-primary/50 focus:outline-none"
                    >
                      {PROCEDURES.map((p) => (
                        <option key={p.code} value={p.code} className="text-foreground bg-background">
                          {p.display}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Kelas Perawatan */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Building2 className="h-4 w-4 text-primary" /> Kelas Rumah Sakit
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["A", "B", "C"].map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setHospitalClass(cls as "A" | "B" | "C")}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition-all duration-200 ${
                            hospitalClass === cls
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          Kelas {cls}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severity Level */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <AlertTriangle className="h-4 w-4 text-primary" /> Severity Level (Tingkat Keparahan)
                    </label>
                    <select
                      value={severityLevel}
                      onChange={(e) => setSeverityLevel(e.target.value as "I" | "II" | "III")}
                      className="w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-sm font-semibold text-foreground focus:border-primary/50 focus:outline-none"
                    >
                      <option value="I" className="text-foreground bg-background">Tingkat I - Ringan</option>
                      <option value="II" className="text-foreground bg-background">Tingkat II - Sedang</option>
                      <option value="III" className="text-foreground bg-background">Tingkat III - Berat</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Calculator & Auditor: Right Column */}
              <div className="lg:col-span-1 space-y-4">
                {/* INA-CBGs Calculator */}
                <Card className="border-border/60 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 bg-muted/20">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">Kalkulator INA-CBG</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Tipe Perawatan:</span>
                      <span className="font-semibold text-foreground">
                        {form.treatmentType === "rawat-inap" ? "Rawat Inap" : form.treatmentType === "rawat-jalan" ? "Rawat Jalan" : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Base Tariff:</span>
                      <span className="font-semibold text-foreground">
                        {form.treatmentType ? formatIDR(getBaseTariff(form.treatmentType)) : "Rp 0"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Multiplier Kelas ({hospitalClass}):</span>
                      <span className="font-semibold text-foreground">{getClassMultiplier(hospitalClass)}x</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Multiplier Keparahan ({severityLevel}):</span>
                      <span className="font-semibold text-foreground">{getSeverityMultiplier(severityLevel)}x</span>
                    </div>
                    <hr className="border-border/40" />
                    <div className="flex flex-col pt-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Estimasi Tarif INA-CBG</span>
                      <span className="text-lg font-black text-primary mt-0.5">
                        {form.treatmentType ? formatIDR(calculateTariff()) : "Rp 0"}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Smart Coding Auditor */}
                <Card className="border-warning/30 bg-warning/5 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-2 border-b border-warning/20 px-4 py-3 bg-warning/10">
                    <ClipboardCheck className="h-4 w-4 text-warning" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">Smart Coding Auditor</span>
                  </div>
                  <div className="p-4 space-y-3 max-h-[220px] overflow-y-auto">
                    {getAuditWarnings().map((warn, i) => (
                      <div key={i} className="flex gap-2 text-xs leading-relaxed border-b border-border/20 pb-2 last:border-b-0 last:pb-0 font-medium">
                        <span className={`font-bold shrink-0 ${warn.type.includes("PENTING") || warn.type.includes("PERINGATAN") ? "text-destructive" : "text-primary"}`}>{warn.type}</span>
                        <span className="text-muted-foreground">{warn.msg}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border/40">
              <Button variant="outline" onClick={() => setStep("docs")} className="rounded-xl">
                <ArrowLeft className="h-4 w-4" /> Kembali
              </Button>
              <Button onClick={proceedToFHIR} disabled={!formComplete} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 border-0  px-6">
                <Heart className="h-4 w-4" /> Buat Preview Data & Analisis <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: FHIR Preview + Risk */}
        {step === "fhir-preview" && fhirBundle && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">Preview Data Klaim & Estimasi Risiko</h1>
              <p className="text-sm text-muted-foreground mt-1">Lihat keselarasan data klinis dalam standar HL7 FHIR R4 sebelum pengajuan</p>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-border/60">
              <button
                type="button"
                onClick={() => setFhirTab("visual")}
                className={`px-5 py-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                  fhirTab === "visual"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Visual Resource Mapping
              </button>
              <button
                type="button"
                onClick={() => setFhirTab("json")}
                className={`px-5 py-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                  fhirTab === "json"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                JSON FHIR Bundle
              </button>
            </div>

            {fhirTab === "visual" ? (
              <div className="space-y-6 animate-fade-in font-medium text-xs">
                {/* Visual Patient Resource Card */}
                <Card className="border-border/60 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">FHIR Patient Resource Mapping</span>
                    </div>
                    <Badge className="bg-primary/15 text-primary border border-primary/25 text-[10px] font-bold">Patient Resource</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/40 bg-muted/10 text-muted-foreground font-bold">
                          <th className="px-5 py-3 font-semibold">FHIR Path Element</th>
                          <th className="px-5 py-3 font-semibold">Deskripsi Logis</th>
                          <th className="px-5 py-3 font-semibold">Nilai Terpetakan</th>
                          <th className="px-5 py-3 font-semibold">Sumber Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-medium">
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Patient.resourceType</td>
                          <td className="px-5 py-3 text-muted-foreground">Tipe Resource HL7</td>
                          <td className="px-5 py-3 font-semibold text-foreground">"Patient"</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">Konstanta Sistem</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Patient.id</td>
                          <td className="px-5 py-3 text-muted-foreground">Identifier Unik Lokal</td>
                          <td className="px-5 py-3 font-mono text-foreground">patient-{form.nik}</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">Generated ID</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Patient.identifier[0].value (NIK)</td>
                          <td className="px-5 py-3 text-muted-foreground">Nomor Identitas Kependudukan (NIK)</td>
                          <td className="px-5 py-3 font-mono text-foreground">{form.nik}</td>
                          <td className="px-5 py-3 text-xs text-success font-bold">KTP Terverifikasi (Step 1)</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Patient.identifier[1].value (BPJS)</td>
                          <td className="px-5 py-3 text-muted-foreground">Nomor Kepesertaan JKN</td>
                          <td className="px-5 py-3 font-mono text-foreground">{form.bpjsNumber}</td>
                          <td className="px-5 py-3 text-xs text-success font-bold">Kartu JKN Terverifikasi (Step 1)</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Patient.name[0].text</td>
                          <td className="px-5 py-3 text-muted-foreground">Nama Lengkap Pasien</td>
                          <td className="px-5 py-3 text-foreground">{form.patientName}</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">Input Data Klaim</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Patient.birthDate</td>
                          <td className="px-5 py-3 text-muted-foreground">Tanggal Lahir Rekam Medis</td>
                          <td className="px-5 py-3 font-mono text-foreground">1990-01-01</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">Sinkronisasi Dukcapil</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Visual Claim Resource Card */}
                <Card className="border-border/60 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">FHIR Claim Resource Mapping</span>
                    </div>
                    <Badge className="bg-primary/15 text-primary border border-primary/25 text-[10px] font-bold">Claim Resource</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/40 bg-muted/10 text-muted-foreground font-bold">
                          <th className="px-5 py-3 font-semibold">FHIR Path Element</th>
                          <th className="px-5 py-3 font-semibold">Deskripsi Logis</th>
                          <th className="px-5 py-3 font-semibold">Nilai Terpetakan</th>
                          <th className="px-5 py-3 font-semibold">Sumber Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-medium">
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Claim.resourceType</td>
                          <td className="px-5 py-3 text-muted-foreground">Tipe Resource HL7</td>
                          <td className="px-5 py-3 font-semibold text-foreground">"Claim"</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">Konstanta Sistem</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Claim.status</td>
                          <td className="px-5 py-3 text-muted-foreground">Status Klaim</td>
                          <td className="px-5 py-3 font-semibold text-foreground">"active"</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">Konstanta Alur Kerja</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Claim.type.coding[0].code</td>
                          <td className="px-5 py-3 text-muted-foreground">Kategori Klaim Layanan</td>
                          <td className="px-5 py-3 text-foreground">
                            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
                              {form.treatmentType === "rawat-inap" ? "institutional (Rawat Inap)" : "professional (Rawat Jalan)"}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">Tipe Perawatan Form</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Claim.patient.reference</td>
                          <td className="px-5 py-3 text-muted-foreground">Link ke Resource Patient</td>
                          <td className="px-5 py-3 font-mono text-foreground">Patient/patient-{form.nik}</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">Relasi Antar Resource</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Claim.provider.display</td>
                          <td className="px-5 py-3 text-muted-foreground">Fasilitas Kesehatan Pengaju</td>
                          <td className="px-5 py-3 text-foreground">{form.hospitalName}</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">Organisasi Rumah Sakit</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Claim.diagnosis[0].diagnosisCodeableConcept.coding[0].code</td>
                          <td className="px-5 py-3 text-muted-foreground">Koding Diagnosis Utama (ICD-10)</td>
                          <td className="px-5 py-3 font-mono text-foreground font-bold">{primaryDiagnosis}</td>
                          <td className="px-5 py-3 text-xs text-success font-bold">ICD-10 Dropdown</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Claim.procedure[0].procedureCodeableConcept.coding[0].code</td>
                          <td className="px-5 py-3 text-muted-foreground">Koding Tindakan (ICD-9-CM)</td>
                          <td className="px-5 py-3 font-mono text-foreground font-bold">{procedure}</td>
                          <td className="px-5 py-3 text-xs text-success font-bold">ICD-9 Dropdown</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Claim.total.value</td>
                          <td className="px-5 py-3 text-muted-foreground">Total Klaim Terhitung</td>
                          <td className="px-5 py-3 font-bold text-primary">{formatIDR(calculateTariff())}</td>
                          <td className="px-5 py-3 text-xs text-success font-bold">Kalkulator INA-CBGs (Step 2)</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-5 py-3 font-mono font-bold text-primary">Claim.supportingInfo[]</td>
                          <td className="px-5 py-3 text-muted-foreground">Lampiran PDF Medis</td>
                          <td className="px-5 py-3 text-foreground font-semibold">10 Berkas Medis Terunggah</td>
                          <td className="px-5 py-3 text-xs text-success font-bold">Dokumen Terverifikasi (Step 1)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Preview Patient Resource */}
                <Card className="border-primary/20 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3 bg-primary/5">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Preview Patient Resource</span>
                    <Badge className="bg-primary/15 text-primary border border-primary/25 text-[10px] font-bold">R4</Badge>
                  </div>
                  <div className="p-5">
                    <pre className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-4 overflow-x-auto font-mono leading-relaxed">
                      {JSON.stringify(fhirBundle.patient, null, 2)}
                    </pre>
                  </div>
                </Card>

                {/* Preview Claim Resource */}
                <Card className="border-primary/20 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3 bg-primary/5">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Preview Claim Resource</span>
                    <Badge className="bg-primary/15 text-primary border border-primary/25 text-[10px] font-bold">R4</Badge>
                  </div>
                  <div className="p-5">
                    <pre className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-4 overflow-x-auto font-mono leading-relaxed max-h-64 overflow-y-auto">
                      {JSON.stringify(fhirBundle.claim, null, 2)}
                    </pre>
                  </div>
                </Card>
              </div>
            )}

            {/* Risk scoring demo */}
            {riskScore !== null && (
              <Card className={`border ${riskLevel(riskScore).bg} overflow-hidden`} style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${riskLevel(riskScore).bg}`}>
                      <span className={`text-xl font-extrabold ${riskLevel(riskScore).color}`}>{riskScore}%</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">Estimasi Risiko Administratif</span>
                        <Badge className={`${riskLevel(riskScore).bg} ${riskLevel(riskScore).color} border text-xs font-bold`}>
                          Risiko {riskLevel(riskScore).label}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{riskLevel(riskScore).desc}</p>
                      <div className="mt-3">
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${riskLevel(riskScore).gradient} transition-all duration-700`} style={{ width: `${riskScore}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep("form")} className="rounded-xl">
                <ArrowLeft className="h-4 w-4" /> Kembali
              </Button>
              <Button onClick={() => setStep("review")} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 border-0  px-6">
                Tinjau & Kirim <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === "review" && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">Tinjau Klaim</h1>
              <p className="text-sm text-muted-foreground mt-1">Periksa kembali semua data dan dokumen sebelum mengirim</p>
            </div>

            {/* Patient info */}
            <Card className="border-border/60 divide-y divide-border/40 font-medium text-xs" style={{ boxShadow: 'var(--shadow-card)' }}>
              {[
                { label: "Nama Pasien", value: form.patientName },
                { label: "NIK", value: form.nik },
                { label: "No. BPJS", value: form.bpjsNumber },
                { label: "Diagnosis Utama (ICD-10)", value: form.diagnosis },
                { label: "Prosedur (ICD-9-CM)", value: PROCEDURES.find(p => p.code === procedure)?.display || procedure },
                { label: "Kelas Perawatan RS", value: `Kelas ${hospitalClass}` },
                { label: "Severity Level", value: `Tingkat ${severityLevel}` },
                { label: "Estimasi Tarif INA-CBG", value: formatIDR(calculateTariff()) },
                { label: "Rumah Sakit", value: form.hospitalName },
                { label: "Tipe Perawatan", value: form.treatmentType === "rawat-jalan" ? "Rawat Jalan" : "Rawat Inap" },
                { label: "Tanggal", value: form.date },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-muted-foreground font-semibold">{item.label}</span>
                  <span className="text-sm font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </Card>

            {/* Documents summary */}
            <Card className="border-border/60 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-sm font-bold text-foreground mb-3">Dokumen Terlampir ({documents.filter(d => d.file).length}/10)</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {documents.map((d) => (
                  <div key={d.key} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 font-medium">
                    {d.file?.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="text-xs text-foreground font-bold truncate">{d.label}</span>
                    {d.file && <span className="text-[10px] text-muted-foreground ml-auto truncate max-w-24">{d.file.file.name}</span>}
                  </div>
                ))}
              </div>
            </Card>

            {/* FHIR + Risk summary */}
            <div className="flex flex-col sm:flex-row gap-4 font-medium">
              <Card className="flex-1 border-primary/20 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Preview FHIR</span>
                </div>
                <p className="text-xs text-muted-foreground">Data ditampilkan sebagai contoh struktur FHIR untuk menggambarkan format pertukaran data, bukan koneksi produksi.</p>
              </Card>
              {riskScore !== null && (
                <Card className={`flex-1 border p-4 ${riskLevel(riskScore).bg}`} style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardCheck className={`h-4 w-4 ${riskLevel(riskScore).color}`} />
                    <span className="text-sm font-bold text-foreground">Skor Risiko: {riskScore}%</span>
                    <Badge className={`${riskLevel(riskScore).bg} ${riskLevel(riskScore).color} border text-xs font-bold ml-auto`}>
                      {riskLevel(riskScore).label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{riskLevel(riskScore).desc}</p>
                </Card>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep("fhir-preview")} className="rounded-xl">
                <ArrowLeft className="h-4 w-4" /> Kembali
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 border-0  px-8">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan demo...</> : <><CheckCircle2 className="h-4 w-4" /> Simpan Klaim Demo</>}
              </Button>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
};

// Reusable form field
function FormField({ icon: Icon, label, value, onChange, placeholder, type = "text", validation }: {
  icon: React.ElementType; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
  validation?: { valid: boolean; msg: string };
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" /> {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Masukkan ${label.toLowerCase()}`}
        className={`rounded-xl border-border/60 bg-muted/20 focus:border-primary/50 ${
          validation ? (validation.valid ? "border-success/50" : "border-warning/50") : ""
        }`}
      />
      {validation && (
        <div className={`flex items-center gap-1 text-xs font-medium ${validation.valid ? "text-success" : "text-warning"}`}>
          {validation.valid ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          {validation.msg}
        </div>
      )}
    </div>
  );
}

export default SmartClaimSubmission;


