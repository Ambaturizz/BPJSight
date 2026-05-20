import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { AppLayout } from "./AppLayout";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Shield, Search, Hospital, CheckCircle2, Loader2,
  User, FileText, FlaskConical, Pill, Receipt, GitBranch, Calendar, MapPin,
  ClipboardCheck,
} from "lucide-react";

interface EHRPartnersProps {
  onBack: () => void;
}

interface Partner {
  id: string;
  name: string;
  shortName: string;
  type: "Rumah Sakit" | "Klinik" | "Lab";
  city: string;
  status: "demo" | "sandbox";
  records: number;
  apiVersion: string;
}

const PARTNERS: Partner[] = [
  { id: "p1", name: "RS Demo Jakarta", shortName: "RSDJ", type: "Rumah Sakit", city: "Jakarta", status: "demo", records: 24, apiVersion: "FHIR Preview" },
  { id: "p2", name: "RS Demo Bandung", shortName: "RSDB", type: "Rumah Sakit", city: "Bandung", status: "demo", records: 18, apiVersion: "FHIR Preview" },
  { id: "p3", name: "Klinik Demo Sentosa", shortName: "KDS", type: "Klinik", city: "Jakarta", status: "sandbox", records: 12, apiVersion: "FHIR Preview" },
  { id: "p4", name: "Klinik Sehat Demo", shortName: "KSD", type: "Klinik", city: "Bekasi", status: "sandbox", records: 9, apiVersion: "FHIR Preview" },
  { id: "p5", name: "Lab Demo Nasional", shortName: "LDN", type: "Lab", city: "Nasional", status: "demo", records: 16, apiVersion: "FHIR Preview" },
  { id: "p6", name: "Lab Demo Bandung", shortName: "LDB", type: "Lab", city: "Bandung", status: "sandbox", records: 8, apiVersion: "FHIR Preview" },
];

const SAMPLE_PATIENT = {
  name: "Budi Santoso",
  nik: "•••• •••• •••• 0001",
  bpjs: "•••• •••• •7890",
  dob: "12 Mei 1990",
  gender: "Laki-laki",
  bloodType: "O+",
  allergies: ["Penisilin"],
};

const MEDICAL_HISTORY = [
  { date: "2024-03-28", title: "Konsultasi Poli Jantung", facility: "RS Demo Jakarta", status: "Selesai" },
  { date: "2024-03-15", title: "Tindakan Bedah Minor", facility: "RS Demo Jakarta", status: "Selesai" },
  { date: "2024-02-10", title: "Kontrol Rawat Jalan", facility: "Klinik Demo Sentosa", status: "Selesai" },
  { date: "2023-11-05", title: "Pemeriksaan Laboratorium", facility: "Lab Demo Nasional", status: "Selesai" },
];

const DIAGNOSES = [
  { code: "I10", name: "Hipertensi Esensial", date: "2024-03-28" },
  { code: "E11.9", name: "Diabetes Mellitus Tipe 2", date: "2024-01-12" },
];

const LAB_RESULTS = [
  { test: "Hemoglobin", value: "14.2", unit: "g/dL", flag: "normal" },
  { test: "Gula Darah Puasa", value: "138", unit: "mg/dL", flag: "high" },
  { test: "Kolesterol Total", value: "210", unit: "mg/dL", flag: "high" },
  { test: "LDL", value: "132", unit: "mg/dL", flag: "high" },
  { test: "Kreatinin", value: "0.9", unit: "mg/dL", flag: "normal" },
];

const PRESCRIPTIONS = [
  { name: "Amlodipine 5mg", dosage: "1x sehari", duration: "30 hari", date: "2024-03-28" },
  { name: "Metformin 500mg", dosage: "2x sehari", duration: "30 hari", date: "2024-03-28" },
  { name: "Atorvastatin 20mg", dosage: "1x malam", duration: "30 hari", date: "2024-03-28" },
];

const CLAIMS = [
  { id: "KLM-DEMO-001", desc: "Rawat Jalan Poli Jantung", amount: "Rp 1.250.000", status: "Diproses" },
  { id: "KLM-DEMO-002", desc: "Tindakan Bedah Minor", amount: "Rp 8.500.000", status: "Berisiko" },
  { id: "KLM-DEMO-003", desc: "Rawat Jalan Poli Mata", amount: "Rp 650.000", status: "Selesai" },
];

