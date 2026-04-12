import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2,
  FileWarning, Activity, Users, BarChart3, Eye, Sparkles, Bell, Search
} from "lucide-react";

interface HospitalDashboardProps {
  onBack: () => void;
}

const STATS = [
  { label: "Total Klaim Aktif", value: "342", icon: Activity, change: "+12 hari ini", trend: "up" },
  { label: "Tingkat Persetujuan", value: "94.2%", icon: TrendingUp, change: "+1.5% dari bulan lalu", trend: "up" },
  { label: "Nilai Klaim Diproses", value: "Rp 2.1M", icon: BarChart3, change: "7 hari terakhir", trend: "neutral" },
  { label: "Prediksi Berisiko", value: "18", icon: FileWarning, change: "Perlu tindakan", trend: "down" },
];

const CLAIMS_TABLE = [
  { id: "1", patient: "Aurora Senja", diagnosis: "Jantung Koroner", amount: "Rp 12.5 jt", risk: 85, confidence: 92, docs: "Tidak Lengkap", status: "berisiko" },
  { id: "2", patient: "Kenzie Althaf", diagnosis: "Diabetes Tipe 2", amount: "Rp 3.2 jt", risk: 25, confidence: 88, docs: "Lengkap", status: "aman" },
  { id: "3", patient: "Alesha Zefanya", diagnosis: "Fraktur Femur", amount: "Rp 18.7 jt", risk: 72, confidence: 85, docs: "Sebagian", status: "berisiko" },
  { id: "4", patient: "Kenzo Dirgantara", diagnosis: "Appendisitis", amount: "Rp 5.1 jt", risk: 15, confidence: 95, docs: "Lengkap", status: "aman" },
  { id: "5", patient: "Clarissa Larasati", diagnosis: "Pneumonia", amount: "Rp 8.9 jt", risk: 60, confidence: 79, docs: "Sebagian", status: "sedang" },
  { id: "6", patient: "Gibran Bumi", diagnosis: "Demam Berdarah", amount: "Rp 4.3 jt", risk: 30, confidence: 91, docs: "Lengkap", status: "aman" },
  { id: "7", patient: "Keisya Aurelia", diagnosis: "Asma Akut", amount: "Rp 2.8 jt", risk: 45, confidence: 83, docs: "Sebagian", status: "sedang" },
  { id: "8", patient: "Naufal Atharrazka", diagnosis: "Hernia Inguinalis", amount: "Rp 15.2 jt", risk: 78, confidence: 87, docs: "Tidak Lengkap", status: "berisiko" },
  { id: "9", patient: "Freya Aninditha", diagnosis: "Gagal Ginjal", amount: "Rp 22.1 jt", risk: 90, confidence: 94, docs: "Tidak Lengkap", status: "berisiko" },
  { id: "10", patient: "Zayyan Arkhanza", diagnosis: "Stroke Ringan", amount: "Rp 11.6 jt", risk: 55, confidence: 80, docs: "Sebagian", status: "sedang" },
];

const HospitalDashboard = ({ onBack }: HospitalDashboardProps) => {
  const riskColor = (risk: number) => {
    if (risk >= 70) return "text-destructive";
    if (risk >= 40) return "text-warning";
    return "text-success";
  };

  const riskBg = (risk: number) => {
    if (risk >= 70) return "bg-destructive/15 border-destructive/25";
    if (risk >= 40) return "bg-warning/15 border-warning/25";
    return "bg-success/15 border-success/25";
  };

  const riskGradient = (risk: number) => {
    if (risk >= 70) return "from-warning to-destructive";
    if (risk >= 40) return "from-success to-warning";
    return "from-success to-success";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <div className="ml-auto flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-card" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground">
                <Users className="h-4 w-4" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-foreground leading-none">RS MBG</p>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="animate-fade-in-up">
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">Command Center Klaim</h1>
          <p className="mb-8 text-muted-foreground">Ringkasan kesehatan klaim 7 hari terakhir</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, idx) => (
            <Card
              key={stat.label}
              className="animate-slide-up group relative overflow-hidden border-border/60 p-5 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 hover:border-primary/20"
              style={{ animationDelay: `${idx * 0.08}s`, boxShadow: 'var(--shadow-card)' }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-all duration-300 group-hover:scale-150 group-hover:bg-primary/10" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary transition-all duration-300 group-hover:gradient-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/25">
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.change}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Claims Table */}
        <Card className="animate-slide-up overflow-hidden border-border/60" style={{ animationDelay: '0.3s', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 px-5 py-4 md:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-bold text-foreground">Klaim Terbaru — Skor Risiko AI</h2>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg">Lihat Semua</Button>
          </div>
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
                {CLAIMS_TABLE.map((claim) => (
                  <tr
                    key={claim.id}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors duration-150"
                  >
                    <td className="px-5 py-4 text-sm font-bold text-primary md:px-6">{claim.id}</td>
                    <td className="px-5 py-4 md:px-6">
                      <p className="text-sm font-semibold text-foreground">{claim.patient}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{claim.diagnosis}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground md:px-6 hidden md:table-cell">{claim.diagnosis}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-foreground md:px-6 hidden lg:table-cell">{claim.amount}</td>
                    <td className="px-5 py-4 md:px-6">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-extrabold ${riskBg(claim.risk)} ${riskColor(claim.risk)}`}>
                          {claim.risk}
                        </div>
                        <div className="hidden sm:block">
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${riskGradient(claim.risk)} transition-all duration-500`}
                              style={{ width: `${claim.risk}%` }}
                            />
                          </div>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">AI: {claim.confidence}%</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 md:px-6 hidden md:table-cell">
                      <Badge
                        className={`font-semibold text-xs ${
                          claim.docs === "Lengkap"
                            ? "bg-success/15 text-success border border-success/25"
                            : claim.docs === "Sebagian"
                            ? "bg-warning/15 text-warning border border-warning/25"
                            : "bg-destructive/15 text-destructive border border-destructive/25"
                        }`}
                      >
                        {claim.docs === "Lengkap" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {claim.docs === "Tidak Lengkap" && <AlertTriangle className="mr-1 h-3 w-3" />}
                        {claim.docs}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 md:px-6">
                      <Button variant="ghost" size="sm" className="rounded-lg hover:bg-primary/15 hover:text-primary">
                        <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Detail</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Risk Alert */}
        <Card className="animate-slide-up mt-6 border-warning/25 overflow-hidden" style={{ animationDelay: '0.4s', boxShadow: 'var(--shadow-card)' }}>
          <div className="bg-gradient-to-r from-warning/10 via-warning/5 to-transparent p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/15 border border-warning/25">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground">18 Klaim Berisiko Ditolak</h3>
                  <Badge className="bg-destructive/15 text-destructive border border-destructive/25 text-xs font-bold">
                    Prioritas Tinggi
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Sistem AI mendeteksi 18 klaim dengan skor risiko tinggi (&gt;70). Periksa kelengkapan dokumen
                  dan pastikan koding diagnosis sesuai ICD-10 sebelum pengajuan.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" className="rounded-lg gradient-primary text-primary-foreground border-0 shadow-md shadow-primary/25">
                    <FileWarning className="h-4 w-4" /> Lihat Daftar Periksa
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Abaikan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default HospitalDashboard;
