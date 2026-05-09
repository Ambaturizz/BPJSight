import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield, ArrowLeft, Heart, AlertTriangle, CheckCircle2, Clock,
  FileText, ChevronRight, Activity, Stethoscope, CreditCard,
  Sparkles, Bell, Inbox, MapPin
} from "lucide-react";
import NearbyFacilities from "./NearbyFacilities";

interface PatientDashboardProps {
  onBack: () => void;
}

const MOCK_CLAIMS = [
  {
    id: "KLM-2024-001",
    title: "Rawat Jalan - Poli Jantung",
    hospital: "RS MBG",
    date: "28 Mar 2024",
    amount: "Rp 1.250.000",
    status: "diproses",
    steps: ["Diajukan", "Diverifikasi", "Diproses", "Selesai"],
    currentStep: 2,
    risk: null,
    aiConfidence: null,
  },
  {
    id: "KLM-2024-002",
    title: "Rawat Inap - Bedah Minor",
    hospital: "RS MBG",
    date: "15 Mar 2024",
    amount: "Rp 8.500.000",
    status: "berisiko",
    steps: ["Diajukan", "Diverifikasi", "Diproses", "Selesai"],
    currentStep: 1,
    risk: "Diagnosis belum terdokumentasi lengkap di rekam medis. Hubungi RS untuk melengkapi dokumentasi.",
    aiConfidence: 78,
  },
  {
    id: "KLM-2024-003",
    title: "Rawat Jalan - Poli Mata",
    hospital: "RS MBG",
    date: "5 Mar 2024",
    amount: "Rp 650.000",
    status: "selesai",
    steps: ["Diajukan", "Diverifikasi", "Diproses", "Selesai"],
    currentStep: 3,
    risk: null,
    aiConfidence: null,
  },
];

const BENEFITS = [
  { icon: Stethoscope, title: "Rawat Jalan", desc: "Konsultasi dokter spesialis di faskes tingkat 1 & 2", covered: true },
  { icon: Heart, title: "Rawat Inap", desc: "Perawatan kelas sesuai kepesertaan (Kelas 1)", covered: true },
  { icon: Activity, title: "Tindakan Medis", desc: "Operasi dan prosedur sesuai indikasi medis", covered: true },
  { icon: CreditCard, title: "Obat-obatan", desc: "Obat generik dan formularium nasional", covered: true },
];

type Tab = "klaim" | "manfaat" | "faskes" | "riwayat";

