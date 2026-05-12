import type { ClaimDocument, DocumentStatus, HospitalClaim, PatientClaimDocument } from "@/types/claim";

function nowIso() {
  return new Date().toISOString();
}

function cloneFileMeta(file: File) {
  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

function deriveDocumentStatus(documents: ClaimDocument[]): DocumentStatus {
  const verifiedCount = documents.filter((document) => document.verified).length;
  const uploadedCount = documents.filter((document) => document.uploaded).length;

  if (verifiedCount === documents.length) return "Lengkap";
  if (uploadedCount === 0 || verifiedCount <= Math.max(1, Math.floor(documents.length * 0.3))) return "Tidak Lengkap";
  return "Sebagian";
}

function uploadPatientDocument(document: PatientClaimDocument, file: File): PatientClaimDocument {
  return {
    ...document,
    status: "review",
    updatedAt: nowIso(),
    ...cloneFileMeta(file),
  };
}

function approveHospitalDocument(claim: HospitalClaim, documentKey: string): HospitalClaim {
  const documents = claim.documents.map((document) =>
    document.key === documentKey
      ? {
          ...document,
          uploaded: true,
          verified: true,
          reviewStatus: "verified" as const,
          uploadedAt: document.uploadedAt ?? nowIso(),
          note: document.note,
        }
      : document,
  );

  return {
    ...claim,
    documents,
    docs: deriveDocumentStatus(documents),
    audit: [
      ...claim.audit,
      {
        at: nowIso(),
        actor: "Verifikator",
        action: `Dokumen ${claim.documents.find((doc) => doc.key === documentKey)?.label ?? documentKey} disetujui`,
      },
    ],
  };
}

function requestHospitalRevision(claim: HospitalClaim, documentKey: string, note?: string): HospitalClaim {
  const target = claim.documents.find((document) => document.key === documentKey);
  const message = note?.trim() || `Mohon revisi dokumen ${target?.label ?? documentKey}.`;
  const documents = claim.documents.map((document) =>
    document.key === documentKey
      ? {
          ...document,
          uploaded: true,
          verified: false,
          reviewStatus: "revision_requested" as const,
          note: message,
        }
      : document,
  );

  return {
    ...claim,
    documents,
    docs: deriveDocumentStatus(documents),
    revisionRequests: [message, ...claim.revisionRequests.filter((request) => request !== message)],
    audit: [
      ...claim.audit,
      {
        at: nowIso(),
        actor: "Verifikator",
        action: `Revisi diminta untuk ${target?.label ?? documentKey}`,
      },
    ],
  };
}

function addHospitalVerifierNote(claim: HospitalClaim, note: string, documentKey?: string): HospitalClaim {
  const target = documentKey ? claim.documents.find((document) => document.key === documentKey) : undefined;
  const cleanNote = note.trim();
  if (!cleanNote) return claim;

  const documents = documentKey
    ? claim.documents.map((document) =>
        document.key === documentKey
          ? {
              ...document,
              note: cleanNote,
            }
          : document,
      )
    : claim.documents;

  return {
    ...claim,
    documents,
    verifierNotes: [
      target ? `${target.label}: ${cleanNote}` : cleanNote,
      ...claim.verifierNotes,
    ],
    audit: [
      ...claim.audit,
      {
        at: nowIso(),
        actor: "Verifikator",
        action: target ? `Catatan ditambahkan pada ${target.label}` : "Catatan verifikator ditambahkan",
      },
    ],
  };
}

export const claimWorkflowService = {
  uploadPatientDocument,
  approveHospitalDocument,
  requestHospitalRevision,
  addHospitalVerifierNote,
};


