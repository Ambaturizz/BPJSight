import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, X } from "lucide-react";
import type { ClaimFilters } from "../hooks/useClaimFilters";
import type { ClaimStatus } from "@/types/claim";

interface Props {
  filters: ClaimFilters;
  onChange: (patch: Partial<ClaimFilters>) => void;
  onExport: () => void;
  total: number;
}

const STATUSES: { value: ClaimStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "aman", label: "Aman" },
  { value: "sedang", label: "Sedang" },
  { value: "berisiko", label: "Berisiko" },
];

const SORTS: { value: ClaimFilters["sort"]; label: string }[] = [
  { value: "date_desc", label: "Terbaru" },
  { value: "date_asc", label: "Terlama" },
  { value: "risk_desc", label: "Risiko tertinggi" },
  { value: "amount_desc", label: "Nilai terbesar" },
];

export default function ClaimsToolbar({ filters, onChange, onExport, total }: Props) {
  const hasFilters = filters.q || filters.status !== "all" || filters.sort !== "date_desc";
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 md:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Cari klaim"
            placeholder="Cari nama pasien, no klaim, diagnosis, ICD-10..."
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            className="rounded-xl border-border/60 bg-muted/20 pl-9 text-sm"
          />
        </div>
        <select
          aria-label="Filter status"
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value as ClaimFilters["status"] })}
          className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm font-medium text-foreground"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>Status: {s.label}</option>)}
        </select>
        <select
          aria-label="Urutkan"
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as ClaimFilters["sort"] })}
          className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm font-medium text-foreground"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>Urut: {s.label}</option>)}
        </select>
        <Button variant="outline" size="sm" className="rounded-lg" onClick={onExport}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{total} klaim ditampilkan</span>
        {hasFilters && (
          <button
            onClick={() => onChange({ q: "", status: "all", sort: "date_desc" })}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <X className="h-3 w-3" /> Reset filter
          </button>
        )}
      </div>
    </div>
  );
}


