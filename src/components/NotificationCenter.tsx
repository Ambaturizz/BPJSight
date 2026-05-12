import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  AlertTriangle,
  ClipboardCheck,
  MapPin,
  Calendar,
  Pill,
  FileText,
  Activity,
  ShieldAlert,
  Database,
  Clock,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { REALTIME_NOTIFICATION_INTERVAL_MS } from "@/constants/app";
import { notificationService } from "@/services/notificationService";
import type {
  Notification as NotificationItem,
  NotificationCategory,
  NotificationSeverity,
} from "@/types/notification";
import type { UserRole } from "@/types/user";

const ICONS: Record<NotificationCategory, ComponentType<{ className?: string }>> = {
  klaim: FileText,
  ai: ClipboardCheck,
  darurat: ShieldAlert,
  jadwal: Calendar,
  obat: Pill,
  rujukan: Activity,
  faskes: MapPin,
  dokumen: FileText,
  fraud: AlertTriangle,
  sistem: Database,
};

const sevTone: Record<NotificationSeverity, string> = {
  info: "bg-info/15 text-info border-info/25",
  warning: "bg-warning/15 text-warning border-warning/25",
  danger: "bg-destructive/15 text-destructive border-destructive/25",
  success: "bg-success/15 text-success border-success/25",
};

const CATEGORY_LABELS: { key: NotificationCategory | "all"; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "klaim", label: "Klaim" },
  { key: "ai", label: "Review" },
  { key: "darurat", label: "Darurat" },
  { key: "jadwal", label: "Jadwal" },
  { key: "dokumen", label: "Dokumen" },
];

interface Props {
  role: UserRole;
}

const NotificationCenter = ({ role }: Props) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<NotificationCategory | "all">("all");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      setIsLoading(true);

      try {
        const notifications = await notificationService.getNotifications(role);

        if (!isMounted) return;

        setItems(notifications);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [role]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (Math.random() > 0.35) return;

      notificationService.createRealtimeNotification(role).then((notification) => {
        setItems((current) => [notification, ...current]);
        toast.info(notification.title, { description: notification.desc });
      });
    }, REALTIME_NOTIFICATION_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [role]);

  const unread = items.filter((item) => !item.read).length;

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.category === filter)),
    [items, filter]
  );

  const markAll = () => {
    if (unread === 0) {
      toast.info("Semua notifikasi sudah dibaca.");
      return;
    }

    setItems((current) => current.map((item) => ({ ...item, read: true })));
    toast.success("Semua notifikasi ditandai sudah dibaca.");
  };

  const toggleRead = (id: string) => {
    let nextRead = false;

    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        nextRead = !item.read;
        return { ...item, read: nextRead };
      })
    );

    toast.success(nextRead ? "Notifikasi ditandai sudah dibaca." : "Notifikasi ditandai belum dibaca.");
  };

  const openNotificationAction = (notification: NotificationItem) => {
    if (!notification.action?.path) {
      toggleRead(notification.id);
      return;
    }

    setItems((current) => current.map((item) => (item.id === notification.id ? { ...item, read: true } : item)));
    setOpen(false);
    toast.info(notification.action.label, { description: notification.title });
    navigate(notification.action.path);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={unread > 0 ? `Buka notifikasi, ${unread} belum dibaca` : "Buka notifikasi"}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-card bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col bg-card p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60 px-5 pb-3 pt-5">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="flex items-center gap-2 text-lg font-bold">
              <Bell className="h-5 w-5 text-primary" /> Notifikasi
              {unread > 0 && (
                <Badge className="border-primary/25 bg-primary/15 text-primary">
                  {unread} baru
                </Badge>
              )}
            </SheetTitle>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={markAll}
              disabled={items.length === 0}
              className="text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Tandai dibaca
            </Button>
          </div>

          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 pt-2">
            {CATEGORY_LABELS.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => setFilter(category.key)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  filter === category.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="mb-3 h-10 w-10 animate-pulse text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Memuat notifikasi...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
            </div>
          ) : (
            filtered.map((notification, index) => {
              const Icon = ICONS[notification.category];

              return (
                <article
                  key={notification.id}
                  className={`rounded-xl border p-3.5 transition-colors hover:border-primary/30 ${
                    notification.read ? "border-border/40 bg-card opacity-75" : "border-border/60 bg-card"
                  }`}
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <div className="flex gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${sevTone[notification.severity]}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug text-foreground">{notification.title}</p>
                        {!notification.read && <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">Baru</span>}
                      </div>

                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notification.desc}</p>

                      <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {notification.time}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRead(notification.id)}
                          className="h-8 rounded-lg text-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {notification.read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                        </Button>

                        {notification.action && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => openNotificationAction(notification)}
                            className="h-8 rounded-lg gradient-primary text-xs text-primary-foreground"
                          >
                            <Eye className="h-3.5 w-3.5" /> {notification.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;