const REFERRALS = [
  { from: "Klinik Demo Sentosa", to: "RS Demo Jakarta — Sp. Jantung", date: "2024-03-20" },
  { from: "RS Demo Jakarta", to: "Lab Demo Nasional — Echocardiogram", date: "2024-03-25" },
];

type Tab = "profile" | "history" | "diagnosis" | "lab" | "rx" | "claims" | "referral";

const EHRPartners = ({ onBack }: EHRPartnersProps) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Partner["type"]>("all");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Partner | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");

  const filtered = useMemo(() => {
    return PARTNERS.filter((p) => {
      const matchesType = typeFilter === "all" || p.type === typeFilter;
      const q = query.toLowerCase();
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
      return matchesType && matchesQ;
    });
  }, [query, typeFilter]);

  const openPartner = (p: Partner) => {
    setActive(p);
    setOpen(true);
    setTab("profile");
    setSynced(false);
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
    }, 900);
  };

  const tabs: { k: Tab; label: string; icon: typeof User }[] = [
    { k: "profile", label: "Profil", icon: User },
    { k: "history", label: "Riwayat", icon: Calendar },
    { k: "diagnosis", label: "Diagnosis", icon: FileText },
    { k: "lab", label: "Lab", icon: FlaskConical },
    { k: "rx", label: "Resep", icon: Pill },
    { k: "claims", label: "Klaim BPJS", icon: Receipt },
    { k: "referral", label: "Rujukan", icon: GitBranch },
  ];

  return (
    <AppLayout>
      <header className="sticky top-0 z-20 border-b border-border/70 bg-card/95 px-4 py-3 backdrop-blur-md md:px-6 md:py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Kembali ke beranda" onClick={onBack} className="rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-foreground">BPJSight</span>
          </div>
          <div className="ml-auto"><ThemeToggle compact /></div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-8">
          <Badge variant="outline" className="border-primary/30 bg-background px-3 py-1.5 text-xs font-semibold text-primary">
            Data Simulasi · Bukan integrasi produksi
          </Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Preview EHR Simulatif
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Halaman ini menampilkan contoh struktur data berbasis FHIR untuk kebutuhan demonstrasi. Nama fasilitas, pasien, status koneksi, dan isi rekam medis adalah data demo.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari fasilitas demo…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "Rumah Sakit", "Klinik", "Lab"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  typeFilter === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "Semua" : t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => openPartner(p)}
              className="animate-slide-up group text-left"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <Card
                className="border-border/70 p-5 transition-colors hover:border-primary/40 hover:bg-muted/10"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <span className="text-sm font-extrabold tracking-tight">{p.shortName}</span>
                  </div>
                  <Badge className="border border-info/25 bg-info/10 text-[10px] font-bold text-info">
                    {p.status === "demo" ? "DEMO" : "SANDBOX"}
                  </Badge>
                </div>
                <h3 className="mt-4 font-bold text-foreground">{p.name}</h3>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {p.city} • {p.type}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">Record contoh</p>
                    <p className="text-sm font-bold text-foreground">{p.records}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">Struktur</p>
                    <p className="text-sm font-bold text-primary">{p.apiVersion}</p>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
          {active && (
            <div className="flex max-h-[90vh] flex-col">
              <DialogHeader className="border-b border-border/60 bg-muted/30 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Hospital className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-base font-bold">{active.name}</DialogTitle>
                    <DialogDescription className="text-xs">
                      Preview EHR simulatif • {active.apiVersion} • {active.city}
                    </DialogDescription>
                  </div>
                  {synced ? (
                    <Badge className="border border-success/25 bg-success/15 text-xs font-bold text-success">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Simulasi koneksi berhasil
                    </Badge>
                  ) : (
                    <Badge className="border border-info/25 bg-info/15 text-xs font-bold text-info">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Memuat demo…
                    </Badge>
                  )}
                </div>

                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full bg-primary transition-all duration-500 ease-out ${
                      syncing ? "w-1/2 animate-pulse" : "w-full"
                    }`}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><ClipboardCheck className="h-3 w-3 text-primary" /> Status simulasi: berhasil</span>
                  <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3 text-primary" /> Data demo tanpa koneksi produksi</span>
                </div>
              </DialogHeader>

              <div className="flex gap-1 overflow-x-auto border-b border-border/60 bg-card px-3 py-2">
                {tabs.map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      tab === t.k
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <Badge variant="outline" className="mb-4 border-primary/25 text-xs text-primary">Data Simulasi</Badge>
                {syncing ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-semibold">Memuat preview data demo…</p>
                    <p className="text-xs">Menyiapkan contoh Patient, Encounter, Observation, dan Claim</p>
                  </div>
                ) : (
                  <>
                    {tab === "profile" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <InfoRow label="Nama Lengkap" value={SAMPLE_PATIENT.name} />
                        <InfoRow label="NIK" value={SAMPLE_PATIENT.nik} />
                        <InfoRow label="No. BPJS" value={SAMPLE_PATIENT.bpjs} />
                        <InfoRow label="Tanggal Lahir" value={SAMPLE_PATIENT.dob} />
                        <InfoRow label="Jenis Kelamin" value={SAMPLE_PATIENT.gender} />
                        <InfoRow label="Gol. Darah" value={SAMPLE_PATIENT.bloodType} />
                        <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-3 sm:col-span-2">
                          <p className="text-xs font-bold text-destructive">Alergi</p>
                          <p className="mt-1 text-sm text-foreground">{SAMPLE_PATIENT.allergies.join(", ")}</p>
                        </div>
                      </div>
                    )}
                    {tab === "history" && (
                      <ul className="space-y-2">
                        {MEDICAL_HISTORY.map((h, i) => (
                          <li key={i} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                            <Calendar className="mt-0.5 h-4 w-4 text-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground">{h.title}</p>
                              <p className="text-xs text-muted-foreground">{h.facility} • {h.date}</p>
                            </div>
                            <Badge className="border border-success/25 bg-success/15 text-[10px] font-semibold text-success">{h.status}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                    {tab === "diagnosis" && (
                      <ul className="space-y-2">
                        {DIAGNOSES.map((d) => (
                          <li key={d.code} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{d.name}</p>
                              <p className="text-xs text-muted-foreground">ICD-10: {d.code}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{d.date}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {tab === "lab" && (
                      <div className="overflow-hidden rounded-xl border border-border/60">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                              <th className="px-4 py-2 text-left">Tes</th>
                              <th className="px-4 py-2 text-left">Hasil</th>
                              <th className="px-4 py-2 text-left">Satuan</th>
                              <th className="px-4 py-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {LAB_RESULTS.map((r, i) => (
                              <tr key={i} className="border-t border-border/60">
                                <td className="px-4 py-2 font-medium text-foreground">{r.test}</td>
                                <td className="px-4 py-2 text-foreground">{r.value}</td>
                                <td className="px-4 py-2 text-muted-foreground">{r.unit}</td>
                                <td className="px-4 py-2">
                                  <Badge className={`border text-[10px] font-semibold ${
                                    r.flag === "high"
                                      ? "border-destructive/25 bg-destructive/15 text-destructive"
                                      : "border-success/25 bg-success/15 text-success"
                                  }`}>
                                    {r.flag === "high" ? "Tinggi" : "Normal"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {tab === "rx" && (
                      <ul className="space-y-2">
                        {PRESCRIPTIONS.map((p, i) => (
                          <li key={i} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                              <Pill className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.dosage} • {p.duration}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{p.date}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {tab === "claims" && (
                      <ul className="space-y-2">
                        {CLAIMS.map((c) => (
                          <li key={c.id} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{c.desc}</p>
                              <p className="text-xs text-muted-foreground">No. {c.id}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">{c.amount}</p>
                              <Badge className={`mt-0.5 border text-[10px] font-semibold ${
                                c.status === "Selesai" ? "border-success/25 bg-success/15 text-success" :
                                c.status === "Berisiko" ? "border-destructive/25 bg-destructive/15 text-destructive" :
                                "border-info/25 bg-info/15 text-info"
                              }`}>{c.status}</Badge>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {tab === "referral" && (
                      <ul className="space-y-2">
                        {REFERRALS.map((r, i) => (
                          <li key={i} className="rounded-xl border border-border/60 p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-foreground">{r.from}</span>
                              <GitBranch className="h-3.5 w-3.5 text-primary" />
                              <span className="font-semibold text-primary">{r.to}</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{r.date}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border/60 p-3">
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
  </div>
);

export default EHRPartners;

