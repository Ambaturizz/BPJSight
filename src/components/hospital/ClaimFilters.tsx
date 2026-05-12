import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type { DocumentStatus } from "@/types/claim";

export type RiskStatusFilter = "all" | "aman" | "sedang" | "berisiko";
export type DocumentStatusFilter = "all" | DocumentStatus;
export type HospitalClaimSort = "risk_desc" | "risk_asc" | "amount_desc" | "amount_asc" | "date_desc";

export interface HospitalClaimFiltersState {
  query: string;
  riskStatus: RiskStatusFilter;
  documentStatus: DocumentStatusFilter;
  riskMin: number;
  riskMax: number;
  sort: HospitalClaimSort;
}

interface ClaimFiltersProps {
  filters: HospitalClaimFiltersState;
  totalClaims: number;
  filteredClaims: number;
  onChange: (patch: Partial<HospitalClaimFiltersState>) => void;
  onReset: () => void;
  onShowAll: () => void;
}

const riskStatusOptions: { value: RiskStatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "aman", label: "Aman" },
  { value: "sedang", label: "Sedang" },
  { value: "berisiko", label: "Berisiko" },
];

const documentStatusOptions: { value: DocumentStatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "Lengkap", label: "Lengkap" },
  { value: "Sebagian", label: "Sebagian" },
  { value: "Tidak Lengkap", label: "Tidak lengkap" },
];

const sortOptions: { value: HospitalClaimSort; label: string }[] = [
  { value: "risk_desc", label: "Risiko tertinggi" },
  { value: "risk_asc", label: "Risiko terendah" },
  { value: "amount_desc", label: "Nilai klaim tertinggi" },
  { value: "amount_asc", label: "Nilai klaim terendah" },
  { value: "date_desc", label: "Terbaru" },
];

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export default function ClaimFilters({
  filters,
  totalClaims,
  filteredClaims,
  onChange,
  onReset,
  onShowAll,
}: ClaimFiltersProps) {
  const hasActiveFilters =
    filters.query.trim().length > 0 ||
    filters.riskStatus !== "all" ||
    filters.documentStatus !== "all" ||
    filters.riskMin !== 0 ||
    filters.riskMax !== 100;

  return (
    <div className="border-b border-border/60 bg-card/60 px-5 py-4 md:px-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter Operasional
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Menampilkan <span className="font-bold text-foreground">{filteredClaims}</span> dari {totalClaims} klaim.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onReset} className="rounded-xl border-border/60">
            <RotateCcw className="h-4 w-4" /> Reset Filter
          </Button>
          <Button size="sm" onClick={onShowAll} className="rounded-xl gradient-primary text-primary-foreground">
            Lihat Semua
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr_0.9fr_1fr]">
        <label className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cari klaim</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Cari nama pasien, diagnosis, atau ID klaim"
              value={filters.query}
              onChange={(event) => onChange({ query: event.target.value })}
              placeholder="Nama pasien, diagnosis, atau ID klaim..."
              className="rounded-xl border-border/60 bg-muted/20 pl-9"
            />
          </div>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status risiko</span>
          <select
            aria-label="Filter status risiko"
            value={filters.riskStatus}
            onChange={(event) => onChange({ riskStatus: event.target.value as RiskStatusFilter })}
            className="h-10 w-full rounded-xl border border-border/60 bg-muted/20 px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          >
            {riskStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dokumen</span>
          <select
            aria-label="Filter status dokumen"
            value={filters.documentStatus}
            onChange={(event) => onChange({ documentStatus: event.target.value as DocumentStatusFilter })}
            className="h-10 w-full rounded-xl border border-border/60 bg-muted/20 px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          >
            {documentStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Urutkan</span>
          <select
            aria-label="Urutkan klaim"
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value as HospitalClaimSort })}
            className="h-10 w-full rounded-xl border border-border/60 bg-muted/20 px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-border/60 bg-background/40 p-4">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rentang skor risiko</p>
          <p className="text-sm font-extrabold text-foreground">
            {Math.min(filters.riskMin, filters.riskMax)}–{Math.max(filters.riskMin, filters.riskMax)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Skor minimum</span>
            <Input
              aria-label="Skor risiko minimum"
              type="number"
              min={0}
              max={100}
              value={filters.riskMin}
              onChange={(event) => onChange({ riskMin: clampScore(Number(event.target.value)) })}
              className="rounded-xl border-border/60 bg-muted/20"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Skor maksimum</span>
            <Input
              aria-label="Skor risiko maksimum"
              type="number"
              min={0}
              max={100}
              value={filters.riskMax}
              onChange={(event) => onChange({ riskMax: clampScore(Number(event.target.value)) })}
              className="rounded-xl border-border/60 bg-muted/20"
            />
          </label>
        </div>

        {hasActiveFilters && (
          <p className="mt-3 text-xs text-muted-foreground">
            Filter aktif. Gunakan <span className="font-semibold text-primary">Lihat Semua</span> untuk reset filter dan menampilkan seluruh klaim.
          </p>
        )}
      </div>
    </div>
  );
}
