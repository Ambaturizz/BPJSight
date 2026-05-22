import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BackgroundOrnaments } from "./BackgroundOrnaments";
import { Shield, ChevronRight, ChevronDown, User, Building2, Stethoscope, Activity, ClipboardCheck, Phone, Mail, Globe2, Users, HeartPulse, Menu, X, HelpCircle } from "lucide-react";

interface LandingHeroProps {
  onNavigate: (role: "patient" | "hospital" | "patient-register") => void;
}

const QUICK_SERVICES = [
  { icon: User, title: "Portal Peserta JKN", desc: "Masuk atau daftar sebagai peserta JKN-KIS. Cek status kepesertaan, riwayat klaim, dan antrean layanan kesehatan.", role: "patient" as const, colorTheme: "blue" as const },
  { icon: Building2, title: "Portal Fasilitas Kesehatan", desc: "Masuk atau daftar sebagai fasilitas kesehatan dan rumah sakit mitra. Kelola klaim, rujukan, dan verifikasi dokumen.", role: "hospital" as const, colorTheme: "green" as const },
];

// Data resmi dari Laporan Pengelolaan Program Jaminan Sosial Kesehatan s.d. 30 April 2026
const STATS = [
  { label: "Peserta JKN", value: "284.337.094", sub: "Peserta terdaftar", icon: Users },
  { label: "FKTP", value: "23.623", sub: "Fasilitas Kesehatan Tingkat Pertama", icon: Stethoscope },
  { label: "RS / Klinik Utama", value: "3.206", sub: "Faskes Rujukan Tingkat Lanjutan", icon: Building2 },
  { label: "Apotek & Optik", value: "6.380", sub: "Apotek dan optik mitra", icon: Activity },
];

