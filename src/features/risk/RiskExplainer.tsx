import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RiskResult } from "./scoring";
import { Info } from "lucide-react";

interface Props { result: RiskResult }

export default function RiskExplainer({ result }: Props) {
  const tone =
    result.level === "tinggi" ? "destructive" :
    result.level === "sedang" ? "warning" : "success";

  return (
    <Card className="p-5 border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground">Skor Risiko Administratif</h3>
            <Badge className={`bg-${tone}/15 text-${tone} border border-${tone}/25 text-xs font-bold capitalize`}>
              {result.level}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Simulasi model {result.modelVersion} • Kelengkapan {result.confidence}/100</p>
        </div>
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border bg-${tone}/15 border-${tone}/25 text-${tone} text-2xl font-extrabold`}>
          {result.score}
        </div>
      </div>

      <div className="space-y-3">
        {result.factors.map((f) => (
          <div key={f.key}>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="font-semibold text-foreground">{f.label}</span>
              <span className="text-muted-foreground">
                bobot {Math.round(f.weight * 100)}% • nilai {f.value} • +{f.contribution.toFixed(1)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                style={{ width: `${f.value}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Sumber: {f.source}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <p>{result.disclaimer}</p>
      </div>
    </Card>
  );
}


