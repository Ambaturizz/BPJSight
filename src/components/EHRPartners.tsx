import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Shield, Search, Hospital, Activity, CheckCircle2, Loader2, Plug,
  User, FileText, FlaskConical, Pill, Receipt, GitBranch, Calendar, MapPin,
  Wifi, ShieldCheck, Sparkles,
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
  status: "live" | "sandbox";
  patients: number;
  uptime: number;
  apiVersion: string;
  color: string;
}

const PARTNERS: Partner[] = [
  { id: "p1", name: "RS MBG Pusat", shortName: "MBG", type: "Rumah Sakit", city: "Jakarta", status: "live", patients: 12450, uptime: 99.98, apiVersion: "FHIR R4", color: "from-primary to-info" },
  { id: "p2", name: "RS Cipto Mangunkusumo", shortName: "RSCM", type: "Rumah Sakit", city: "Jakarta", status: "live", patients: 28900, uptime: 99.92, apiVersion: "FHIR R4", color: "from-info to-primary" },
  { id: "p3", name: "RS Pondok Indah", shortName: "RSPI", type: "Rumah Sakit", city: "Jakarta", status: "live", patients: 15820, uptime: 99.95, apiVersion: "FHIR R4", color: "from-success to-primary" },
  { id: "p4", name: "Klinik Mitra Keluarga", shortName: "MK", type: "Klinik", city: "Jakarta", status: "live", patients: 6210, uptime: 99.80, apiVersion: "FHIR R4", color: "from-warning to-destructive" },
  { id: "p5", name: "Klinik Sehat Sentosa", shortName: "SS", type: "Klinik", city: "Bandung", status: "sandbox", patients: 980, uptime: 99.50, apiVersion: "FHIR R4", color: "from-primary to-success" },
  { id: "p6", name: "Lab Prodia", shortName: "PRO", type: "Lab", city: "Nasional", status: "live", patients: 41200, uptime: 99.99, apiVersion: "FHIR R4", color: "from-destructive to-warning" },
  { id: "p7", name: "Puskesmas Menteng", shortName: "PKM", type: "Klinik", city: "Jakarta", status: "live", patients: 3420, uptime: 99.70, apiVersion: "FHIR R4", color: "from-info to-success" },
  { id: "p8", name: "RS Hermina", shortName: "HER", type: "Rumah Sakit", city: "Bekasi", status: "sandbox", patients: 8900, uptime: 99.60, apiVersion: "FHIR R4", color: "from-warning to-primary" },
];

const SAMPLE_PATIENT = {
  name: "Polisi MBG",
  nik: "3201234567890001",
  bpjs: "0001234567890",
  dob: "12 Mei 1990",
  gender: "Laki-laki",
  bloodType: "O+",
  allergies: ["Penisilin"],
};

const MEDICAL_HISTORY = [
  { date: "2024-03-28", title: "Konsultasi Poli Jantung", facility: "RS MBG", status: "Selesai" },
  { date: "2024-03-15", title: "Bedah Minor — Kista", facility: "RS MBG", status: "Selesai" },
  { date: "2024-02-10", title: "Imunisasi Influenza", facility: "Klinik Mitra Keluarga", status: "Selesai" },
  { date: "2023-11-05", title: "MCU Tahunan", facility: "Lab Prodia", status: "Selesai" },
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
  { id: "1", desc: "Rawat Jalan Poli Jantung", amount: "Rp 1.250.000", status: "Diproses" },
  { id: "2", desc: "Bedah Minor", amount: "Rp 8.500.000", status: "Berisiko" },
  { id: "3", desc: "Poli Mata", amount: "Rp 650.000", status: "Selesai" },
];

