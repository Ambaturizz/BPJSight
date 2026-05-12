import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2,
  FileWarning, Activity, Users, BarChart3, Eye, Sparkles, Plus
} from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import LogoutButton from "./LogoutButton";
import AIRecommendations from "./AIRecommendations";
import HospitalProfile from "./HospitalProfile";
import { useClaims } from "@/features/claims/hooks/useClaims";
import { useFilteredClaims, exportClaimsCsv, downloadCsv } from "@/features/claims/hooks/useClaimFilters";
import ClaimsToolbar from "@/features/claims/components/ClaimsToolbar";
import { formatIDRShort } from "@/lib/formatters";

interface HospitalDashboardProps {
  onBack: () => void;
  onSubmitClaim?: () => void;
}

const STATS = [
  { label: "Total Klaim Aktif", value: "342", icon: Activity, change: "+12 hari ini" },
  { label: "Tingkat Persetujuan", value: "94.2%", icon: TrendingUp, change: "+1.5% dari bulan lalu" },
  { label: "Nilai Klaim Diproses", value: "Rp 2.1M", icon: BarChart3, change: "7 hari terakhir" },
  { label: "Prediksi Berisiko", value: "18", icon: FileWarning, change: "Perlu tindakan" },
];

const HospitalDashboard = ({ onBack, onSubmitClaim }: HospitalDashboardProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<"home" | "ai" | "profil">("home");
  const claims = useClaims();
  const { data: filteredClaims, filters, update } = useFilteredClaims(claims);

  const riskColor = (risk: number) =>
    risk >= 70 ? "text-destructive" : risk >= 40 ? "text-warning" : "text-success";
  const riskBg = (risk: number) =>
    risk >= 70 ? "bg-destructive/15 border-destructive/25" :
    risk >= 40 ? "bg-warning/15 border-warning/25" : "bg-success/15 border-success/25";
  const riskGradient = (risk: number) =>
    risk >= 70 ? "from-warning to-destructive" :
    risk >= 40 ? "from-success to-warning" : "from-success to-success";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 glass-card px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground tracking-tight">BPJSight</span>
          </div>
          <Badge variant="outline" className="ml-1 text-primary border-primary/30 font-semibold text-xs">Portal RS</Badge>
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <button onClick={() => setView("home")} className={`hidden md:inline text-xs font-semibold px-2.5 py-1 rounded-lg ${view === "home" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>Klaim</button>
            <button onClick={() => setView("ai")} className={`hidden md:inline text-xs font-semibold px-2.5 py-1 rounded-lg ${view === "ai" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>AI Insight</button>
            <button onClick={() => setView("profil")} className={`hidden md:inline text-xs font-semibold px-2.5 py-1 rounded-lg ${view === "profil" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>Profil</button>
            <NotificationCenter role="hospital" />
            <LogoutButton compact onLoggedOut={onBack} />
            <button onClick={() => setView("profil")} className="flex items-center gap-2 rounded-xl hover:bg-muted/40 px-1.5 py-1">
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground">
                <Users className="h-4 w-4" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-foreground leading-none">RS MBG</p>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {view === "ai" && <AIRecommendations role="hospital" />}
        {view === "profil" && <HospitalProfile onBack={() => setView("home")} />}
        {view === "home" && (<>
          <div className="animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="mb-1 text-2xl font-extrabold tracking-tight md:text-3xl">Command Center Klaim</h1>
              <p className="text-muted-foreground">Ringkasan kesehatan klaim 7 hari terakhir</p>
            </div>
            {onSubmitClaim && (
              <Button onClick={onSubmitClaim} className="rounded-xl gradient-primary text-primary-foreground border-0 shadow-lg shadow-primary/30 px-6 py-3 text-base font-bold animate-pulse hover:animate-none hover:scale-105 transition-transform">
                <Plus className="h-5 w-5" /> Ajukan Klaim Baru
              </Button>
            )}
          </div>

          <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, idx) => (
              <Card key={stat.label} className="animate-slide-up group relative overflow-hidden border-border/60 p-5 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all" style={{ animationDelay: `${idx * 0.08}s`, boxShadow: "var(--shadow-card)" }}>
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

          <Card className="animate-slide-up overflow-hidden border-border/60" style={{ animationDelay: "0.3s", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2 px-5 py-4 md:px-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-bold text-foreground">Klaim Terbaru — Skor Risiko AI</h2>
            </div>
            <ClaimsToolbar
              filters={filters}
              onChange={update}
              total={filteredClaims.length}
              onExport={() => downloadCsv(`bpjsight-claims-${new Date().toISOString().slice(0,10)}.csv`, exportClaimsCsv(filteredClaims))}
            />

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-6">No</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-6">Pasien</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-6 hidden md:table-cell">Diagnosis</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-6 hidden lg:table-cell">Nilai</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-6">Skor Risiko</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-6 hidden md:table-cell">Dokumen</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-6">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">Tidak ada klaim yang cocok.</td></tr>
                  ) : filteredClaims.map((claim) => (
                    <tr key={claim.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4 text-sm font-bold text-primary md:px-6">{claim.id}</td>
                      <td className="px-5 py-4 md:px-6">
                        <p className="text-sm font-semibold text-foreground">{claim.patient}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{claim.diagnosis}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground md:px-6 hidden md:table-cell">{claim.diagnosis} <span className="text-[10px] text-muted-foreground/60">({claim.icd10})</span></td>
                      <td className="px-5 py-4 text-sm font-semibold text-foreground md:px-6 hidden lg:table-cell">{formatIDRShort(claim.amountIDR)}</td>
                      <td className="px-5 py-4 md:px-6">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-extrabold ${riskBg(claim.risk)} ${riskColor(claim.risk)}`}>
                            {claim.risk}
                          </div>
                          <div className="hidden sm:block">
                            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                              <div className={`h-full rounded-full bg-gradient-to-r ${riskGradient(claim.risk)} transition-all duration-500`} style={{ width: `${claim.risk}%` }} />
                            </div>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">AI: {claim.confidence}%</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 md:px-6 hidden md:table-cell">
                        <Badge className={`font-semibold text-xs ${
                          claim.docs === "Lengkap" ? "bg-success/15 text-success border border-success/25" :
                          claim.docs === "Sebagian" ? "bg-warning/15 text-warning border border-warning/25" :
                          "bg-destructive/15 text-destructive border border-destructive/25"
                        }`}>
                          {claim.docs === "Lengkap" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                          {claim.docs === "Tidak Lengkap" && <AlertTriangle className="mr-1 h-3 w-3" />}
                          {claim.docs}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 md:px-6">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/rumah-sakit/klaim/${claim.id}`)} className="rounded-lg hover:bg-primary/15 hover:text-primary">
                          <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Detail</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>)}
      </main>
    </div>
  );
};

export default HospitalDashboard;
