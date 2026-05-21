import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
  AlertTriangle,
  CheckCircle2,
  Users,
  Eye,
  ClipboardList,
  Plus,
  SearchX,
  ChevronLeft,
  ChevronRight,
  Activity,
  FileText,
  ClipboardCheck,
  Wrench,
  X,
} from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "./LogoutButton";
import ClaimReviewRecommendations from "./AIRecommendations";
import HospitalProfile from "./HospitalProfile";
import ClaimFilters, { type HospitalClaimFiltersState } from "@/components/hospital/ClaimFilters";
import { applyHospitalClaimFilters } from "@/lib/hospital-claim-filters";
import HospitalClaimCard from "@/components/hospital/HospitalClaimCard";
import { formatIDRShort } from "@/lib/formatters";
import { claimsService } from "@/services/claimsService";
import { useAuth } from "@/features/auth/AuthProvider";
import RiskFactorList from "@/components/ai/RiskFactorList";
import RiskScoreBadge from "@/components/ai/RiskScoreBadge";
import type { DashboardStat } from "@/types/dashboard";
import type { HospitalClaim } from "@/types/claim";
import { AppLayout } from "./AppLayout";

interface HospitalDashboardProps {
  onBack: () => void;
  onSubmitClaim?: () => void;
}

type PageSize = 5 | 10 | "all";

const DEFAULT_FILTERS: HospitalClaimFiltersState = {
  query: "",
  riskStatus: "all",
  documentStatus: "all",
  riskMin: 0,
  riskMax: 100,
  sort: "patient_asc",
};


function getDocumentTone(docs: HospitalClaim["docs"]): string {
  if (docs === "Lengkap") return "bg-success/15 text-success border-success/25";
  if (docs === "Sebagian") return "bg-warning/15 text-warning border-warning/25";
  return "bg-destructive/15 text-destructive border-destructive/25";
}


