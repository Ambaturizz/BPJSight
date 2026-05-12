import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RiskFactorList from "@/components/ai/RiskFactorList";
import RiskScoreBadge from "@/components/ai/RiskScoreBadge";
import { formatIDRShort } from "@/lib/formatters";
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardCheck, Eye, FileText, Stethoscope, Wrench } from "lucide-react";
import type { HospitalClaim } from "@/types/claim";

interface HospitalClaimCardProps {
  claim: HospitalClaim;
  onDetail: (claimId: string) => void;
  onChecklist: (claim: HospitalClaim) => void;
  onRecommendations: (claim: HospitalClaim) => void;
}

function getDocumentTone(docs: HospitalClaim["docs"]): string {
  if (docs === "Lengkap") return "bg-success/15 text-success border-success/25";
  if (docs === "Sebagian") return "bg-warning/15 text-warning border-warning/25";
  return "bg-destructive/15 text-destructive border-destructive/25";
}

export default function HospitalClaimCard({ claim, onDetail, onChecklist, onRecommendations }: HospitalClaimCardProps) {
  return (
    <Card className="border-border/60 p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">#{claim.id}</p>
          <h3 className="mt-1 truncate text-base font-extrabold text-foreground">{claim.patient}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Stethoscope className="h-3.5 w-3.5" /> {claim.diagnosis} ({claim.icd10})
          </p>
        </div>

        <RiskScoreBadge
          score={claim.risk}
          level={claim.riskLevel}
          confidence={claim.confidence}
          size="sm"
          showConfidence={false}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <FileText className="h-3.5 w-3.5" /> Nilai klaim
          </p>
          <p className="mt-1 text-sm font-extrabold text-foreground">{formatIDRShort(claim.amountIDR)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> Tanggal
          </p>
          <p className="mt-1 text-sm font-extrabold text-foreground">
            {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(claim.submittedAt))}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge className={`border text-xs font-bold ${getDocumentTone(claim.docs)}`}>
          {claim.docs === "Lengkap" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
          Dokumen {claim.docs}
        </Badge>
        <Badge variant="outline" className="border-info/25 bg-info/10 text-xs font-bold text-info">
          Kelengkapan {claim.confidence}%
        </Badge>
      </div>

      {claim.riskFactors.length > 0 && (
        <div className="mt-4">
          <RiskFactorList title="Faktor utama" items={claim.riskFactors.slice(0, 2)} variant="factor" compact />
        </div>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          aria-label={`Lihat detail klaim ${claim.id}`}
          onClick={() => onDetail(claim.id)}
          className="rounded-xl border-primary/30 text-primary hover:bg-primary/15"
        >
          <Eye className="h-4 w-4" /> Lihat Detail
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label={`Lihat langkah perbaikan klaim ${claim.id}`}
          onClick={() => onRecommendations(claim)}
          className="rounded-xl border-warning/30 text-warning hover:bg-warning/15"
        >
          <Wrench className="h-4 w-4" /> Langkah Perbaikan
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label={`Lihat daftar periksa klaim ${claim.id}`}
          onClick={() => onChecklist(claim)}
          className="rounded-xl border-info/30 text-info hover:bg-info/15"
        >
          <ClipboardCheck className="h-4 w-4" /> Daftar Periksa
        </Button>
      </div>
    </Card>
  );
}


