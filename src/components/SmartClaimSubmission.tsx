import { useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Shield, ArrowLeft, Upload, FileText, X, CheckCircle2,
  AlertTriangle, Sparkles, Bell, Loader2, ChevronRight,
  Building2, Calendar, Stethoscope, Activity, User, CreditCard, Heart
} from "lucide-react";

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

// HL7 FHIR Resource types
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

const INITIAL_FORM: ClaimForm = {
  patientName: "",
  nik: "",
  bpjsNumber: "",
  diagnosis: "",
  hospitalName: "RS MBG",
  treatmentType: "",
  date: new Date().toISOString().split("T")[0],
};

const SmartClaimSubmission = ({ onBack, onSuccess }: SmartClaimSubmissionProps) => {
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
        { system: "urn:oid:2.16.840.1.113883.2.2.1.1", value: form.nik },
        { system: "https://bpjs-kesehatan.go.id/fhir/sid/bpjs-number", value: form.bpjsNumber },
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
      provider: { reference: "Organization/rs-mbg", display: form.hospitalName },
      diagnosis: [{
        sequence: 1,
        diagnosisCodeableConcept: {
          coding: [{
            system: "http://hl7.org/fhir/sid/icd-10",
            code: "J18.9",
            display: form.diagnosis,
          }],
        },
      }],
      supportingInfo: documents.filter(d => d.file).map((d, i) => ({
        sequence: i + 1,
        category: {
          coding: [{
            system: "https://bpjs-kesehatan.go.id/fhir/CodeSystem/claim-document-type",
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
    const score = Math.floor(Math.random() * 60) + 15;
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
    if (score >= 70) return { label: "Tinggi", color: "text-destructive", bg: "bg-destructive/15 border-destructive/25", gradient: "from-warning to-destructive", desc: "Klaim memiliki risiko tinggi ditolak. Pastikan semua dokumen lengkap dan koding ICD-10 sesuai." };
    if (score >= 40) return { label: "Sedang", color: "text-warning", bg: "bg-warning/15 border-warning/25", gradient: "from-success to-warning", desc: "Klaim memiliki risiko sedang. Periksa kembali kelengkapan lembar verifikasi casemix dan INA CBG's." };
    return { label: "Rendah", color: "text-success", bg: "bg-success/15 border-success/25", gradient: "from-success to-success", desc: "Risiko rendah. Semua dokumen terverifikasi dan data FHIR sesuai standar." };
  };

  const stepLabels: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: "docs", label: "Upload Dokumen", icon: Upload },
    { key: "form", label: "Data Klaim", icon: FileText },
    { key: "fhir-preview", label: "FHIR & Risiko", icon: Heart },
    { key: "review", label: "Kirim", icon: CheckCircle2 },
  ];
  const stepOrder: Step[] = ["docs", "form", "fhir-preview", "review"];
  const currentStepIdx = stepOrder.indexOf(step);

  // Success screen
  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="animate-fade-in-up max-w-md w-full p-8 text-center border-border/60" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full gradient-primary shadow-lg shadow-primary/30 mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Klaim Berhasil Dikirim!</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Klaim telah diajukan ke BPJS Kesehatan melalui standar HL7 FHIR. Dokumen verifikasi telah terlampir lengkap.
          </p>
          <div className="mt-6 rounded-xl bg-muted/40 p-4 text-left space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pasien</span><span className="font-bold text-foreground">{form.patientName}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Dokumen</span><span className="font-semibold text-foreground">{documents.filter(d => d.file).length}/10 terlampir</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Format</span><Badge className="bg-primary/15 text-primary border border-primary/25 text-xs font-semibold">HL7 FHIR R4</Badge></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><Badge className="bg-info/15 text-info border border-info/25 text-xs font-semibold">Diproses</Badge></div>
          </div>
          <Button onClick={onSuccess} className="mt-6 w-full rounded-xl gradient-primary text-primary-foreground border-0 shadow-md shadow-primary/25">
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
          <Badge variant="outline" className="ml-1 text-primary border-primary/30 font-semibold text-xs">Pengajuan Klaim RS</Badge>
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
                      isDone ? "gradient-primary text-primary-foreground shadow-md shadow-primary/25" :
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
              <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">Upload Dokumen Verifikasi</h1>
              <p className="text-sm text-muted-foreground mt-1">Upload 10 dokumen persyaratan klaim BPJS satu per satu (format PDF)</p>
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground font-bold text-sm">
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
                <Button onClick={goNextDoc} disabled={!currentDoc.file || currentDoc.file.status !== "done"} className="rounded-xl gradient-primary text-primary-foreground border-0 shadow-md shadow-primary/25">
                  Dokumen Selanjutnya <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setStep("form")} disabled={!allDocsDone} className="rounded-xl gradient-primary text-primary-foreground border-0 shadow-md shadow-primary/25 px-6">
                  <Sparkles className="h-4 w-4" /> Lanjut ke Data Klaim <ChevronRight className="h-4 w-4" />
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
              <p className="text-sm text-muted-foreground mt-1">Lengkapi informasi pasien dan diagnosis untuk pengajuan klaim</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField icon={User} label="Nama Pasien" value={form.patientName} onChange={(v) => setForm(f => ({ ...f, patientName: v }))} />
              <FormField icon={CreditCard} label="NIK" value={form.nik} onChange={(v) => setForm(f => ({ ...f, nik: v.replace(/\D/g, "").slice(0, 16) }))}
                validation={form.nik ? (nikValid ? { valid: true, msg: "NIK valid (16 digit)" } : { valid: false, msg: `${form.nik.length}/16 digit` }) : undefined}
              />
              <FormField icon={Shield} label="No. BPJS" value={form.bpjsNumber} onChange={(v) => setForm(f => ({ ...f, bpjsNumber: v.replace(/\D/g, "").slice(0, 13) }))}
                validation={form.bpjsNumber ? (bpjsValid ? { valid: true, msg: "No. BPJS valid (13 digit)" } : { valid: false, msg: `${form.bpjsNumber.length}/13 digit` }) : undefined}
              />
              <FormField icon={Stethoscope} label="Diagnosis" value={form.diagnosis} onChange={(v) => setForm(f => ({ ...f, diagnosis: v }))} placeholder="Masukkan diagnosis (kode ICD-10)" />
              <FormField icon={Building2} label="Nama Rumah Sakit" value={form.hospitalName} onChange={(v) => setForm(f => ({ ...f, hospitalName: v }))} />
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
                      onClick={() => setForm(f => ({ ...f, treatmentType: opt.value as "rawat-jalan" | "rawat-inap" }))}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
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
              <FormField icon={Calendar} label="Tanggal Perawatan" value={form.date} onChange={(v) => setForm(f => ({ ...f, date: v }))} type="date" />
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep("docs")} className="rounded-xl">
                <ArrowLeft className="h-4 w-4" /> Kembali
              </Button>
              <Button onClick={proceedToFHIR} disabled={!formComplete} className="rounded-xl gradient-primary text-primary-foreground border-0 shadow-md shadow-primary/25 px-6">
                <Heart className="h-4 w-4" /> Generate FHIR & Analisis <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: FHIR Preview + Risk */}
        {step === "fhir-preview" && fhirBundle && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">HL7 FHIR & Prediksi Risiko AI</h1>
              <p className="text-sm text-muted-foreground mt-1">Rekam medis telah dikonversi ke standar HL7 FHIR R4</p>
            </div>

            {/* FHIR Patient Resource */}
            <Card className="border-primary/20 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3 bg-primary/5">
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">FHIR Patient Resource</span>
                <Badge className="bg-primary/15 text-primary border border-primary/25 text-[10px] font-bold">R4</Badge>
              </div>
              <div className="p-5">
                <pre className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-4 overflow-x-auto font-mono leading-relaxed">
                  {JSON.stringify(fhirBundle.patient, null, 2)}
                </pre>
              </div>
            </Card>

            {/* FHIR Claim Resource */}
            <Card className="border-primary/20 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3 bg-primary/5">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">FHIR Claim Resource</span>
                <Badge className="bg-primary/15 text-primary border border-primary/25 text-[10px] font-bold">R4</Badge>
              </div>
              <div className="p-5">
                <pre className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-4 overflow-x-auto font-mono leading-relaxed max-h-64 overflow-y-auto">
                  {JSON.stringify(fhirBundle.claim, null, 2)}
                </pre>
              </div>
            </Card>

            {/* AI Risk */}
            {riskScore !== null && (
              <Card className={`border ${riskLevel(riskScore).bg} overflow-hidden`} style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${riskLevel(riskScore).bg}`}>
                      <span className={`text-xl font-extrabold ${riskLevel(riskScore).color}`}>{riskScore}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">Prediksi Risiko AI</span>
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
              <Button onClick={() => setStep("review")} className="rounded-xl gradient-primary text-primary-foreground border-0 shadow-md shadow-primary/25 px-6">
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
            <Card className="border-border/60 divide-y divide-border/40" style={{ boxShadow: 'var(--shadow-card)' }}>
              {[
                { label: "Nama Pasien", value: form.patientName },
                { label: "NIK", value: form.nik },
                { label: "No. BPJS", value: form.bpjsNumber },
                { label: "Diagnosis", value: form.diagnosis },
                { label: "Rumah Sakit", value: form.hospitalName },
                { label: "Tipe Perawatan", value: form.treatmentType === "rawat-jalan" ? "Rawat Jalan" : "Rawat Inap" },
                { label: "Tanggal", value: form.date },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </Card>

            {/* Documents summary */}
            <Card className="border-border/60 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-sm font-bold text-foreground mb-3">Dokumen Terlampir ({documents.filter(d => d.file).length}/10)</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {documents.map((d) => (
                  <div key={d.key} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                    {d.file?.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="text-xs text-foreground font-medium truncate">{d.label}</span>
                    {d.file && <span className="text-[10px] text-muted-foreground ml-auto truncate max-w-24">{d.file.file.name}</span>}
                  </div>
                ))}
              </div>
            </Card>

            {/* FHIR + Risk summary */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Card className="flex-1 border-primary/20 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">HL7 FHIR</span>
                </div>
                <p className="text-xs text-muted-foreground">Data telah dikonversi ke format FHIR R4 untuk interoperabilitas sistem kesehatan nasional.</p>
              </Card>
              {riskScore !== null && (
                <Card className={`flex-1 border p-4 ${riskLevel(riskScore).bg}`} style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className={`h-4 w-4 ${riskLevel(riskScore).color}`} />
                    <span className="text-sm font-bold text-foreground">Skor Risiko: {riskScore}/100</span>
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
              <Button onClick={handleSubmit} disabled={submitting} className="rounded-xl gradient-primary text-primary-foreground border-0 shadow-md shadow-primary/25 px-8">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengirim via FHIR...</> : <><CheckCircle2 className="h-4 w-4" /> Kirim Klaim</>}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
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
