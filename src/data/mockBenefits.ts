import { Activity, CreditCard, Heart, Stethoscope } from "lucide-react";
import type { Benefit } from "@/types/dashboard";

export const mockBenefits: Benefit[] = [
  {
    icon: Stethoscope,
    title: "Rawat Jalan",
    desc: "Konsultasi dokter spesialis di faskes tingkat 1 & 2",
    covered: true,
  },
  {
    icon: Heart,
    title: "Rawat Inap",
    desc: "Perawatan kelas sesuai kepesertaan (Kelas 1)",
    covered: true,
  },
  {
    icon: Activity,
    title: "Tindakan Medis",
    desc: "Operasi dan prosedur sesuai indikasi medis",
    covered: true,
  },
  {
    icon: CreditCard,
    title: "Obat-obatan",
    desc: "Obat generik dan formularium nasional",
    covered: true,
  },
];