const HospitalDashboard = ({ onBack, onSubmitClaim }: HospitalDashboardProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<"home" | "ai" | "profil" | "rujukan">("home");
  const [claims, setClaims] = useState<HospitalClaim[]>([]);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<HospitalClaimFiltersState>(DEFAULT_FILTERS);
  const [pageSize, setPageSize] = useState<PageSize>(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecommendationClaim, setSelectedRecommendationClaim] = useState<HospitalClaim | null>(null);
  const [selectedChecklistClaim, setSelectedChecklistClaim] = useState<HospitalClaim | null>(null);
  const [dismissedPriorityClaims, setDismissedPriorityClaims] = useState<Set<string>>(() => new Set());
  const { currentUser } = useAuth();
  const hospitalName = currentUser?.displayName ?? currentUser?.name ?? "Rumah Sakit";

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);

      try {
        setErrorMessage(null);
        const [hospitalClaims, dashboardStats] = await Promise.all([
          claimsService.getHospitalClaims(),
          claimsService.getDashboardStats(),
        ]);

        if (!isMounted) return;

        setClaims(hospitalClaims);
        setStats(dashboardStats);
      } catch {
        if (isMounted) {
          setClaims([]);
          setStats([]);
          setErrorMessage("Data dashboard rumah sakit belum dapat dimuat.");
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

  const filteredClaims = useMemo(() => applyHospitalClaimFilters(claims, filters), [claims, filters]);

  const totalPages = useMemo(() => {
    if (pageSize === "all") return 1;
    return Math.max(1, Math.ceil(filteredClaims.length / pageSize));
  }, [filteredClaims.length, pageSize]);

  const visibleClaims = useMemo(() => {
    if (pageSize === "all") return filteredClaims;
    const start = (currentPage - 1) * pageSize;
    return filteredClaims.slice(start, start + pageSize);
  }, [currentPage, filteredClaims, pageSize]);

  const priorityClaim = useMemo(() => {
    return [...claims].sort((a, b) => b.risk - a.risk)[0];
  }, [claims]);

  const visiblePriorityClaim = priorityClaim && !dismissedPriorityClaims.has(priorityClaim.id) ? priorityClaim : null;

  const filteredSummary = useMemo(() => {
    return {
      total: filteredClaims.length,
      highRisk: filteredClaims.filter((claim) => claim.status === "berisiko").length,
      mediumRisk: filteredClaims.filter((claim) => claim.status === "sedang").length,
      incompleteDocs: filteredClaims.filter((claim) => claim.docs !== "Lengkap").length,
      totalAmount: filteredClaims.reduce((sum, claim) => sum + claim.amountIDR, 0),
    };
  }, [filteredClaims]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const updateFilters = (patch: Partial<HospitalClaimFiltersState>) => {
    setFilters((previous) => ({ ...previous, ...patch }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPageSize(5);
    setCurrentPage(1);
  };

  const showAllClaims = () => {
    setFilters(DEFAULT_FILTERS);
    setPageSize("all");
    setCurrentPage(1);
  };

  const goToClaimDetail = (claimId: string) => {
    toast.info("Membuka detail klaim...", { description: `Klaim #${claimId}` });
    navigate(`/rumah-sakit/klaim/${claimId}`);
  };

  const openRecommendations = (claim: HospitalClaim) => {
    setSelectedRecommendationClaim(claim);
    toast.info("Langkah perbaikan dibuka.", { description: `Klaim #${claim.id}` });
  };

  const openChecklist = (claim: HospitalClaim) => {
    setSelectedChecklistClaim(claim);
    toast.info("Daftar periksa dokumen dibuka.", { description: `Klaim #${claim.id}` });
  };

  const dismissPriorityAlert = (claimId: string) => {
    setDismissedPriorityClaims((current) => new Set(current).add(claimId));
    toast.success("Alert prioritas disembunyikan untuk sesi ini.");
  };

  return (
    <AppLayout className="operational-dashboard hospital-portal">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-card/95 backdrop-blur-md px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali ke halaman utama" onClick={onBack} className="rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground tracking-tight">BPJSight</span>
          </div>

          <Badge variant="outline" className="ml-1 text-primary border-primary/30 font-semibold text-xs">
            Portal RS
          </Badge>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setView("home")}
              className={`hidden md:inline text-xs font-semibold px-2.5 py-1 rounded-lg ${
                view === "home" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Klaim
            </button>

            <button
              onClick={() => setView("ai")}
              className={`hidden md:inline text-xs font-semibold px-2.5 py-1 rounded-lg ${
                view === "ai" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Insight Klaim
            </button>

            <button
              onClick={() => setView("rujukan")}
              className={`hidden md:inline text-xs font-semibold px-2.5 py-1 rounded-lg ${
                view === "rujukan" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              E-Rujukan
            </button>

            <button
              onClick={() => setView("profil")}
              className={`hidden md:inline text-xs font-semibold px-2.5 py-1 rounded-lg ${
                view === "profil" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Profil
            </button>

            <ThemeToggle compact />
            <NotificationCenter role="hospital" />
            <LogoutButton compact onLoggedOut={onBack} />

            <button aria-label="Buka profil rumah sakit" onClick={() => setView("profil")} className="flex items-center gap-2 rounded-xl hover:bg-muted/40 px-1.5 py-1">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                <Users className="h-4 w-4" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-foreground leading-none">{hospitalName}</p>
                <p className="text-xs text-muted-foreground">Portal Admin</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {view === "ai" && <ClaimReviewRecommendations role="hospital" />}
        {view === "profil" && <HospitalProfile onBack={() => setView("home")} />}
        {view === "rujukan" && <HospitalReferralView onBackToHome={() => setView("home")} />}

        {view === "home" && (
          <>
            <div className="animate-fade-in-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-1 text-2xl font-extrabold tracking-tight md:text-3xl">Dashboard Operasional Klaim</h1>
                <p className="text-muted-foreground">Dashboard operasional untuk memantau risiko klaim, kelengkapan dokumen, dan prioritas review administrasi rumah sakit.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={showAllClaims} className="rounded-xl border-primary/30 text-primary hover:bg-primary/15">
                  Lihat Semua
                </Button>
                {onSubmitClaim && (
                  <Button
                    onClick={onSubmitClaim}
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 border-0 px-6 py-3 text-base font-bold"
                  >
                    <Plus className="h-5 w-5" /> Ajukan Klaim Baru
                  </Button>
                )}
              </div>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {isLoading
                ? [1, 2, 3, 4].map((item) => (
                    <Card key={item} className="border-border/60 p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-9 w-9 rounded-xl" />
                      </div>
                      <Skeleton className="mt-4 h-8 w-20" />
                      <Skeleton className="mt-2 h-3 w-24" />
                    </Card>
                  ))
                : stats.map((stat, index) => (
                    <Card
                      key={stat.label}
                      className="animate-slide-up group relative overflow-hidden border-border/60 p-5 transition-colors hover:border-primary/30"
                      style={{ animationDelay: `${index * 0.08}s`, boxShadow: "var(--shadow-card)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                          <stat.icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">{stat.value}</p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.change}</p>
                    </Card>
                  ))}
            </div>

            {/* Smart Claim Dispute Analytics Widget */}
            <Card className="mb-6 border-emerald-500/20 bg-emerald-500/5 p-5 md:p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-500/10 pb-4 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">Analisis Penolakan & Dispute Klaim JKN</h2>
                    <p className="text-xs text-muted-foreground">Analitik real-time penyebab dispute klaim berdasarkan audit verifikator BPJS</p>
                  </div>
                </div>
                <Badge className="bg-emerald-600/10 text-emerald-600 border border-emerald-600/25 px-2 py-0.5 text-xs font-bold">
                  85% RESOLUSI KLAIM CAIR
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-3 mt-5">
                {/* Reason 1 */}
                <div className="space-y-2 bg-card p-4 rounded-xl border border-border/80 shadow-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Berkas Casemix Tidak Lengkap</span>
                    <span className="font-extrabold text-destructive">45% (Tinggi)</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-destructive h-full rounded-full" style={{ width: "45%" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Terutama didominasi oleh tidak adanya Scan Resume Medis DPJP dan laporan tindakan operasi.
                  </p>
                </div>

                {/* Reason 2 */}
                <div className="space-y-2 bg-card p-4 rounded-xl border border-border/80 shadow-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Koding ICD Mismatch (Upcoding)</span>
                    <span className="font-extrabold text-warning">30% (Sedang)</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-warning h-full rounded-full" style={{ width: "30%" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Diagnosa sekunder tidak didukung oleh pemeriksaan penunjang (laboratorium atau radiologi).
                  </p>
                </div>

                {/* Reason 3 */}
                <div className="space-y-2 bg-card p-4 rounded-xl border border-border/80 shadow-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Kriteria Medis Tidak Sesuai</span>
                    <span className="font-extrabold text-info">15% (Rendah)</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-info h-full rounded-full" style={{ width: "15%" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Lama rawat inap melebihi LOS (Length of Stay) standar tanpa indikasi medis tertulis.
                  </p>
                </div>
              </div>

              {/* Billing Team Tips */}
              <div className="mt-4 p-3 bg-emerald-600/5 border border-emerald-500/10 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <span className="font-bold">Tips Tim Billing RS:</span> Lakukan pre-audit koding ICD-10 dengan Kalkulator INA-CBG terintegrasi di Step 2 Form smart submission untuk meminimalisir dispute klaim bulanan.
                </div>
              </div>
            </Card>

            {visiblePriorityClaim && (
              <Card className="mb-6 border-warning/25 bg-warning/5 p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-warning" />
                      <h2 className="font-bold text-foreground">Prioritas Review Administratif</h2>
                      <RiskScoreBadge
                        score={visiblePriorityClaim.risk}
                        level={visiblePriorityClaim.riskLevel}
                        confidence={visiblePriorityClaim.confidence}
                        size="sm"
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Klaim #{visiblePriorityClaim.id} untuk {visiblePriorityClaim.diagnosis} memiliki faktor yang perlu dicek sebelum submit final.
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <RiskFactorList title="Faktor penyebab" items={visiblePriorityClaim.riskFactors.slice(0, 2)} variant="factor" compact />
                      <RiskFactorList title="Rekomendasi" items={visiblePriorityClaim.recommendedActions.slice(0, 2)} variant="action" compact />
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Skor ini simulatif untuk membantu prioritas review. Verifikasi resmi tetap dilakukan oleh petugas berwenang.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button
                      variant="outline"
                      onClick={() => goToClaimDetail(visiblePriorityClaim.id)}
                      className="rounded-xl border-warning/30 text-warning hover:bg-warning/15"
                    >
                      <Eye className="h-4 w-4" /> Lihat Detail
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openRecommendations(visiblePriorityClaim)}
                      className="rounded-xl border-primary/30 text-primary hover:bg-primary/15"
                    >
                      <Wrench className="h-4 w-4" /> Lihat Langkah Perbaikan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openChecklist(visiblePriorityClaim)}
                      className="rounded-xl border-info/30 text-info hover:bg-info/15"
                    >
                      <ClipboardCheck className="h-4 w-4" /> Lihat Daftar Periksa
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => dismissPriorityAlert(visiblePriorityClaim.id)}
                      className="rounded-xl text-muted-foreground hover:bg-muted/60"
                    >
                      <X className="h-4 w-4" /> Abaikan
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Card className="animate-slide-up overflow-hidden border-border/60" style={{ animationDelay: "0.3s", boxShadow: "var(--shadow-card)" }}>
              <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                    <ClipboardList className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">Klaim Rumah Sakit — Skor Risiko Administratif</h2>
                    <p className="text-xs text-muted-foreground">Nomor pasien mengikuti urutan abjad. Nama pasien bersifat fiktif dan hanya digunakan untuk keperluan demo.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Badge className="justify-center border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
                    <Activity className="mr-1 h-3.5 w-3.5" /> {filteredSummary.total} Klaim
                  </Badge>
                  <Badge className="justify-center border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
                    <AlertTriangle className="mr-1 h-3.5 w-3.5" /> {filteredSummary.highRisk} Berisiko
                  </Badge>
                  <Badge className="justify-center border border-warning/25 bg-warning/10 px-3 py-2 text-xs font-bold text-warning">
                    <FileText className="mr-1 h-3.5 w-3.5" /> {filteredSummary.incompleteDocs} Dokumen Perlu Cek
                  </Badge>
                  <Badge className="justify-center border border-info/25 bg-info/10 px-3 py-2 text-xs font-bold text-info">
                    {formatIDRShort(filteredSummary.totalAmount)} Total
                  </Badge>
                </div>
              </div>

              <ClaimFilters
                filters={filters}
                totalClaims={claims.length}
                filteredClaims={filteredClaims.length}
                onChange={updateFilters}
                onReset={resetFilters}
                onShowAll={showAllClaims}
              />

              {isLoading ? (
                <div className="space-y-3 p-5 md:p-6">
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className="h-24 w-full rounded-2xl" />
                  ))}
                </div>
              ) : errorMessage ? (
                <div className="px-5 py-6 md:px-6">
                  <EmptyState
                    title="Dashboard belum dapat dimuat"
                    description={errorMessage}
                    icon={<AlertTriangle className="h-7 w-7 text-destructive" aria-hidden="true" />}
                  />
                </div>
              ) : filteredClaims.length === 0 ? (
                <div className="px-5 py-6 md:px-6">
                  <EmptyState
                    title="Tidak ada klaim yang cocok"
                    description="Coba ubah kata kunci, rentang skor risiko, status risiko, atau filter dokumen untuk melihat hasil lain."
                    icon={<SearchX className="h-7 w-7" aria-hidden="true" />}
                    action={<Button onClick={showAllClaims} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">Lihat Semua Klaim</Button>}
                  />
                </div>
              ) : (
                <>
                  <div className="block space-y-3 p-5 md:hidden">
                    {visibleClaims.map((claim) => (
                      <HospitalClaimCard key={claim.id} claim={claim} onDetail={goToClaimDetail} onChecklist={openChecklist} onRecommendations={openRecommendations} />
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                          <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-6">No Urut</th>
                          <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-6">Pasien</th>
                          <th className="hidden px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:table-cell md:px-6">Diagnosis</th>
                          <th className="hidden px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground lg:table-cell md:px-6">Nilai</th>
                          <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-6">Skor Risiko</th>
                          <th className="hidden px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:table-cell md:px-6">Dokumen</th>
                          <th className="hidden px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground xl:table-cell md:px-6">Tanggal</th>
                          <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-6">Aksi</th>
                        </tr>
                      </thead>

                      <tbody>
                        {visibleClaims.map((claim) => (
                          <tr key={claim.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="px-5 py-4 text-sm font-bold text-primary md:px-6">#{claim.id}</td>

                            <td className="px-5 py-4 md:px-6">
                              <p className="text-sm font-semibold text-foreground">{claim.patient}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{claim.diagnosis}</p>
                            </td>

                            <td className="hidden px-5 py-4 text-sm text-muted-foreground md:table-cell md:px-6">
                              {claim.diagnosis} <span className="text-[10px] text-muted-foreground/60">({claim.icd10})</span>
                            </td>

                            <td className="hidden px-5 py-4 text-sm font-semibold text-foreground lg:table-cell md:px-6">
                              {formatIDRShort(claim.amountIDR)}
                            </td>

                            <td className="px-5 py-4 md:px-6">
                              <RiskScoreBadge
                                score={claim.risk}
                                level={claim.riskLevel}
                                confidence={claim.confidence}
                                size="sm"
                                showConfidence={false}
                              />
                              <p className="mt-1 text-[10px] text-muted-foreground">Skor kelengkapan {claim.confidence}/100</p>
                            </td>

                            <td className="hidden px-5 py-4 md:table-cell md:px-6">
                              <Badge className={`border text-xs font-semibold ${getDocumentTone(claim.docs)}`}>
                                {claim.docs === "Lengkap" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
                                {claim.docs}
                              </Badge>
                            </td>

                            <td className="hidden px-5 py-4 text-sm text-muted-foreground xl:table-cell md:px-6">
                              {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(claim.submittedAt))}
                            </td>

                            <td className="px-5 py-4 md:px-6">
                              <div className="flex flex-wrap gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  aria-label={`Lihat detail klaim ${claim.id}`}
                                  onClick={() => goToClaimDetail(claim.id)}
                                  className="rounded-lg hover:bg-primary/15 hover:text-primary"
                                >
                                  <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Detail</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  aria-label={`Lihat langkah perbaikan klaim ${claim.id}`}
                                  onClick={() => openRecommendations(claim)}
                                  className="rounded-lg hover:bg-warning/15 hover:text-warning"
                                >
                                  <Wrench className="h-4 w-4" /> <span className="hidden xl:inline">Perbaikan</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  aria-label={`Lihat daftar periksa klaim ${claim.id}`}
                                  onClick={() => openChecklist(claim)}
                                  className="rounded-lg hover:bg-info/15 hover:text-info"
                                >
                                  <ClipboardCheck className="h-4 w-4" /> <span className="hidden xl:inline">Checklist</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border/60 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                    <p className="text-sm text-muted-foreground">
                      {pageSize === "all" ? (
                        <>Menampilkan semua <span className="font-bold text-foreground">{filteredClaims.length}</span> klaim hasil filter.</>
                      ) : (
                        <>
                          Menampilkan <span className="font-bold text-foreground">{visibleClaims.length}</span> dari {filteredClaims.length} klaim hasil filter.
                        </>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label="Jumlah klaim per halaman"
                        value={String(pageSize)}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPageSize(value === "all" ? "all" : Number(value) === 10 ? 10 : 5);
                        }}
                        className="h-9 rounded-xl border border-border/60 bg-muted/20 px-3 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="5">5 per halaman</option>
                        <option value="10">10 per halaman</option>
                        <option value="all">Semua</option>
                      </select>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1 || pageSize === "all"}
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        className="rounded-xl border-border/60"
                      >
                        <ChevronLeft className="h-4 w-4" /> Sebelumnya
                      </Button>

                      <span className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs font-bold text-foreground">
                        {currentPage}/{totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages || pageSize === "all"}
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        className="rounded-xl border-border/60"
                      >
                        Berikutnya <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </>
        )}
      </main>

      <Dialog open={selectedRecommendationClaim !== null} onOpenChange={(open) => !open && setSelectedRecommendationClaim(null)}>
        <DialogContent className="max-h-[86vh] overflow-y-auto border-border/60 bg-card sm:max-w-2xl">
          {selectedRecommendationClaim && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <Wrench className="h-5 w-5 text-primary" /> Langkah Perbaikan Klaim
                </DialogTitle>
                <DialogDescription>
                  Rekomendasi simulasi untuk klaim #{selectedRecommendationClaim.id}. Skor risiko hanya alat bantu prioritas review, bukan keputusan otomatis.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">{selectedRecommendationClaim.patient}</p>
                      <p className="text-xs text-muted-foreground">{selectedRecommendationClaim.diagnosis} ({selectedRecommendationClaim.icd10})</p>
                    </div>
                    <RiskScoreBadge
                      score={selectedRecommendationClaim.risk}
                      level={selectedRecommendationClaim.riskLevel}
                      confidence={selectedRecommendationClaim.confidence}
                      size="sm"
                    />
                  </div>
                </div>

                <RiskFactorList
                  title="Faktor penyebab"
                  items={selectedRecommendationClaim.riskFactors.length > 0 ? selectedRecommendationClaim.riskFactors : ["Tidak ada faktor risiko utama yang terdeteksi saat ini."]}
                  variant="factor"
                />

                <RiskFactorList
                  title="Rekomendasi tindakan"
                  items={selectedRecommendationClaim.recommendedActions}
                  variant="action"
                />

                <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                  <p className="text-sm font-bold text-foreground">Catatan verifikator</p>
                  <ul className="mt-3 space-y-2">
                    {selectedRecommendationClaim.verifierNotes.map((note) => (
                      <li key={note} className="flex gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {note}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedRecommendationClaim(null)} className="rounded-xl">
                    Tutup
                  </Button>
                  <Button
                    onClick={() => {
                      const claim = selectedRecommendationClaim;
                      setSelectedRecommendationClaim(null);
                      openChecklist(claim);
                    }}
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Lihat Daftar Periksa
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={selectedChecklistClaim !== null} onOpenChange={(open) => !open && setSelectedChecklistClaim(null)}>
        <DialogContent className="max-h-[86vh] overflow-y-auto border-border/60 bg-card sm:max-w-2xl">
          {selectedChecklistClaim && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <ClipboardCheck className="h-5 w-5 text-info" /> Daftar Periksa Dokumen
                </DialogTitle>
                <DialogDescription>
                  Checklist simulasi untuk klaim #{selectedChecklistClaim.id}. Gunakan sebagai panduan review internal sebelum verifikasi resmi.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {selectedChecklistClaim.documents.map((document) => (
                  <div key={document.key} className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">{document.label}</p>
                      <p className="text-xs text-muted-foreground">Status upload dan verifikasi dokumen klaim</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={document.uploaded ? "border-success/25 bg-success/15 text-success" : "border-destructive/25 bg-destructive/15 text-destructive"}>
                        {document.uploaded ? "Terunggah" : "Belum upload"}
                      </Badge>
                      <Badge className={document.verified ? "border-success/25 bg-success/15 text-success" : "border-warning/25 bg-warning/15 text-warning"}>
                        {document.verified ? "Terverifikasi" : "Perlu review"}
                      </Badge>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSelectedChecklistClaim(null)} className="rounded-xl">
                    Tutup
                  </Button>
                  <Button onClick={() => goToClaimDetail(selectedChecklistClaim.id)} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
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

const HospitalReferralView = ({ onBackToHome }: { onBackToHome: () => void }) => {
  const [referralStep, setReferralStep] = useState<"search" | "form" | "letter">("search");
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  
  // Form fields
  const [patientBPJS, setPatientBPJS] = useState("0001427892314");
  const [patientName, setPatientName] = useState("Fazel Hidayat");
  const [diagnosis, setDiagnosis] = useState("J18.9 - Pneumonia");
  const [referralType, setReferralType] = useState("Rawat Jalan");
  const [notes, setNotes] = useState("Mohon pemeriksaan bronkoskopi dan penanganan lebih lanjut.");

  const [generatedLetter, setGeneratedLetter] = useState<any>(null);

  const REFERRAL_HOSPITALS = [
    {
      id: "rs-demo-pusat",
      name: "RS Demo Pusat (Kelas A)",
      address: "Jl. Salemba Raya No. 4, Jakarta Pusat",
      beds: 12,
      maxBeds: 15,
      specialist: "Spesialis Paru (DPJP: Dr. Denny Sp.P)",
      distance: "2.4 km",
      phone: "021-3147-900",
      status: "Menerima Rujukan JKN"
    },
    {
      id: "rs-polisi-mbg",
      name: "RS Polisi MBG (Kelas B)",
      address: "Jl. Polisi MBG No. 1, Jakarta Barat",
      beds: 5,
      maxBeds: 20,
      specialist: "Spesialis Jantung (DPJP: Dr. Hendra Sp.JP)",
      distance: "4.8 km",
      phone: "021-3500-100",
      status: "Kapasitas Terbatas"
    }
  ];

  const handleCreateReferral = (hosp: any) => {
    setSelectedHospital(hosp);
    setReferralStep("form");
  };

  const handleSubmitReferral = () => {
    toast.loading("Menerbitkan rujukan elektronik di SATUSEHAT...");
    setTimeout(() => {
      const code = `RUJ-${Date.now().toString().slice(-6)}`;
      const letter = {
        id: code,
        patientName,
        patientBPJS,
        diagnosis,
        type: referralType,
        sourceHospital: "RS Demo Sentosa",
        targetHospital: selectedHospital.name,
        date: new Date().toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' }),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' }),
        notes
      };
      setGeneratedLetter(letter);
      setReferralStep("letter");
      toast.dismiss();
      toast.success("Rujukan Elektronik Berhasil Diterbitkan!", {
        description: `Kode Rujukan: ${code} untuk ${patientName}`
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {referralStep === "search" && (
        <div className="space-y-5 animate-slide-up">
          <Card className="p-5 border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="font-bold text-foreground text-lg mb-2">Pencarian Rumah Sakit Rujukan</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Cari Faskes Rujukan Tingkat Lanjut (FKRTL) BPJS berdasarkan ketersediaan tempat tidur kosong dan DPJP spesialis aktif.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Cari nama rumah sakit rujukan..." defaultValue="RS Demo" className="rounded-xl flex-1 bg-muted/20" />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl border-0 h-10 px-4 text-xs font-bold">
                Cari Faskes
              </Button>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {REFERRAL_HOSPITALS.map((hosp) => (
              <Card key={hosp.id} className="p-5 border-border/60 flex flex-col justify-between" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 leading-snug">{hosp.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{hosp.address}</p>
                    </div>
                    <Badge className={`text-[10px] font-bold px-2 py-0.5 border ${hosp.beds > 6 ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>
                      {hosp.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-dashed border-border py-2.5">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Tempat Tidur ICU</span>
                      <span className="font-extrabold text-foreground">{hosp.beds} Tersedia</span>
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1 max-w-[120px]">
                        <div className={`h-full rounded-full ${hosp.beds > 6 ? "bg-success" : "bg-warning"}`} style={{ width: `${(hosp.beds/hosp.maxBeds)*100}%` }} />
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Spesialis Aktif</span>
                      <span className="font-semibold text-foreground truncate block max-w-[160px]">{hosp.specialist}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="rounded-xl flex-1 text-xs" asChild>
                    <a href={`tel:${hosp.phone}`}>📞 Hubungi RS</a>
                  </Button>
                  <Button onClick={() => handleCreateReferral(hosp)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl border-0 flex-1 text-xs font-bold">
                    📝 Buat Rujukan JKN
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {referralStep === "form" && selectedHospital && (
        <Card className="p-5 md:p-6 border-border/60 max-w-xl mx-auto animate-slide-up space-y-4" style={{ boxShadow: "var(--shadow-elevated)" }}>
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="font-bold text-foreground text-lg">Formulir Rujukan Baru</h3>
            <Button variant="ghost" size="sm" onClick={() => setReferralStep("search")} className="rounded-xl">Batal</Button>
          </div>

          <div className="space-y-3">
            <div className="bg-muted/10 p-3 rounded-xl border border-border/60 text-xs">
              <span className="text-muted-foreground">Rumah Sakit Rujukan Tujuan</span>
              <span className="font-extrabold text-foreground block mt-0.5">{selectedHospital.name}</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">{selectedHospital.address}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Nomor BPJS Pasien</label>
              <Input value={patientBPJS} onChange={(e) => setPatientBPJS(e.target.value)} className="rounded-xl bg-muted/20 animate-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Nama Lengkap Pasien</label>
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} className="rounded-xl bg-muted/20 animate-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Diagnosa Rujukan (ICD-10)</label>
                <select value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full h-10 rounded-xl border border-border/80 bg-muted/20 px-3 text-sm font-semibold text-foreground outline-none">
                  <option value="J18.9 - Pneumonia">J18.9 - Pneumonia</option>
                  <option value="E11.9 - Type 2 Diabetes">E11.9 - Type 2 Diabetes</option>
                  <option value="I10 - Essential Hypertension">I10 - Essential Hypertension</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Tipe Pelayanan Rujukan</label>
                <select value={referralType} onChange={(e) => setReferralType(e.target.value)} className="w-full h-10 rounded-xl border border-border/80 bg-muted/20 px-3 text-sm font-semibold text-foreground outline-none">
                  <option value="Rawat Jalan">Rawat Jalan</option>
                  <option value="Rawat Inap">Rawat Inap</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Catatan / Alasan Rujukan</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-20 rounded-xl border border-border/80 bg-muted/20 p-3 text-sm font-semibold text-foreground outline-none resize-none" />
            </div>
          </div>

          <Button onClick={handleSubmitReferral} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl border-0 h-10 font-bold text-sm mt-2">
            🚀 Terbitkan Rujukan Elektronik (SATUSEHAT)
          </Button>
        </Card>
      )}

      {referralStep === "letter" && generatedLetter && (
        <div className="max-w-xl mx-auto animate-slide-up space-y-4">
          <Card className="p-6 border border-slate-300 bg-white text-slate-800 space-y-6 relative overflow-hidden" style={{ boxShadow: "0 15px 30px rgba(0,0,0,0.08)" }}>
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <Shield className="w-96 h-96 text-slate-900" />
            </div>

            {/* Official Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center p-1 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider leading-none text-slate-950">BPJS KESEHATAN</h4>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Jaminan Kesehatan Nasional</span>
                </div>
              </div>
              <div className="text-right">
                <h4 className="text-xs font-extrabold text-slate-950 leading-none">SURAT RUJUKAN FKRTL</h4>
                <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mt-1.5 inline-block">
                  No. Rujukan: {generatedLetter.id}
                </span>
              </div>
            </div>

            {/* Letter Content */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <p>Kepada Yth. Dokter Spesialis Rujukan di:<br /><span className="font-extrabold text-slate-950">{generatedLetter.targetHospital}</span></p>

              <p>Mohon pemeriksaan dan penanganan lebih lanjut terhadap pasien dengan identitas berikut:</p>

              <div className="grid grid-cols-3 gap-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50">
                <span className="text-slate-500 font-semibold">Nama Pasien</span>
                <span className="col-span-2 font-extrabold text-slate-950">: {generatedLetter.patientName}</span>

                <span className="text-slate-500 font-semibold">Nomor BPJS</span>
                <span className="col-span-2 font-mono font-bold text-slate-950">: {generatedLetter.patientBPJS}</span>

                <span className="text-slate-500 font-semibold">Diagnosa Utama</span>
                <span className="col-span-2 font-extrabold text-slate-955">: {generatedLetter.diagnosis}</span>

                <span className="text-slate-500 font-semibold">Tipe Pelayanan</span>
                <span className="col-span-2 font-bold text-slate-900">: {generatedLetter.type}</span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700">Catatan Klinis Rujukan:</span>
                <p className="bg-slate-50 border border-slate-200 p-3 rounded-xl italic text-slate-600 leading-normal">
                  "{generatedLetter.notes}"
                </p>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                <div className="space-y-1 font-semibold text-[10px] text-slate-500">
                  <p>Tanggal Diterbitkan: <span className="text-slate-800">{generatedLetter.date}</span></p>
                  <p>Berlaku Sampai: <span className="text-slate-800 font-bold">{generatedLetter.expiryDate}</span></p>
                  <p className="text-[8px] text-emerald-600">* Surat rujukan ini sah dan tercatat secara elektronik di SATUSEHAT.</p>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-1 shrink-0 bg-slate-50 p-2 border border-slate-200 rounded-xl">
                  <div className="h-14 w-14 bg-white p-1 border border-slate-300 rounded flex flex-col gap-0.5 justify-between">
                    {Array.from({ length: 5 }).map((_, r) => (
                      <div key={r} className="flex gap-0.5 justify-between h-full">
                        {Array.from({ length: 5 }).map((_, c) => {
                          const isAnchor = (r < 2 && c < 2) || (r < 2 && c > 2) || (r > 2 && c < 2);
                          const fill = isAnchor || (r + c) % 3 === 0 || (r * c) % 2 === 0;
                          return (
                            <div key={c} className={`flex-1 h-full rounded-[1px] ${fill ? "bg-slate-900" : "bg-transparent"}`} />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <span className="text-[7px] font-mono font-bold text-slate-500">VERIFIKASI JKN</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-2 text-white">
            <Button onClick={() => setReferralStep("search")} variant="outline" className="flex-1 rounded-xl h-10 text-xs text-slate-700 bg-white border border-slate-200">
              Buat Rujukan Baru
            </Button>
            <Button onClick={onBackToHome} className="bg-emerald-600 hover:bg-emerald-700 flex-1 rounded-xl h-10 text-xs font-bold border-0">
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;






