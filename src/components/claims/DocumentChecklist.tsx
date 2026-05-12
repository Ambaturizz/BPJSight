import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  MessageSquarePlus,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DocumentUpload from "@/components/claims/DocumentUpload";
import type { ClaimDocument, PatientClaimDocument } from "@/types/claim";

type ChecklistMode = "patient" | "hospital";

type ChecklistDocument = PatientClaimDocument | ClaimDocument;

interface DocumentChecklistProps {
  documents: ChecklistDocument[];
  mode: ChecklistMode;
  title?: string;
  description?: string;
  onUpload?: (documentKey: string, file: File) => void;
  onApprove?: (documentKey: string) => void;
  onRequestRevision?: (documentKey: string) => void;
  onAddNote?: (documentKey: string) => void;
}

interface NormalizedDocument {
  key: string;
  label: string;
  uploaded: boolean;
  verified: boolean;
  waitingVerification: boolean;
  revisionRequested: boolean;
  optional: boolean;
  fileName?: string;
  uploadedAt?: string;
  note?: string;
}

const statusTone = {
  verified: "border-success/25 bg-success/15 text-success",
  waiting: "border-warning/25 bg-warning/15 text-warning",
  missing: "border-destructive/25 bg-destructive/15 text-destructive",
  revision: "border-destructive/25 bg-destructive/15 text-destructive",
};

function normalizeDocument(document: ChecklistDocument): NormalizedDocument {
  if ("status" in document) {
    return {
      key: document.key,
      label: document.label,
      uploaded: document.status !== "missing",
      verified: document.status === "verified",
      waitingVerification: document.status === "review",
      revisionRequested: false,
      optional: Boolean(document.optional),
      fileName: document.fileName,
      uploadedAt: document.updatedAt,
    };
  }

  return {
    key: document.key,
    label: document.label,
    uploaded: document.uploaded,
    verified: document.verified,
    waitingVerification: document.uploaded && !document.verified && document.reviewStatus !== "revision_requested",
    revisionRequested: document.reviewStatus === "revision_requested",
    optional: Boolean(document.optional),
    fileName: document.fileName,
    uploadedAt: document.uploadedAt,
    note: document.note,
  };
}

function getStatus(document: NormalizedDocument) {
  if (document.verified) {
    return {
      label: "Lengkap",
      description: "Dokumen sudah lengkap dan terverifikasi.",
      tone: statusTone.verified,
      icon: CheckCircle2,
    };
  }

  if (document.revisionRequested) {
    return {
      label: "Perlu Revisi",
      description: "Dokumen perlu diperbaiki sebelum verifikasi dilanjutkan.",
      tone: statusTone.revision,
      icon: AlertTriangle,
    };
  }

  if (document.uploaded || document.waitingVerification) {
    return {
      label: "Menunggu Verifikasi",
      description: "Dokumen sudah diunggah dan sedang menunggu verifikasi.",
      tone: statusTone.waiting,
      icon: Clock,
    };
  }

  return {
    label: "Belum Lengkap",
    description: document.optional ? "Dokumen opsional belum tersedia." : "Dokumen wajib belum tersedia.",
    tone: statusTone.missing,
    icon: AlertTriangle,
  };
}

function formatUploadedAt(value?: string) {
  if (!value || value === "-") return null;
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

export default function DocumentChecklist({
  documents,
  mode,
  title = "Checklist Dokumen Klaim",
  description = "Pantau kelengkapan dokumen wajib sebelum proses verifikasi dilanjutkan.",
  onUpload,
  onApprove,
  onRequestRevision,
  onAddNote,
}: DocumentChecklistProps) {
  const normalizedDocuments = documents.map(normalizeDocument);
  const verifiedCount = normalizedDocuments.filter((document) => document.verified).length;
  const waitingCount = normalizedDocuments.filter((document) => document.uploaded && !document.verified).length;
  const missingCount = normalizedDocuments.filter((document) => !document.uploaded).length;

  return (
    <Card className="border-border/60 p-4 sm:p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="border border-success/25 bg-success/15 text-success text-xs font-bold">
            <CheckCircle2 className="mr-1 h-3 w-3" /> {verifiedCount} lengkap
          </Badge>
          <Badge className="border border-warning/25 bg-warning/15 text-warning text-xs font-bold">
            <Clock className="mr-1 h-3 w-3" /> {waitingCount} verifikasi
          </Badge>
          <Badge className="border border-destructive/25 bg-destructive/15 text-destructive text-xs font-bold">
            <AlertTriangle className="mr-1 h-3 w-3" /> {missingCount} kurang
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {normalizedDocuments.map((document, index) => {
          const state = getStatus(document);
          const uploadedAt = formatUploadedAt(document.uploadedAt);
          return (
            <div key={document.key} className="rounded-2xl border border-border/60 bg-card/60 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">
                  {mode === "hospital" ? index + 1 : <FileText className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{document.label}</p>
                    {document.optional && (
                      <Badge variant="outline" className="text-[10px]">Opsional</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{state.description}</p>

                  {document.fileName && (
                    <p className="mt-2 truncate rounded-lg bg-muted/60 px-2 py-1 text-xs font-medium text-foreground" title={document.fileName}>
                      File: {document.fileName}
                    </p>
                  )}
                  {uploadedAt && <p className="mt-1 text-xs text-muted-foreground">Update: {uploadedAt}</p>}
                  {document.note && (
                    <p className="mt-2 rounded-lg border border-warning/25 bg-warning/10 px-2 py-1 text-xs leading-relaxed text-warning">
                      Catatan: {document.note}
                    </p>
                  )}

                  <Badge className={`${state.tone} mt-3 border text-xs font-bold`}>
                    <state.icon className="mr-1 h-3 w-3" /> {state.label}
                  </Badge>

                  {mode === "patient" && !document.uploaded && onUpload && (
                    <div className="mt-3">
                      <DocumentUpload
                        compact
                        documentKey={document.key}
                        label={document.label}
                        onUpload={(file) => onUpload(document.key, file)}
                      />
                    </div>
                  )}

                  {mode === "hospital" && (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {document.uploaded && !document.verified && onApprove && (
                        <Button size="sm" className="rounded-xl" onClick={() => onApprove(document.key)}>
                          <ShieldCheck className="h-4 w-4" /> Setujui Dokumen
                        </Button>
                      )}
                      {document.uploaded && !document.verified && onRequestRevision && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-warning/30 text-warning hover:bg-warning/15"
                          onClick={() => onRequestRevision(document.key)}
                        >
                          <AlertTriangle className="h-4 w-4" /> Minta Revisi
                        </Button>
                      )}
                      {onAddNote && (
                        <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => onAddNote(document.key)}>
                          <MessageSquarePlus className="h-4 w-4" /> Tambahkan Catatan
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}


