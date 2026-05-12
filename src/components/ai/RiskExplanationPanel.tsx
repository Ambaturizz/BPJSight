import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { RiskLevel } from "@/types/claim";
import RiskFactorList from "./RiskFactorList";
import RiskScoreBadge from "./RiskScoreBadge";
import { getRiskLevelFromScore, getRiskLevelLabel } from "@/lib/risk-helpers";

interface RiskExplanationPanelProps {
  score?: number | null;
  level?: RiskLevel | null;
  confidence?: number | null;
  riskFactors: string[];
  recommendedActions: string[];
  title?: string;
  summary?: string;
  className?: string;
}

const progressTone: Record<RiskLevel, string> = {
  rendah: "bg-success",
  sedang: "bg-warning",
  tinggi: "bg-destructive",
};

const DEFAULT_DISCLAIMER =
  "AI hanya alat bantu untuk membantu prioritas review dan perbaikan dokumen. Keputusan akhir klaim tetap melalui verifikasi resmi sesuai prosedur yang berlaku.";

export default function RiskExplanationPanel({
  score,
  level,
  confidence,
  riskFactors,
  recommendedActions,
  title = "Penjelasan Skor Risiko AI",
  summary,
  className = "",
}: RiskExplanationPanelProps) {
  const resolvedLevel = level ?? getRiskLevelFromScore(score);
  const safeScore = typeof score === "number" ? Math.max(0, Math.min(100, Math.round(score))) : 0;

  return (
    <Card className={`overflow-hidden border-border/60 ${className}`} style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {summary ?? `Level saat ini: ${getRiskLevelLabel(resolvedLevel)}. Gunakan informasi ini sebagai dasar pengecekan, bukan keputusan otomatis.`}
            </p>
          </div>

          <RiskScoreBadge score={safeScore} level={resolvedLevel} confidence={confidence} size="lg" />
        </div>

        <div className="mt-5">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Skor risiko</span>
            <span>{safeScore}/100</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full transition-all duration-500 ${progressTone[resolvedLevel]}`} style={{ width: `${safeScore}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <RiskFactorList
          title="Faktor Penyebab"
          items={riskFactors}
          variant="factor"
          emptyMessage="Tidak ada faktor risiko utama yang terdeteksi pada data klaim ini."
        />

        <RiskFactorList
          title="Rekomendasi Tindakan"
          items={recommendedActions}
          variant="action"
          emptyMessage="Tidak ada tindakan perbaikan khusus saat ini. Tetap pantau status klaim sampai proses selesai."
        />

        <div className="flex items-start gap-2 rounded-2xl border border-info/25 bg-info/10 p-4 text-sm leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
          <p>{DEFAULT_DISCLAIMER}</p>
        </div>
      </div>
    </Card>
  );
}


