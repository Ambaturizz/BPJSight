import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Shield,
  Activity,
  Building2,
  User,
  ChevronRight,
  ClipboardCheck,
  Lock,
  Plug,
  Menu,
  X,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  FileText,
  BarChart3,
} from "lucide-react";

interface LandingHeroProps {
  onNavigate: (role: "patient" | "hospital") => void;
  onNavPage?: (page: "beranda" | "tentang" | "fitur") => void;
  onOpenEHR?: () => void;
}

const FEATURES = [
  {
    icon: Activity,
    title: "Pemantauan status klaim",
    desc: "Pasien dan rumah sakit dapat melihat tahapan klaim dari pengajuan, validasi dokumen, sampai keputusan akhir.",
  },
  {
    icon: ClipboardCheck,
    title: "Checklist kelengkapan dokumen",
    desc: "SEP, resume medis, identitas, rujukan, billing, dan dokumen penunjang ditampilkan dalam daftar periksa yang mudah diaudit.",
  },
  {
    icon: BarChart3,
    title: "Estimasi risiko administratif",
    desc: "Prototype risk scoring membantu menandai klaim yang memerlukan review awal berdasarkan kelengkapan dokumen.",
  },
  {
    icon: Lock,
    title: "Data contoh yang terpisah dari produksi",
    desc: "Seluruh data pada prototype menggunakan data simulasi, bukan data pasien atau integrasi rumah sakit nyata.",
  },
];

const NAV_ITEMS = [
  { label: "Tentang", target: "about" },
  { label: "Fitur", target: "features" },
  { label: "Kontak", target: "contact" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const LandingHero = ({ onNavigate, onOpenEHR }: LandingHeroProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNav = (target: string) => {
    setMobileNavOpen(false);
    scrollToSection(target);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.36)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.36)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/8 to-transparent" />
      </div>

      <nav className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="safe-container flex items-center justify-between py-4">
          <button type="button" onClick={() => scrollToSection("home")} className="flex items-center gap-2.5 rounded-xl text-left" aria-label="Kembali ke bagian utama BPJSight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">BPJSight</span>
          </button>

          <div className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map((item) => (
              <button key={item.target} type="button" onClick={() => handleNav(item.target)} className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
                {item.label}
              </button>
            ))}
            <button type="button" onClick={onOpenEHR} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
              <Plug className="h-3.5 w-3.5" aria-hidden="true" /> EHR Demo
            </button>
            <ThemeToggle compact />
            <Button type="button" variant="outline" size="sm" onClick={() => handleNav("login-options")} className="rounded-full">
              Masuk
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle compact />
            <Button type="button" variant="ghost" size="icon" aria-label={mobileNavOpen ? "Tutup menu navigasi" : "Buka menu navigasi"} onClick={() => setMobileNavOpen((open) => !open)} className="rounded-xl">
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-border/60 bg-background/95 px-4 py-3 md:hidden">
            <div className="grid gap-2">
              {NAV_ITEMS.map((item) => (
                <button key={item.target} type="button" onClick={() => handleNav(item.target)} className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-muted">
                  {item.label}
                </button>
              ))}
              <button type="button" onClick={() => { setMobileNavOpen(false); onOpenEHR?.(); }} className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-muted">
                EHR Demo
              </button>
              <Button type="button" onClick={() => handleNav("login-options")} className="mt-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                Pilih Login
              </Button>
            </div>
          </div>
        )}
      </nav>

      <main id="home" className="relative z-10">
        <section className="safe-container flex min-h-[calc(100vh-72px)] flex-col items-center justify-center py-14 text-center md:py-20">
          <Badge variant="outline" className="mb-5 border-primary/30 bg-background px-4 py-2 text-xs font-bold text-primary sm:text-sm">
            Prototype dashboard klaim BPJS · Data simulasi
          </Badge>

          <h1 className="max-w-4xl text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Pemantauan dan Validasi Klaim BPJS dalam Satu Dashboard
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            BPJSight adalah prototype dashboard untuk membantu pasien dan rumah sakit memantau status klaim, mengecek kelengkapan dokumen, dan mengidentifikasi risiko administratif sejak awal.
          </p>

          <div id="login-options" className="mt-10 grid w-full max-w-2xl gap-4 scroll-mt-24 md:grid-cols-2">
            <RoleCard
              icon={User}
              title="Masuk sebagai Pasien"
              desc="Lihat timeline klaim, status dokumen, riwayat klaim, dan saran tindak lanjut berbasis data contoh."
              onClick={() => onNavigate("patient")}
            />
            <RoleCard
              icon={Building2}
              title="Masuk sebagai Rumah Sakit"
              desc="Pantau klaim berisiko, checklist dokumen, dan prioritas review administrasi pada dashboard demo."
              onClick={() => onNavigate("hospital")}
            />
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => handleNav("features")} className="rounded-xl px-6">
              Lihat Alur Demo
            </Button>
          </div>

          <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-3 md:p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            {[
              { value: "3", label: "Skenario klaim demo", icon: FileText },
              { value: "10", label: "Dokumen klaim dicek", icon: ClipboardCheck },
              { value: "4", label: "Tahap timeline klaim", icon: Activity },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-xl p-2 text-left sm:flex-col sm:text-center">
                <stat.icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{stat.value}</p>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="safe-container scroll-mt-24 py-14 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Tentang BPJSight</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Didesain untuk alur klaim yang mudah dipahami dan mudah diaudit.</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                Prototype ini memperlihatkan alur pasien dan rumah sakit tanpa mengklaim terhubung ke BPJS atau fasilitas kesehatan nyata. Fokusnya adalah validasi dokumen, status klaim, dan penjelasan risiko administratif.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {["Transparansi status klaim", "Konteks data simulasi", "Akses berbasis peran", "Saran perbaikan yang dapat ditindaklanjuti"].map((item) => (
                <div key={item} className="rounded-2xl border border-border/70 bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                  <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="mt-3 text-sm font-bold text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="safe-container scroll-mt-24 py-14 md:py-20">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Fitur utama</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Dibangun untuk pasien dan operasional rumah sakit.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-border/70 bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="safe-container scroll-mt-24 pb-16 pt-12 md:pb-24">
          <div className="rounded-3xl border border-border/70 bg-card p-6 md:p-10" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Kontak demo</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">Coba alur BPJSight sebagai prototype portfolio.</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Seluruh data pada aplikasi ini adalah data contoh untuk demonstrasi. Tidak ada koneksi produksi ke BPJS, rumah sakit, atau data pasien asli.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={() => scrollToSection("login-options")} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">Pilih role login</Button>
                  <Button variant="outline" onClick={onOpenEHR} className="rounded-xl">Lihat EHR demo</Button>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" aria-hidden="true" /> support@bpjsight.demo</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" aria-hidden="true" /> Simulasi kontak layanan</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" aria-hidden="true" /> Prototype untuk alur administrasi klaim kesehatan</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

interface RoleCardProps {
  icon: typeof User;
  title: string;
  desc: string;
  onClick: () => void;
}

function RoleCard({ icon: Icon, title, desc, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-start gap-4 rounded-2xl border border-border/70 bg-card p-5 text-left transition-colors duration-200 hover:border-primary/40 hover:bg-muted/20 sm:p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-primary">
        Mulai <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </button>
  );
}

export default LandingHero;


