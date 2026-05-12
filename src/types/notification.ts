import type { UserRole } from "@/types/user";

export type NotificationCategory =
  | "klaim"
  | "ai"
  | "darurat"
  | "jadwal"
  | "obat"
  | "rujukan"
  | "faskes"
  | "dokumen"
  | "fraud"
  | "sistem";

export type NotificationSeverity =
  | "info"
  | "warning"
  | "danger"
  | "success";

export interface NotificationAction {
  label: string;
  path?: string;
}

export interface Notification {
  id: string;
  role: UserRole;
  title: string;
  desc: string;
  time: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  read: boolean;
  action?: NotificationAction;
}




