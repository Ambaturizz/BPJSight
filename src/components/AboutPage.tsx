import { Shield, Target, Heart, Users, Award, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

interface AboutPageProps {
  onBack: () => void;
  onNavigate: (page: "beranda" | "tentang" | "fitur") => void;
}

const VALUES = [
  { icon: Heart, title: "Empati", desc: "Mengutamakan kenyamanan dan keamanan pasien dalam setiap proses klaim." },
  { icon: Shield, title: "Integritas", desc: "Transparansi penuh untuk setiap data, klaim, dan keputusan." },
  { icon: Award, title: "Keunggulan", desc: "Teknologi AI mutakhir untuk akurasi dan efisiensi maksimal." },
  { icon: Users, title: "Kolaborasi", desc: "Menghubungkan pasien, rumah sakit, dan BPJS dalam satu ekosistem." },
];

const MILESTONES = [
  { year: "2023", event: "BPJSight didirikan dengan visi modernisasi klaim BPJS" },
  { year: "2024", event: "Integrasi AI prediksi penolakan klaim diluncurkan" },
  { year: "2025", event: "Mendukung HL7 FHIR R4 untuk interoperabilitas data" },
  { year: "2026", event: "Melayani 1.200+ rumah sakit di seluruh Indonesia" },
];

const AboutPage = ({ onBack, onNavigate }: AboutPageProps) => {
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
          <button className="text-sm font-semibold text-primary">Tentang</button>
          <button onClick={() => onNavigate("fitur")} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Fitur</button>
        </div>
        <ThemeToggle compact />
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-8 pb-20 lg:px-20">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>

        <div className="animate-fade-in-up mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Heart className="h-4 w-4" /> Tentang Kami
        </div>

        <h1 className="animate-fade-in-up mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
          Mengubah Cara Indonesia <br /> Mengelola <span className="gradient-text">Klaim Kesehatan</span>
        </h1>

        <p className="animate-fade-in-up mb-12 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
          BPJSight lahir dari kebutuhan akan transparansi, kecepatan, dan akurasi dalam pengelolaan klaim BPJS Kesehatan.
          Kami menggabungkan teknologi AI, standar interoperabilitas global (HL7 FHIR), dan pengalaman pengguna yang
          ramah untuk menciptakan platform yang melayani jutaan pasien dan ribuan rumah sakit di seluruh Indonesia.
        </p>

        {/* Misi & Visi */}
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card p-8" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-foreground">Misi Kami</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Menyederhanakan proses klaim BPJS dengan teknologi AI yang prediktif, transparan, dan dapat diandalkan,
              sehingga setiap pasien mendapatkan haknya dengan cepat dan setiap rumah sakit dapat fokus pada pelayanan.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-8" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-foreground">Visi Kami</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Menjadi platform klaim kesehatan terdepan di Asia Tenggara yang menghubungkan seluruh ekosistem layanan
              kesehatan dengan standar interoperabilitas internasional dan kecerdasan buatan.
            </p>
          </div>
        </div>

        {/* Nilai */}
        <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Nilai yang Kami Pegang</h2>
        <div className="mb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary/40 hover:-translate-y-1" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <v.icon className="h-5 w-5" />
              </div>
              <h4 className="mb-2 text-base font-bold text-foreground">{v.title}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Perjalanan Kami</h2>
        <div className="mb-16 space-y-4">
          {MILESTONES.map((m) => (
            <div key={m.year} className="flex items-start gap-5 rounded-2xl border border-border/60 bg-card p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground font-bold">
                {m.year}
              </div>
              <div className="flex-1 pt-2">
                <p className="text-sm leading-relaxed text-foreground">{m.event}</p>
              </div>
              <CheckCircle2 className="mt-3 h-5 w-5 shrink-0 text-primary" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-10 text-center" style={{ boxShadow: 'var(--shadow-elevated)' }}>
          <h3 className="mb-3 text-2xl font-bold text-foreground">Bergabunglah dengan Revolusi Klaim Kesehatan</h3>
          <p className="mb-6 text-sm text-muted-foreground">Jelajahi fitur lengkap BPJSight atau mulai perjalanan Anda sekarang.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => onNavigate("fitur")} className="rounded-full">Lihat Fitur</Button>
            <Button variant="outline" onClick={() => onNavigate("beranda")} className="rounded-full">Mulai Sekarang</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
