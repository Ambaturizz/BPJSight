import { useEffect, useMemo, useState } from "react";
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
  const [view, setView] = useState<"home" | "ai" | "profil">("home");
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
    <div className="operational-dashboard min-h-screen bg-background">
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
    </div>
  );
};

export default HospitalDashboard;






