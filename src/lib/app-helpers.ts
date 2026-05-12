import type { ClaimStatus, RiskLevel } from "@/types/claim";

export function formatCurrencyIDR(value: number | null | undefined): string {
  const safeValue = Number.isFinite(value ?? NaN) ? Number(value) : 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(safeValue);
}

export function formatDateID(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...options,
  }).format(date);
}

function normalizeDigits(value: string | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

function maskDigits(value: string | null | undefined, visibleEnd = 4, groupSize = 4): string {
  const digits = normalizeDigits(value);
  if (!digits) return "-";

  const safeVisibleEnd = Math.max(0, Math.min(visibleEnd, digits.length));
  const visible = digits.slice(-safeVisibleEnd);
  const hiddenLength = Math.max(digits.length - safeVisibleEnd, 0);

  if (hiddenLength === 0) return visible || "-";

  const hidden = "•".repeat(hiddenLength);
  const hiddenChunks = hidden.match(new RegExp(`.{1,${groupSize}}`, "g")) ?? [];

  return [...hiddenChunks, visible].filter(Boolean).join(" ");
}

export function maskNik(nik: string | null | undefined): string {
  return maskDigits(nik, 4, 4);
}

export function maskBpjsNumber(bpjsNumber: string | null | undefined): string {
  return maskDigits(bpjsNumber, 4, 4);
}

export function getRiskLevel(score: number | null | undefined): RiskLevel {
  if (typeof score !== "number" || Number.isNaN(score)) return "rendah";
  if (score >= 70) return "tinggi";
  if (score >= 40) return "sedang";
  return "rendah";
}

export function getClaimStatusLabel(status: ClaimStatus | string | null | undefined): string {
  const labels: Record<string, string> = {
    aman: "Aman",
    sedang: "Perlu Ditinjau",
    berisiko: "Berisiko",
    ditolak: "Ditolak",
    selesai: "Selesai",
    diproses: "Diproses",
  };

  return labels[String(status ?? "").toLowerCase()] ?? "Status tidak diketahui";
}






