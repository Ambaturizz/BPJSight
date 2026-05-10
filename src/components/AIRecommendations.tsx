import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles, TrendingUp, AlertTriangle, CheckCircle2, FileText, Activity,
  Heart, Shield, ArrowRight, BarChart3, Stethoscope, Pill
} from "lucide-react";

type Risk = "low" | "medium" | "high";
interface Insight {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  action: string;
  impact: string;
  risk: Risk;
  confidence: number;
}

const PATIENT: Insight[] = [
  { icon: AlertTriangle, title: "Lengkapi Resume Medis Klaim KLM-002", desc: "Dokumen resume DPJP belum tersedia — risiko penolakan tinggi.", action: "Hubungi RS", impact: "+38% peluang persetujuan", risk: "high", confidence: 92 },
  { icon: Stethoscope, title: "Cek Rutin Tekanan Darah", desc: "Riwayat hipertensi terdeteksi. Disarankan kontrol tiap 2 minggu.", action: "Buat Janji", impact: "Pencegahan komplikasi", risk: "medium", confidence: 86 },
  { icon: Pill, title: "Aktifkan Pengingat Obat", desc: "Jadwal Amlodipine 5mg sering terlewat berdasarkan riwayat tebus resep.", action: "Aktifkan", impact: "+24% kepatuhan terapi", risk: "medium", confidence: 81 },
  { icon: Activity, title: "Rujukan ke Sp.JP Tersedia", desc: "Berdasarkan profil risiko, konsultasi kardiologi direkomendasikan.", action: "Lihat Faskes", impact: "Skrining dini", risk: "low", confidence: 78 },
  { icon: Heart, title: "Program Senam Jantung BPJS", desc: "Manfaat preventif gratis di RS MBG setiap Sabtu pagi.", action: "Daftar", impact: "Manfaat ditanggung", risk: "low", confidence: 90 },
];

const HOSPITAL: Insight[] = [
  { icon: TrendingUp, title: "Optimasi INA-CBG's Coding", desc: "12 klaim rawat inap dapat dipindah ke kode lebih spesifik untuk reimbursement optimal.", action: "Tinjau Klaim", impact: "+Rp 84 jt/bulan", risk: "low", confidence: 94 },
  { icon: AlertTriangle, title: "Anomali Pola Klaim Bedah", desc: "Lonjakan 3.2x klaim bedah minor dari 1 dokter — verifikasi pola dianjurkan.", action: "Audit", impact: "Mitigasi fraud", risk: "high", confidence: 88 },
  { icon: FileText, title: "Standarisasi SEP Digital", desc: "23% klaim minggu ini SEP belum ditandatangani digital — perlambat verifikasi.", action: "Atur Workflow", impact: "-2 hari proses", risk: "medium", confidence: 91 },
  { icon: BarChart3, title: "Performa Departemen Radiologi", desc: "Tingkat persetujuan 78% — di bawah rata-rata RS (94%).", action: "Lihat Laporan", impact: "Target +16%", risk: "medium", confidence: 85 },
  { icon: Shield, title: "Kepatuhan Dokumentasi Naik", desc: "Departemen Pediatri capai 98% kelengkapan dokumen — ditiru ke unit lain.", action: "Bagikan SOP", impact: "Best practice", risk: "low", confidence: 96 },
];

const riskTone: Record<Risk, string> = {
  low: "bg-success/15 text-success border-success/25",
  medium: "bg-warning/15 text-warning border-warning/25",
  high: "bg-destructive/15 text-destructive border-destructive/25",
};

const riskLabel: Record<Risk, string> = { low: "Rendah", medium: "Sedang", high: "Tinggi" };

const TRENDS = [42, 55, 48, 61, 58, 72, 68, 79, 85, 82, 91, 94];

interface Props { role: "patient" | "hospital" }

const AIRecommendations = ({ role }: Props) => {
  const items = role === "patient" ? PATIENT : HOSPITAL;
  const heading = role === "patient" ? "Rekomendasi Kesehatan AI" : "Wawasan Operasional AI";
  const subtitle = role === "patient"
    ? "Saran personal berdasarkan profil & klaim Anda"
    : "Optimasi klaim, deteksi anomali, dan analitik departemen";

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-primary/20" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="relative p-5 md:p-6 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/8 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-foreground">{heading}</h2>
                <Badge className="bg-primary/15 text-primary border border-primary/25 text-xs"><Sparkles className="mr-1 h-3 w-3" />AI Engine v3.2</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              {/* Trend chart */}
              <div className="mt-4 flex items-end gap-1 h-14">
                {TRENDS.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary transition-all hover:from-primary hover:to-primary-glow"
                    style={{ height: `${v}%` }}
                    title={`${v}%`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {role === "patient" ? "Skor kesehatan 12 minggu terakhir — tren membaik" : "Akurasi prediksi klaim 12 minggu — naik 52% sejak Q1"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((it, idx) => (
          <Card
            key={it.title}
            className="animate-slide-up p-5 border-border/60 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20 transition-all"
            style={{ animationDelay: `${idx * 0.06}s`, boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${riskTone[it.risk]}`}>
                <it.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="font-bold text-foreground text-sm leading-snug">{it.title}</h3>
                  <Badge className={`${riskTone[it.risk]} text-xs font-bold border`}>{riskLabel[it.risk]}</Badge>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{it.desc}</p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-primary transition-all duration-500"
                      style={{ width: `${it.confidence}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-primary">AI {it.confidence}%</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                    <CheckCircle2 className="h-3 w-3" /> {it.impact}
                  </span>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/15 h-7 text-xs">
                    {it.action} <ArrowRight className="h-3 w-3" />
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

export default AIRecommendations;