const REFERRALS = [
  { from: "Puskesmas Menteng", to: "RS MBG — Sp. Jantung", date: "2024-03-20" },
  { from: "RS MBG", to: "Lab Prodia — Echocardiogram", date: "2024-03-25" },
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
    }, 1400);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/60 glass-card px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground tracking-tight">BPJSight</span>
          </div>
          <Badge className="ml-3 bg-primary/15 text-primary border border-primary/25 text-xs font-semibold">
            <Plug className="mr-1 h-3 w-3" /> EHR Partners
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Integrated EHR Partners
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Partner EHR Terintegrasi
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            BPJSight terhubung dengan rumah sakit, klinik, dan laboratorium melalui standar HL7 FHIR R4.
            Klik kartu partner untuk melihat preview EHR dan simulasi sinkronisasi data.
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari rumah sakit, klinik, atau lab…"
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
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  typeFilter === t
                    ? "gradient-primary border-transparent text-primary-foreground shadow-md shadow-primary/25"
                    : "border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "Semua" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Partner grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => openPartner(p)}
              className="animate-slide-up group text-left"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <Card
                className="relative overflow-hidden border-border/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${p.color} opacity-20 blur-2xl transition-opacity group-hover:opacity-30`} />
                <div className="relative flex items-start justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color} text-primary-foreground shadow-md`}>
                    <span className="text-sm font-extrabold tracking-tight">{p.shortName}</span>
                  </div>
                  <Badge className={`text-[10px] font-bold border ${
                    p.status === "live"
                      ? "bg-success/15 text-success border-success/25"
                      : "bg-warning/15 text-warning border-warning/25"
                  }`}>
                    <span className={`mr-1 h-1.5 w-1.5 rounded-full ${p.status === "live" ? "bg-success animate-pulse" : "bg-warning"}`} />
                    {p.status === "live" ? "LIVE" : "SANDBOX"}
                  </Badge>
                </div>
                <h3 className="relative mt-4 font-bold text-foreground">{p.name}</h3>
                <p className="relative mt-0.5 text-xs text-muted-foreground inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {p.city} • {p.type}
                </p>

                <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">Pasien</p>
                    <p className="text-sm font-bold text-foreground">{(p.patients / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">Uptime</p>
                    <p className="text-sm font-bold text-foreground">{p.uptime}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground">API</p>
                    <p className="text-sm font-bold text-primary">{p.apiVersion}</p>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </main>

      {/* EHR Preview Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {active && (
            <div className="flex max-h-[90vh] flex-col">
              <DialogHeader className="border-b border-border/60 bg-muted/30 p-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${active.color} text-primary-foreground shadow-md`}>
                    <Hospital className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-base font-bold">{active.name}</DialogTitle>
                    <DialogDescription className="text-xs">
                      Preview EHR • {active.apiVersion} • {active.city}
                    </DialogDescription>
                  </div>
                  {synced ? (
                    <Badge className="bg-success/15 text-success border border-success/25 text-xs font-bold">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Connected to BPJSight
                    </Badge>
                  ) : (
                    <Badge className="bg-info/15 text-info border border-info/25 text-xs font-bold">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Syncing…
                    </Badge>
                  )}
                </div>

                {/* Sync animation bar */}
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full bg-gradient-to-r from-primary to-info transition-all duration-700 ease-out ${
                      syncing ? "w-1/2 animate-pulse" : "w-full"
                    }`}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Wifi className="h-3 w-3 text-success" /> API: 200 OK</span>
                  <span className="inline-flex items-center gap-1"><Activity className="h-3 w-3 text-primary" /> Latency: 142ms</span>
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-success" /> TLS 1.3</span>
                </div>
              </DialogHeader>

              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto border-b border-border/60 bg-card px-3 py-2">
                {tabs.map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
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

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-5">
                {syncing ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-semibold">Menyinkronkan data FHIR R4…</p>
                    <p className="text-xs">Mengambil resource Patient, Encounter, Observation</p>
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
                        <div className="sm:col-span-2 rounded-xl border border-destructive/25 bg-destructive/10 p-3">
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
                            <Badge className="bg-success/15 text-success border border-success/25 text-[10px] font-semibold">{h.status}</Badge>
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
                                  <Badge className={`text-[10px] font-semibold border ${
                                    r.flag === "high"
                                      ? "bg-destructive/15 text-destructive border-destructive/25"
                                      : "bg-success/15 text-success border-success/25"
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
                              <Badge className={`mt-0.5 text-[10px] font-semibold border ${
                                c.status === "Selesai" ? "bg-success/15 text-success border-success/25" :
                                c.status === "Berisiko" ? "bg-destructive/15 text-destructive border-destructive/25" :
                                "bg-info/15 text-info border-info/25"
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
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border/60 p-3">
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
  </div>
);

export default EHRPartners;