const PatientDashboard = ({ onBack }: PatientDashboardProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("klaim");
  const [isLoading] = useState(false);

  const statusColor = (status: string) => {
    if (status === "selesai") return "bg-success/15 text-success border-success/25";
    if (status === "berisiko") return "bg-destructive/15 text-destructive border-destructive/25";
    return "bg-info/15 text-info border-info/25";
  };

  const statusLabel = (status: string) => {
    if (status === "selesai") return "Selesai";
    if (status === "berisiko") return "Berisiko";
    return "Diproses";
  };

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
          <div className="ml-auto flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-card" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">P</div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-foreground leading-none">Polisi MBG</p>
                <p className="text-xs text-muted-foreground">BPJS Kelas 1</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        {/* Health Risk Card */}
        <Card className="animate-slide-up mb-8 overflow-hidden border-primary/20" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/8 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="relative flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
                  <Heart className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Health Risk Card</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">BPJS Kelas 1 • No. 0001234567890</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="bg-success/15 text-success border border-success/25 font-medium">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> 2 Klaim Aktif
                    </Badge>
                    <Badge className="bg-warning/15 text-warning border border-warning/25 font-medium">
                      <AlertTriangle className="mr-1 h-3 w-3" /> 1 Perlu Tindakan
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-4 md:max-w-xs">
                <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Tindakan Mendesak
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Klaim KLM-2024-002 berisiko ditolak. Lengkapi dokumen segera.
                </p>
                <Button variant="outline" size="sm" className="mt-3 h-8 rounded-lg text-xs border-destructive/25 text-destructive hover:bg-destructive/15">
                  Lihat Detail
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-muted/60 p-1.5 backdrop-blur-sm">
          {([
            { key: "klaim" as Tab, label: "Klaim Saya", icon: FileText },
            { key: "manfaat" as Tab, label: "Manfaat & Hak", icon: Heart },
            { key: "faskes" as Tab, label: "Faskes Terdekat", icon: MapPin },
            { key: "riwayat" as Tab, label: "Riwayat", icon: Clock },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="mt-6 flex items-center gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex flex-col items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Claims Tab */}
        {!isLoading && activeTab === "klaim" && (
          <div className="space-y-4">
            {MOCK_CLAIMS.filter((c) => c.status !== "selesai").length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-bold text-foreground">Tidak Ada Klaim Aktif</h3>
                <p className="mt-1 text-sm text-muted-foreground">Semua klaim Anda sudah selesai diproses.</p>
              </Card>
            ) : (
              MOCK_CLAIMS.filter((c) => c.status !== "selesai").map((claim, idx) => (
                <Card
                  key={claim.id}
                  className="animate-slide-up overflow-hidden border-border/60 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20"
                  style={{ animationDelay: `${idx * 0.1}s`, boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-foreground">{claim.title}</h3>
                          <Badge className={`${statusColor(claim.status)} text-xs font-semibold border`}>
                            {statusLabel(claim.status)}
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {claim.hospital} • {claim.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{claim.amount}</p>
                        <p className="text-xs text-muted-foreground">{claim.id}</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-6 flex items-center">
                      {claim.steps.map((step, i) => (
                        <div key={step} className="flex flex-1 items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                                i <= claim.currentStep
                                  ? "gradient-primary text-primary-foreground shadow-md shadow-primary/25"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {i <= claim.currentStep ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                            </div>
                            <span className={`mt-1.5 text-xs font-medium ${i <= claim.currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                              {step}
                            </span>
                          </div>
                          {i < claim.steps.length - 1 && (
                            <div className={`mx-1 h-0.5 flex-1 rounded-full transition-colors ${i < claim.currentStep ? "gradient-primary" : "bg-muted"}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* AI Risk Warning */}
                    {claim.risk && (
                      <div className="mt-5 rounded-xl border border-warning/25 bg-warning/5 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/15">
                            <Sparkles className="h-4 w-4 text-warning" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-foreground">Prediksi AI: Risiko Penolakan</span>
                              {claim.aiConfidence && (
                                <Badge className="bg-destructive/15 text-destructive border border-destructive/25 text-xs font-bold">
                                  {claim.aiConfidence}% Risiko
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{claim.risk}</p>
                            {claim.aiConfidence && (
                              <div className="mt-3 flex items-center gap-3">
                                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-warning to-destructive transition-all duration-500"
                                    style={{ width: `${claim.aiConfidence}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-destructive">{claim.aiConfidence}%</span>
                              </div>
                            )}
                            <Button variant="outline" size="sm" className="mt-3 rounded-lg border-warning/30 text-warning hover:bg-warning/15">
                              <FileText className="h-4 w-4" /> Lihat Langkah Perbaikan
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Benefits Tab */}
        {!isLoading && activeTab === "manfaat" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((b, idx) => (
              <Card
                key={b.title}
                className="animate-slide-up group flex items-start gap-4 border-border/60 p-5 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 hover:border-primary/20"
                style={{ animationDelay: `${idx * 0.08}s`, boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-all duration-300 group-hover:gradient-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/25">
                  <b.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground">{b.title}</h4>
                    <Badge className="bg-success/15 text-success border border-success/25 text-xs font-semibold">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Ditanggung
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Nearby Facilities Tab */}
        {!isLoading && activeTab === "faskes" && <NearbyFacilities />}

        {/* History Tab */}
        {!isLoading && activeTab === "riwayat" && (
          <div className="space-y-3">
            {MOCK_CLAIMS.filter((c) => c.status === "selesai").length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-bold text-foreground">Belum Ada Riwayat</h3>
                <p className="mt-1 text-sm text-muted-foreground">Klaim yang sudah selesai akan muncul di sini.</p>
              </Card>
            ) : (
              MOCK_CLAIMS.filter((c) => c.status === "selesai").map((claim, idx) => (
                <Card
                  key={claim.id}
                  className="animate-slide-up group flex items-center justify-between border-border/60 p-4 md:p-5 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20 cursor-pointer"
                  style={{ animationDelay: `${idx * 0.08}s`, boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/15">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{claim.title}</p>
                      <p className="text-sm text-muted-foreground">{claim.hospital} • {claim.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">{claim.amount}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
