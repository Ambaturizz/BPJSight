import { Shield, ArrowLeft, Activity, Sparkles, Lock, FileText, Brain, Database, Bell, BarChart3, Users, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

interface FeaturesPageProps {
  onBack: () => void;
  onNavigate: (page: "beranda" | "tentang" | "fitur") => void;
}

const MAIN_FEATURES = [
  {
    icon: Brain,
    title: "Prediksi AI Risiko Penolakan",
    desc: "Model AI menganalisis kelengkapan dokumen, riwayat klaim, dan pola data untuk memprediksi probabilitas penolakan sebelum diajukan.",
    points: ["Skor risiko real-time", "Rekomendasi perbaikan otomatis", "Akurasi 94%+"],
  },
  {
    icon: Database,
    title: "HL7 FHIR R4 Interoperabilitas",
    desc: "Integrasi standar global memungkinkan pertukaran rekam medis pasien antar sistem kesehatan dengan aman dan terstandar.",
    points: ["FHIR Bundle otomatis", "Resource Patient & Claim", "Kompatibel sistem RS global"],
  },
  {
    icon: FileText,
    title: "Smart Claim Submission",
    desc: "Pengajuan klaim 10 dokumen wajib dengan upload PDF terstruktur, OCR otomatis, dan validasi real-time.",
    points: ["10 jenis dokumen klaim", "Validasi NIK & BPJS", "Progress tracker visual"],
  },
  {
    icon: Activity,
    title: "Pemantauan Real-Time",
    desc: "Dashboard pasien dan rumah sakit menampilkan status klaim live dari pengajuan hingga pencairan.",
    points: ["Notifikasi status", "Timeline lengkap", "Riwayat tak terbatas"],
  },
];

const SUB_FEATURES = [
  { icon: Lock, title: "Keamanan Data Aplikasi", desc: "Data Anda dilindungi sesuai standar keamanan aplikasi dan praktik minimisasi data." },
  { icon: Bell, title: "Notifikasi Cerdas", desc: "Pengingat dokumen kurang, status berubah, atau klaim disetujui." },
  { icon: BarChart3, title: "Analitik Mendalam", desc: "Laporan tren klaim, tingkat persetujuan, dan performa rumah sakit." },
  { icon: Users, title: "Multi-Role Access", desc: "Akses berbeda untuk pasien, admin RS, dan verifikator." },
  { icon: Zap, title: "Proses Cepat", desc: "Pengajuan klaim selesai dalam hitungan menit, bukan hari." },
  { icon: Sparkles, title: "UI Modern", desc: "Antarmuka glassmorphism yang nyaman digunakan di semua perangkat." },
];

const COMPARISON = [
  { feature: "Prediksi AI penolakan", us: true, them: false },
  { feature: "HL7 FHIR R4", us: true, them: false },
  { feature: "Real-time tracking", us: true, them: true },
  { feature: "OCR dokumen otomatis", us: true, them: false },
  { feature: "Dashboard analitik", us: true, them: true },
  { feature: "Mobile responsive", us: true, them: false },
];

const FeaturesPage = ({ onBack, onNavigate }: FeaturesPageProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-info/6 blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <button onClick={() => onNavigate("beranda")} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">BPJSight</span>
        </button>
        <div className="hidden items-center gap-8 md:flex">
          <button onClick={() => onNavigate("beranda")} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Beranda</button>
          <button onClick={() => onNavigate("tentang")} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Tentang</button>
          <button className="text-sm font-semibold text-primary">Fitur</button>
        </div>
        <ThemeToggle compact />
      </nav>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-8 pb-20 lg:px-20">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>

        <div className="animate-fade-in-up mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" /> Fitur Lengkap
        </div>

        <h1 className="animate-fade-in-up mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
          Semua yang Anda Butuhkan untuk <br /> <span className="gradient-text">Klaim BPJS Modern</span>
        </h1>

        <p className="animate-fade-in-up mb-12 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
          BPJSight menggabungkan AI, interoperabilitas data, dan pengalaman pengguna terbaik untuk mengelola klaim
          kesehatan dengan cara yang belum pernah Anda alami sebelumnya.
        </p>

        {/* Main Features */}
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          {MAIN_FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-8 transition-all hover:border-primary/40 hover:-translate-y-1" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
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

        {/* Sub Features */}
        <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Fitur Pendukung</h2>
        <div className="mb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SUB_FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary/40" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h4 className="mb-2 text-base font-bold text-foreground">{f.title}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">BPJSight vs Sistem Konvensional</h2>
        <div className="mb-16 overflow-hidden rounded-2xl border border-border/60 bg-card" style={{ boxShadow: 'var(--shadow-card)' }}>
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-secondary/50">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-foreground">Fitur</th>
                <th className="px-6 py-4 text-center font-bold text-primary">BPJSight</th>
                <th className="px-6 py-4 text-center font-bold text-muted-foreground">Konvensional</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((c) => (
                <tr key={c.feature} className="border-b border-border/40 last:border-0">
                  <td className="px-6 py-4 text-foreground">{c.feature}</td>
                  <td className="px-6 py-4 text-center">{c.us ? <CheckCircle2 className="mx-auto h-5 w-5 text-primary" /> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-6 py-4 text-center">{c.them ? <CheckCircle2 className="mx-auto h-5 w-5 text-muted-foreground" /> : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-10 text-center" style={{ boxShadow: 'var(--shadow-elevated)' }}>
          <h3 className="mb-3 text-2xl font-bold text-foreground">Siap mencoba BPJSight?</h3>
          <p className="mb-6 text-sm text-muted-foreground">Mulai sebagai pasien atau rumah sakit hari ini.</p>
          <Button onClick={() => onNavigate("beranda")} className="rounded-full">Mulai Sekarang</Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
