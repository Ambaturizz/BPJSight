import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types/claim";
import { getRiskLevelFromScore } from "@/lib/risk-helpers";

type RiskScoreBadgeSize = "sm" | "md" | "lg";

interface RiskScoreBadgeProps {
  score?: number | null;
  level?: RiskLevel | null;
  confidence?: number | null;
  size?: RiskScoreBadgeSize;
  showConfidence?: boolean;
  className?: string;
}

const levelLabel: Record<RiskLevel, string> = {
  rendah: "Risiko Rendah",
  sedang: "Risiko Sedang",
  tinggi: "Risiko Tinggi",
};

const levelTone: Record<RiskLevel, string> = {
  rendah: "border-success/25 bg-success/15 text-success",
  sedang: "border-warning/25 bg-warning/15 text-warning",
  tinggi: "border-destructive/25 bg-destructive/15 text-destructive",
};

const scoreBoxTone: Record<RiskLevel, string> = {
  rendah: "border-success/25 bg-success/10 text-success",
  sedang: "border-warning/25 bg-warning/10 text-warning",
  tinggi: "border-destructive/25 bg-destructive/10 text-destructive",
};

const iconMap = {
  rendah: CheckCircle2,
  sedang: ShieldAlert,
  tinggi: AlertTriangle,
} satisfies Record<RiskLevel, typeof CheckCircle2>;

const sizeClass: Record<RiskScoreBadgeSize, { root: string; icon: string; score: string; label: string }> = {
  sm: {
    root: "gap-2 rounded-xl px-2.5 py-2",
    icon: "h-3.5 w-3.5",
    score: "h-8 w-8 text-xs",
    label: "text-xs",
  },
  md: {
    root: "gap-3 rounded-2xl px-3 py-2.5",
    icon: "h-4 w-4",
    score: "h-10 w-10 text-sm",
    label: "text-sm",
  },
  lg: {
    root: "gap-3 rounded-2xl px-4 py-3",
    icon: "h-5 w-5",
    score: "h-14 w-14 text-xl",
    label: "text-base",
  },
};


export default function RiskScoreBadge({
  score,
  level,
  confidence,
  size = "md",
  showConfidence = true,
  className = "",
}: RiskScoreBadgeProps) {
  const resolvedLevel = level ?? getRiskLevelFromScore(score);
  const Icon = iconMap[resolvedLevel];
  const hasScore = typeof score === "number";
  const safeScore = hasScore ? Math.max(0, Math.min(100, Math.round(score))) : null;
  const styles = sizeClass[size];

  return (
    <div className={`inline-flex items-center border ${levelTone[resolvedLevel]} ${styles.root} ${className}`} aria-label={`${levelLabel[resolvedLevel]}${safeScore !== null ? `, skor ${safeScore}` : ""}${typeof confidence === "number" ? `, confidence AI ${Math.round(confidence)} persen` : ""}`}>
      <div className={`flex shrink-0 items-center justify-center rounded-xl border font-extrabold ${scoreBoxTone[resolvedLevel]} ${styles.score}`}>
        {safeScore ?? <Info className={styles.icon} />}
      </div>

      <div className="min-w-0">
        <div className={`flex items-center gap-1.5 font-bold ${styles.label}`}>
          <Icon className={styles.icon} />
          <span>{levelLabel[resolvedLevel]}</span>
        </div>

        {showConfidence && typeof confidence === "number" && (
          <Badge className="mt-1 border border-info/25 bg-info/15 text-[10px] font-bold text-info">
            Confidence AI {Math.round(confidence)}%
          </Badge>
        )}
      </div>
    </div>
  );
}


