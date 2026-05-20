

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { BackgroundOrnaments } from "./BackgroundOrnaments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import {
  Shield,
  Activity,
  Building2,
  User,
  ChevronRight,
  ClipboardCheck,
  Lock,
  Menu,
  X,
  CheckCircle2,
  Mail,
  Phone,
  Globe2,
  BarChart3,
  HeartPulse,
  FileText,
  Database,
  Stethoscope,
  Sparkles,
  PieChart,
  LineChart,
  ClipboardList,
  LockKeyhole,
  Users,
  ArrowUpRight,
} from "lucide-react";

interface LandingHeroProps {
  onNavigate: (role: "patient" | "hospital") => void;
  onNavPage?: (page: "beranda" | "tentang" | "fitur") => void;
  onOpenEHR?: () => void;
}

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const FEATURES: FeatureItem[] = [
  {
    icon: Activity,
    title: "Pemantauan status klaim",
    desc: "Pantau proses klaim dari pengajuan, validasi dokumen, review, sampai keputusan akhir dengan alur yang mudah dibaca.",
  },
  {
    icon: ClipboardCheck,
    title: "Checklist kelengkapan dokumen",
    desc: "SEP, identitas, resume medis, rujukan, billing, dan dokumen penunjang ditampilkan sebagai daftar periksa administratif.",
  },
  {
    icon: BarChart3,
    title: "Estimasi risiko administratif",
    desc: "Risk scoring simulatif membantu menandai klaim yang perlu ditinjau lebih awal berdasarkan kelengkapan dan konsistensi data.",
  },
  {
    icon: Lock,
    title: "Data contoh yang terpisah dari produksi",
    desc: "Seluruh data pada prototype adalah data simulasi sehingga aman untuk demo, portfolio, dan presentasi alur produk.",
  },
];

const NAV_ITEMS = [
  { label: "Tentang", target: "about" },
  { label: "Fitur", target: "features" },
  { label: "Kontak", target: "contact" },
] as const;

const KPI_CARDS = [
  {
    label: "Jumlah Peserta JKN",
    value: "224.237.094 Peserta",
    icon: Users,
    chart: "donut" as const,
    legend: ["Peserta aktif", "Perlindungan", "Portabilitas"],
  },
  {
    label: "Fasilitas Kesehatan Tingkat Pertama",
    value: "23.823 FKTP",
    icon: Stethoscope,
    chart: "ring" as const,
    legend: ["Tingkat pertama", "Perta", "PUTP"],
  },
  {
    label: "Faskes Rujukan Tingkat Lanjutan",
    value: "3.205 RS/klinik utama dan 8.360 optik/apotek",
    icon: Database,
    chart: "area" as const,
    legend: ["RS/Klinik", "Apotek", "Optik"],
  },
  {
    label: "Faskes Rujukan Berwenang Jaminan",
    value: "25.823 NKTP",
    icon: LineChart,
    chart: "line" as const,
    legend: ["Jan", "Mar", "Jun", "Sep"],
  },
];

