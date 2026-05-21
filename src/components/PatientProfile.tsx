import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Heart, Phone, Shield, Activity, Building2, Lock, Edit3, Save, Droplet
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthProvider";

const PATIENT_PROFILE_STORAGE_KEY = "bpjsight.patient.profile";

const WHATSAPP_AVATAR = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <defs>
    <linearGradient id='avatar-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#1D4580' />
      <stop offset='100%' stop-color='#00A14B' />
    </linearGradient>
  </defs>
  <circle cx='100' cy='100' r='100' fill='url(#avatar-grad)' />
  <circle cx='100' cy='100' r='92' fill='none' stroke='#ffffff' stroke-width='4' stroke-opacity='0.15' />
  <g fill='#ffffff'>
    <circle cx='100' cy='76' r='26' />
    <path d='M100 114c-32 0-58 17-58 39v12h116v-12c0-22-26-39-58-39z' />
  </g>
</svg>
`);

const STATS = [
  { label: "Total Klaim", value: "12", icon: Activity },
  { label: "Disetujui", value: "10", icon: Shield },
  { label: "Diproses", value: "2", icon: Heart },
];

const HOSPITALS = ["RS Polisi MBG", "RS Demo Bandung", "Klinik Demo Sentosa"];

type PatientProfileForm = {
  name: string;
  nik: string;
  bpjs: string;
  blood: string;
  phone: string;
  emergency: string;
  history: string;
};

function readPatientProfile(defaultValue: PatientProfileForm): PatientProfileForm {
  try {
    const raw = sessionStorage.getItem(PATIENT_PROFILE_STORAGE_KEY);
    if (!raw) return defaultValue;

    return { ...defaultValue, ...JSON.parse(raw) };
  } catch {
    return defaultValue;
  }
}

function savePatientProfile(form: PatientProfileForm): void {
  try {
    sessionStorage.setItem(PATIENT_PROFILE_STORAGE_KEY, JSON.stringify(form));
  } catch {
    // Abaikan jika storage browser tidak tersedia.
  }
}

const PatientProfile = ({ onBack }: { onBack: () => void }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<PatientProfileForm>(() => readPatientProfile({
    name: currentUser?.displayName ?? currentUser?.name ?? "Pasien MBG",
    nik: currentUser?.identifierMasked ?? "•••• •••• •••• 0123",
    bpjs: currentUser?.bpjsMasked ?? "•••• •••• •7890",
    blood: "O+",
    phone: "+62 812-3456-7890",
    emergency: "Keluarga Pasien · +62 813-1111-2222",
    history: "Hipertensi terkontrol, tidak ada riwayat operasi",
  }));
  const [twoFA, setTwoFA] = useState(true);
  const [bioLogin, setBioLogin] = useState(false);

  const [isFlipped, setIsFlipped] = useState(false);

  const save = () => {
    const cleanName = form.name.trim() || "Pasien MBG";
    const nextForm = { ...form, name: cleanName };

    setForm(nextForm);
    savePatientProfile(nextForm);
    updateCurrentUser({ name: cleanName, displayName: cleanName });
    setEditing(false);
    toast.success("Profil berhasil diperbarui", {
      description: "Nama pada dasbor pasien ikut berubah selama sesi website berjalan.",
    });
  };

  const formattedBpjs = form.bpjs.replace(/(.{4})/g, "$1 ").trim();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Profil Saya</h1>
          <p className="text-sm text-muted-foreground">Kelola informasi akun demo pasien</p>
        </div>
        <Button variant="ghost" onClick={onBack}>Kembali</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-5 items-stretch">
        {/* Interactive JKN KIS Card Column */}
        <div className="md:col-span-2 flex flex-col items-center justify-center space-y-3">
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="kis-card-container w-full"
            style={{ perspective: "1000px", height: "245px" }}
          >
            <div 
              className="kis-card"
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                cursor: "pointer"
              }}
            >
              {/* CARD FRONT */}
              <div 
                className="kis-card-front flex flex-col justify-between"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  borderRadius: "16px",
                  border: "1px solid rgba(29, 69, 128, 0.15)",
                  boxShadow: "0 10px 25px -5px rgba(29, 69, 128, 0.12)",
                  background: "linear-gradient(135deg, #00A14B 0%, #00A14B 35%, #1D4580 35%, #1D4580 38%, #ffffff 38%, #ffffff 100%)",
                  overflow: "hidden"
                }}
              >
                {/* Header text inside front of card */}
                <div className="flex justify-between items-start px-4 pt-3 text-[10px] font-bold text-white leading-tight">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 bg-white rounded-full flex items-center justify-center p-0.5 shadow-sm">
                      <Shield className="h-3 w-3 text-secondary" />
                    </div>
                    <span className="tracking-wide">BPJS Kesehatan</span>
                  </div>
                  <div className="text-right">
                    <p className="tracking-wide opacity-95">JAMINAN KESEHATAN NASIONAL</p>
                    <p className="text-[11px] font-extrabold tracking-widest text-emerald-400">KARTU INDONESIA SEHAT</p>
                  </div>
                </div>

                {/* Body Details */}
                <div className="px-5 pt-8 flex-1 flex flex-col justify-end pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 text-slate-800">
                      <p className="text-[14px] font-extrabold tracking-widest text-primary font-mono leading-none">
                        {formattedBpjs}
                      </p>
                      <p className="text-[12px] font-extrabold tracking-wide uppercase text-slate-900 mt-1 font-mono">
                        {form.name}
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px] font-semibold text-slate-600 mt-1">
                        <div>
                          <span className="text-[8px] text-slate-400 block leading-none">NIK</span>
                          <span className="font-mono">{form.nik}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-400 block leading-none">FASKES TINGKAT I</span>
                          <span className="truncate block max-w-[120px]">Klinik Sehat Demo</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-[8px] text-slate-400 block leading-none">TGL LAHIR</span>
                          <span>01-Jan-1990</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-[8px] text-slate-400 block leading-none">KELAS RAWAT</span>
                          <span>Kelas 1</span>
                        </div>
                      </div>
                    </div>

                    {/* Golden chip & official JKN watermark */}
                    <div className="flex flex-col items-end justify-between h-full py-0.5">
                      <div 
                        className="h-6 w-8 rounded bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 border border-yellow-600/30 flex flex-col justify-between p-1 overflow-hidden shadow-inner"
                        style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.4)" }}
                      >
                        <div className="grid grid-cols-3 gap-0.5 h-full opacity-60">
                          <div className="border-r border-b border-yellow-800/30"></div>
                          <div className="border-r border-b border-yellow-800/30"></div>
                          <div className="border-b border-yellow-800/30"></div>
                          <div className="border-r border-yellow-800/30"></div>
                          <div className="border-r border-yellow-800/30"></div>
                          <div></div>
                        </div>
                      </div>
                      <Badge className="bg-primary text-white border border-primary/20 text-[8px] font-bold px-1.5 py-0 mt-8">
                        KIS DIGITAL
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Bottom decorative bar */}
                <div className="h-1.5 w-full bg-secondary"></div>
              </div>

              {/* CARD BACK */}
              <div 
                className="kis-card-back flex flex-col justify-between p-4"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  borderRadius: "16px",
                  border: "1px solid rgba(0, 161, 75, 0.15)",
                  boxShadow: "0 10px 25px -5px rgba(0, 161, 75, 0.1)",
                  transform: "rotateY(180deg)",
                  backgroundColor: "#ffffff",
                  overflow: "hidden"
                }}
              >
                {/* Magnetic Stripe */}
                <div className="absolute top-3 left-0 w-full h-8 bg-zinc-800"></div>

                {/* Barcode & scan content */}
                <div className="mt-8 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    {/* Simulated Barcode */}
                    <div className="flex-1 bg-white p-2 border border-zinc-200 rounded-lg flex flex-col items-center">
                      <div className="flex h-10 w-full items-center justify-between px-1 bg-white">
                        {Array.from({ length: 42 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-black h-8"
                            style={{
                              width: i % 4 === 0 ? "3.5px" : i % 3 === 0 ? "1px" : i % 5 === 0 ? "4px" : "2px",
                              opacity: i % 11 === 0 ? 0 : 1
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[8px] font-mono text-zinc-500 mt-1 font-bold">
                        * {form.bpjs.replace(/\s+/g, "")} *
                      </span>
                    </div>

                    {/* Custom simulated QR Code */}
                    <div className="h-16 w-16 bg-white p-1.5 border border-zinc-200 rounded-lg flex flex-col gap-0.5 justify-between">
                      {Array.from({ length: 5 }).map((_, r) => (
                        <div key={r} className="flex gap-0.5 justify-between h-full">
                          {Array.from({ length: 5 }).map((_, c) => {
                            const isAnchor = (r < 2 && c < 2) || (r < 2 && c > 2) || (r > 2 && c < 2);
                            const fill = isAnchor || (r + c) % 3 === 0 || (r * c) % 2 === 0;
                            return (
                              <div
                                key={c}
                                className={`flex-1 h-full rounded-[1px] ${
                                  fill ? "bg-black" : "bg-transparent"
                                }`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-[7px] text-zinc-400 font-semibold space-y-0.5 leading-normal border-t border-zinc-100 pt-2">
                  <p>1. Kartu digital ini merupakan identitas kepesertaan JKN-KIS resmi BPJS Kesehatan.</p>
                  <p>2. Pindai barcode di atas untuk pendaftaran mandiri (Self Check-in) di Faskes Tingkat I & RS Rujukan.</p>
                  <p>3. Simpan kerahasiaan nomor kartu Anda. Kontak Call Center: PANDAWA 08118165165.</p>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsFlipped(!isFlipped)}
            className="text-[11px] font-semibold text-primary hover:text-primary-glow flex items-center gap-1 transition-colors"
          >
            🔄 Klik kartu untuk membalik
          </button>
        </div>

        {/* Account Info / Avatar Column */}
        <Card className="md:col-span-3 overflow-hidden border-border/70" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center h-full justify-between">
            <div className="flex gap-4 items-center">
              <img src={WHATSAPP_AVATAR} alt="Avatar" className="h-16 w-16 rounded-full border-2 border-primary shadow shrink-0 bg-muted" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground leading-snug">{form.name}</h2>
                <p className="text-xs text-muted-foreground">BPJS Kesehatan Kelas 1 · Peserta Aktif</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="bg-success/15 text-success border border-success/25 py-0 px-2 text-[10px] font-semibold">
                    <Shield className="mr-1 h-3 w-3" />Akun Demo
                  </Badge>
                  <Badge className="bg-primary/15 text-primary border border-primary/25 py-0 px-2 text-[10px] font-semibold">
                    <Droplet className="mr-1 h-3 w-3" />Gol. Darah {form.blood}
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => editing ? save() : setEditing(true)} 
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 border-0 text-xs font-semibold py-2 h-9"
            >
              {editing ? <><Save className="h-3.5 w-3.5 mr-1" /> Simpan</> : <><Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Profil</>}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/70">


        <div className="grid gap-4 p-6 md:grid-cols-2">
          {([
            ["Nama Lengkap", "name"],
            ["NIK", "nik"],
            ["Nomor BPJS", "bpjs"],
            ["Golongan Darah", "blood"],
            ["Nomor Telepon", "phone"],
            ["Kontak Darurat", "emergency"],
          ] as const).map(([label, key]) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
              <Input
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                disabled={!editing || key === "nik" || key === "bpjs"}
                className="rounded-xl bg-muted/20"
              />
            </div>
          ))}
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Riwayat Medis</Label>
            <Input
              value={form.history}
              onChange={e => setForm({ ...form, history: e.target.value })}
              disabled={!editing}
              className="rounded-xl bg-muted/20"
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {STATS.map(s => (
          <Card key={s.label} className="p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Faskes Demo Terkait</h3>
        <div className="flex flex-wrap gap-2">
          {HOSPITALS.map(h => (
            <Badge key={h} className="bg-muted/40 text-foreground border border-border/60 px-3 py-1">{h}</Badge>
          ))}
        </div>
      </Card>

      <Card className="p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Keamanan Akun</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Verifikasi 2 Langkah</p>
              <p className="text-xs text-muted-foreground">Tambahkan lapisan keamanan via OTP SMS.</p>
            </div>
            <Switch checked={twoFA} onCheckedChange={setTwoFA} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Login Biometrik</p>
              <p className="text-xs text-muted-foreground">Sidik jari atau Face ID di perangkat ini.</p>
            </div>
            <Switch checked={bioLogin} onCheckedChange={setBioLogin} />
          </div>
          <Button variant="outline" className="w-full rounded-xl"><Phone className="h-4 w-4" /> Ubah Kata Sandi</Button>
        </div>
      </Card>
    </main>
  );
};

export default PatientProfile;
