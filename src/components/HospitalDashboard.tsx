import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2,
  FileWarning, Activity, Users, BarChart3, Eye
} from "lucide-react";

interface HospitalDashboardProps {
  onBack: () => void;
}

const STATS = [
  { label: "Total Klaim Aktif", value: "342", icon: Activity, change: "+12 hari ini" },
  { label: "Tingkat Persetujuan", value: "94.2%", icon: TrendingUp, change: "+1.5% dari bulan lalu" },
  { label: "Nilai Klaim Diproses", value: "Rp 2.1M", icon: BarChart3, change: "7 hari terakhir" },
  { label: "Prediksi Berisiko", value: "18", icon: FileWarning, change: "Perlu tindakan" },
];

const CLAIMS_TABLE = [
  { id: "KLM-001", patient: "Ahmad Santoso", diagnosis: "Jantung Koroner", amount: "Rp 12.5 jt", risk: 85, docs: "Tidak Lengkap", status: "berisiko" },
  { id: "KLM-002", patient: "Siti Nurhaliza", diagnosis: "Diabetes Tipe 2", amount: "Rp 3.2 jt", risk: 25, docs: "Lengkap", status: "aman" },
  { id: "KLM-003", patient: "Budi Prasetyo", diagnosis: "Fraktur Femur", amount: "Rp 18.7 jt", risk: 72, docs: "Sebagian", status: "berisiko" },
  { id: "KLM-004", patient: "Dewi Lestari", diagnosis: "Appendisitis", amount: "Rp 5.1 jt", risk: 15, docs: "Lengkap", status: "aman" },
  { id: "KLM-005", patient: "Eko Wijaya", diagnosis: "Pneumonia", amount: "Rp 8.9 jt", risk: 60, docs: "Sebagian", status: "sedang" },
];

const HospitalDashboard = ({ onBack }: HospitalDashboardProps) => {
  const riskColor = (risk: number) => {
    if (risk >= 70) return "text-destructive";
    if (risk >= 40) return "text-warning";
    return "text-success";
  };

  const riskBg = (risk: number) => {
    if (risk >= 70) return "bg-destructive/10";
    if (risk >= 40) return "bg-warning/10";
    return "bg-success/10";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground">BPJSight</span>
          <Badge variant="outline" className="ml-2 text-primary border-primary/30">Portal RS</Badge>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-sm text-foreground">RS Harapan Kita</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Command Center Klaim</h1>
        <p className="mb-8 text-muted-foreground">Ringkasan kesehatan klaim 7 hari terakhir</p>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {STATS.map((stat) => (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-card-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
            </Card>
          ))}
        </div>

        {/* Claims Table */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-semibold text-card-foreground">Klaim Terbaru — Skor Risiko AI</h2>
            <Button variant="outline" size="sm">Lihat Semua</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">ID Klaim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Pasien</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Diagnosis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Nilai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Skor Risiko</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Dokumen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {CLAIMS_TABLE.map((claim) => (
                  <tr key={claim.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-card-foreground">{claim.id}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{claim.patient}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{claim.diagnosis}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{claim.amount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${riskBg(claim.risk)} ${riskColor(claim.risk)}`}>
                          {claim.risk}
                        </div>
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              claim.risk >= 70 ? "bg-destructive" : claim.risk >= 40 ? "bg-warning" : "bg-success"
                            }`}
                            style={{ width: `${claim.risk}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          claim.docs === "Lengkap"
                            ? "bg-success/10 text-success"
                            : claim.docs === "Sebagian"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }
                      >
                        {claim.docs}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" /> Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Risk Alert */}
        <Card className="mt-6 border-warning/30 bg-warning/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
            <div>
              <h3 className="font-semibold text-card-foreground">18 Klaim Berisiko Ditolak</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Sistem AI mendeteksi 18 klaim dengan skor risiko tinggi (&gt;70). Periksa kelengkapan dokumen
                dan pastikan koding diagnosis sesuai ICD-10 sebelum pengajuan.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                <FileWarning className="h-4 w-4" /> Lihat Daftar Periksa
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default HospitalDashboard;
