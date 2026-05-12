import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Building2, Shield, Activity, Users, Edit3, Save, Database, Phone, MapPin, TrendingUp, Lock
} from "lucide-react";
import { toast } from "sonner";

const STATS = [
  { label: "Klaim Demo Diproses", value: "24", icon: Activity },
  { label: "Kelengkapan Dokumen", value: "78/100", icon: TrendingUp },
  { label: "Unit Demo", value: "6", icon: Users },
];

const EHR = [
  { name: "Preview FHIR Demo", status: "demo" },
  { name: "Gateway Klaim Demo", status: "demo" },
  { name: "Sandbox Dokumen", status: "sandbox" },
  { name: "Mock EHR Internal", status: "demo" },
];

const DEPARTMENTS = ["Kardiologi", "Neurologi", "Pediatri", "Bedah Umum", "Onkologi", "Radiologi", "IGD 24 Jam", "Laboratorium"];

const STAFF = [
  { name: "dr. Andini Pratama", role: "Verifikator Senior", status: "online" },
  { name: "Bagus Setiawan", role: "Admin Klaim", status: "online" },
  { name: "Maya Sari", role: "Koder INA-CBG's", status: "offline" },
  { name: "dr. Rizki Hidayat", role: "DPJP", status: "online" },
];

const HospitalProfile = ({ onBack }: { onBack: () => void }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "RS Demo Jakarta",
    code: "1234567",
    address: "Jl. Kesehatan No. 12, Jakarta Selatan",
    phone: "+62 21 7000-1234",
    director: "dr. Sutrisno Wibowo, MARS",
    type: "RS Tipe B",
  });
  const [autoSync, setAutoSync] = useState(true);
  const [auditLog, setAuditLog] = useState(true);

  const save = () => { setEditing(false); toast.success("Profil rumah sakit diperbarui"); };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Profil Rumah Sakit</h1>
          <p className="text-sm text-muted-foreground">Profil demo rumah sakit dan pengaturan simulasi</p>
        </div>
        <Button variant="ghost" onClick={onBack}>Kembali</Button>
      </div>

      <Card className="overflow-hidden border-primary/20" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="bg-gradient-to-br from-primary/15 via-primary/8 to-transparent p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl gradient-primary ">
              <Building2 className="h-12 w-12 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{form.name}</h2>
              <p className="text-sm text-muted-foreground">{form.type} · Kode: {form.code}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-success/15 text-success border border-success/25"><Shield className="mr-1 h-3 w-3" />Faskes Demo</Badge>
                <Badge className="bg-primary/15 text-primary border border-primary/25"><Database className="mr-1 h-3 w-3" />Preview FHIR</Badge>
                <Badge className="bg-info/15 text-info border border-info/25">Data Simulasi</Badge>
              </div>
            </div>
            <Button onClick={() => editing ? save() : setEditing(true)} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 border-0">
              {editing ? <><Save className="h-4 w-4" /> Simpan</> : <><Edit3 className="h-4 w-4" /> Edit Profil</>}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          {([
            ["Nama RS", "name"],
            ["Kode Faskes", "code"],
            ["Alamat", "address"],
            ["Telepon", "phone"],
            ["Direktur", "director"],
            ["Tipe RS", "type"],
          ] as const).map(([label, key]) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
              <Input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} disabled={!editing} className="rounded-xl bg-muted/20" />
            </div>
          ))}
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> Sistem Demo Terkait</h3>
          <div className="space-y-2">
            {EHR.map(e => (
              <div key={e.name} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <span className="text-sm font-semibold text-foreground">{e.name}</span>
                <Badge className={e.status === "demo"
                  ? "bg-success/15 text-success border border-success/25 text-xs"
                  : "bg-warning/15 text-warning border border-warning/25 text-xs"}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${e.status === "demo" ? "bg-success" : "bg-warning"}`} />
                  {e.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Departemen Aktif</h3>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map(d => (
              <Badge key={d} className="bg-muted/40 text-foreground border border-border/60 px-3 py-1">{d}</Badge>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Manajemen Akses Staf</h3>
        <div className="divide-y divide-border/40">
          {STAFF.map(s => (
            <div key={s.name} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.role}</p>
                </div>
              </div>
              <Badge className={s.status === "online"
                ? "bg-success/15 text-success border border-success/25 text-xs"
                : "bg-muted/40 text-muted-foreground border border-border/60 text-xs"}>
                <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${s.status === "online" ? "bg-success" : "bg-muted-foreground"}`} />
                {s.status}
              </Badge>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-3 w-full rounded-xl"><Users className="h-4 w-4" /> Kelola Staf</Button>
      </Card>

      <Card className="p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Keamanan & Integrasi</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Preview FHIR Demo</p>
              <p className="text-xs text-muted-foreground">Menampilkan contoh sinkronisasi tanpa koneksi produksi.</p>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Audit Log Demo</p>
              <p className="text-xs text-muted-foreground">Mencatat aktivitas demo tanpa data pasien asli.</p>
            </div>
            <Switch checked={auditLog} onCheckedChange={setAuditLog} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /> {form.address}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4 text-primary" /> {form.phone}</div>
          </div>
        </div>
      </Card>
    </main>
  );
};

export default HospitalProfile;


