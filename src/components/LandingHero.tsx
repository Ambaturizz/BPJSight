import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BackgroundOrnaments } from "./BackgroundOrnaments";
import { Shield, ChevronRight, User, Building2, Stethoscope, Activity, ClipboardCheck, Phone, Mail, Globe2, FileText, BarChart3, Users, HeartPulse, Search } from "lucide-react";

interface LandingHeroProps {
  onNavigate: (role: "patient" | "hospital") => void;
}

const QUICK_SERVICES = [
  { icon: User, title: "Pendaftaran Pasien", desc: "Daftar antrean dan periksa status kepesertaan JKN-KIS.", role: "patient" },
  { icon: Building2, title: "Portal Faskes", desc: "Akses dashboard untuk fasilitas kesehatan dan rumah sakit.", role: "hospital" },
  { icon: ClipboardCheck, title: "Cek Status Klaim", desc: "Pantau proses verifikasi dan validasi klaim secara transparan.", role: "patient" },
  { icon: HeartPulse, title: "Skrining Kesehatan", desc: "Lakukan skrining riwayat kesehatan secara mandiri.", role: "patient" },
] as const;

const STATS = [
  { label: "Peserta JKN-KIS", value: "267+ Juta", icon: Users },
  { label: "Fasilitas Kesehatan", value: "23.000+", icon: Stethoscope },
  { label: "Klaim Diproses", value: "1.2M / hari", icon: Activity },
];

const LandingHero = ({ onNavigate }: LandingHeroProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans">
      <BackgroundOrnaments />
      {/* Top Utility Bar (very common in govt sites) */}
      <div className="hidden md:flex justify-end items-center bg-primary text-white py-1.5 px-8 text-xs font-medium gap-6">
        <a href="#" className="hover:underline flex items-center gap-1.5"><Phone className="h-3 w-3" /> Care Center 165</a>
        <a href="#" className="hover:underline flex items-center gap-1.5"><Globe2 className="h-3 w-3" /> PANDAWA</a>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xl font-bold leading-tight text-primary">BPJSight</span>
              <span className="block text-[10px] uppercase font-semibold text-secondary tracking-widest">Kesehatan Republik Indonesia</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-foreground">
            <a href="#" className="hover:text-primary transition-colors">Beranda</a>
            <a href="#" className="hover:text-primary transition-colors">Layanan Peserta</a>
            <a href="#" className="hover:text-primary transition-colors">Fasilitas Kesehatan</a>
            <a href="#" className="hover:text-primary transition-colors">Informasi Publik</a>
          </div>

          <div className="hidden md:flex gap-3">
            <Button variant="outline" className="border-border hover:bg-slate-50 text-primary font-bold shadow-sm">Masuk</Button>
            <Button className="bg-secondary hover:bg-green-700 text-white font-bold shadow-sm">Pendaftaran</Button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Banner Section */}
        <section className="relative overflow-hidden bg-slate-50 border-b border-border">
          <div className="relative mx-auto max-w-7xl">
            <div className="relative z-10 lg:w-1/2 py-16 md:py-24 lg:py-28 px-5 md:px-8">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-blue-200">Portal Layanan JKN</span>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-[1.15] mb-6 tracking-tight">
                Layanan Administrasi Kesehatan <span className="text-primary block mt-2">Dalam Satu Pintu</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl leading-relaxed">
                BPJSight memberikan transparansi penuh untuk pemantauan status klaim, verifikasi fasilitas kesehatan, dan layanan administrasi peserta JKN-KIS secara digital.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-blue-900 text-white font-semibold rounded-md shadow-sm h-12 px-6" onClick={() => onNavigate("patient")}>
                  Portal Pasien JKN
                </Button>
                <Button size="lg" variant="outline" className="bg-white border-border text-foreground hover:bg-slate-50 font-semibold rounded-md shadow-sm h-12 px-6" onClick={() => onNavigate("hospital")}>
                  Portal Faskes & RS
                </Button>
              </div>
            </div>
          </div>

          {/* Full-bleed hero image on the right */}
          <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img 
              src="/images/hero-card.jpg" 
              alt="Peserta BPJS menunjukkan Kartu Indonesia Sehat" 
              className="h-64 w-full object-cover sm:h-72 md:h-96 lg:h-full lg:w-full"
            />
            {/* Gradient fade from left to create smooth blend with text area */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent"></div>
          </div>
        </section>

        {/* Quick Services Section (Layanan Cepat) */}
        <section className="py-20 bg-white border-b border-border">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Layanan Publik JKN</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Akses layanan administrasi mandiri yang paling sering digunakan oleh peserta dan mitra fasilitas kesehatan secara online.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {QUICK_SERVICES.map((service, idx) => (
                <div 
                  key={idx}
                  onClick={() => onNavigate(service.role)}
                  className="group cursor-pointer p-6 rounded-lg border border-border bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-primary/30 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="h-12 w-12 rounded-lg bg-blue-50 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors border border-blue-100 group-hover:border-primary">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm flex-1 leading-relaxed">{service.desc}</p>
                  <div className="mt-6 flex items-center text-primary text-sm font-bold">
                    Akses Portal <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section (Data & Transparansi) */}
        <section className="py-20 bg-primary text-white border-t border-b border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_50%)]"></div>
          <div className="mx-auto max-w-7xl px-5 md:px-8 relative z-10">
            <div className="text-center mb-12">
               <h2 className="text-2xl font-bold text-white mb-2">Transparansi Data Nasional</h2>
               <p className="text-blue-200">Sistem terintegrasi untuk seluruh masyarakat Indonesia</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/20 text-center">
              {STATS.map((stat, idx) => (
                <div key={idx} className="pt-8 md:pt-0 px-4">
                  <stat.icon className="h-10 w-10 mx-auto mb-5 text-secondary" />
                  <div className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">{stat.value}</div>
                  <div className="text-blue-100 font-semibold uppercase tracking-widest text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer / Info */}
        <footer className="bg-slate-50 pt-20 pb-10 border-t border-border text-sm text-muted-foreground">
          <div className="mx-auto max-w-7xl px-5 md:px-8 grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6 text-foreground">
                <Shield className="h-7 w-7 text-primary" />
                <span className="font-bold text-xl">BPJSight</span>
              </div>
              <p className="mb-6 leading-relaxed max-w-md">BPJSight adalah portal prototipe untuk Sistem Informasi Administrasi dan Pemantauan Klaim Kesehatan Terpadu Republik Indonesia.</p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Layanan Peserta</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Pendaftaran Baru</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cek Status JKN</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Riwayat Klaim</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Skrining Mandiri</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Fasilitas Kesehatan</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Portal V-Claim</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">E-Klaim Terpadu</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Referensi Diagnosa</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Verifikasi Dokumen</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Hubungi Kami</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><Phone className="h-4 w-4"/> Care Center 165</a></li>
                <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><Globe2 className="h-4 w-4"/> PANDAWA</a></li>
                <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><Mail className="h-4 w-4"/> Lapor Gratifikasi</a></li>
              </ul>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-5 md:px-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-medium">&copy; 2026 BPJSight. Prototype Non-Komersial (Hanya untuk keperluan desain).</p>
            <div className="flex gap-6 font-medium">
              <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

// Helper component
const Badge = () => (
  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-secondary border border-green-200 text-xs font-bold">
    <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div> Live
  </span>
);

export default LandingHero;
