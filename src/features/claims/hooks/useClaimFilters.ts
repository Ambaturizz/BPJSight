import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import type { Claim, ClaimStatus } from "@/types/claim";

export interface ClaimFilters {
  q: string;
  status: ClaimStatus | "all";
  sort: "date_desc" | "date_asc" | "risk_desc" | "amount_desc";
}

export function useClaimFilters() {
  const [params, setParams] = useSearchParams();
  const filters: ClaimFilters = {
    q: params.get("q") ?? "",
    status: (params.get("status") as ClaimFilters["status"]) || "all",
    sort: (params.get("sort") as ClaimFilters["sort"]) || "date_desc",
  };

  const update = (patch: Partial<ClaimFilters>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v === "all" || v == null) next.delete(k);
      else next.set(k, String(v));
    });
    setParams(next, { replace: true });
  };

  return { filters, update };
}

export function applyFilters(claims: Claim[], f: ClaimFilters): Claim[] {
  let out = claims;
  if (f.q.trim()) {
    const q = f.q.toLowerCase();
    out = out.filter(
      (c) =>
        c.patient.toLowerCase().includes(q) ||
        c.id.includes(q) ||
        c.diagnosis.toLowerCase().includes(q) ||
        c.icd10.toLowerCase().includes(q)
    );
  }
  if (f.status !== "all") out = out.filter((c) => c.status === f.status);
  out = [...out].sort((a, b) => {
    switch (f.sort) {
      case "date_asc": return a.submittedAt.localeCompare(b.submittedAt);
      case "risk_desc": return b.risk - a.risk;
      case "amount_desc": return b.amountIDR - a.amountIDR;
      default: return b.submittedAt.localeCompare(a.submittedAt);
    }
  });
  return out;
}

export function exportClaimsCsv(claims: Claim[]): string {
  const header = ["No", "Pasien", "Diagnosis", "ICD-10", "Nilai (IDR)", "Status", "Risk", "Confidence", "Tanggal"];
  const rows = claims.map((c) => [
    c.id, c.patient, c.diagnosis, c.icd10, c.amountIDR, c.status, c.risk, c.confidence, c.submittedAt,
  ]);
  return [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useFilteredClaims(claims: Claim[]) {
  const { filters, update } = useClaimFilters();
  const data = useMemo(() => applyFilters(claims, filters), [claims, filters]);
  return { data, filters, update };
}


