import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, ArrowLeft, Heart, AlertTriangle, CheckCircle2, Clock,
  FileText, ChevronRight, Activity, Stethoscope, CreditCard
} from "lucide-react";

interface PatientDashboardProps {
  onBack: () => void;
}

const MOCK_CLAIMS = [
  {
    id: "KLM-2024-001",
    title: "Rawat Jalan - Poli Jantung",
    hospital: "RS Harapan Kita",
    date: "28 Mar 2024",
    amount: "Rp 1.250.000",
    status: "diproses",
    steps: ["Diajukan", "Diverifikasi", "Diproses", "Selesai"],
    currentStep: 2,
    risk: null,
  },
  {
    id: "KLM-2024-002",
    title: "Rawat Inap - Bedah Minor",
    hospital: "RS Cipto Mangunkusumo",
    date: "15 Mar 2024",
    amount: "Rp 8.500.000",
    status: "berisiko",
    steps: ["Diajukan", "Diverifikasi", "Diproses", "Selesai"],
    currentStep: 1,
    risk: "Diagnosis belum terdokumentasi lengkap di rekam medis. Hubungi RS untuk melengkapi dokumentasi.",
  },
  {
    id: "KLM-2024-003",
    title: "Rawat Jalan - Poli Mata",
    hospital: "RS Mata Cicendo",
    date: "5 Mar 2024",
    amount: "Rp 650.000",
    status: "selesai",
    steps: ["Diajukan", "Diverifikasi", "Diproses", "Selesai"],
    currentStep: 3,
    risk: null,
  },
];

const BENEFITS = [
  { icon: Stethoscope, title: "Rawat Jalan", desc: "Konsultasi dokter spesialis di faskes tingkat 1 & 2", covered: true },
  { icon: Heart, title: "Rawat Inap", desc: "Perawatan kelas sesuai kepesertaan (Kelas 1)", covered: true },
  { icon: Activity, title: "Tindakan Medis", desc: "Operasi dan prosedur sesuai indikasi medis", covered: true },
  { icon: CreditCard, title: "Obat-obatan", desc: "Obat generik dan formularium nasional", covered: true },
];

type Tab = "klaim" | "manfaat" | "riwayat";

const PatientDashboard = ({ onBack }: PatientDashboardProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("klaim");

  const statusColor = (status: string) => {
    if (status === "selesai") return "bg-success text-success-foreground";
    if (status === "berisiko") return "bg-warning text-warning-foreground";
    return "bg-info text-info-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground">BPJSight</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">A</div>
            <span className="text-sm text-foreground">Ahmad Santoso</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Health Risk Card */}
        <Card className="mb-8 overflow-hidden border-primary/20">
          <div className="flex flex-col gap-4 bg-gradient-to-r from-primary/5 to-transparent p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Health Risk Card</h2>
                <p className="text-sm text-muted-foreground">BPJS Kelas 1 • No. 0001234567890</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="bg-success text-success-foreground">2 Klaim Aktif</Badge>
                  <Badge className="bg-warning text-warning-foreground">1 Perlu Tindakan</Badge>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Tindakan Mendesak
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Klaim KLM-2024-002 berisiko ditolak. Lengkapi dokumen segera.
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
          {(["klaim", "manfaat", "riwayat"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "klaim" ? "Klaim Saya" : tab === "manfaat" ? "Manfaat & Hak" : "Riwayat"}
            </button>
          ))}
        </div>

        {/* Claims Tab */}
        {activeTab === "klaim" && (
          <div className="space-y-4">
            {MOCK_CLAIMS.filter((c) => c.status !== "selesai").map((claim) => (
              <Card key={claim.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-card-foreground">{claim.title}</h3>
                      <Badge className={statusColor(claim.status)}>
                        {claim.status === "berisiko" ? "Berisiko" : "Diproses"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {claim.hospital} • {claim.date} • {claim.amount}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{claim.id}</span>
                </div>

                {/* Timeline */}
                <div className="mt-6 flex items-center gap-0">
                  {claim.steps.map((step, i) => (
                    <div key={step} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                            i <= claim.currentStep
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {i <= claim.currentStep ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <span className="mt-1 text-xs text-muted-foreground">{step}</span>
                      </div>
                      {i < claim.steps.length - 1 && (
                        <div
                          className={`mx-1 h-0.5 flex-1 ${
                            i < claim.currentStep ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Risk Warning */}
                {claim.risk && (
                  <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Prediksi Risiko Penolakan
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{claim.risk}</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <FileText className="h-4 w-4" /> Lihat Langkah Perbaikan
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === "manfaat" && (
          <div className="grid gap-4 md:grid-cols-2">
            {BENEFITS.map((b) => (
              <Card key={b.title} className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-card-foreground">{b.title}</h4>
                    <Badge className="bg-success/10 text-success">Ditanggung</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "riwayat" && (
          <div className="space-y-3">
            {MOCK_CLAIMS.filter((c) => c.status === "selesai").map((claim) => (
              <Card key={claim.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium text-card-foreground">{claim.title}</p>
                    <p className="text-sm text-muted-foreground">{claim.hospital} • {claim.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-card-foreground">{claim.amount}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
