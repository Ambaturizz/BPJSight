import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Hospital,
  Inbox,
  Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DocumentChecklist from "@/components/claims/DocumentChecklist";
import RiskExplanationPanel from "@/components/ai/RiskExplanationPanel";
import { claimsService } from "@/services/claimsService";
import { claimWorkflowService } from "@/services/claimWorkflowService";
import type { ClaimStatus, ClaimTimelineStatus, PatientClaim } from "@/types/claim";

const statusTone: Record<ClaimStatus, string> = {
  aman: "bg-success/15 text-success border-success/25",
  sedang: "bg-warning/15 text-warning border-warning/25",
  berisiko: "bg-destructive/15 text-destructive border-destructive/25",
  ditolak: "bg-destructive/15 text-destructive border-destructive/25",
  selesai: "bg-success/15 text-success border-success/25",
  diproses: "bg-info/15 text-info border-info/25",
};

const statusLabel: Record<ClaimStatus, string> = {
  aman: "Aman",
  sedang: "Perlu Review",
  berisiko: "Berisiko",
  ditolak: "Ditolak",
  selesai: "Selesai",
  diproses: "Diproses",
};

const timelineTone: Record<ClaimTimelineStatus, string> = {
  completed: "gradient-primary text-primary-foreground shadow-md shadow-primary/25",
  current: "bg-warning/15 text-warning border border-warning/25",
  pending: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/15 text-destructive border border-destructive/25",
};

export default function PatientClaimDetail() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<PatientClaim | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadClaim() {
      setIsLoading(true);
      try {
        const data = claimId ? await claimsService.getPatientClaimById(claimId) : undefined;
        if (isMounted) {
          setClaim(data ?? null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadClaim();

    return () => {
      isMounted = false;
    };
  }, [claimId]);

  const documentSummary = useMemo(() => {
    if (!claim) return { total: 0, verified: 0, review: 0, missing: 0 };

    return claim.documents.reduce(
      (summary, document) => ({
        total: summary.total,
        verified: summary.verified + (document.status === "verified" ? 1 : 0),
        review: summary.review + (document.status === "review" ? 1 : 0),
        missing: summary.missing + (document.status === "missing" ? 1 : 0),
      }),
      { total: claim.documents.length, verified: 0, review: 0, missing: 0 },
    );
  }, [claim]);

  const handleUploadDocument = (documentKey: string, file: File) => {
    setClaim((currentClaim) => {
      if (!currentClaim) return currentClaim;

      return {
        ...currentClaim,
        documents: currentClaim.documents.map((document) =>
          document.key === documentKey ? claimWorkflowService.uploadPatientDocument(document, file) : document,
        ),
        timeline: currentClaim.timeline.map((item) =>
          item.title === "Validasi dokumen" || item.title === "Perbaikan dokumen"
            ? {
                ...item,
                description: "Dokumen tambahan sudah diunggah dan menunggu verifikasi rumah sakit.",
                status: item.status === "pending" ? "current" : item.status,
              }
            : item,
        ),
      };
    });

    toast.success(`${file.name} berhasil diunggah. Status: Menunggu Verifikasi.`);
  };

  if (isLoading) {
    return <PatientClaimDetailSkeleton />;
  }

  if (!claim) {
    return (
      <EmptyClaimState
        title="Klaim tidak ditemukan"
        description={`Klaim ${claimId ?? "yang dipilih"} tidak tersedia di data pasien demo.`}
        actionLabel="Kembali ke Dashboard Pasien"
        onAction={() => navigate("/pasien/dashboard")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 glass-card px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali ke dashboard" onClick={() => navigate("/pasien/dashboard")} className="rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
              <Receipt className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="truncate font-bold tracking-tight text-foreground">Detail Klaim Pasien</span>
          </div>
          <div className="ml-auto"><ThemeToggle compact /></div>
          <Badge className={`${statusTone[claim.status]} hidden border text-xs font-bold sm:inline-flex`}>
            {statusLabel[claim.status]}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{claim.id}</p>
              <Badge className={`${statusTone[claim.status]} border text-xs font-bold sm:hidden`}>
                {statusLabel[claim.status]}
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{claim.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Hospital className="h-4 w-4 text-primary" /> {claim.hospital}
              <span className="text-muted-foreground/50">•</span>
              <Calendar className="h-4 w-4 text-primary" /> {claim.date}
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4 text-left md:text-right">
            <p className="text-xs font-semibold text-primary">Nominal Klaim</p>
            <p className="mt-1 text-2xl font-extrabold text-foreground">{claim.amount}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border/60 p-4 sm:p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Timeline Proses</h2>
                  <p className="text-sm text-muted-foreground">Perkembangan klaim dari pengajuan sampai keputusan akhir.</p>
                </div>
                <Clock className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-4">
                {claim.timeline.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${timelineTone[item.status]}`}>
                        {item.status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : item.status === "current" ? <Clock className="h-5 w-5" /> : <span>{index + 1}</span>}
                      </div>
                      {index < claim.timeline.length - 1 && <div className="mt-2 h-full min-h-8 w-0.5 rounded-full bg-border" />}
                    </div>

                    <div className="min-w-0 flex-1 rounded-2xl border border-border/60 bg-card/60 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-bold text-foreground">{item.title}</h3>
                        <span className="text-xs text-muted-foreground">{formatTimelineDate(item.at)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <DocumentChecklist
              mode="patient"
              documents={claim.documents}
              title="Checklist Dokumen Klaim"
              description="Dokumen yang belum lengkap dapat diunggah langsung dari halaman detail ini. File akan masuk status Menunggu Verifikasi."
              onUpload={handleUploadDocument}
            />
          </div>

          <div className="space-y-6">
            <Card className="border-border/60 p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Ringkasan Klaim</h2>
                  <p className="text-sm text-muted-foreground">Data utama klaim pasien.</p>
                </div>
                <Badge className={`${statusTone[claim.status]} border text-xs font-bold`}>{statusLabel[claim.status]}</Badge>
              </div>

              <div className="mt-5 space-y-3">
                <InfoRow label="ID Klaim" value={claim.id} />
                <InfoRow label="Rumah Sakit" value={claim.hospital} />
                <InfoRow label="Tanggal" value={claim.date} />
                <InfoRow label="Nominal" value={claim.amount} />
                <InfoRow label="Dokumen Lengkap" value={`${documentSummary.verified}/${documentSummary.total}`} />
                <InfoRow label="Menunggu Verifikasi" value={`${documentSummary.review} dokumen`} />
                <InfoRow label="Dokumen Kurang" value={`${documentSummary.missing} dokumen`} />
              </div>
            </Card>

            <RiskExplanationPanel
              score={claim.riskScore}
              level={claim.riskLevel}
              confidence={claim.aiConfidence}
              riskFactors={claim.riskFactors}
              recommendedActions={claim.recommendedActions}
              title="Risiko AI Klaim"
              summary={
                claim.risk ??
                "Tidak ada risiko kritikal yang terdeteksi. Tetap pantau proses klaim sampai verifikasi selesai."
              }
            />

            <Button onClick={() => navigate("/pasien/dashboard")} className="w-full rounded-xl">
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function PatientClaimDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function EmptyClaimState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="max-w-md border-border/60 p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <Button onClick={onAction} className="mt-5 rounded-xl">
          {actionLabel}
        </Button>
      </Card>
    </div>
  );
}

function formatTimelineDate(value: string) {
  if (value === "-") return "Menunggu";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
