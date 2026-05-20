import { Shield, ArrowLeft, Activity, Lock, FileText, Database, Bell, BarChart3, Users, ClipboardCheck, CheckCircle2, History, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import { AppLayout } from "./AppLayout";

interface FeaturesPageProps {
  onBack: () => void;
  onNavigate: (page: "beranda" | "tentang" | "fitur") => void;
}

const MAIN_FEATURES = [
  {
    icon: Activity,
    title: "Pemantauan Status Klaim",
    desc: "Timeline klaim membantu pasien dan admin melihat status pengajuan, validasi dokumen, review, dan keputusan akhir secara terstruktur.",
    points: ["Timeline klaim", "Status aktif dan selesai", "Riwayat klaim demo"],
  },
  {
    icon: ClipboardCheck,
    title: "Checklist Kelengkapan Dokumen",
    desc: "Dokumen seperti SEP, identitas, resume medis, rujukan, billing, dan hasil penunjang ditampilkan sebagai daftar periksa administratif.",
    points: ["Dokumen wajib", "Status terunggah", "Status perlu review"],
  },
  {
    icon: BarChart3,
    title: "Estimasi Risiko Administratif",
    desc: "Skor risiko simulatif membantu menandai klaim yang perlu ditinjau lebih awal berdasarkan kelengkapan dan konsistensi dokumen.",
    points: ["Skor 0–100", "Prioritas review", "Saran perbaikan berbasis aturan"],
  },
  {
    icon: Database,
    title: "Preview Struktur Data EHR Simulatif",
    desc: "Menampilkan contoh struktur data berbasis FHIR untuk menggambarkan potensi pertukaran data, bukan integrasi produksi.",
    points: ["Data contoh", "Partner demo", "Bukan koneksi nyata"],
  },
];

const SUB_FEATURES = [
  { icon: Lock, title: "Konteks Data Simulasi", desc: "Label demo ditampilkan agar pengguna memahami bahwa data bukan data pasien asli." },
  { icon: Bell, title: "Notifikasi Status", desc: "Contoh notifikasi perubahan status klaim dan dokumen yang perlu dilengkapi." },
  { icon: ListChecks, title: "Ringkasan Dokumen", desc: "Admin dapat melihat dokumen lengkap, sebagian, atau belum lengkap dalam satu panel." },
  { icon: Users, title: "Role Pasien dan Rumah Sakit", desc: "Alur pasien dan admin rumah sakit dipisahkan tanpa mengubah logic autentikasi." },
  { icon: History, title: "Riwayat Klaim", desc: "Klaim yang sudah selesai dapat dilihat sebagai arsip demo." },
  { icon: FileText, title: "Pengajuan Klaim Demo", desc: "Form upload PDF dan preview struktur klaim disediakan untuk kebutuhan demonstrasi." },
];

const COMPARISON = [
  { feature: "Pemantauan status klaim", prototype: true, note: "Ditampilkan sebagai timeline demo" },
  { feature: "Checklist kelengkapan dokumen", prototype: true, note: "Berbasis dokumen wajib klaim" },
  { feature: "Estimasi risiko administratif", prototype: true, note: "Simulasi decision-support" },
  { feature: "Ekstraksi dokumen otomatis", prototype: false, note: "Belum diimplementasikan" },
  { feature: "Integrasi BPJS/RS produksi", prototype: false, note: "Tidak diklaim pada prototype" },
  { feature: "Preview data berbasis FHIR", prototype: true, note: "Contoh struktur data, bukan koneksi nyata" },
];

const FeaturesPage = ({ onBack, onNavigate }: FeaturesPageProps) => {
  return (
    <AppLayout>
      <nav className="relative z-10 flex items-center justify-between border-b border-border/70 bg-background/95 px-6 py-5 md:px-12 lg:px-20">
        <button onClick={() => onNavigate("beranda")} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">BPJSight</span>
        </button>
        <div className="hidden items-center gap-8 md:flex">
          <button onClick={() => onNavigate("beranda")} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Beranda</button>
          <button onClick={() => onNavigate("tentang")} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Tentang</button>
          <button className="text-sm font-semibold text-primary">Fitur</button>
        </div>
        <ThemeToggle compact />
      </nav>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-8 lg:px-20">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>

        <Badge variant="outline" className="mb-4 border-primary/30 bg-background px-4 py-2 text-sm font-semibold text-primary">
          Fitur prototype
        </Badge>

        <h1 className="mb-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
          Fitur Administratif untuk Monitoring Klaim BPJS
        </h1>

        <p className="mb-12 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Fitur BPJSight dibuat spesifik untuk demonstrasi alur klaim: status klaim, kelengkapan dokumen, estimasi risiko administratif, dashboard rumah sakit, dan preview data EHR simulatif.
        </p>

        <div className="mb-16 grid gap-6 md:grid-cols-2">
          {MAIN_FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/70 bg-card p-8 transition-colors hover:border-primary/40" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{f.title}</h3>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <ul className="space-y-2">
                {f.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Fitur Pendukung</h2>
        <div className="mb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SUB_FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/40" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h4 className="mb-2 text-base font-bold text-foreground">{f.title}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Cakupan Prototype</h2>
        <div className="mb-16 overflow-hidden rounded-2xl border border-border/70 bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-secondary/50">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-foreground">Kemampuan</th>
                <th className="px-6 py-4 text-center font-bold text-primary">Status</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((c) => (
                <tr key={c.feature} className="border-b border-border/40 last:border-0">
                  <td className="px-6 py-4 text-foreground">{c.feature}</td>
                  <td className="px-6 py-4 text-center">
                    {c.prototype ? <CheckCircle2 className="mx-auto h-5 w-5 text-primary" /> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-10 text-center" style={{ boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="mb-3 text-2xl font-bold text-foreground">Mulai dari alur demo</h3>
          <p className="mb-6 text-sm text-muted-foreground">Coba dashboard pasien atau rumah sakit untuk melihat bagaimana fitur digunakan dalam skenario klaim simulatif.</p>
          <Button onClick={() => onNavigate("beranda")} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Kembali ke Beranda</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default FeaturesPage;
