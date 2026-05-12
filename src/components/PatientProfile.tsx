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

const WHATSAPP_AVATAR = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 212 212'><path fill='#DFE5E7' d='M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z'/><g fill='#FFF'><path d='M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-22.1-19.299c-10.366-5.84-22.612-9.221-35.643-9.221s-25.277 3.381-35.643 9.221a67.704 67.704 0 0 0-22.1 19.299 63.083 63.083 0 0 0-2.065 2.955C70.642 194.342 87.045 200.5 106.25 200.5s35.608-6.158 50.311-28.885z'/><path d='M106.002 96.633c12.791 0 23.16-10.371 23.16-23.16 0-12.792-10.369-23.161-23.16-23.161-12.79 0-23.159 10.369-23.159 23.161 0 12.789 10.369 23.16 23.159 23.16z'/></g></svg>
`);

const STATS = [
  { label: "Total Klaim", value: "12", icon: Activity },
  { label: "Disetujui", value: "10", icon: Shield },
  { label: "Diproses", value: "2", icon: Heart },
];

const HOSPITALS = ["RS Demo Jakarta", "RS Demo Bandung", "Klinik Demo Sentosa"];

const PatientProfile = ({ onBack }: { onBack: () => void }) => {
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.displayName ?? currentUser?.name ?? "Pasien BPJS",
    nik: currentUser?.identifierMasked ?? "•••• •••• •••• 0123",
    bpjs: currentUser?.bpjsMasked ?? "•••• •••• •7890",
    blood: "O+",
    phone: "+62 812-3456-7890",
    emergency: "Keluarga Pasien · +62 813-1111-2222",
    history: "Hipertensi terkontrol, tidak ada riwayat operasi",
  });
  const [twoFA, setTwoFA] = useState(true);
  const [bioLogin, setBioLogin] = useState(false);

  const save = () => {
    setEditing(false);
    toast.success("Profil berhasil diperbarui");
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Profil Saya</h1>
          <p className="text-sm text-muted-foreground">Kelola informasi akun demo pasien</p>
        </div>
        <Button variant="ghost" onClick={onBack}>Kembali</Button>
      </div>

      <Card className="overflow-hidden border-primary/20" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/8 to-transparent p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <img src={WHATSAPP_AVATAR} alt="Avatar" className="h-24 w-24 rounded-full border-4 border-card shadow-lg shrink-0 bg-muted" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{form.name}</h2>
              <p className="text-sm text-muted-foreground">BPJS Kelas 1 · Aktif</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-success/15 text-success border border-success/25"><Shield className="mr-1 h-3 w-3" />Akun Demo</Badge>
                <Badge className="bg-primary/15 text-primary border border-primary/25"><Droplet className="mr-1 h-3 w-3" />Gol. Darah {form.blood}</Badge>
              </div>
            </div>
            <Button onClick={() => editing ? save() : setEditing(true)} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 border-0">
              {editing ? <><Save className="h-4 w-4" /> Simpan</> : <><Edit3 className="h-4 w-4" /> Edit Profil</>}
            </Button>
          </div>
        </div>

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




