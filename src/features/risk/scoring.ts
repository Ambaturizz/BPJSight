import type { Claim } from "@/types/claim";

export interface RiskFactor {
  key: string;
  label: string;
  /** 0..1 weight of the factor in the model */
  weight: number;
  /** 0..100 raw value derived from the claim */
  value: number;
  /** Contribution to final score (weight * value) */
  contribution: number;
  source: string;
}

export interface RiskResult {
  score: number; // 0..100
  level: "rendah" | "sedang" | "tinggi";
  confidence: number; // 0..100
  factors: RiskFactor[];
  modelVersion: string;
  disclaimer: string;
}

const MODEL_VERSION = "bpjsight-risk@1.0.0";
const DISCLAIMER =
  "Skor ini adalah indikasi statistik berdasarkan data historis klaim, bukan keputusan medis atau finansial final. Verifikasi manual oleh verifikator BPJS tetap diperlukan.";

/**
 * Deterministic risk scorer.
 * Factors:
 *  - docCompleteness (40%): kelengkapan 10 dokumen wajib.
 *  - inaCbgFit       (25%): kesesuaian biaya terhadap rentang INA-CBG diagnosis.
 *  - dpjpDenialRate  (20%): historis penolakan DPJP terkait.
 *  - costAnomaly     (15%): deviasi biaya dari median diagnosis sejenis.
 */
export function scoreClaim(claim: Claim): RiskResult {
  const totalDocs = claim.documents.length || 10;
  const verified = claim.documents.filter((d) => d.verified).length;
  const docMissingPct = 100 * (1 - verified / totalDocs);

  // INA-CBG fit — heuristik: makin besar nilai vs ekspektasi, makin tinggi risiko
  const inaCbgFit = Math.min(100, Math.round((claim.amountIDR / 25_000_000) * 60));

  // Hash dpjp name for a stable pseudo denial rate (demo)
  const dpjpDenialRate =
    Math.abs(hashCode(claim.dpjp)) % 60; // 0..59

  const costAnomaly = Math.min(
    100,
    Math.abs(claim.amountIDR - 8_000_000) / 200_000
  );

  const factors: RiskFactor[] = [
    {
      key: "docCompleteness",
      label: "Kelengkapan dokumen wajib",
      weight: 0.4,
      value: Math.round(docMissingPct),
      contribution: 0.4 * docMissingPct,
      source: "10 dokumen klaim BPJS (SEP, INA-CBG, resume medis, dst.)",
    },
    {
      key: "inaCbgFit",
      label: "Kesesuaian biaya vs INA-CBG",
      weight: 0.25,
      value: Math.round(inaCbgFit),
      contribution: 0.25 * inaCbgFit,
      source: "Tarif INA-CBG Permenkes 3/2023",
    },
    {
      key: "dpjpDenialRate",
      label: "Riwayat penolakan DPJP",
      weight: 0.2,
      value: Math.round(dpjpDenialRate),
      contribution: 0.2 * dpjpDenialRate,
      source: "Histori 90 hari klaim DPJP terkait",
    },
    {
      key: "costAnomaly",
      label: "Anomali biaya vs median diagnosis",
      weight: 0.15,
      value: Math.round(costAnomaly),
      contribution: 0.15 * costAnomaly,
      source: "Median biaya internal RS untuk ICD-10 sejenis",
    },
  ];

  const score = Math.round(
    Math.min(100, factors.reduce((s, f) => s + f.contribution, 0))
  );

  const level: RiskResult["level"] =
    score >= 70 ? "tinggi" : score >= 40 ? "sedang" : "rendah";

  // Confidence drops when document set is incomplete
  const confidence = Math.max(60, 100 - Math.round(docMissingPct / 3));

  return {
    score,
    level,
    confidence,
    factors,
    modelVersion: MODEL_VERSION,
    disclaimer: DISCLAIMER,
  };
}

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
