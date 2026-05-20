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
  const patientName = currentUser?.displayName ?? currentUser?.name ?? "Pasien BPJS";
  const patientInitial = patientName.trim().charAt(0).toUpperCase() || "P";
  const bpjsDisplay = currentUser?.bpjsMasked ?? "•••• •••• •7890";

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
        )}

        {!isLoading && !errorMessage && activeTab === "faskes" && <NearbyFacilities />}

        {!isLoading && !errorMessage && activeTab === "ai" && <ClaimReviewRecommendations role="patient" />}

        {!isLoading && !errorMessage && activeTab === "profil" && (
          <PatientProfile onBack={() => setActiveTab("klaim")} />
        )}

        {!isLoading && !errorMessage && activeTab === "riwayat" && (
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


