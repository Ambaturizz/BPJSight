import type { RiskLevel } from "@/types/claim";
import { getRiskLevel } from "@/lib/app-helpers";

const riskLevelLabels: Record<RiskLevel, string> = {
  rendah: "Risiko Rendah",
  sedang: "Risiko Sedang",
  tinggi: "Risiko Tinggi",
};

export function getRiskLevelFromScore(score?: number | null): RiskLevel {
  return getRiskLevel(score);
}

export function getRiskLevelLabel(level: RiskLevel): string {
  return riskLevelLabels[level];
}


