import { Activity, BarChart3, FileWarning, TrendingUp } from "lucide-react";
import type { DashboardStat } from "@/types/dashboard";

export const mockStats: DashboardStat[] = [
  {
    label: "Total Klaim Aktif",
    value: "342",
    icon: Activity,
    change: "+12 hari ini",
  },
  {
    label: "Tingkat Persetujuan",
    value: "94.2%",
    icon: TrendingUp,
    change: "+1.5% dari bulan lalu",
  },
  {
    label: "Nilai Klaim Diproses",
    value: "Rp 2.1M",
    icon: BarChart3,
    change: "7 hari terakhir",
  },
  {
    label: "Prediksi Berisiko",
    value: "18",
    icon: FileWarning,
    change: "Perlu tindakan",
  },
];
