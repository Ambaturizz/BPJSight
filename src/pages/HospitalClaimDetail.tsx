import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  ClipboardCheck,
  FileText,
  Hash,
  Inbox,
  MessageSquarePlus,
  MessageSquareWarning,
  Receipt,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import DocumentChecklist from "@/components/claims/DocumentChecklist";
import RiskExplanationPanel from "@/components/ai/RiskExplanationPanel";
import { claimsService } from "@/services/claimsService";
import { claimWorkflowService } from "@/services/claimWorkflowService";
import { formatDate, formatDateTime, formatIDR, maskNik } from "@/lib/formatters";
import type { ClaimStatus, DocumentStatus, HospitalClaim } from "@/types/claim";

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

const documentTone: Record<DocumentStatus, string> = {
  Lengkap: "bg-success/15 text-success border-success/25",
  Sebagian: "bg-warning/15 text-warning border-warning/25",
  "Tidak Lengkap": "bg-destructive/15 text-destructive border-destructive/25",
};

export default function HospitalClaimDetail() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<HospitalClaim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewed, setReviewed] = useState(false);
  const [revisionRequested, setRevisionRequested] = useState(false);
  const [noteDialog, setNoteDialog] = useState<{ documentKey?: string; documentLabel?: string } | null>(null);
  const [noteValue, setNoteValue] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadClaim() {
      setIsLoading(true);
      try {
        const data = claimId ? await claimsService.getHospitalClaimById(claimId) : undefined;
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
    if (!claim) return { total: 0, verified: 0, uploaded: 0, missing: 0, waiting: 0 };

    return claim.documents.reduce(
      (summary, document) => ({
        total: summary.total,
        verified: summary.verified + (document.verified ? 1 : 0),
        uploaded: summary.uploaded + (document.uploaded ? 1 : 0),
        missing: summary.missing + (!document.uploaded ? 1 : 0),
        waiting: summary.waiting + (document.uploaded && !document.verified ? 1 : 0),
      }),
      { total: claim.documents.length, verified: 0, uploaded: 0, missing: 0, waiting: 0 },
    );
  }, [claim]);

  const handleMarkReviewed = () => {
    setReviewed(true);
    toast.success("Klaim ditandai sudah direview.");
  };

  const handleRequestRevision = () => {
    setRevisionRequested(true);
    setClaim((currentClaim) => {
      if (!currentClaim) return currentClaim;
      const firstWaitingDocument = currentClaim.documents.find((document) => document.uploaded && !document.verified);
      if (!firstWaitingDocument) return currentClaim;
      return claimWorkflowService.requestHospitalRevision(currentClaim, firstWaitingDocument.key);
    });
    toast.warning("Permintaan revisi dokumen dibuat untuk klaim ini.");
  };

  const handleApproveDocument = (documentKey: string) => {
    setClaim((currentClaim) => {
      if (!currentClaim) return currentClaim;
      return claimWorkflowService.approveHospitalDocument(currentClaim, documentKey);
    });
    toast.success("Dokumen disetujui dan status checklist diperbarui.");
  };

  const handleApproveUploadedDocuments = () => {
    setClaim((currentClaim) => {
      if (!currentClaim) return currentClaim;
      const waitingDocuments = currentClaim.documents.filter((document) => document.uploaded && !document.verified);
      return waitingDocuments.reduce(
        (updatedClaim, document) => claimWorkflowService.approveHospitalDocument(updatedClaim, document.key),
        currentClaim,
      );
    });
    toast.success("Semua dokumen yang sudah diunggah ditandai disetujui.");
  };

  const handleRequestDocumentRevision = (documentKey: string) => {
    setClaim((currentClaim) => {
      if (!currentClaim) return currentClaim;
      return claimWorkflowService.requestHospitalRevision(currentClaim, documentKey);
    });
    toast.warning("Permintaan revisi dibuat untuk dokumen terpilih.");
  };

  const handleOpenNote = (documentKey?: string) => {
    const documentLabel = claim?.documents.find((document) => document.key === documentKey)?.label;
    setNoteDialog({ documentKey, documentLabel });
    setNoteValue("");
  };

  const handleSubmitNote = () => {
    const cleanNote = noteValue.trim();
    if (!cleanNote) {
      toast.error("Catatan belum diisi.");
      return;
    }

    setClaim((currentClaim) => {
      if (!currentClaim) return currentClaim;
      return claimWorkflowService.addHospitalVerifierNote(currentClaim, cleanNote, noteDialog?.documentKey);
    });
    toast.success("Catatan verifikator berhasil ditambahkan.");
    setNoteDialog(null);
    setNoteValue("");
  };

  if (isLoading) {
    return <HospitalClaimDetailSkeleton />;
  }

  if (!claim) {
    return (
      <EmptyClaimState
        title="Klaim tidak ditemukan"
        description={`Klaim ${claimId ?? "yang dipilih"} tidak tersedia di data rumah sakit demo.`}
        actionLabel="Kembali ke Dashboard Rumah Sakit"
        onAction={() => navigate("/rumah-sakit/dashboard")}
      />
    );
  }

  const maskedPatient = maskPatientName(claim.patient);
  const hasWaitingDocument = claim.documents.some((document) => document.uploaded && !document.verified);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 glass-card px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali ke dashboard" onClick={() => navigate("/rumah-sakit/dashboard")} className="rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
              <Receipt className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="truncate font-bold tracking-tight text-foreground">Detail Klaim Rumah Sakit</span>
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
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Klaim #{claim.id}</p>
              <Badge className={`${statusTone[claim.status]} border text-xs font-bold sm:hidden`}>
                {statusLabel[claim.status]}
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{claim.diagnosis}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" /> Diajukan {formatDate(claim.submittedAt)}
              <span className="text-muted-foreground/50">•</span>
              <Stethoscope className="h-4 w-4 text-primary" /> {claim.dpjp}
            </p>
          </div>

          <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <Button
              variant="outline"
              onClick={handleApproveUploadedDocuments}
              disabled={!hasWaitingDocument}
              className="rounded-xl border-success/30 text-success hover:bg-success/15"
            >
              <ShieldCheck className="h-4 w-4" /> Setujui Dokumen
            </Button>
            <Button
              variant="outline"
              onClick={handleRequestRevision}
              disabled={revisionRequested || !hasWaitingDocument}
              className="rounded-xl border-warning/30 text-warning hover:bg-warning/15"
            >
              <MessageSquareWarning className="h-4 w-4" />
              {revisionRequested ? "Revisi Diminta" : "Minta Revisi"}
            </Button>
            <Button variant="outline" onClick={() => handleOpenNote()} className="rounded-xl">
              <MessageSquarePlus className="h-4 w-4" /> Tambahkan Catatan
            </Button>
            <Button onClick={handleMarkReviewed} disabled={reviewed} className="rounded-xl">
              <ClipboardCheck className="h-4 w-4" />
              {reviewed ? "Sudah Direview" : "Tandai Sudah Direview"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border/60 p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Data Klaim</h2>
                  <p className="text-sm text-muted-foreground">Identitas pasien ditampilkan dalam format masking untuk keamanan prototype.</p>
                </div>
                <Badge className={`${documentTone[claim.docs]} border text-xs font-bold`}>{claim.docs}</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Info icon={Hash} label="ID Klaim" value={`#${claim.id}`} />
                <Info icon={UserRound} label="Nama Pasien" value={maskedPatient} />
                <Info icon={Hash} label="NIK" value={maskNik(claim.nik)} />
                <Info icon={Hash} label="No. BPJS" value={maskBpjs(claim.bpjs)} />
                <Info icon={Stethoscope} label="Diagnosis" value={`${claim.diagnosis} (${claim.icd10})`} />
                <Info icon={Receipt} label="Nilai Klaim" value={formatIDR(claim.amountIDR)} />
              </div>
            </Card>

            <DocumentChecklist
              mode="hospital"
              documents={claim.documents}
              title="Checklist Dokumen Klaim"
              description={`${documentSummary.verified}/${documentSummary.total} dokumen terverifikasi • ${documentSummary.waiting} menunggu verifikasi • ${documentSummary.missing} belum diunggah.`}
              onApprove={handleApproveDocument}
              onRequestRevision={handleRequestDocumentRevision}
              onAddNote={handleOpenNote}
            />

            <Card className="border-border/60 p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Catatan Verifikator</h2>
                  <p className="text-sm text-muted-foreground">Catatan operasional untuk proses review klaim.</p>
                </div>
                <FileText className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-3">
                {claim.verifierNotes.map((note) => (
                  <div key={note} className="flex gap-3 rounded-2xl border border-border/60 bg-card/60 p-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <RiskExplanationPanel
              score={claim.risk}
              level={claim.riskLevel}
              confidence={claim.confidence}
              riskFactors={claim.riskFactors}
              recommendedActions={claim.recommendedActions}
              title="Skor Risiko Administratif"
              summary="Skor ini membantu admin menentukan prioritas review dokumen sebelum klaim dikirim atau diproses lebih lanjut."
            />

            <Card className="border-border/60 p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-foreground">Permintaan Revisi</h2>
              <div className="mt-4 space-y-3">
                {claim.revisionRequests.map((request, index) => (
                  <div key={`${request}-${index}`} className="flex gap-3 rounded-2xl border border-border/60 bg-card/60 p-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{request}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border/60 p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-foreground">Audit Singkat</h2>
              <div className="mt-4 space-y-3">
                {claim.audit.map((entry, index) => (
                  <div key={`${entry.action}-${entry.at}-${index}`} className="rounded-2xl border border-border/60 bg-card/60 p-3">
                    <p className="text-sm font-bold text-foreground">{entry.action}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{entry.actor} • {formatDateTime(entry.at)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={Boolean(noteDialog)} onOpenChange={(open) => !open && setNoteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambahkan Catatan Verifikator</DialogTitle>
            <DialogDescription>
              {noteDialog?.documentLabel
                ? `Catatan ini akan dikaitkan dengan dokumen ${noteDialog.documentLabel}.`
                : "Catatan ini akan ditambahkan ke klaim secara umum."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteValue}
            onChange={(event) => setNoteValue(event.target.value)}
            placeholder="Contoh: Perlu validasi ulang tanda tangan DPJP dan tanggal tindakan."
            className="min-h-28"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog(null)} className="rounded-xl">
              Batal
            </Button>
            <Button onClick={handleSubmitNote} className="rounded-xl">
              Simpan Catatan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function HospitalClaimDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
          <Skeleton className="h-[32rem] rounded-2xl" />
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

function maskPatientName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      if (part.length <= 2) return `${part[0] ?? ""}•`;
      return `${part[0]}${"•".repeat(Math.min(part.length - 1, 5))}`;
    })
    .join(" ");
}

function maskBpjs(bpjs: string) {
  if (bpjs.length <= 4) return "••••";
  return `•••• •••• •${bpjs.slice(-4)}`;
}


