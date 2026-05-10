import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell, AlertTriangle, CheckCircle2, Sparkles, MapPin, Calendar,
  Pill, FileText, Activity, Building2, ShieldAlert, Database, Clock
} from "lucide-react";

type Category = "klaim" | "ai" | "darurat" | "jadwal" | "obat" | "rujukan" | "faskes" | "dokumen" | "fraud" | "sistem";
type Severity = "info" | "warning" | "danger" | "success";

export interface NotifItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  category: Category;
  severity: Severity;
  read: boolean;
}

const PATIENT_NOTIFS: NotifItem[] = [
  { id: "p1", title: "Klaim KLM-2024-002 berisiko ditolak", desc: "AI mendeteksi dokumentasi rekam medis tidak lengkap. Hubungi RS MBG.", time: "5 menit lalu", category: "ai", severity: "danger", read: false },
  { id: "p2", title: "Status klaim diperbarui", desc: "KLM-2024-001 kini dalam tahap verifikasi BPJS Kesehatan.", time: "1 jam lalu", category: "klaim", severity: "info", read: false },
  { id: "p3", title: "Pengingat janji temu", desc: "Konsultasi Poli Jantung besok pukul 09:00 di RS MBG.", time: "3 jam lalu", category: "jadwal", severity: "info", read: false },
  { id: "p4", title: "Klinik baru di sekitar Anda", desc: "Klinik Pratama Sehat (1.2 km) menerima BPJS — buka 24 jam.", time: "Kemarin", category: "faskes", severity: "info", read: true },
  { id: "p5", title: "Resep harus segera ditebus", desc: "Resep dr. Andini berlaku 3 hari lagi di Apotek Kimia Farma.", time: "Kemarin", category: "obat", severity: "warning", read: true },
  { id: "p6", title: "Rujukan disetujui", desc: "Rujukan ke Sp.JP RSUP telah dikonfirmasi BPJS.", time: "2 hari lalu", category: "rujukan", severity: "success", read: true },
  { id: "p7", title: "Peringatan kesehatan wilayah", desc: "DBD meningkat di area Anda — lakukan 3M plus.", time: "3 hari lalu", category: "darurat", severity: "warning", read: true },
];

const HOSPITAL_NOTIFS: NotifItem[] = [
  { id: "h1", title: "9 klaim risiko tinggi terdeteksi", desc: "Skor AI > 70. Cek INA-CBG's coding dan kelengkapan dokumen.", time: "Baru saja", category: "ai", severity: "danger", read: false },
  { id: "h2", title: "Dokumen kurang: Klaim #9 Freya Aninditha", desc: "Resume medis DPJP belum diunggah.", time: "10 menit lalu", category: "dokumen", severity: "warning", read: false },
  { id: "h3", title: "Anomali pola klaim terdeteksi", desc: "5 klaim diagnosis identik dalam 1 jam — verifikasi fraud.", time: "30 menit lalu", category: "fraud", severity: "danger", read: false },
  { id: "h4", title: "Deadline klaim 3 hari lagi", desc: "12 klaim bulan ini belum disubmit ke BPJS Kesehatan.", time: "1 jam lalu", category: "klaim", severity: "warning", read: false },
  { id: "h5", title: "Pasien IGD prioritas", desc: "Pasien Aurora Senja masuk IGD — kondisi kritis.", time: "2 jam lalu", category: "darurat", severity: "danger", read: true },
  { id: "h6", title: "Rekomendasi AI baru", desc: "Optimasi klaim rawat inap dapat naikkan approval +4.2%.", time: "Hari ini", category: "ai", severity: "info", read: true },
  { id: "h7", title: "Integrasi HL7 FHIR berhasil", desc: "Sinkronisasi 248 rekam medis dengan SatuSehat selesai.", time: "Kemarin", category: "sistem", severity: "success", read: true },
];

const ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  klaim: FileText, ai: Sparkles, darurat: ShieldAlert, jadwal: Calendar,
  obat: Pill, rujukan: Activity, faskes: MapPin, dokumen: FileText,
  fraud: AlertTriangle, sistem: Database,
};

const sevTone: Record<Severity, string> = {
  info: "bg-info/15 text-info border-info/25",
  warning: "bg-warning/15 text-warning border-warning/25",
  danger: "bg-destructive/15 text-destructive border-destructive/25",
  success: "bg-success/15 text-success border-success/25",
};

const CATEGORY_LABELS: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "klaim", label: "Klaim" },
  { key: "ai", label: "AI" },
  { key: "darurat", label: "Darurat" },
  { key: "jadwal", label: "Jadwal" },
  { key: "dokumen", label: "Dokumen" },
];

interface Props { role: "patient" | "hospital" }

const NotificationCenter = ({ role }: Props) => {
  const seed = role === "patient" ? PATIENT_NOTIFS : HOSPITAL_NOTIFS;
  const [items, setItems] = useState<NotifItem[]>(seed);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [open, setOpen] = useState(false);

  // Simulated real-time push
  useEffect(() => {
    const t = setInterval(() => {
      setItems(prev => {
        if (Math.random() > 0.35) return prev;
        const news: NotifItem = role === "patient"
          ? { id: `rt-${Date.now()}`, title: "Update klaim real-time", desc: "Status klaim Anda baru saja diperbarui oleh sistem.", time: "Baru saja", category: "klaim", severity: "info", read: false }
          : { id: `rt-${Date.now()}`, title: "Klaim baru masuk antrean", desc: "Sistem AI sedang menganalisis risiko klaim baru.", time: "Baru saja", category: "ai", severity: "info", read: false };
        return [news, ...prev];
      });
    }, 45_000);
    return () => clearInterval(t);
  }, [role]);

  const unread = items.filter(i => !i.read).length;
  const filtered = useMemo(
    () => filter === "all" ? items : items.filter(i => i.category === filter),
    [items, filter]
  );

  const markAll = () => setItems(items.map(i => ({ ...i, read: true })));
  const toggleRead = (id: string) =>
    setItems(items.map(i => i.id === id ? { ...i, read: !i.read } : i));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive border-2 border-card flex items-center justify-center text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-card">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Notifikasi
              {unread > 0 && <Badge className="bg-primary/15 text-primary border-primary/25">{unread} baru</Badge>}
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={markAll} className="text-xs">Tandai dibaca</Button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pt-2 pb-1 -mx-1 px-1">
            {CATEGORY_LABELS.map(c => (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  filter === c.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
            </div>
          ) : filtered.map((n, idx) => {
            const Icon = ICONS[n.category];
            return (
              <button
                key={n.id}
                onClick={() => toggleRead(n.id)}
                className={`animate-slide-up w-full text-left rounded-xl border p-3.5 transition-all hover:shadow-md ${
                  n.read ? "bg-card border-border/40 opacity-70" : "bg-card border-border/60"
                }`}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="flex gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${sevTone[n.severity]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground leading-snug">{n.title}</p>
                      {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.desc}</p>
                    <p className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {n.time}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
