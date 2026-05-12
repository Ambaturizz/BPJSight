import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Shield,
  Activity,
  Building2,
  User,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Lock,
  Plug,
  Menu,
  X,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Brain,
  FileText,
} from "lucide-react";
import { useState } from "react";

interface LandingHeroProps {
  onNavigate: (role: "patient" | "hospital") => void;
  onNavPage?: (page: "beranda" | "tentang" | "fitur") => void;
  onOpenEHR?: () => void;
}

const FEATURES = [
  { icon: Activity, title: "Pemantauan real-time", desc: "Lacak status klaim dari pengajuan hingga selesai dengan bahasa yang mudah dipahami." },
  { icon: Brain, title: "Analisis risiko AI", desc: "Membantu menemukan faktor risiko dan rekomendasi perbaikan sebelum klaim diverifikasi." },
  { icon: FileText, title: "Dokumen klaim terstruktur", desc: "Checklist dokumen membuat pasien dan rumah sakit tahu berkas mana yang perlu dilengkapi." },
  { icon: Lock, title: "Keamanan data aplikasi", desc: "Data dilindungi dengan praktik minimisasi data dan kontrol akses berbasis peran." },
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
        <div className="absolute -right-32 -top-32 h-[360px] w-[360px] rounded-full bg-primary/10 blur-3xl md:h-[600px] md:w-[600px]" />
        <div className="absolute -bottom-32 -left-32 h-[320px] w-[320px] rounded-full bg-info/10 blur-3xl md:h-[500px] md:w-[500px]" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.04)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.04)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>

      <nav className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="safe-container flex items-center justify-between py-4">
          <button type="button" onClick={() => scrollToSection("home")} className="flex items-center gap-2.5 rounded-xl text-left" aria-label="Kembali ke bagian utama BPJSight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
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
              <Plug className="h-3.5 w-3.5" aria-hidden="true" /> Integrasi EHR
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
                Integrasi EHR
              </button>
              <Button type="button" onClick={() => handleNav("login-options")} className="mt-1 rounded-xl gradient-primary text-primary-foreground">
                Pilih Login
              </Button>
            </div>
          </div>
        )}
      </nav>

      <main id="home" className="relative z-10">
        <section className="safe-container flex min-h-[calc(100vh-72px)] flex-col items-center justify-center py-14 text-center md:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-bold text-primary backdrop-blur-sm sm:text-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Platform Manajemen Klaim BPJS Bertenaga AI
          </div>

          <h1 className="max-w-4xl text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Pantau Klaim Kesehatan dengan <span className="gradient-text">Transparan</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            BPJSight membantu pasien memantau klaim secara real-time dan rumah sakit mengelola prioritas verifikasi secara lebih jelas, konsisten, dan mudah diaudit.
          </p>

          <div id="login-options" className="mt-10 grid w-full max-w-2xl gap-4 scroll-mt-24 md:grid-cols-2">
            <RoleCard
              icon={User}
              title="Masuk sebagai Pasien"
              desc="Pantau klaim, manfaat, status dokumen, dan rekomendasi langkah perbaikan."
              onClick={() => onNavigate("patient")}
            />
            <RoleCard
              icon={Building2}
              title="Masuk sebagai Rumah Sakit"
              desc="Command Center Klaim untuk memprioritaskan review dan kelengkapan dokumen."
              onClick={() => onNavigate("hospital")}
            />
          </div>

          <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm sm:grid-cols-3 md:p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            {[
              { value: "2.5M+", label: "Klaim dipantau", icon: TrendingUp },
              { value: "98%", label: "Skenario validasi", icon: Activity },
              { value: "1.200+", label: "Contoh faskes", icon: Building2 },
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
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Membuat proses klaim lebih mudah dipahami.</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                BPJSight dirancang sebagai prototype profesional untuk memperlihatkan bagaimana pasien dan rumah sakit dapat melihat status klaim, risiko dokumen, dan rekomendasi perbaikan dalam satu alur yang jelas.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {["Transparansi status klaim", "Minimisasi data sensitif", "Akses berbasis peran", "Rekomendasi yang dapat ditindaklanjuti"].map((item) => (
                <div key={item} className="rounded-2xl border border-border/60 bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
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
              <article key={feature.title} className="rounded-2xl border border-border/60 bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
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
          <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-10" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Kontak</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">Siap mencoba alur BPJSight?</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Mulai sebagai pasien atau rumah sakit. Untuk prototype ini, semua data menggunakan simulasi aman tanpa backend produksi.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={() => scrollToSection("login-options")} className="rounded-xl gradient-primary text-primary-foreground">Pilih role login</Button>
                  <Button variant="outline" onClick={onOpenEHR} className="rounded-xl">Lihat integrasi EHR</Button>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" aria-hidden="true" /> support@bpjsight.demo</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" aria-hidden="true" /> Simulasi kontak layanan</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" aria-hidden="true" /> Prototype untuk ekosistem layanan kesehatan Indonesia</p>
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
      className="group relative flex flex-col items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)] sm:p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-colors group-hover:gradient-primary group-hover:text-primary-foreground">
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
