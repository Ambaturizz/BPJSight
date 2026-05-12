import { describe, expect, it } from "vitest";
import {
  formatCurrencyIDR,
  formatDateID,
  getClaimStatusLabel,
  getRiskLevel,
  maskBpjsNumber,
  maskNik,
} from "@/lib/app-helpers";

describe("app helpers", () => {
  it("formats currency and date for Indonesian locale", () => {
    expect(formatCurrencyIDR(1250000)).toContain("Rp");
    expect(formatDateID("2026-05-12T00:00:00+07:00")).toMatch(/2026/);
  });

  it("masks sensitive identifiers", () => {
    expect(maskNik("3275010101010001")).toContain("0001");
    expect(maskNik("3275010101010001")).not.toContain("327501010101");
    expect(maskBpjsNumber("0001234567890")).toContain("7890");
  });

  it("returns risk level and claim status labels", () => {
    expect(getRiskLevel(85)).toBe("tinggi");
    expect(getRiskLevel(50)).toBe("sedang");
    expect(getRiskLevel(10)).toBe("rendah");
    expect(getClaimStatusLabel("berisiko")).toBe("Berisiko");
  });
});


