import { Link, useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, FileText, CheckCircle2, AlertTriangle, Clock,
  User as UserIcon, Stethoscope, Hash, Calendar
} from "lucide-react";
import { useClaim } from "@/features/claims/hooks/useClaims";
import { scoreClaim } from "@/features/risk/scoring";
import RiskExplainer from "@/features/risk/RiskExplainer";
import { formatIDR, formatDate, formatDateTime, maskNik } from "@/lib/formatters";

export default function ClaimDetailRoute() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const claim = useClaim(claimId);

  if (!claim) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 max-w-md text-center border-border/60">
          <h2 className="text-xl font-bold mb-2">Klaim tidak ditemukan</h2>
          <p className="text-sm text-muted-foreground mb-4">Klaim #{claimId} tidak tersedia atau telah dihapus.</p>
          <Button onClick={() => navigate("/rs")}>Kembali ke Dashboard</Button>
        </Card>
      </div>
    );
  }

  const risk = scoreClaim(claim);
  const verifiedDocs = claim.documents.filter((d) => d.verified).length;

  const fhirBundle = {
    resourceType: "Bundle",
    id: claim.fhirBundleId,
    type: "collection",
    timestamp: claim.submittedAt,
    entry: [
      { resource: { resourceType: "Patient", id: claim.nik, name: [{ text: claim.patient }], identifier: [{ system: "NIK", value: claim.nik }, { system: "BPJS", value: claim.bpjs }] } },
      { resource: { resourceType: "Encounter", id: `enc-${claim.id}`, status: "finished", subject: { reference: `Patient/${claim.nik}` } } },
      { resource: { resourceType: "Condition", code: { coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code: claim.icd10, display: claim.diagnosis }] } } },
      { resource: { resourceType: "Claim", id: claim.id, status: "active", total: { value: claim.amountIDR, currency: "IDR" } } },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 glass-card px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link to="/rs" className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <span className="text-sm text-muted-foreground">/ Klaim #{claim.id}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Klaim #{claim.id} — {claim.patient}</h1>
            <p className="text-muted-foreground text-sm mt-1">Diajukan {formatDate(claim.submittedAt)} • DPJP {claim.dpjp}</p>
          </div>
          <Badge className="bg-primary/15 text-primary border border-primary/25 text-xs font-bold capitalize">{claim.status}</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="ringkasan">
              <TabsList>
                <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
                <TabsTrigger value="dokumen">Dokumen ({verifiedDocs}/{claim.documents.length})</TabsTrigger>
                <TabsTrigger value="fhir">FHIR Bundle</TabsTrigger>
                <TabsTrigger value="audit">Audit Log</TabsTrigger>
              </TabsList>

              <TabsContent value="ringkasan">
                <Card className="p-5 border-border/60 grid gap-4 sm:grid-cols-2">
                  <Info icon={UserIcon} label="Pasien" value={claim.patient} />
                  <Info icon={Hash} label="NIK" value={maskNik(claim.nik)} />
                  <Info icon={Hash} label="Nomor BPJS" value={claim.bpjs} />
                  <Info icon={Stethoscope} label="Diagnosis" value={`${claim.diagnosis} (${claim.icd10})`} />
                  <Info icon={Calendar} label="Tanggal Pengajuan" value={formatDate(claim.submittedAt)} />
                  <Info icon={FileText} label="Nilai Klaim" value={formatIDR(claim.amountIDR)} />
                </Card>
              </TabsContent>

              <TabsContent value="dokumen">
                <Card className="border-border/60 divide-y divide-border/40">
                  {claim.documents.map((d, i) => (
                    <div key={d.key} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-bold">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{d.label}</p>
                        <p className="text-xs text-muted-foreground">{d.uploaded ? "Terunggah" : "Belum diunggah"}</p>
                      </div>
                      {d.verified ? (
                        <Badge className="bg-success/15 text-success border border-success/25 text-xs font-bold"><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</Badge>
                      ) : d.uploaded ? (
                        <Badge className="bg-warning/15 text-warning border border-warning/25 text-xs font-bold"><Clock className="h-3 w-3 mr-1" /> Review</Badge>
                      ) : (
                        <Badge className="bg-destructive/15 text-destructive border border-destructive/25 text-xs font-bold"><AlertTriangle className="h-3 w-3 mr-1" /> Missing</Badge>
                      )}
                    </div>
                  ))}
                </Card>
              </TabsContent>

              <TabsContent value="fhir">
                <Card className="p-4 border-border/60">
                  <p className="text-xs text-muted-foreground mb-2">HL7 FHIR R4 Bundle • {claim.fhirBundleId}</p>
                  <pre className="overflow-x-auto rounded-lg bg-muted/40 p-4 text-xs leading-relaxed text-foreground">
{JSON.stringify(fhirBundle, null, 2)}
                  </pre>
                </Card>
              </TabsContent>

              <TabsContent value="audit">
                <Card className="border-border/60 divide-y divide-border/40">
                  {claim.audit.map((a, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{a.action}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(a.at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">oleh {a.actor}</p>
                    </div>
                  ))}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <RiskExplainer result={risk} />
          </div>
        </div>
      </main>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
