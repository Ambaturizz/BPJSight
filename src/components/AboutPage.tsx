import { Shield, Target, Heart, Users, ArrowLeft, CheckCircle2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";

interface AboutPageProps {
  onBack: () => void;
  onNavigate: (page: "beranda" | "tentang" | "fitur") => void;
}

const VALUES = [
  { icon: Heart, title: "Empati", desc: "Menampilkan informasi klaim dengan bahasa yang mudah dipahami pasien." },
  { icon: Shield, title: "Transparansi", desc: "Memberi konteks bahwa seluruh data pada prototype adalah data simulasi." },
  { icon: ClipboardCheck, title: "Ketelitian Administratif", desc: "Membantu mengecek kelengkapan dokumen sebelum klaim masuk tahap verifikasi." },
  { icon: Users, title: "Kolaborasi", desc: "Menggambarkan alur kerja pasien dan rumah sakit tanpa mengklaim integrasi produksi." },
];

const ROADMAP = [
  { year: "2024", event: "Perancangan alur klaim pasien dan rumah sakit berbasis data contoh." },
  { year: "2025", event: "Pengembangan simulasi validasi dokumen dan timeline status klaim." },
  { year: "2026", event: "Prototype dashboard multi-role untuk portfolio health-tech administratif." },
];

const AboutPage = ({ onBack, onNavigate }: AboutPageProps) => {
  return (
    <div className="relative min-h-screen bg-background">
      <nav className="relative z-10 flex items-center justify-between border-b border-border/70 bg-background/95 px-6 py-5 md:px-12 lg:px-20">
        <button onClick={() => onNavigate("beranda")} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">BPJSight</span>
        </button>
        <div className="hidden items-center gap-8 md:flex">
          <button onClick={() => onNavigate("beranda")} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Beranda</button>
          <button className="text-sm font-semibold text-primary">Tentang</button>
          <button onClick={() => onNavigate("fitur")} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Fitur</button>
        </div>
        <ThemeToggle compact />
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-20 pt-8 lg:px-20">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>

        <Badge variant="outline" className="mb-4 border-primary/30 bg-background px-4 py-2 text-sm font-semibold text-primary">
          Tentang prototype BPJSight
        </Badge>

        <h1 className="mb-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
          Prototype untuk Monitoring dan Validasi Klaim BPJS
        </h1>

        <p className="mb-12 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
          BPJSight dirancang sebagai prototype portfolio untuk memperlihatkan alur pemantauan klaim, validasi kelengkapan dokumen, dan estimasi risiko administratif. Aplikasi ini tidak mengklaim terhubung ke BPJS, rumah sakit, atau data pasien asli.
        </p>

        <div className="mb-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card p-8" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-foreground">Tujuan Prototype</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Menunjukkan bagaimana dashboard administratif dapat membantu pasien memahami status klaim dan membantu rumah sakit memprioritaskan pengecekan dokumen yang belum lengkap.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-8" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-foreground">Batasan Demo</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Data, nama pasien, fasilitas kesehatan, EHR preview, dan status klaim adalah simulasi. Skor risiko hanya contoh decision-support, bukan keputusan klaim resmi.
            </p>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Prinsip Desain</h2>
        <div className="mb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/40" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <v.icon className="h-5 w-5" />
              </div>
              <h4 className="mb-2 text-base font-bold text-foreground">{v.title}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Roadmap Prototype</h2>
        <div className="mb-16 space-y-4">
          {ROADMAP.map((m) => (
            <div key={m.year} className="flex items-start gap-5 rounded-2xl border border-border/70 bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-bold text-primary">
                {m.year}
              </div>
              <div className="flex-1 pt-2">
                <p className="text-sm leading-relaxed text-foreground">{m.event}</p>
              </div>
              <CheckCircle2 className="mt-3 h-5 w-5 shrink-0 text-primary" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-10 text-center" style={{ boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="mb-3 text-2xl font-bold text-foreground">Lihat fitur prototype BPJSight</h3>
          <p className="mb-6 text-sm text-muted-foreground">Tinjau komponen utama untuk pemantauan klaim, checklist dokumen, dan risk scoring simulatif.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => onNavigate("fitur")} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Lihat Fitur</Button>
            <Button variant="outline" onClick={() => onNavigate("beranda")} className="rounded-full">Kembali ke Beranda</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
