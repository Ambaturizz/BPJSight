import { useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Shield, ArrowLeft, Upload, FileText, Image, X, CheckCircle2,
  AlertTriangle, Sparkles, Bell, Loader2, ChevronRight, Eye,
  CreditCard, User, Building2, Calendar, Stethoscope, Activity
} from "lucide-react";

interface SmartClaimSubmissionProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "done" | "error";
}

interface DocumentSlot {
  key: string;
  label: string;
  required: boolean;
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

type Step = "upload" | "form" | "review" | "success";

const INITIAL_FORM: ClaimForm = {
  patientName: "",
  nik: "",
  bpjsNumber: "",
  diagnosis: "",
  hospitalName: "",
  treatmentType: "",
  date: "",
};

const SmartClaimSubmission = ({ onBack, onSuccess }: SmartClaimSubmissionProps) => {
  const [step, setStep] = useState<Step>("upload");
  const [documents, setDocuments] = useState<DocumentSlot[]>([
    { key: "ktp", label: "KTP", required: true, file: null },
    { key: "bpjs", label: "Kartu BPJS", required: true, file: null },
    { key: "kk", label: "Kartu Keluarga", required: true, file: null },
    { key: "additional", label: "Dokumen Tambahan", required: false, file: null },
  ]);
  const [form, setForm] = useState<ClaimForm>(INITIAL_FORM);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const nikValid = form.nik.length === 16 && /^\d+$/.test(form.nik);
  const bpjsValid = form.bpjsNumber.length === 13 && /^\d+$/.test(form.bpjsNumber);
  const requiredDocsDone = documents.filter(d => d.required).every(d => d.file?.status === "done");
  const formComplete = form.patientName && nikValid && bpjsValid && form.diagnosis && form.hospitalName && form.treatmentType && form.date;

  const simulateUpload = useCallback((docKey: string, file: File) => {
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    const uploaded: UploadedFile = { file, preview, progress: 0, status: "uploading" };

    setDocuments(prev => prev.map(d => d.key === docKey ? { ...d, file: uploaded } : d));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDocuments(prev => prev.map(d =>
          d.key === docKey ? { ...d, file: { ...uploaded, progress: 100, status: "done" } } : d
        ));
      } else {
        setDocuments(prev => prev.map(d =>
          d.key === docKey ? { ...d, file: { ...uploaded, progress } } : d
        ));
      }
    }, 200);
  }, []);

  const handleFileDrop = useCallback((docKey: string, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      simulateUpload(docKey, file);
    }
  }, [simulateUpload]);

  const handleFileSelect = useCallback((docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateUpload(docKey, file);
  }, [simulateUpload]);

  const removeFile = (docKey: string) => {
    setDocuments(prev => prev.map(d => d.key === docKey ? { ...d, file: null } : d));
  };

  const runOCR = () => {
    setOcrProcessing(true);
    setTimeout(() => {
      setForm({
        patientName: "Polisi MBG",
        nik: "3201234567890123",
        bpjsNumber: "0001234567890",
        diagnosis: "",
        hospitalName: "RS MBG",
        treatmentType: "",
        date: new Date().toISOString().split("T")[0],
      });
      setOcrProcessing(false);
      setStep("form");
    }, 2000);
  };

  const calculateRisk = () => {
    const score = Math.floor(Math.random() * 60) + 15;
    setRiskScore(score);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep("success");
    }, 2500);
  };

  const riskLevel = (score: number) => {
    if (score >= 70) return { label: "Tinggi", color: "text-destructive", bg: "bg-destructive/15 border-destructive/25", gradient: "from-warning to-destructive", desc: "Klaim ini memiliki risiko tinggi ditolak. Pastikan semua dokumen lengkap dan diagnosis sesuai ICD-10." };
    if (score >= 40) return { label: "Sedang", color: "text-warning", bg: "bg-warning/15 border-warning/25", gradient: "from-success to-warning", desc: "Klaim memiliki risiko sedang. Periksa kembali kelengkapan data untuk meningkatkan peluang persetujuan." };
    return { label: "Rendah", color: "text-success", bg: "bg-success/15 border-success/25", gradient: "from-success to-success", desc: "Klaim ini memiliki risiko rendah ditolak. Data dan dokumen terlihat lengkap dan sesuai." };
  };

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
            Klaim Anda telah berhasil diajukan dan sedang diproses. Anda akan menerima notifikasi untuk setiap pembaruan status.
          </p>
          <div className="mt-6 rounded-xl bg-muted/40 p-4 text-left space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">ID Klaim</span><span className="font-bold text-foreground">KLM-2024-004</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pasien</span><span className="font-semibold text-foreground">{form.patientName}</span></div>
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
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground tracking-tight">BPJSight</span>
          </div>
          <Badge variant="outline" className="ml-1 text-primary border-primary/30 font-semibold text-xs">Ajukan Klaim</Badge>
          <div className="ml-auto">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
        {/* Stepper */}
        <div className="animate-fade-in-up mb-8">
          <div className="flex items-center justify-between mb-6">
            {[
              { key: "upload", label: "Unggah Dokumen", icon: Upload },
              { key: "form", label: "Isi Data Klaim", icon: FileText },
              { key: "review", label: "Tinjau & Kirim", icon: CheckCircle2 },
            ].map((s, i) => {
              const steps: Step[] = ["upload", "form", "review"];
              const currentIdx = steps.indexOf(step);
              const thisIdx = i;
              const isActive = thisIdx === currentIdx;
              const isDone = thisIdx < currentIdx;
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
                    <span className={`mt-2 text-xs font-semibold ${isActive || isDone ? "text-primary" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && <div className={`h-0.5 w-full mx-2 rounded-full ${isDone ? "gradient-primary" : "bg-muted"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="animate-slide-up space-y-4">
            <div className="mb-2">
              <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">Unggah Dokumen</h1>
              <p className="text-sm text-muted-foreground mt-1">Upload dokumen yang diperlukan untuk pengajuan klaim BPJS</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {documents.map((doc) => (
                <Card
                  key={doc.key}
                  className="border-border/60 overflow-hidden transition-all duration-200 hover:border-primary/20"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleFileDrop(doc.key, e)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{doc.label}</h3>
                        {doc.required && <Badge className="bg-destructive/15 text-destructive border border-destructive/25 text-[10px] font-bold">Wajib</Badge>}
                      </div>
                      {doc.file?.status === "done" && (
                        <button onClick={() => removeFile(doc.key)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {!doc.file ? (
                      <button
                        onClick={() => fileInputRefs.current[doc.key]?.click()}
                        className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-6 transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-foreground">Drag & drop atau klik</p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF • Maks 5MB</p>
                        </div>
                        <input
                          ref={(el) => { fileInputRefs.current[doc.key] = el; }}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileSelect(doc.key, e)}
                        />
                      </button>
                    ) : doc.file.status === "uploading" ? (
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">{doc.file.file.name}</p>
                            <p className="text-xs text-muted-foreground">Mengunggah...</p>
                          </div>
                        </div>
                        <Progress value={doc.file.progress} className="h-2" />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-success/25 bg-success/5 p-3">
                        <div className="flex items-center gap-3">
                          {doc.file.preview ? (
                            <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-border/60">
                              <img src={doc.file.preview} alt={doc.label} className="h-full w-full object-cover" />
                              <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                                <Eye className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                              <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{doc.file.file.name}</p>
                            <p className="text-xs text-muted-foreground">{(doc.file.file.size / 1024).toFixed(0)} KB</p>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={runOCR}
                disabled={!requiredDocsDone || ocrProcessing}
                className="rounded-xl gradient-primary text-primary-foreground border-0 shadow-md shadow-primary/25 px-6"
              >
                {ocrProcessing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Memproses OCR...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Lanjut & Ekstrak Data <ChevronRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Form */}
        {step === "form" && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">Data Klaim</h1>
              <p className="text-sm text-muted-foreground mt-1">Data berikut telah diisi otomatis dari OCR. Periksa dan lengkapi.</p>
            </div>

            {/* OCR Badge */}
            <Card className="border-primary/20 bg-primary/5 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Data Otomatis dari OCR</p>
                  <p className="text-xs text-muted-foreground">Beberapa field telah terisi otomatis dari dokumen yang diunggah</p>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField icon={User} label="Nama Pasien" value={form.patientName} onChange={(v) => setForm(f => ({ ...f, patientName: v }))} autoFilled />
              <FormField icon={CreditCard} label="NIK" value={form.nik} onChange={(v) => setForm(f => ({ ...f, nik: v.replace(/\D/g, "").slice(0, 16) }))} autoFilled
                validation={form.nik ? (nikValid ? { valid: true, msg: "NIK valid (16 digit)" } : { valid: false, msg: `${form.nik.length}/16 digit` }) : undefined}
              />
              <FormField icon={Shield} label="No. BPJS" value={form.bpjsNumber} onChange={(v) => setForm(f => ({ ...f, bpjsNumber: v.replace(/\D/g, "").slice(0, 13) }))} autoFilled
                validation={form.bpjsNumber ? (bpjsValid ? { valid: true, msg: "No. BPJS valid (13 digit)" } : { valid: false, msg: `${form.bpjsNumber.length}/13 digit` }) : undefined}
              />
              <FormField icon={Stethoscope} label="Diagnosis" value={form.diagnosis} onChange={(v) => setForm(f => ({ ...f, diagnosis: v }))} placeholder="Masukkan diagnosis" />
              <FormField icon={Building2} label="Nama Rumah Sakit" value={form.hospitalName} onChange={(v) => setForm(f => ({ ...f, hospitalName: v }))} autoFilled />
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
              <FormField icon={Calendar} label="Tanggal" value={form.date} onChange={(v) => setForm(f => ({ ...f, date: v }))} type="date" autoFilled />
            </div>

            {/* AI Risk Prediction */}
            {riskScore === null ? (
              <div className="flex justify-center">
                <Button onClick={calculateRisk} disabled={!formComplete} variant="outline" className="rounded-xl border-primary/30 text-primary hover:bg-primary/10">
                  <Sparkles className="h-4 w-4" /> Hitung Prediksi Risiko AI
                </Button>
              </div>
            ) : (
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
              <Button variant="outline" onClick={() => setStep("upload")} className="rounded-xl">
                <ArrowLeft className="h-4 w-4" /> Kembali
              </Button>
              <Button onClick={() => setStep("review")} disabled={!formComplete} className="rounded-xl gradient-primary text-primary-foreground border-0 shadow-md shadow-primary/25 px-6">
                Tinjau Klaim <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === "review" && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">Tinjau Klaim</h1>
              <p className="text-sm text-muted-foreground mt-1">Periksa kembali data sebelum mengirim klaim</p>
            </div>

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

            {/* Uploaded docs summary */}
            <Card className="border-border/60 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-sm font-bold text-foreground mb-3">Dokumen Terlampir</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {documents.filter(d => d.file).map(d => (
                  <div key={d.key} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span className="text-sm text-foreground font-medium truncate">{d.label}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{d.file?.file.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            {riskScore !== null && (
              <div className={`flex items-center gap-3 rounded-xl border p-4 ${riskLevel(riskScore).bg}`}>
                <Sparkles className={`h-5 w-5 ${riskLevel(riskScore).color}`} />
                <span className="text-sm font-semibold text-foreground">Skor Risiko AI: {riskScore}/100</span>
                <Badge className={`${riskLevel(riskScore).bg} ${riskLevel(riskScore).color} border text-xs font-bold ml-auto`}>
                  {riskLevel(riskScore).label}
                </Badge>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep("form")} className="rounded-xl">
                <ArrowLeft className="h-4 w-4" /> Kembali
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="rounded-xl gradient-primary text-primary-foreground border-0 shadow-md shadow-primary/25 px-8">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengirim...</> : <><CheckCircle2 className="h-4 w-4" /> Kirim Klaim</>}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Reusable form field
function FormField({ icon: Icon, label, value, onChange, placeholder, type = "text", autoFilled, validation }: {
  icon: React.ElementType; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; autoFilled?: boolean;
  validation?: { valid: boolean; msg: string };
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" /> {label}
        {autoFilled && value && <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px] font-bold border">OCR</Badge>}
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
