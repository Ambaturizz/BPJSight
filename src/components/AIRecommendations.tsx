import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Activity,
  Shield,
  ArrowRight,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";

type Risk = "low" | "medium" | "high";

interface Insight {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  action: string;
  impact: string;
  risk: Risk;
  score: number;
}

const PATIENT: Insight[] = [
  {
    icon: AlertTriangle,
    title: "Resume Medis KLM-2024-002 Belum Lengkap",
    desc: "Data contoh menunjukkan resume medis DPJP belum tersedia pada klaim rawat inap.",
    action: "Lihat Dokumen",
    impact: "Prioritas: Tinggi",
    risk: "high",
    score: 72,
  },
  {
    icon: FileText,
    title: "Cek Konsistensi Diagnosis dan Tindakan",
    desc: "Pastikan diagnosis, tindakan, tanggal pelayanan, dan billing tertulis konsisten pada dokumen klaim.",
    action: "Lihat Klaim",
    impact: "Perlu ditinjau",
    risk: "medium",
    score: 64,
  },
  {
    icon: ClipboardCheck,
    title: "Dokumen Identitas Sudah Tersedia",
    desc: "KTP/KK dan nomor peserta pada data demo sudah masuk daftar dokumen klaim.",
    action: "Buka Checklist",
    impact: "Lengkap",
    risk: "low",
    score: 88,
  },
  {
    icon: Activity,
    title: "Pantau Status Setelah Perbaikan",
    desc: "Setelah dokumen dilengkapi, status klaim dapat dipantau kembali melalui timeline klaim.",
    action: "Pantau Timeline",
    impact: "Tindak lanjut",
    risk: "medium",
    score: 68,
  },
];

const HOSPITAL: Insight[] = [
  {
    icon: TrendingUp,
    title: "Klaim Rawat Inap Perlu Prioritas Review",
    desc: "Beberapa klaim demo memiliki dokumen sebagian dan skor risiko administratif tinggi.",
    action: "Tinjau Klaim",
    impact: "Prioritas: Tinggi",
    risk: "high",
    score: 76,
  },
  {
    icon: FileText,
    title: "Resume Medis dan Bukti Tindakan Perlu Dicek",
    desc: "Checklist menunjukkan dokumen klinis belum lengkap untuk sebagian klaim yang sedang diproses.",
    action: "Buka Checklist",
    impact: "Dokumen perlu review",
    risk: "medium",
    score: 70,
  },
  {
    icon: BarChart3,
    title: "Ringkasan Nilai Klaim untuk Monitoring",
    desc: "Total nominal pada dashboard bersifat contoh dan membantu menguji tampilan operasional rumah sakit.",
    action: "Lihat Dashboard",
    impact: "Data simulasi",
    risk: "low",
    score: 82,
  },
  {
    icon: Shield,
    title: "Saran Perbaikan Berbasis Aturan",
    desc: "Rekomendasi menampilkan langkah administratif, bukan persetujuan atau penolakan otomatis.",
    action: "Lihat Saran",
    impact: "Decision-support",
    risk: "medium",
    score: 66,
  },
];

const riskTone: Record<Risk, string> = {
  low: "bg-success/15 text-success border-success/25",
  medium: "bg-warning/15 text-warning border-warning/25",
  high: "bg-destructive/15 text-destructive border-destructive/25",
};

const riskLabel: Record<Risk, string> = { low: "Rendah", medium: "Sedang", high: "Tinggi" };

const COMPLETENESS = [58, 62, 66, 64, 70, 72, 74, 71, 76, 78, 80, 82];

interface Props { role: "patient" | "hospital" }

const ClaimReviewRecommendations = ({ role }: Props) => {
  const items = role === "patient" ? PATIENT : HOSPITAL;
  const heading = role === "patient" ? "Rekomendasi Pemeriksaan Klaim" : "Insight Administratif Klaim";
  const subtitle = role === "patient"
    ? "Saran berbasis kelengkapan dokumen pada data simulasi pasien"
    : "Ringkasan awal untuk membantu admin menentukan prioritas review";

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-border/70" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{heading}</h2>
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
                    Data Simulasi
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            <Badge className="w-fit border border-info/25 bg-info/10 text-xs font-semibold text-info">
              Prototype risk scoring
            </Badge>
          </div>

          <div className="mt-5 flex h-14 items-end gap-1" aria-label="Tren kelengkapan dokumen simulatif 12 minggu">
            {COMPLETENESS.map((value, index) => (
              <div
                key={`${value}-${index}`}
                className="flex-1 rounded-t bg-primary/40"
                style={{ height: `${value}%` }}
                title={`Skor kelengkapan ${value}/100`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Grafik menunjukkan skor kelengkapan dokumen contoh, bukan akurasi prediksi atau performa produksi.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <Card
            key={item.title}
            className="animate-slide-up border-border/70 p-5 transition-colors hover:border-primary/30"
            style={{ animationDelay: `${index * 0.04}s`, boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${riskTone[item.risk]}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-bold leading-snug text-foreground">{item.title}</h3>
                  <Badge className={`${riskTone[item.risk]} border text-xs font-bold`}>{riskLabel[item.risk]}</Badge>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-primary">{item.score}/100</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-primary" /> {item.impact}
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary">
                    {item.action} <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClaimReviewRecommendations;
