import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/feedback/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  ArrowLeft,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  ClipboardCheck,
  Inbox,
  MapPin,
  User as UserIcon,
  Wrench,
  X,
  Pill,
  Activity
} from "lucide-react";
import NearbyFacilities from "./NearbyFacilities";
import NotificationCenter from "./NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "./LogoutButton";
import ClaimReviewRecommendations from "./AIRecommendations";
import PatientProfile from "./PatientProfile";
import RiskFactorList from "@/components/ai/RiskFactorList";
import RiskScoreBadge from "@/components/ai/RiskScoreBadge";
import { claimsService } from "@/services/claimsService";
import { getClaimStatusLabel } from "@/lib/app-helpers";
import { useAuth } from "@/features/auth/AuthProvider";
import type { Benefit } from "@/types/dashboard";
import type { ClaimStatus, PatientClaim } from "@/types/claim";
import { AppLayout } from "./AppLayout";

interface PatientDashboardProps {
  onBack: () => void;
}

type Tab = "klaim" | "manfaat" | "faskes" | "ai" | "profil" | "riwayat";

interface ActiveQueueTicket {
  id: string;
  facilityId: string;
  facilityName: string;
  poli: string;
  doctor: string;
  timeSlot: string;
  queueNumber: string;
  remaining: number;
  date: string;
}

