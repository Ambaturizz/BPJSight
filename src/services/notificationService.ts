
import { NOTIFICATION_DELAY_MS } from "@/constants/app";
import {
  mockHospitalNotifications,
  mockPatientNotifications,
} from "@/data/mockNotifications";
import type { Notification } from "@/types/notification";
import type { UserRole } from "@/types/user";

function delay<T>(data: T, ms = NOTIFICATION_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), ms);
  });
}

function cloneNotification(notification: Notification): Notification {
  return { ...notification };
}

async function getNotifications(role: UserRole): Promise<Notification[]> {
  const source =
    role === "patient"
      ? mockPatientNotifications
      : mockHospitalNotifications;

  return delay(source.map(cloneNotification));
}

async function createRealtimeNotification(role: UserRole): Promise<Notification> {
  const notification: Notification =
    role === "patient"
      ? {
          id: `rt-${Date.now()}`,
          role,
          title: "Update klaim real-time",
          desc: "Status klaim Anda baru saja diperbarui oleh sistem.",
          time: "Baru saja",
          category: "klaim",
          severity: "info",
          read: false,
          action: { label: "Lihat klaim", path: "/pasien/dashboard" },
        }
      : {
          id: `rt-${Date.now()}`,
          role,
          title: "Klaim baru masuk antrean",
          desc: "Sistem AI sedang menganalisis risiko klaim baru.",
          time: "Baru saja",
          category: "ai",
          severity: "info",
          read: false,
          action: { label: "Buka antrean", path: "/rumah-sakit/dashboard" },
        };

  return delay(notification, 120);
}

export const notificationService = {
  getNotifications,
  createRealtimeNotification,
};