const FAQ_DATA = [
  {
    category: "Kepesertaan",
    items: [
      {
        q: "Siapa saja yang wajib menjadi peserta JKN-KIS?",
        a: "Seluruh penduduk Indonesia wajib menjadi peserta JKN-KIS, termasuk WNA yang telah bekerja dan tinggal di Indonesia minimal 6 bulan. Peserta terbagi menjadi Penerima Bantuan Iuran (PBI) yang dibiayai pemerintah dan Bukan PBI (mandiri, pekerja penerima upah, bukan pekerja)."
      },
      {
        q: "Bagaimana cara mendaftar sebagai peserta JKN-KIS baru?",
        a: "Pendaftaran dapat dilakukan melalui: (1) Aplikasi Mobile JKN, (2) Website resmi BPJS Kesehatan, (3) Kantor cabang BPJS Kesehatan terdekat, atau (4) Layanan PANDAWA (Pelayanan Administrasi melalui WhatsApp) di 08118165165. Siapkan KTP, Kartu Keluarga, dan pas foto."
      },
      {
        q: "Apa perbedaan kelas rawat inap pada JKN-KIS?",
        a: "Mulai 2025, sistem kelas rawat inap JKN bertransformasi menjadi Kelas Rawat Inap Standar (KRIS) yang menyediakan standar layanan yang sama bagi seluruh peserta, menggantikan sistem Kelas 1, 2, dan 3 sebelumnya."
      },
      {
        q: "Bagaimana cara mengecek status kepesertaan JKN saya?",
        a: "Anda dapat mengecek status kepesertaan melalui: (1) Aplikasi Mobile JKN, (2) Care Center 165, (3) Layanan PANDAWA di WhatsApp 08118165165, (4) Website resmi BPJS Kesehatan, atau (5) melalui portal BPJSight ini dengan masuk ke Portal Pasien."
      },
    ]
  },
  {
    category: "Iuran & Pembayaran",
    items: [
      {
        q: "Berapa besaran iuran BPJS Kesehatan per bulan?",
        a: "Iuran JKN-KIS tergantung segmen peserta: (1) PBI: ditanggung pemerintah, (2) PPU (Pekerja Penerima Upah): 5% dari gaji (4% pemberi kerja, 1% pekerja), (3) PBPU/BP Mandiri: Kelas Rawat Inap Standar mulai dari Rp 42.000 per bulan per orang."
      },
      {
        q: "Di mana saya bisa membayar iuran BPJS Kesehatan?",
        a: "Iuran dapat dibayarkan melalui: bank (BRI, BNI, BTN, Mandiri, BCA), e-commerce (Tokopedia, Shopee, Bukalapak), minimarket (Alfamart, Indomaret), kantor pos, ATM, mobile/internet banking, atau autodebit rekening bank."
      },
      {
        q: "Apa konsekuensi jika telat membayar iuran?",
        a: "Jika menunggak lebih dari 1 bulan, kartu JKN-KIS akan dinonaktifkan sementara. Untuk mengaktifkan kembali, peserta harus melunasi seluruh tunggakan (maksimal 12 bulan). Jika dalam 45 hari setelah aktivasi peserta memerlukan rawat inap, maka dikenakan denda pelayanan sebesar 5% dari biaya diagnosa awal."
      },
    ]
  },
  {
    category: "Pelayanan Kesehatan",
    items: [
      {
        q: "Bagaimana alur berobat menggunakan JKN-KIS?",
        a: "Alur pelayanan: (1) Kunjungi FKTP (Puskesmas/Klinik/Dokter Keluarga) sesuai yang tertera di kartu, (2) Tunjukkan kartu JKN-KIS atau KTP, (3) Jika diperlukan, dokter FKTP akan memberikan surat rujukan ke Rumah Sakit, (4) Datang ke RS tujuan rujukan dengan membawa surat rujukan dan kartu JKN-KIS."
      },
      {
        q: "Apakah bisa berobat di luar faskes yang terdaftar?",
        a: "Dalam kondisi darurat medis, peserta dapat langsung ke IGD rumah sakit terdekat tanpa rujukan. Untuk kondisi non-darurat, peserta harus berobat di FKTP yang terdaftar terlebih dahulu. Peserta dapat mengubah FKTP terdaftar minimal setelah 3 bulan melalui aplikasi Mobile JKN."
      },
      {
        q: "Layanan apa saja yang ditanggung JKN-KIS?",
        a: "JKN-KIS menanggung: rawat jalan tingkat pertama & lanjutan, rawat inap, persalinan, operasi, pelayanan gigi, kacamata (dengan ketentuan), obat-obatan sesuai Fornas, pemeriksaan penunjang (lab, rontgen, USG), rehabilitasi medis, hemodialisis, dan kemoterapi/radioterapi sesuai indikasi medis."
      },
      {
        q: "Apakah JKN-KIS menanggung biaya persalinan?",
        a: "Ya, JKN-KIS menanggung biaya persalinan termasuk persalinan normal, persalinan dengan penyulit, dan operasi Caesar (SC) atas indikasi medis. Persalinan normal dapat dilakukan di FKTP (bidan/puskesmas) sedangkan persalinan dengan penyulit dirujuk ke RS."
      },
    ]
  },
  {
    category: "Portal BPJSight",
    items: [
      {
        q: "Apa itu BPJSight?",
        a: "BPJSight adalah portal prototipe Sistem Informasi Administrasi dan Pemantauan Klaim Kesehatan Terpadu yang dirancang untuk memberikan transparansi penuh dalam pemantauan status klaim, verifikasi fasilitas kesehatan, dan layanan administrasi peserta JKN-KIS secara digital."
      },
      {
        q: "Bagaimana cara masuk ke Portal Pasien?",
        a: "Klik tombol 'Portal Pasien JKN' pada halaman utama atau klik 'Masuk' pada navigasi atas. Anda akan diarahkan ke halaman login di mana Anda dapat menggunakan NIK atau nomor kartu JKN-KIS untuk mengakses dashboard peserta."
      },
      {
        q: "Apa yang bisa dilakukan di Portal Faskes?",
        a: "Portal Faskes menyediakan dashboard khusus untuk fasilitas kesehatan dan rumah sakit mitra, meliputi: pengajuan klaim elektronik, monitoring status verifikasi klaim, laporan utilisasi layanan, manajemen data rujukan, dan akses ke referensi diagnosa INA-CBGs."
      },
    ]
  },
];

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const LandingHero = ({ onNavigate }: LandingHeroProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeFaqCategory, setActiveFaqCategory] = useState(FAQ_DATA[0].category);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);

  const toggleFaq = (key: string) => {
    setOpenFaq(openFaq === key ? null : key);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans">
      <BackgroundOrnaments />
      {/* Top Utility Bar */}
      <div className="hidden md:flex justify-end items-center bg-primary text-white py-1.5 px-8 text-xs font-medium gap-6">
        <a href="tel:165" className="hover:underline flex items-center gap-1.5"><Phone className="h-3 w-3" /> Care Center 165</a>
        <a href="https://wa.me/628118165165" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1.5"><Globe2 className="h-3 w-3" /> PANDAWA</a>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#beranda" onClick={(e) => { e.preventDefault(); scrollToSection("beranda"); }} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <Shield className="h-6 w-6 text-green-300" />
            </div>
            <div>
              <span className="block text-xl font-bold leading-tight text-primary">BPJSight</span>
              <span className="block text-[10px] uppercase font-semibold text-secondary tracking-widest">Kesehatan Republik Indonesia</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-foreground">
            <a href="#beranda" onClick={(e) => { e.preventDefault(); scrollToSection("beranda"); }} className="hover:text-primary transition-colors">Beranda</a>
            <a href="#layanan" onClick={(e) => { e.preventDefault(); scrollToSection("layanan"); }} className="hover:text-primary transition-colors">Layanan Peserta</a>
            <a href="#data-jkn" onClick={(e) => { e.preventDefault(); scrollToSection("data-jkn"); }} className="hover:text-primary transition-colors">Data JKN</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection("faq"); }} className="hover:text-primary transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex gap-3">
            <Button variant="outline" className="border-border hover:bg-slate-50 text-primary font-bold shadow-sm" onClick={() => onNavigate("patient")}>Masuk</Button>
            <Button className="bg-secondary hover:bg-green-700 text-white font-bold shadow-sm" onClick={() => onNavigate("patient-register")}>Pendaftaran</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm" onClick={() => setShowDownloadConfirm(true)}>Download Aplikasi</Button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-md hover:bg-slate-100" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-border bg-white px-5 py-4 space-y-3">
            <a href="#beranda" onClick={() => { scrollToSection("beranda"); setMobileNavOpen(false); }} className="block py-2 font-semibold text-foreground hover:text-primary">Beranda</a>
            <a href="#layanan" onClick={() => { scrollToSection("layanan"); setMobileNavOpen(false); }} className="block py-2 font-semibold text-foreground hover:text-primary">Layanan Peserta</a>
            <a href="#data-jkn" onClick={() => { scrollToSection("data-jkn"); setMobileNavOpen(false); }} className="block py-2 font-semibold text-foreground hover:text-primary">Data JKN</a>
            <a href="#faq" onClick={() => { scrollToSection("faq"); setMobileNavOpen(false); }} className="block py-2 font-semibold text-foreground hover:text-primary">FAQ</a>
            <div className="flex gap-3 pt-3 border-t border-border">
              <Button variant="outline" className="flex-1 text-primary font-bold" onClick={() => { onNavigate("patient"); setMobileNavOpen(false); }}>Masuk</Button>
              <Button className="flex-1 bg-secondary text-white font-bold" onClick={() => { onNavigate("patient-register"); setMobileNavOpen(false); }}>Daftar</Button>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Banner */}
        <section id="beranda" className="relative overflow-hidden bg-slate-50 border-b border-border">
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
                <Button size="lg" className="bg-secondary hover:bg-green-700 text-white font-semibold rounded-md shadow-sm h-12 px-6" onClick={() => onNavigate("hospital")}>
                  Portal Faskes & RS
                </Button>
              </div>
            </div>
          </div>
          <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img src="/images/hero-card.jpg" alt="Peserta BPJS menunjukkan Kartu Indonesia Sehat" className="h-64 w-full object-cover sm:h-72 md:h-96 lg:h-full lg:w-full" />
            <div className="hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent"></div>
          </div>
        </section>

        {/* Quick Services */}
        <section id="layanan" className="py-20 bg-white border-b border-border">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Layanan Publik JKN</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Akses layanan administrasi mandiri yang paling sering digunakan oleh peserta dan mitra fasilitas kesehatan secara online.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {QUICK_SERVICES.map((service, idx) => {
                const isGreen = service.colorTheme === "green";
                return (
                  <div
                    key={idx}
                    onClick={() => onNavigate(service.role)}
                    className={`group cursor-pointer p-6 rounded-lg border border-border bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all flex flex-col ${
                      isGreen 
                        ? "hover:border-secondary/30 hover:shadow-md" 
                        : "hover:border-primary/30 hover:shadow-md"
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-6 transition-colors border ${
                      isGreen
                        ? "bg-green-50 text-secondary border-green-100 group-hover:bg-secondary group-hover:text-white group-hover:border-secondary"
                        : "bg-blue-50 text-primary border-blue-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary"
                    }`}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-foreground text-lg mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm flex-1 leading-relaxed">{service.desc}</p>
                    <div className={`mt-6 flex items-center text-sm font-bold ${
                      isGreen ? "text-secondary" : "text-primary"
                    }`}>
                      Akses Portal <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Data JKN — Sumber: Laporan Pengelolaan Program Jaminan Sosial Kesehatan s.d. 30 April 2026 */}
        <section id="data-jkn" className="py-20 bg-primary text-white relative overflow-hidden border-t-4 border-secondary">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_50%)]"></div>
          <div className="mx-auto max-w-7xl px-5 md:px-8 relative z-10">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">Data JKN</h2>
              <p className="text-blue-200 text-sm">Sumber: Laporan Pengelolaan Program Jaminan Sosial Kesehatan s.d. 30 April 2026</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {STATS.map((stat, idx) => (
                <div key={idx} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <stat.icon className="h-8 w-8 mx-auto mb-4 text-green-300" />
                  <div className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">{stat.value}</div>
                  <div className="text-white font-semibold text-sm mb-1">{stat.label}</div>
                  <div className="text-blue-200 text-xs">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white border-b border-border">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-green-100 text-secondary text-xs font-bold uppercase tracking-wider mb-4 border border-green-200">
                <HelpCircle className="h-3.5 w-3.5 text-secondary" /> Pusat Bantuan
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Pertanyaan yang Sering Diajukan</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Temukan jawaban untuk pertanyaan umum seputar JKN-KIS, kepesertaan, iuran, dan layanan kesehatan.</p>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {FAQ_DATA.map((cat) => {
                const isGreenTab = cat.category === "Pelayanan Kesehatan" || cat.category === "Portal BPJSight";
                return (
                  <button
                    key={cat.category}
                    onClick={() => { setActiveFaqCategory(cat.category); setOpenFaq(null); }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                      activeFaqCategory === cat.category
                        ? isGreenTab
                          ? "bg-secondary text-white border-secondary"
                          : "bg-primary text-white border-primary"
                        : isGreenTab
                          ? "bg-white text-foreground border-border hover:border-secondary/30 hover:text-secondary"
                          : "bg-white text-foreground border-border hover:border-primary/30 hover:text-primary"
                    }`}
                  >
                    {cat.category}
                  </button>
                );
              })}
            </div>

            {/* FAQ accordion */}
            <div className="max-w-3xl mx-auto space-y-3">
              {FAQ_DATA.find(c => c.category === activeFaqCategory)?.items.map((item, idx) => {
                const key = `${activeFaqCategory}-${idx}`;
                const isOpen = openFaq === key;
                return (
                  <div key={key} className="border border-border rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => toggleFaq(key)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-semibold text-foreground pr-4">{item.q}</span>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="kontak" className="bg-slate-50 pt-20 pb-10 border-t-4 border-secondary text-sm text-muted-foreground">
          <div className="mx-auto max-w-7xl px-5 md:px-8 grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <a href="#beranda" onClick={(e) => { e.preventDefault(); scrollToSection("beranda"); }} className="flex items-center gap-2 mb-6 text-foreground">
                <Shield className="h-7 w-7 text-secondary" />
                <span className="font-bold text-xl">BPJSight</span>
              </a>
              <p className="mb-6 leading-relaxed max-w-md">BPJSight adalah portal prototipe untuk Sistem Informasi Administrasi dan Pemantauan Klaim Kesehatan Terpadu Republik Indonesia.</p>
              <p className="text-xs text-muted-foreground">Sumber data: Laporan Pengelolaan Program Jaminan Sosial Kesehatan s.d. 30 April 2026</p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Layanan Peserta</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#layanan" onClick={(e) => { e.preventDefault(); scrollToSection("layanan"); }} className="hover:text-primary transition-colors">Pendaftaran Baru</a></li>
                <li><a href="#layanan" onClick={(e) => { e.preventDefault(); scrollToSection("layanan"); }} className="hover:text-primary transition-colors">Cek Status JKN</a></li>
                <li><a href="#layanan" onClick={(e) => { e.preventDefault(); scrollToSection("layanan"); }} className="hover:text-primary transition-colors">Riwayat Klaim</a></li>
                <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection("faq"); }} className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Fasilitas Kesehatan</h4>
              <ul className="space-y-3 font-medium">
                <li><button onClick={() => onNavigate("hospital")} className="hover:text-secondary transition-colors">Portal V-Claim</button></li>
                <li><button onClick={() => onNavigate("hospital")} className="hover:text-secondary transition-colors">E-Klaim Terpadu</button></li>
                <li><button onClick={() => onNavigate("hospital")} className="hover:text-secondary transition-colors">Referensi Diagnosa</button></li>
                <li><button onClick={() => onNavigate("hospital")} className="hover:text-secondary transition-colors">Verifikasi Dokumen</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Hubungi Kami</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="tel:165" className="hover:text-primary transition-colors flex items-center gap-2"><Phone className="h-4 w-4"/> Care Center 165</a></li>
                <li><a href="https://wa.me/628118165165" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2"><Globe2 className="h-4 w-4"/> PANDAWA</a></li>
                <li><a href="mailto:halo@bpjs-kesehatan.go.id" className="hover:text-primary transition-colors flex items-center gap-2"><Mail className="h-4 w-4"/> halo@bpjs-kesehatan.go.id</a></li>
              </ul>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-5 md:px-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-medium">&copy; 2026 BPJSight. Prototype Non-Komersial (Hanya untuk keperluan desain).</p>
            <div className="flex gap-6 font-medium">
              <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection("faq"); }} className="hover:text-primary transition-colors">Kebijakan Privasi</a>
              <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection("faq"); }} className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </footer>
        {showDownloadConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Download Aplikasi BPJSight Khusus Pengguna Pasien?
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Aplikasi ini akan diunduh ke perangkat Anda.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" className="flex-1 font-bold text-slate-700" onClick={() => setShowDownloadConfirm(false)}>
                  Tidak
                </Button>
                <a href="/bpjsight.apk" download="bpjsight.apk" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={() => setShowDownloadConfirm(false)}>
                    Ya
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingHero;
