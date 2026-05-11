import { describe, it, expect } from "vitest";
import { applyFilters } from "@/features/claims/hooks/useClaimFilters";
import type { Claim } from "@/types/claim";

const make = (id: string, p: Partial<Claim>): Claim => ({
  id, patient: "X", nik: "0", bpjs: "0", diagnosis: "Diag", icd10: "Z00",
  amountIDR: 1_000_000, submittedAt: "2024-01-01T00:00:00Z", status: "aman",
  risk: 10, confidence: 90, docs: "Lengkap", documents: [], audit: [],
  fhirBundleId: "x", dpjp: "dr.", ...p,
});

describe("applyFilters", () => {
  const data: Claim[] = [
    make("1", { patient: "Aurora Senja", status: "berisiko", risk: 85, submittedAt: "2024-03-01T00:00:00Z", amountIDR: 12_000_000 }),
    make("2", { patient: "Kenzie Althaf", status: "aman", risk: 25, submittedAt: "2024-03-05T00:00:00Z", amountIDR: 3_000_000 }),
    make("3", { patient: "Alesha Zefanya", status: "sedang", risk: 55, submittedAt: "2024-03-03T00:00:00Z", amountIDR: 8_000_000 }),
  ];

  it("filters by query (patient name)", () => {
    expect(applyFilters(data, { q: "aurora", status: "all", sort: "date_desc" })).toHaveLength(1);
  });
  it("filters by status", () => {
    expect(applyFilters(data, { q: "", status: "berisiko", sort: "date_desc" }).map(c => c.id)).toEqual(["1"]);
  });
  it("sorts by risk_desc", () => {
    expect(applyFilters(data, { q: "", status: "all", sort: "risk_desc" }).map(c => c.id)).toEqual(["1", "3", "2"]);
  });
  it("sorts by date_desc by default", () => {
    expect(applyFilters(data, { q: "", status: "all", sort: "date_desc" }).map(c => c.id)).toEqual(["2", "3", "1"]);
  });
});
