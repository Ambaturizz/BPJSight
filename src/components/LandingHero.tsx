import { Button } from "@/components/ui/button";
import { Shield, Activity, Building2, User, ChevronRight, Sparkles, TrendingUp, Lock } from "lucide-react";

interface LandingHeroProps {
  onNavigate: (role: "patient" | "hospital") => void;
}

const FEATURES = [
  { icon: Activity, title: "Pemantauan Real-Time", desc: "Lacak klaim dari pengajuan hingga selesai" },
  { icon: Sparkles, title: "Prediksi AI", desc: "Deteksi risiko penolakan sebelum terjadi" },
  { icon: Lock, title: "Aman & Terpercaya", desc: "Enkripsi data end-to-end" },
];

const LandingHero = ({ onNavigate }: LandingHeroProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-info/6 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-accent/3 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.04)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">BPJSight</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          {["Tentang", "Fitur", "Kontak"].map((item) => (
            <span key={item} className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors duration-200">
              {item}
            </span>
          ))}
          <Button variant="outline" size="sm" className="rounded-full">
            Masuk
          </Button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-16 text-center md:pt-24 lg:px-20">
        <div className="animate-fade-in-up mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          Platform Manajemen Klaim BPJS Bertenaga AI
        </div>

        <h1 className="animate-fade-in-up mb-6 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl" style={{ animationDelay: '0.1s' }}>
          Pantau Klaim Kesehatan{" "}
          <br className="hidden md:block" />
          Anda dengan{" "}
          <span className="gradient-text">Transparan</span>
        </h1>

        <p className="animate-fade-in-up mb-12 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg" style={{ animationDelay: '0.2s' }}>
          BPJSight membantu pasien memantau klaim secara real-time dan rumah sakit mengelola
          klaim secara proaktif dengan prediksi risiko penolakan berbasis AI.
        </p>

        {/* Role Selection Cards */}
        <div className="animate-fade-in-up grid w-full max-w-2xl gap-5 md:grid-cols-2" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => onNavigate("patient")}
            className="group relative flex flex-col items-center gap-5 rounded-2xl border border-border/60 bg-card p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-all duration-300 group-hover:scale-110 group-hover:gradient-primary group-hover:text-primary-foreground group-hover:shadow-[var(--shadow-elevated)]">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Masuk sebagai Pasien</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Pantau klaim, lihat manfaat, dan cek risiko kesehatan
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
              Mulai Sekarang <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          <button
            onClick={() => onNavigate("hospital")}
            className="group relative flex flex-col items-center gap-5 rounded-2xl border border-border/60 bg-card p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-all duration-300 group-hover:scale-110 group-hover:gradient-primary group-hover:text-primary-foreground group-hover:shadow-[var(--shadow-elevated)]">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Masuk sebagai Rumah Sakit</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Command center klaim dan manajemen risiko penolakan
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
              Mulai Sekarang <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>

        {/* Features Row */}
        <div className="animate-fade-in-up mt-20 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-3" style={{ animationDelay: '0.4s' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-3 rounded-xl p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">{f.title}</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="animate-fade-in-up mt-16 mb-16 grid w-full max-w-3xl grid-cols-3 gap-8 rounded-2xl border border-border/60 bg-card/50 p-8 backdrop-blur-sm" style={{ animationDelay: '0.5s', boxShadow: 'var(--shadow-card)' }}>
          {[
            { value: "2.5M+", label: "Klaim Diproses", icon: TrendingUp },
            { value: "98%", label: "Tingkat Persetujuan", icon: Activity },
            { value: "1,200+", label: "Rumah Sakit", icon: Building2 },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <stat.icon className="mb-1 h-5 w-5 text-primary" />
              <p className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{stat.value}</p>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
