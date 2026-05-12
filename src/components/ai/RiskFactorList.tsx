import { AlertTriangle, CheckCircle2, ClipboardList, Lightbulb } from "lucide-react";

interface RiskFactorListProps {
  title: string;
  items: string[];
  emptyMessage?: string;
  variant?: "factor" | "action" | "neutral";
  compact?: boolean;
}

const variantConfig = {
  factor: {
    Icon: AlertTriangle,
    iconClass: "bg-warning/15 text-warning",
    itemClass: "border-warning/20 bg-warning/5",
  },
  action: {
    Icon: Lightbulb,
    iconClass: "bg-primary/15 text-primary",
    itemClass: "border-primary/20 bg-primary/5",
  },
  neutral: {
    Icon: ClipboardList,
    iconClass: "bg-muted text-muted-foreground",
    itemClass: "border-border/60 bg-card/60",
  },
} as const;

export default function RiskFactorList({
  title,
  items,
  emptyMessage = "Tidak ada item yang perlu ditampilkan.",
  variant = "factor",
  compact = false,
}: RiskFactorListProps) {
  const config = variantConfig[variant];
  const Icon = config.Icon;

  return (
    <div>
      <p className="text-sm font-bold text-foreground">{title}</p>

      {items.length === 0 ? (
        <div className="mt-2 flex gap-2 rounded-xl border border-success/25 bg-success/10 p-3 text-sm text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <span>{emptyMessage}</span>
        </div>
      ) : (
        <div className={compact ? "mt-2 space-y-2" : "mt-3 space-y-3"}>
          {items.map((item, index) => (
            <div key={`${item}-${index}`} className={`flex gap-3 rounded-2xl border ${config.itemClass} ${compact ? "p-3" : "p-4"}`}>
              <div className={`flex shrink-0 items-center justify-center rounded-xl ${config.iconClass} ${compact ? "h-8 w-8" : "h-10 w-10"}`}>
                {variant === "action" ? <span className="text-xs font-extrabold">{index + 1}</span> : <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
