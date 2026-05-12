import type { LucideIcon } from "lucide-react";

export interface Benefit {
  icon: LucideIcon;
  title: string;
  desc: string;
  covered: boolean;
}

export interface DashboardStat {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
}