const PatientDashboard = ({ onBack }: PatientDashboardProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("klaim");
  const [claims, setClaims] = useState<PatientClaim[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedActionClaim, setSelectedActionClaim] = useState<PatientClaim | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(() => new Set());
  const { currentUser } = useAuth();

  const [activeQueue, setActiveQueue] = useState<ActiveQueueTicket | null>(() => {
    try {
      const raw = sessionStorage.getItem("bpjsight.active.queue");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [prbStep, setPrbStep] = useState<number>(() => {
    return Number(sessionStorage.getItem("bpjsight.prb.step") ?? "0");
  });

  const patientName = currentUser?.displayName ?? currentUser?.name ?? "Pasien MBG";
  const patientInitial = patientName.trim().charAt(0).toUpperCase() || "P";
  const bpjsDisplay = currentUser?.bpjsMasked ?? "•••• •••• •7890";

  const handleAdvanceQueue = () => {
    if (!activeQueue) return;
    const nextRemaining = activeQueue.remaining > 0 ? activeQueue.remaining - 1 : 0;
    const nextQueue = { ...activeQueue, remaining: nextRemaining };
    setActiveQueue(nextQueue);
    sessionStorage.setItem("bpjsight.active.queue", JSON.stringify(nextQueue));
    if (nextRemaining === 0) {
      toast.success("Nomor Anda Dipanggil!", {
        description: "Silakan menuju ke loket admisi Faskes sekarang.",
      });
    } else {
      toast.info(`Antrean diperbarui. Tersisa ${nextRemaining} orang lagi.`);
    }
  };

  const handleDismissQueue = () => {
    sessionStorage.removeItem("bpjsight.active.queue");
    setActiveQueue(null);
    toast.success("Antrean selesai.", {
      description: "Kunjungan Anda telah diselesaikan.",
    });
  };

  const handlePRBRefill = () => {
    setPrbStep(1);
    sessionStorage.setItem("bpjsight.prb.step", "1");
    toast.success("Resep PRB Dikirim!", {
      description: "Permintaan tebus obat PRB Anda sedang diproses oleh Apotek.",
    });
  };

  const handlePRBAdvance = () => {
    const nextStep = prbStep + 1;
    if (nextStep > 4) {
      setPrbStep(0);
      sessionStorage.setItem("bpjsight.prb.step", "0");
      toast.success("Obat PRB Selesai Diterima", {
        description: "Terima kasih telah mengonfirmasi penerimaan obat PRB.",
      });
    } else {
      setPrbStep(nextStep);
      sessionStorage.setItem("bpjsight.prb.step", String(nextStep));
      toast.info("Status pengiriman diperbarui.");
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);

      try {
        setErrorMessage(null);
        const [patientClaims, patientBenefits] = await Promise.all([
          claimsService.getPatientClaims(),
          claimsService.getBenefits(),
        ]);

        if (!isMounted) return;

        setClaims(patientClaims);
        setBenefits(patientBenefits);
      } catch {
        if (isMounted) {
          setClaims([]);
          setBenefits([]);
          setErrorMessage("Data dashboard pasien belum dapat dimuat.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const statusColor = (status: ClaimStatus) => {
    if (status === "selesai") return "bg-success/15 text-success border-success/25";
    if (status === "berisiko") return "bg-destructive/15 text-destructive border-destructive/25";
    return "bg-info/15 text-info border-info/25";
  };

  const statusLabel = (status: ClaimStatus) => getClaimStatusLabel(status);

  const activeClaims = claims.filter((claim) => claim.status !== "selesai");
  const finishedClaims = claims.filter((claim) => claim.status === "selesai");
  const urgentClaims = claims.filter((claim) => claim.riskLevel === "tinggi" || claim.status === "berisiko");
  const urgentClaim = urgentClaims.find((claim) => !dismissedAlerts.has(claim.id));

  const goToClaimDetail = (claimId: string) => {
    toast.info("Membuka detail klaim...", { description: claimId });
    navigate(`/pasien/klaim/${claimId}`);
  };

  const openImprovementModal = (claim: PatientClaim) => {
    setSelectedActionClaim(claim);
    toast.info("Langkah perbaikan dibuka.", { description: claim.id });
  };

  const dismissClaimAlert = (claimId: string) => {
    setDismissedAlerts((current) => new Set(current).add(claimId));
    toast.success("Alert disembunyikan untuk sesi ini.");
  };

  return (
    <AppLayout>
      <header className="sticky top-0 z-20 border-b border-border/60 bg-card/95 backdrop-blur-md px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali ke halaman utama" onClick={onBack} className="rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground tracking-tight">BPJSight</span>
          </div>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <ThemeToggle compact />
            <NotificationCenter role="patient" />
            <LogoutButton compact onLoggedOut={onBack} />

            <button
              aria-label="Buka profil pasien"
              onClick={() => setActiveTab("profil")}
              className="flex items-center gap-2 rounded-xl hover:bg-muted/40 px-1.5 py-1 transition-colors"
            >
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                {patientInitial}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-foreground leading-none">{patientName}</p>
                <p className="text-xs text-muted-foreground">BPJS Kelas 1</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        <Card className="animate-slide-up mb-8 overflow-hidden border-border/70" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-muted/20" />

            <div className="relative flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary">
                  <Heart className="h-7 w-7 text-primary-foreground" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Ringkasan Status Klaim</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">BPJS Kelas 1 • No. {bpjsDisplay} • Data simulasi</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="bg-success/15 text-success border border-success/25 font-medium">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> {activeClaims.length} Klaim Aktif
                    </Badge>
                    <Badge variant="outline" className="border-primary/25 text-primary font-medium">
                      Data Simulasi
                    </Badge>
                    <Badge className="bg-warning/15 text-warning border border-warning/25 font-medium">
                      <AlertTriangle className="mr-1 h-3 w-3" /> {urgentClaims.length} Perlu Tindakan
                    </Badge>
                  </div>
                </div>
              </div>

              {urgentClaim ? (
                <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-4 md:max-w-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-destructive">Tindakan Mendesak</p>
                        <RiskScoreBadge
                          score={urgentClaim.riskScore}
                          level={urgentClaim.riskLevel}
                          confidence={urgentClaim.aiConfidence}
                          size="sm"
                          showConfidence={false}
                        />
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {urgentClaim.id} perlu dilengkapi agar proses verifikasi tidak tertunda.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToClaimDetail(urgentClaim.id)}
                          className="h-8 rounded-lg border-destructive/25 text-xs text-destructive hover:bg-destructive/15"
                        >
                          Lihat Detail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openImprovementModal(urgentClaim)}
                          className="h-8 rounded-lg border-warning/25 text-xs text-warning hover:bg-warning/15"
                        >
                          <Wrench className="h-3.5 w-3.5" /> Lihat Langkah Perbaikan
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissClaimAlert(urgentClaim.id)}
                          className="h-8 rounded-lg text-xs text-muted-foreground hover:bg-muted/60"
                        >
                          <X className="h-3.5 w-3.5" /> Abaikan
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        {/* Active Queue Ticket Widget */}
        {activeQueue && (
          <Card className="animate-slide-up mb-6 border-primary/20 bg-primary/5 overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-primary">Tiket Antrean JKN-KIS Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold px-2 py-0.5">
                    Faskes Rujukan
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-semibold">ID: {activeQueue.id}</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 items-center">
                {/* Queue Number Badge */}
                <div className="flex flex-col items-center justify-center p-4 bg-card border border-border/80 rounded-2xl text-center shadow-sm">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Nomor Antrean Anda</span>
                  <span className={`text-4xl font-extrabold font-mono mt-1 ${activeQueue.remaining === 0 ? "text-emerald-600 animate-pulse scale-105" : "text-primary"}`}>
                    {activeQueue.queueNumber}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground mt-1">Poli: {activeQueue.poli}</span>
                </div>

                {/* Queue Details */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Nama Faskes</span>
                    <span className="font-extrabold text-foreground mt-0.5 truncate">{activeQueue.facilityName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Dokter DPJP</span>
                    <span className="font-semibold text-muted-foreground mt-0.5">{activeQueue.doctor}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Sesi Jam Layanan</span>
                    <span className="font-semibold text-muted-foreground mt-0.5">{activeQueue.timeSlot}</span>
                  </div>
                </div>

                {/* Live Countdown & Simulation Actions */}
                <div className="flex flex-col justify-center gap-3">
                  <div className={`p-3 rounded-xl border text-center ${activeQueue.remaining === 0 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-card border-border/60 text-muted-foreground"}`}>
                    {activeQueue.remaining === 0 ? (
                      <div className="space-y-0.5">
                        <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-700 animate-pulse">Sedang Dipanggil!</p>
                        <p className="text-[10px] leading-tight font-semibold">Silakan menuju Loket Admisi / Counter Poli sekarang.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider">Sisa Antrean Di Depan</p>
                        <p className="text-2xl font-extrabold text-foreground font-mono mt-0.5">{activeQueue.remaining} Orang</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {activeQueue.remaining > 0 ? (
                      <Button
                        onClick={handleAdvanceQueue}
                        size="sm"
                        className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold h-9"
                      >
                        🔄 Majukan Antrean
                      </Button>
                    ) : (
                      <Button
                        onClick={handleDismissQueue}
                        size="sm"
                        className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold h-9"
                      >
                        ✅ Selesaikan Kunjungan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="mb-6 flex gap-1 rounded-xl bg-muted/60 p-1.5 backdrop-blur-sm overflow-x-auto">
          {([
            { key: "klaim" as Tab, label: "Klaim", icon: FileText },
            { key: "manfaat" as Tab, label: "Manfaat", icon: Heart },
            { key: "faskes" as Tab, label: "Faskes", icon: MapPin },
            { key: "ai" as Tab, label: "Insight Klaim", icon: ClipboardCheck },
            { key: "profil" as Tab, label: "Profil", icon: UserIcon },
            { key: "riwayat" as Tab, label: "Riwayat", icon: Clock },
          ]).map((tab) => (
            <button
              key={tab.key}
              aria-label={`Buka tab ${tab.label}`}
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

        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <Card key={item} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>

                <div className="mt-6 flex items-center gap-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex flex-col items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && errorMessage && (
          <EmptyState
            title="Dashboard belum dapat dimuat"
            description={errorMessage}
            icon={<AlertTriangle className="h-7 w-7 text-destructive" aria-hidden="true" />}
          />
        )}

        {!isLoading && !errorMessage && activeTab === "klaim" && (
          <div className="space-y-4">
            {activeClaims.length === 0 ? (
              <EmptyState
                title="Tidak Ada Klaim Aktif"
                description="Semua klaim Anda sudah selesai diproses."
                icon={<Inbox className="h-7 w-7" aria-hidden="true" />}
              />
            ) : (
              activeClaims.map((claim, index) => (
                <Card
                  key={claim.id}
                  className="animate-slide-up overflow-hidden border-border/70 transition-colors duration-200 hover:border-primary/30"
                  style={{ animationDelay: `${index * 0.08}s`, boxShadow: "var(--shadow-card)" }}
                >
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-foreground">{claim.title}</h3>
                          <Badge className={`${statusColor(claim.status)} text-xs font-semibold border`}>
                            {statusLabel(claim.status)}
                          </Badge>
                          {claim.riskScore !== null && (
                            <RiskScoreBadge
                              score={claim.riskScore}
                              level={claim.riskLevel}
                              confidence={claim.aiConfidence}
                              size="sm"
                              showConfidence={false}
                            />
                          )}
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

                    <div className="mt-6 flex items-center">
                      {claim.steps.map((step, stepIndex) => (
                        <div key={step} className="flex flex-1 items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                                stepIndex <= claim.currentStep
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {stepIndex <= claim.currentStep ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                            </div>
                            <span
                              className={`mt-1.5 text-xs font-medium ${
                                stepIndex <= claim.currentStep ? "text-primary" : "text-muted-foreground"
                              }`}
                            >
                              {step}
                            </span>
                          </div>

                          {stepIndex < claim.steps.length - 1 && (
                            <div
                              className={`mx-1 h-0.5 flex-1 rounded-full transition-colors ${
                                stepIndex < claim.currentStep ? "gradient-primary" : "bg-muted"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {claim.riskScore !== null && claim.riskLevel !== "rendah" && !dismissedAlerts.has(claim.id) && (
                      <div className="mt-5 rounded-xl border border-warning/25 bg-warning/5 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-foreground">Estimasi Risiko Klaim</span>
                              <RiskScoreBadge
                                score={claim.riskScore}
                                level={claim.riskLevel}
                                confidence={claim.aiConfidence}
                                size="sm"
                              />
                            </div>

                            {claim.risk && (
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{claim.risk}</p>
                            )}

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              <RiskFactorList title="Faktor penyebab" items={claim.riskFactors.slice(0, 2)} variant="factor" compact />
                              <RiskFactorList title="Rekomendasi" items={claim.recommendedActions.slice(0, 2)} variant="action" compact />
                            </div>

                            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                              Skor ini bersifat simulatif untuk membantu prioritas perbaikan. Keputusan akhir tetap melalui verifikasi resmi.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => openImprovementModal(claim)}
                                className="h-8 rounded-lg gradient-primary text-xs text-primary-foreground"
                              >
                                <Wrench className="h-3.5 w-3.5" /> Lihat Langkah Perbaikan
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => dismissClaimAlert(claim.id)}
                                className="h-8 rounded-lg text-xs"
                              >
                                <X className="h-3.5 w-3.5" /> Abaikan
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => goToClaimDetail(claim.id)}
                        className="rounded-lg hover:bg-primary/15 hover:text-primary"
                      >
                        Detail <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {!isLoading && !errorMessage && activeTab === "manfaat" && (
          <div className="space-y-6">
            {/* PRB Chronic Refill Manager Card */}
            <Card className="border-emerald-500/20 bg-emerald-500/5 p-5 md:p-6 overflow-hidden animate-slide-up" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center border-b border-emerald-500/10 pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Program Rujuk Balik (PRB) JKN</h3>
                    <p className="text-xs text-muted-foreground">Layanan obat bulanan penderita penyakit kronis di faskes primer</p>
                  </div>
                </div>
                <Badge className="bg-emerald-600/10 text-emerald-600 border border-emerald-600/25 px-2.5 py-0.5 text-xs font-bold uppercase">
                  Peserta PRB Aktif
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mt-5">
                {/* PRB Enrollment Details */}
                <div className="space-y-4">
                  <div className="bg-card p-4 rounded-xl border border-border/80 space-y-3">
                    <div className="flex justify-between border-b border-dashed border-border pb-2 text-xs">
                      <span className="text-muted-foreground">Diagnosa Terdaftar</span>
                      <span className="font-extrabold text-foreground">I10 - Hipertensi Esensial</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Resep Obat PRB Bulan Ini</span>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-foreground">Amlodipine 10 mg</span>
                          <span className="text-xs text-muted-foreground font-mono">30 Tablet · 1x1 Hari</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-foreground">Candesartan 8 mg</span>
                          <span className="text-xs text-muted-foreground font-mono">30 Tablet · 1x1 Hari</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground border-t border-dashed border-border pt-2 leading-relaxed">
                      * Obat PRB disediakan tiap 30 hari di Apotek PRB rujukan. Pengambilan dapat diantarkan langsung ke rumah pasien melalui JKN Logistik.
                    </div>
                  </div>
                </div>

                {/* Refill Request & Delivery Timeline */}
                <div className="flex flex-col justify-center">
                  {prbStep === 0 ? (
                    <div className="text-center p-6 bg-card border border-border/80 rounded-xl space-y-4">
                      <p className="text-sm font-semibold text-muted-foreground">Jadwal tebus obat bulanan Anda telah tersedia</p>
                      <Button
                        onClick={handlePRBRefill}
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-0 py-2.5 h-11 text-xs"
                      >
                        💊 Tebus Obat PRB Bulan Ini (Kirim ke Rumah)
                      </Button>
                      <p className="text-[10px] text-muted-foreground">Pengiriman gratis ditanggung sepenuhnya oleh BPJS Kesehatan</p>
                    </div>
                  ) : (
                    <div className="bg-card border border-border/80 p-5 rounded-xl space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-border pb-2.5">
                        <span className="text-xs font-bold text-foreground">Pelacakan Pengiriman Obat</span>
                        <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                          Resi: JKN-77890
                        </Badge>
                      </div>

                      {/* Timeline */}
                      <div className="relative pl-6 space-y-4 py-2 text-xs">
                        <div className="absolute left-1.5 top-2.5 bottom-2.5 w-0.5 bg-border" />

                        {/* Step 1 */}
                        <div className="relative">
                          <div className={`absolute -left-[22px] top-0.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${prbStep >= 1 ? "bg-emerald-600 border-emerald-600 text-white" : "bg-card border-border"}`}>
                            {prbStep >= 1 && <span className="block h-1 w-1 bg-white rounded-full" />}
                          </div>
                          <p className={`font-bold ${prbStep >= 1 ? "text-foreground" : "text-muted-foreground"}`}>Resep Diverifikasi</p>
                          <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">Disetujui oleh Apoteker Apotek Demo Farma</p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative">
                          <div className={`absolute -left-[22px] top-0.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${prbStep >= 2 ? "bg-emerald-600 border-emerald-600 text-white" : "bg-card border-border"}`}>
                            {prbStep >= 2 && <span className="block h-1 w-1 bg-white rounded-full" />}
                          </div>
                          <p className={`font-bold ${prbStep >= 2 ? "text-foreground" : "text-muted-foreground"}`}>Pengemasan Obat</p>
                          <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">Obat disiapkan & dikemas higienis</p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative">
                          <div className={`absolute -left-[22px] top-0.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${prbStep >= 3 ? "bg-emerald-600 border-emerald-600 text-white" : "bg-card border-border"}`}>
                            {prbStep >= 3 && <span className="block h-1 w-1 bg-white rounded-full" />}
                          </div>
                          <p className={`font-bold ${prbStep >= 3 ? "text-foreground" : "text-muted-foreground"}`}>Dalam Perjalanan</p>
                          <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">Kurir JKN Logistik sedang menuju alamat Anda</p>
                        </div>

                        {/* Step 4 */}
                        <div className="relative">
                          <div className={`absolute -left-[22px] top-0.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${prbStep >= 4 ? "bg-emerald-600 border-emerald-600 text-white" : "bg-card border-border"}`}>
                            {prbStep >= 4 && <span className="block h-1 w-1 bg-white rounded-full" />}
                          </div>
                          <p className={`font-bold ${prbStep >= 4 ? "text-foreground" : "text-muted-foreground"}`}>Obat Tiba & Diterima</p>
                          <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">Tiba di rumah pasien. Silakan konfirmasi terima.</p>
                        </div>
                      </div>

                      {/* Simulation Button */}
                      <Button
                        onClick={handlePRBAdvance}
                        className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold border-0 mt-2 h-9 text-xs"
                      >
                        {prbStep === 4 ? "✅ Konfirmasi Terima Obat" : "🚚 Perbarui Status Pengiriman (Simulasi)"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <Card
                  key={benefit.title}
                  className="animate-slide-up group flex items-start gap-4 border-border/60 p-5 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 hover:border-primary/20"
                  style={{ animationDelay: `${index * 0.08}s`, boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <benefit.icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground">{benefit.title}</h4>
                      <Badge className="bg-success/15 text-success border border-success/25 text-xs font-semibold">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Ditanggung
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{benefit.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !errorMessage && activeTab === "faskes" && (
          <NearbyFacilities onQueueBooked={() => {
            try {
              const raw = sessionStorage.getItem("bpjsight.active.queue");
              if (raw) {
                setActiveQueue(JSON.parse(raw));
              }
            } catch (e) {}
          }} />
        )}

        {!isLoading && !errorMessage && activeTab === "ai" && <ClaimReviewRecommendations role="patient" />}

        {!isLoading && !errorMessage && activeTab === "profil" && (
          <PatientProfile onBack={() => setActiveTab("klaim")} />
        )}

        {!isLoading && !errorMessage && activeTab === "riwayat" && (
          <div className="space-y-6">
            {/* Personal Health Record (PHR) Widget */}
            <Card className="p-5 md:p-6 mb-6 overflow-hidden animate-slide-up" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Personal Health Record (PHR) JKN</h3>
                    <p className="text-xs text-muted-foreground">Tren vital medis hasil integrasi SATUSEHAT Faskes</p>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success border border-success/20 py-0.5 px-2 text-[10px] font-semibold">
                  SINKRON: 1 Jam Lalu
                </Badge>
              </div>

              <div className="grid gap-6 lg:grid-cols-3 mt-5">
                {/* Blood Pressure Chart */}
                <div className="space-y-3 bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">Tekanan Darah (Sistolik / Diastolik)</span>
                    <span className="text-[11px] font-extrabold text-primary font-mono bg-white px-2 py-0.5 rounded-lg border border-border">
                      118/78 mmHg · Terkontrol
                    </span>
                  </div>

                  <div className="h-44 w-full bg-white rounded-xl border border-border/60 p-2 flex items-center justify-center relative overflow-hidden">
                    <svg viewBox="0 0 450 140" className="w-full h-full overflow-visible">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="430" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="50" x2="430" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="80" x2="430" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="110" x2="430" y2="110" stroke="#f1f5f9" strokeWidth="1" />

                      {/* Target shaded normal area */}
                      <rect x="40" y="50" width="390" height="60" fill="#00A14B" fillOpacity="0.04" />

                      {/* X Axis Labels */}
                      <text x="40" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Feb</text>
                      <text x="170" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Mar</text>
                      <text x="300" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Apr</text>
                      <text x="430" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Mei</text>

                      {/* Y Axis Labels */}
                      <text x="30" y="23" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">140</text>
                      <text x="30" y="53" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">120</text>
                      <text x="30" y="83" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">90</text>
                      <text x="30" y="113" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">60</text>

                      {/* Systolic Line */}
                      <path d="M 40 26 L 170 34 L 300 40 L 430 45" fill="none" stroke="#1D4580" strokeWidth="2.5" strokeLinecap="round" />
                      
                      {/* Diastolic Line */}
                      <path d="M 40 76 L 170 83 L 300 88 L 430 90" fill="none" stroke="#00A14B" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Node Circles & Value Labels - Systolic */}
                      <circle cx="40" cy="26" r="3.5" fill="#1D4580" stroke="#fff" strokeWidth="1.5" />
                      <text x="40" y="18" fill="#1D4580" fontSize="8" fontWeight="extrabold" textAnchor="middle">135</text>

                      <circle cx="170" cy="34" r="3.5" fill="#1D4580" stroke="#fff" strokeWidth="1.5" />
                      <text x="170" y="26" fill="#1D4580" fontSize="8" fontWeight="extrabold" textAnchor="middle">128</text>

                      <circle cx="300" cy="40" r="3.5" fill="#1D4580" stroke="#fff" strokeWidth="1.5" />
                      <text x="300" y="32" fill="#1D4580" fontSize="8" fontWeight="extrabold" textAnchor="middle">122</text>

                      <circle cx="430" cy="45" r="3.5" fill="#1D4580" stroke="#fff" strokeWidth="1.5" />
                      <text x="430" y="37" fill="#1D4580" fontSize="8" fontWeight="extrabold" textAnchor="middle">118</text>

                      {/* Node Circles & Value Labels - Diastolic */}
                      <circle cx="40" cy="76" r="3.5" fill="#00A14B" stroke="#fff" strokeWidth="1.5" />
                      <text x="40" y="70" fill="#00A14B" fontSize="8" fontWeight="extrabold" textAnchor="middle">90</text>

                      <circle cx="170" cy="83" r="3.5" fill="#00A14B" stroke="#fff" strokeWidth="1.5" />
                      <text x="170" y="77" fill="#00A14B" fontSize="8" fontWeight="extrabold" textAnchor="middle">84</text>

                      <circle cx="300" cy="88" r="3.5" fill="#00A14B" stroke="#fff" strokeWidth="1.5" />
                      <text x="300" y="82" fill="#00A14B" fontSize="8" fontWeight="extrabold" textAnchor="middle">80</text>

                      <circle cx="430" cy="78" r="3.5" fill="#00A14B" stroke="#fff" strokeWidth="1.5" />
                      <text x="430" y="72" fill="#00A14B" fontSize="8" fontWeight="extrabold" textAnchor="middle">78</text>
                    </svg>
                  </div>
                </div>

                {/* GDP Chart */}
                <div className="space-y-3 bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">Gula Darah Puasa (GDP)</span>
                    <span className="text-[11px] font-extrabold text-emerald-600 font-mono bg-white px-2 py-0.5 rounded-lg border border-border">
                      108 mg/dL · Terkontrol
                    </span>
                  </div>

                  <div className="h-44 w-full bg-white rounded-xl border border-border/60 p-2 flex items-center justify-center relative overflow-hidden">
                    <svg viewBox="0 0 450 140" className="w-full h-full overflow-visible">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="430" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="50" x2="430" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="80" x2="430" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="110" x2="430" y2="110" stroke="#f1f5f9" strokeWidth="1" />

                      {/* Normal GDP area (< 110) */}
                      <rect x="40" y="80" width="390" height="30" fill="#00A14B" fillOpacity="0.04" />

                      {/* X Axis Labels */}
                      <text x="40" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Feb</text>
                      <text x="170" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Mar</text>
                      <text x="300" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Apr</text>
                      <text x="430" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Mei</text>

                      {/* Y Axis Labels */}
                      <text x="30" y="23" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">160</text>
                      <text x="30" y="53" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">140</text>
                      <text x="30" y="83" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">110</text>
                      <text x="30" y="113" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">80</text>

                      {/* GDP Line */}
                      <path d="M 40 37 L 170 52 L 300 71 L 430 79" fill="none" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Node Circles & Value Labels */}
                      <circle cx="40" cy="37" r="3.5" fill="#EAB308" stroke="#fff" strokeWidth="1.5" />
                      <text x="40" y="29" fill="#EAB308" fontSize="8" fontWeight="extrabold" textAnchor="middle">145</text>

                      <circle cx="170" cy="52" r="3.5" fill="#EAB308" stroke="#fff" strokeWidth="1.5" />
                      <text x="170" y="44" fill="#EAB308" fontSize="8" fontWeight="extrabold" textAnchor="middle">132</text>

                      <circle cx="300" cy="71" r="3.5" fill="#EAB308" stroke="#fff" strokeWidth="1.5" />
                      <text x="300" y="63" fill="#EAB308" fontSize="8" fontWeight="extrabold" textAnchor="middle">115</text>

                      <circle cx="430" cy="79" r="3.5" fill="#EAB308" stroke="#fff" strokeWidth="1.5" />
                      <text x="430" y="71" fill="#EAB308" fontSize="8" fontWeight="extrabold" textAnchor="middle">108</text>
                    </svg>
                  </div>
                </div>

                {/* BMI & Weight Chart */}
                <div className="space-y-3 bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">Indeks Massa Tubuh (IMT) & Berat</span>
                    <span className="text-[11px] font-extrabold text-emerald-600 font-mono bg-white px-2 py-0.5 rounded-lg border border-border">
                      22.5 kg/m² (72 kg) · Ideal
                    </span>
                  </div>

                  <div className="h-44 w-full bg-white rounded-xl border border-border/60 p-2 flex items-center justify-center relative overflow-hidden">
                    <svg viewBox="0 0 450 140" className="w-full h-full overflow-visible">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="430" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="50" x2="430" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="80" x2="430" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="110" x2="430" y2="110" stroke="#f1f5f9" strokeWidth="1" />

                      {/* Normal BMI range (18.5 - 25.0) shaded area */}
                      <rect x="40" y="40" width="390" height="60" fill="#00A14B" fillOpacity="0.04" />

                      {/* X Axis Labels */}
                      <text x="40" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Feb</text>
                      <text x="170" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Mar</text>
                      <text x="300" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Apr</text>
                      <text x="430" y="130" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Mei</text>

                      {/* Y Axis Labels */}
                      <text x="30" y="23" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">28</text>
                      <text x="30" y="53" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">24</text>
                      <text x="30" y="83" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">20</text>
                      <text x="30" y="113" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">16</text>

                      {/* BMI Trend Line */}
                      <path d="M 40 52 L 170 58 L 300 64 L 430 68" fill="none" stroke="#00A14B" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Node Circles & Value Labels */}
                      <circle cx="40" cy="52" r="3.5" fill="#00A14B" stroke="#fff" strokeWidth="1.5" />
                      <text x="40" y="44" fill="#00A14B" fontSize="8" fontWeight="extrabold" textAnchor="middle">24.1 (77kg)</text>

                      <circle cx="170" cy="58" r="3.5" fill="#00A14B" stroke="#fff" strokeWidth="1.5" />
                      <text x="170" y="50" fill="#00A14B" fontSize="8" fontWeight="extrabold" textAnchor="middle">23.4 (75kg)</text>

                      <circle cx="300" cy="64" r="3.5" fill="#00A14B" stroke="#fff" strokeWidth="1.5" />
                      <text x="300" y="56" fill="#00A14B" fontSize="8" fontWeight="extrabold" textAnchor="middle">22.8 (73kg)</text>

                      <circle cx="430" cy="68" r="3.5" fill="#00A14B" stroke="#fff" strokeWidth="1.5" />
                      <text x="430" y="60" fill="#00A14B" fontSize="8" fontWeight="extrabold" textAnchor="middle">22.5 (72kg)</text>
                    </svg>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              {finishedClaims.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                    <Inbox className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 font-bold text-foreground">Belum Ada Riwayat</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Klaim yang sudah selesai akan muncul di sini.</p>
                </Card>
              ) : (
                finishedClaims.map((claim, index) => (
                  <Card
                    key={claim.id}
                    onClick={() => goToClaimDetail(claim.id)}
                    className="animate-slide-up group flex items-center justify-between border-border/60 p-4 md:p-5 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20 cursor-pointer"
                    style={{ animationDelay: `${index * 0.08}s`, boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/15">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>

                      <div>
                        <p className="font-semibold text-foreground">{claim.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {claim.hospital} • {claim.date}
                        </p>
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
          </div>
        )}
      </main>

      <Dialog open={selectedActionClaim !== null} onOpenChange={(open) => !open && setSelectedActionClaim(null)}>
        <DialogContent className="max-h-[86vh] overflow-y-auto border-border/60 bg-card sm:max-w-2xl">
          {selectedActionClaim && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <Wrench className="h-5 w-5 text-primary" /> Langkah Perbaikan Klaim
                </DialogTitle>
                <DialogDescription>
                  Rekomendasi simulasi untuk {selectedActionClaim.id}. Skor risiko hanya alat bantu review, verifikasi akhir tetap mengikuti proses resmi.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">{selectedActionClaim.title}</p>
                      <p className="text-xs text-muted-foreground">{selectedActionClaim.hospital} • {selectedActionClaim.date}</p>
                    </div>
                    {selectedActionClaim.riskScore !== null && (
                      <RiskScoreBadge
                        score={selectedActionClaim.riskScore}
                        level={selectedActionClaim.riskLevel}
                        confidence={selectedActionClaim.aiConfidence}
                        size="sm"
                      />
                    )}
                  </div>
                </div>

                <RiskFactorList
                  title="Faktor penyebab yang perlu dicek"
                  items={selectedActionClaim.riskFactors.length > 0 ? selectedActionClaim.riskFactors : ["Tidak ada faktor risiko utama yang terdeteksi saat ini."]}
                  variant="factor"
                />

                <RiskFactorList
                  title="Rekomendasi langkah perbaikan"
                  items={selectedActionClaim.recommendedActions}
                  variant="action"
                />

                <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                  <p className="text-sm font-bold text-foreground">Dokumen yang perlu dipantau</p>
                  <div className="mt-3 space-y-2">
                    {selectedActionClaim.documents.map((document) => (
                      <div key={document.key} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/10 px-3 py-2">
                        <span className="text-sm text-foreground">{document.label}</span>
                        <Badge className={
                          document.status === "verified"
                            ? "border-success/25 bg-success/15 text-success"
                            : document.status === "review"
                              ? "border-warning/25 bg-warning/15 text-warning"
                              : "border-destructive/25 bg-destructive/15 text-destructive"
                        }>
                          {document.status === "verified" ? "Terverifikasi" : document.status === "review" ? "Perlu review" : "Belum lengkap"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedActionClaim(null)} className="rounded-xl">
                    Tutup
                  </Button>
                  <Button onClick={() => goToClaimDetail(selectedActionClaim.id)} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    Buka Detail Klaim
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default PatientDashboard;


