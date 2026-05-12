import { Activity, BarChart3, FileWarning, ClipboardCheck } from "lucide-react";
import type { DashboardStat } from "@/types/dashboard";

export const mockStats: DashboardStat[] = [
  {
    label: "Klaim Demo Aktif",
    value: "24",
    icon: Activity,
    change: "Data simulasi",
  },
  {
    label: "Kelengkapan Dokumen",
    value: "78/100",
    icon: ClipboardCheck,
    change: "Rata-rata contoh",
  },
  {
    label: "Nilai Klaim Demo",
    value: "Rp 210 jt",
    icon: BarChart3,
    change: "Nominal simulasi",
  },
  {
    label: "Klaim Berisiko",
    value: "6",
    icon: FileWarning,
    change: "Perlu review",
  },
];
