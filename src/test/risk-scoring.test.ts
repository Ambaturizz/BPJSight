import { describe, it, expect } from "vitest";
import { scoreClaim } from "@/features/risk/scoring";
import type { Claim } from "@/types/claim";

const baseClaim = (overrides: Partial<Claim> = {}): Claim => ({
  id: "1",
  patient: "Test",
  nik: "3275010101010001",
  bpjs: "0001234567890",
  diagnosis: "Test",
  icd10: "Z00",
  amountIDR: 5_000_000,
  submittedAt: "2024-01-01T00:00:00Z",
  status: "aman",
  risk: 0,
  confidence: 0,
  docs: "Lengkap",
  documents: Array.from({ length: 10 }, (_, i) => ({
    key: `d${i}`, label: `Doc ${i}`, uploaded: true, verified: true,
  })),
  audit: [],
  fhirBundleId: "x",
  dpjp: "dr. A",
  ...overrides,
});

describe("scoreClaim", () => {
  it("returns deterministic output for the same input", () => {
    const c = baseClaim();
    expect(scoreClaim(c).score).toBe(scoreClaim(c).score);
  });
  it("low risk when all docs verified and small amount", () => {
    const r = scoreClaim(baseClaim());
    expect(r.level).toBe("rendah");
    expect(r.score).toBeLessThan(40);
  });
  it("high risk when docs incomplete and amount large", () => {
    const docs = Array.from({ length: 10 }, (_, i) => ({
      key: `d${i}`, label: `Doc ${i}`, uploaded: i < 3, verified: i < 2,
    }));
    const r = scoreClaim(baseClaim({ documents: docs, amountIDR: 30_000_000 }));
    expect(r.level === "tinggi" || r.level === "sedang").toBe(true);
    expect(r.factors).toHaveLength(4);
  });
});


