import { Button } from "@/components/ui/button";
import { Shield, Activity, Building2, User } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

interface LandingHeroProps {
  onNavigate: (role: "patient" | "hospital") => void;
}

const LandingHero = ({ onNavigate }: LandingHeroProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">BPJSight</span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Tentang</span>
          <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Fitur</span>
          <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Kontak</span>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-20 text-center md:pt-32">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Activity className="h-4 w-4" />
          Platform Manajemen Klaim BPJS Kesehatan
        </div>

        <h1 className="mb-6 max-w-3xl text-4xl font-bold leading-tight text-foreground md:text-6xl">
          Pantau Klaim Kesehatan Anda dengan{" "}
          <span className="text-primary">Transparan</span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-muted-foreground">
          BPJSight membantu pasien memantau klaim secara real-time dan rumah sakit mengelola
          klaim secara proaktif dengan prediksi risiko penolakan berbasis AI.
        </p>

        {/* Role Selection Cards */}
        <div className="grid w-full max-w-2xl gap-4 md:grid-cols-2">
          <button
            onClick={() => onNavigate("patient")}
            className="group flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Masuk sebagai Pasien</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Pantau klaim, lihat manfaat, dan cek risiko kesehatan
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("hospital")}
            className="group flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Masuk sebagai Rumah Sakit</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Command center klaim dan manajemen risiko penolakan
              </p>
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8">
          <div>
            <p className="text-2xl font-bold text-foreground md:text-3xl">2.5M+</p>
            <p className="text-sm text-muted-foreground">Klaim Diproses</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground md:text-3xl">98%</p>
            <p className="text-sm text-muted-foreground">Tingkat Persetujuan</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground md:text-3xl">1,200+</p>
            <p className="text-sm text-muted-foreground">Rumah Sakit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