const FOOTER_COLUMNS = [
  { title: "Produk", items: ["Platform", "Status", "Security", "Changelog"] },
  { title: "Fitur", items: ["Monitoring", "Risk Scoring", "Analytics", "Reporting"] },
  { title: "Tentang", items: ["Team", "Careers", "Press", "Blog"] },
  { title: "Resources", items: ["Documentation", "Guides", "Support", "Contact"] },
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
      <BackgroundOrnaments />

      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-2.5 rounded-xl text-left"
            aria-label="Kembali ke bagian utama BPJSight"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-[0_0_30px_rgba(45,212,191,0.28)]">
              <Shield className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-primary">BPJSight</span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => handleNav(item.target)}
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle compact />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleNav("login-options")}
              className="rounded-full border-border bg-transparent px-5 text-primary dark:text-primary hover:bg-primary/10 hover:text-primary dark:text-primary"
            >
              Masuk/Daftar
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle compact />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={mobileNavOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              onClick={() => setMobileNavOpen((open) => !open)}
              className="rounded-xl text-primary dark:text-primary hover:bg-white/10 hover:text-primary dark:text-primary"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-border/50 bg-card/95 px-5 py-3 backdrop-blur-xl md:hidden">
            <div className="grid gap-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.target}
                  type="button"
                  onClick={() => handleNav(item.target)}
                  className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-white/10"
                >
                  {item.label}
                </button>
              ))}
              <Button type="button" onClick={() => handleNav("login-options")} className="mt-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow">
                Pilih Login
              </Button>
            </div>
          </div>
        )}
      </nav>

      <main id="home" className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-76px)] w-full max-w-7xl items-center gap-12 px-5 py-12 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-16">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-5 rounded-full border-border/50 bg-card shadow-sm px-4 py-2 text-xs font-semibold text-primary dark:text-primary shadow-[0_0_32px_rgba(45,212,191,0.14)] sm:text-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Prototype dashboard Klaim BPJS · Data simulasi
            </Badge>

            <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[4.15rem]">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent  bg-clip-text text-transparent">Pemantauan dan Validasi Klaim BPJS</span>{" "}
              dalam Satu Dashboard
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              BPJSight adalah prototype dashboard untuk membantu pasien dan rumah sakit memantau status klaim, mengecek kelengkapan dokumen, dan mengidentifikasi risiko administratif sejak awal.
            </p>

            <div id="login-options" className="mt-7 grid w-full max-w-[44rem] gap-4 scroll-mt-24 md:grid-cols-2">
              <RoleCard
                icon={User}
                title="Masuk/Daftar sebagai Pasien"
                desc="Pantau timeline klaim, status dokumen, riwayat klaim, dan saran tindak lanjut berbasis data contoh."
                onClick={() => onNavigate("patient")}
              />
              <RoleCard
                icon={Building2}
                title="Masuk/Daftar sebagai Rumah Sakit"
                desc="Monitor klaim berisiko, checklist dokumen, dan prioritas review administrasi pada dashboard demo."
                onClick={() => onNavigate("hospital")}
              />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[37rem] lg:max-w-none">
            <HeroVisual />
          </div>
        </section>

        <section id="about" className="mx-auto grid w-full max-w-7xl scroll-mt-24 gap-10 px-5 py-12 md:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-16">
          <div className="lg:pt-4">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-primary">Tentang BPJSight</p>
            <h2 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
              Didesain untuk alur klaim yang mudah dipahami dan mudah diaudit.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Prototype ini memperlihatkan alur pasien dan rumah sakit tanpa mengklaim terhubung ke BPJS atau fasilitas kesehatan nyata. Fokusnya adalah validasi dokumen, status klaim, dan penjelasan risiko administratif.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {KPI_CARDS.map((card, index) => (
              <MetricCard key={card.label} {...card} delay={index * 70} />
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-12 md:px-8 lg:px-10 lg:py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-primary">Fitur utama</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Dibangun untuk pasien dan operasional rumah sakit.</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="group rounded-3xl border border-border/50 bg-card shadow-sm p-6 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-white/[0.075]">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-br from-cyan-300/25 to-sky-400/15 text-primary dark:text-primary shadow-[0_0_34px_rgba(45,212,191,0.20)]">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-xl font-extrabold text-foreground">{feature.title}</h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-primary opacity-60 transition group-hover:opacity-100" aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 pb-10 pt-8 md:px-8 lg:px-10 lg:pb-14">
          <div className="rounded-3xl border border-border/50 bg-card shadow-sm p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-8">
            <div className="grid gap-7 lg:grid-cols-[1fr_0.78fr] lg:items-center">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-primary">Kontak demo</p>
                <h2 className="mt-3 max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-3xl">
                  Coba alur BPJSight sebagai prototype portfolio.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  BPJSight memperlihatkan alur pasien dan rumah sakit tanpa mengklaim terhubung ke BPJS atau fasilitas kesehatan nyata.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={() => scrollToSection("login-options")} className="rounded-full bg-primary px-5 font-bold text-primary-foreground hover:bg-primary-glow">
                    Pilih role login
                  </Button>
                  
                </div>
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted px-4 py-3">
                  <Mail className="h-4 w-4 text-primary" aria-hidden="true" /> support@bpjsight.demo
                </p>
                <p className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted px-4 py-3">
                  <Phone className="h-4 w-4 text-primary" aria-hidden="true" /> Simulasi kontak layanan
                </p>
                <p className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted px-4 py-3">
                  <Globe2 className="h-4 w-4 text-primary" aria-hidden="true" /> Prototype untuk alur administrasi klaim kesehatan
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

interface RoleCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  onClick: () => void;
}

function RoleCard({ icon: Icon, title, desc, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm p-5 text-left shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-white/[0.085]"
    >
      <div className="pointer-events-none absolute inset-0 dark:bg-[radial-gradient(circle_at_10%_0%,rgba(94,234,212,0.18),transparent_34%)] opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-primary/10 text-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-extrabold leading-tight text-foreground">{title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{desc}</p>
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground shadow-[0_12px_28px_rgba(45,212,191,0.20)]">
            Mulai <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  );
}

function HeroVisual() {
  return (
    <div className="relative min-h-[32rem] overflow-hidden rounded-[2.4rem] border border-border/50 dark:bg-[radial-gradient(circle_at_45%_20%,rgba(45,212,191,0.27),transparent_28%),linear-gradient(145deg,rgba(15,23,42,0.20),rgba(8,13,29,0.56))] p-6 shadow-[0_30px_110px_rgba(0,0,0,0.35)] backdrop-blur-sm">
      <div className="absolute inset-0 dark:bg-[linear-gradient(rgba(94,234,212,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(94,234,212,0.08)_1px,transparent_1px)] bg-[size:54px_54px]" />
      <div className="absolute left-8 top-20 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-12 right-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative h-[28rem]">
        <FloatingIcon className="left-8 top-14" icon={HeartPulse} />
        <FloatingIcon className="right-10 top-14" icon={FileText} />
        <FloatingIcon className="left-10 bottom-28" icon={ClipboardList} small />
        <FloatingIcon className="right-14 bottom-28" icon={LockKeyhole} small />

        <div className="absolute left-1/2 top-[43%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-[2.4rem] border border-white/35 bg-gradient-to-br from-white/45 via-cyan-200/30 to-cyan-400/20 shadow-[0_0_80px_rgba(94,234,212,0.38)] backdrop-blur-md">
          <Shield className="absolute inset-0 m-auto h-28 w-28 text-primary dark:text-primary/75 drop-shadow-[0_0_18px_rgba(255,255,255,0.75)]" strokeWidth={1.15} aria-hidden="true" />
          <svg viewBox="0 0 200 120" className="absolute left-1/2 top-1/2 h-28 w-40 -translate-x-1/2 -translate-y-1/2 text-foreground/75" aria-hidden="true">
            <path d="M10 62H55L70 31l24 70 18-44h28l14-25 16 30h20" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="absolute bottom-10 left-1/2 flex w-[82%] -translate-x-1/2 items-end justify-center gap-2 sm:gap-4">
          <PersonCard className="h-32 w-24" tone="from-primary to-primary-glow" />
          <PersonCard className="h-24 w-20" tone="from-accent to-primary" child />
          <PersonCard className="h-24 w-20" tone="from-muted to-accent" child />
          <PersonCard className="h-32 w-24" tone="from-primary to-accent" />
        </div>
      </div>
    </div>
  );
}

function PersonCard({ className, tone, child = false }: { className: string; tone: string; child?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-1/2 top-0 h-12 w-12 -translate-x-1/2 rounded-full bg-gradient-to-br from-slate-200 to-cyan-100 shadow-[0_0_26px_rgba(255,255,255,0.30)]" />
      <div className={`absolute bottom-0 left-1/2 ${child ? "h-20 w-20" : "h-28 w-24"} -translate-x-1/2 rounded-t-[2.2rem] bg-gradient-to-br ${tone} opacity-90 shadow-[0_18px_50px_rgba(45,212,191,0.22)]`} />
    </div>
  );
}

function FloatingIcon({ icon: Icon, className, small = false }: { icon: LucideIcon; className: string; small?: boolean }) {
  return (
    <div className={`absolute ${className} flex ${small ? "h-14 w-14" : "h-20 w-20"} items-center justify-center rounded-3xl border border-primary/25 bg-white/10 text-primary dark:text-primary shadow-[0_0_45px_rgba(94,234,212,0.20)] backdrop-blur-md`}>
      <Icon className={small ? "h-7 w-7" : "h-10 w-10"} strokeWidth={1.5} aria-hidden="true" />
    </div>
  );
}

function MetricCard({ label, value, chart, legend, icon: Icon, delay }: (typeof KPI_CARDS)[number] & { delay: number }) {
  return (
    <article className="rounded-2xl border border-border/50 bg-card shadow-sm p-4 shadow-[0_18px_55px_rgba(0,0,0,0.24)] backdrop-blur-xl" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-semibold leading-snug text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm font-extrabold leading-snug text-foreground">{value}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[0.9fr_1fr] items-center gap-3">
        <MiniChart type={chart} />
        <div className="space-y-1.5">
          {legend.map((item, index) => (
            <p key={item} className="flex items-center gap-1.5 text-[0.64rem] leading-tight text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${index === 0 ? "bg-primary" : index === 1 ? "bg-sky-300" : "bg-lime-200"}`} />
              {item}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

function MiniChart({ type }: { type: "donut" | "ring" | "area" | "line" }) {
  if (type === "area") {
    return (
      <svg viewBox="0 0 120 80" className="h-20 w-full" aria-hidden="true">
        <defs>
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d="M8 67 C18 58 23 57 31 60 C40 64 44 44 53 48 C62 53 67 28 75 34 C84 40 89 20 97 26 C105 31 110 18 116 14 L116 74 L8 74 Z" fill="url(#areaGradient)" />
        <path d="M8 67 C18 58 23 57 31 60 C40 64 44 44 53 48 C62 53 67 28 75 34 C84 40 89 20 97 26 C105 31 110 18 116 14" fill="none" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "line") {
    return (
      <svg viewBox="0 0 120 80" className="h-20 w-full" aria-hidden="true">
        {[20, 40, 60].map((y) => <line key={y} x1="5" x2="116" y1={y} y2={y} stroke="rgba(148,163,184,0.18)" />)}
        <path d="M8 64 C17 37 28 45 36 43 C48 41 48 26 61 31 C73 36 75 16 88 20 C101 24 106 14 116 10" fill="none" stroke="#5eead4" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  const stroke = type === "donut" ? 27 : 20;
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-full drop-shadow-[0_0_16px_rgba(45,212,191,0.4)]" aria-hidden="true">
      <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#5eead4" strokeWidth={stroke} strokeDasharray="125 188" strokeLinecap="round" transform="rotate(-90 50 50)" />
      <circle cx="50" cy="50" r="18" fill="rgba(15,23,42,0.55)" stroke="rgba(255,255,255,0.18)" />
    </svg>
  );
}



function Footer() {
  return (
    <footer className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-8 md:px-8 lg:px-10">
      <div className="grid gap-8 border-t border-border/50 pt-7 lg:grid-cols-[1.2fr_1.3fr]">
        <div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            BPJSight adalah mini project yang memperlihatkan alur pasien dan rumah sakit tanpa mengklaim terhubung ke BPJS atau fasilitas kesehatan nyata.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            
            
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-extrabold text-foreground">{column.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/50 pt-5 text-xs text-muted-foreground/50">
        <span>© 2026 BPJSight. All rights reserved.</span>
        <span>|</span>
        <span>Privacy Policy</span>
        <span>|</span>
        <span>Terms of Service</span>
        <span>|</span>
        <span>Legal &amp; Compliance</span>
        <span>|</span>
        <span>Non-Discrimination Policy</span>
        <span>|</span>
        <span>Accessibility</span>
        <span>|</span>
        <span>Your Privacy Choices</span>
      </div>
    </footer>
  );
}

export default LandingHero;




