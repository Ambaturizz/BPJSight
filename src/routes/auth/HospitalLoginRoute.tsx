import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";
import { hospitalLoginSchema, hospitalRegisterSchema } from "@/lib/validators";
import { authService } from "@/services/authService";
import { AppLayout } from "@/components/AppLayout";

interface HospitalFormState {
  hospitalName: string;
  faskes: string;
  npwp: string;
  email: string;
  password: string;
}

type HospitalField = keyof HospitalFormState;
type HospitalErrors = Partial<Record<HospitalField, string>>;

const initialForm: HospitalFormState = {
  hospitalName: "",
  faskes: "",
  npwp: "",
  email: "",
  password: "",
};

function getRedirectTarget(location: ReturnType<typeof useLocation>): string {
  const state = location.state as { from?: { pathname?: string } } | null;
  return state?.from?.pathname || "/rumah-sakit/dashboard";
}

function mapZodErrors(error: ZodError): HospitalErrors {
  return error.issues.reduce<HospitalErrors>((acc, issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && field in initialForm) {
      acc[field as HospitalField] = issue.message;
    }
    return acc;
  }, {});
}

export default function HospitalLoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [form, setForm] = useState<HospitalFormState>(initialForm);
  const [errors, setErrors] = useState<HospitalErrors>({});

  const updateField = (field: HospitalField) => (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const value = field === "npwp" ? rawValue.replace(/\D/g, "") : rawValue;

    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): HospitalErrors => {
    const schema = isRegistering ? hospitalRegisterSchema : hospitalLoginSchema;
    const payload = isRegistering
      ? form
      : { faskes: form.faskes, email: form.email, password: form.password };
    const result = schema.safeParse(payload);

    if (result.success) return {};
    return mapZodErrors(result.error);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Periksa kembali data rumah sakit yang Anda isi.");
      return;
    }

    setIsLoading(true);

    try {
      const user = isRegistering
        ? await authService.registerHospital(form)
        : await authService.loginHospital({ faskes: form.faskes, email: form.email, password: form.password });

      login(user);
      toast.success(isRegistering ? "Registrasi rumah sakit berhasil." : "Login rumah sakit berhasil.");
      navigate(getRedirectTarget(location), { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Autentikasi rumah sakit gagal.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegistering((current) => !current);
    setErrors({});
  };

  return (
    <AppLayout>
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6"><ThemeToggle compact /></div>
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-secondary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>

        <Card className="border-border/60 p-5 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-white shadow-lg shadow-secondary/30">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-secondary" />
              <span className="font-bold tracking-tight text-foreground">BPJSight</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {isRegistering ? "Registrasi Rumah Sakit" : "Login Rumah Sakit"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Data institusi dilindungi sesuai standar keamanan aplikasi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {isRegistering && (
              <Field label="Nama Rumah Sakit" error={errors.hospitalName}>
                <Input
                  value={form.hospitalName}
                  onChange={updateField("hospitalName")}
                  placeholder="Nama institusi"
                  className="h-11 rounded-xl border-border/70 bg-background/80"
                  disabled={isLoading}
                  autoComplete="organization"
                />
              </Field>
            )}

            <Field label="Kode Faskes BPJS" error={errors.faskes}>
              <Input
                value={form.faskes}
                onChange={updateField("faskes")}
                placeholder="Contoh: RSMBG123"
                className="h-11 rounded-xl border-border/70 bg-background/80"
                disabled={isLoading}
                autoComplete="off"
              />
            </Field>

            {isRegistering && (
              <Field label="NPWP Institusi" error={errors.npwp}>
                <Input
                  value={form.npwp}
                  onChange={updateField("npwp")}
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="15–16 digit NPWP"
                  className="h-11 rounded-xl border-border/70 bg-background/80"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </Field>
            )}

            <Field label="Email Admin" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={updateField("email")}
                placeholder="polisi@MBG.co.id"
                className="h-11 rounded-xl border-border/70 bg-background/80"
                disabled={isLoading}
                autoComplete="email"
              />
            </Field>

            <Field label="Password" error={errors.password}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={updateField("password")}
                  placeholder="Minimal 8 karakter"
                  className="h-11 rounded-xl border-border/70 bg-background/80 pr-10"
                  disabled={isLoading}
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl border-0 bg-secondary hover:bg-green-700 font-bold text-white shadow-lg shadow-secondary/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isRegistering ? "Memproses registrasi..." : "Memeriksa akun..."}
                </>
              ) : isRegistering ? (
                "Daftar Rumah Sakit"
              ) : (
                "Masuk"
              )}
            </Button>

            <p className="mt-4 text-xs text-center text-muted-foreground leading-relaxed">
              Dengan masuk atau mendaftar, Anda menyetujui <a href="#syarat" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} className="text-secondary hover:underline font-semibold">Syarat & Ketentuan</a> dan <a href="#privasi" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} className="text-secondary hover:underline font-semibold">Kebijakan Privasi</a> BPJSight.
            </p>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isRegistering ? "Sudah terdaftar? " : "Belum terdaftar? "}
            <button onClick={switchMode} className="rounded-lg px-1 font-semibold text-secondary hover:underline" disabled={isLoading}>
              {isRegistering ? "Masuk di sini" : "Daftar institusi"}
            </button>
          </div>
        </Card>
        </div>
      </div>
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 text-left animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
              Syarat, Ketentuan & Kebijakan Privasi
            </h3>
            <div className="text-sm text-slate-700 space-y-4 mb-6">
              <div>
                <strong className="text-slate-900 block mb-1">Privasi & Keamanan Data</strong>
                <p>Kami menjamin kerahasiaan data pribadi dan riwayat kesehatan (rekam medis) Anda. Data hanya diproses untuk memfasilitasi layanan kesehatan Anda dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan eksplisit Anda, kecuali diwajibkan oleh hukum.</p>
              </div>
              <div>
                <strong className="text-slate-900 block mb-1">Sangkalan Medis (Medical Disclaimer)</strong>
                <p>Layanan telemedicine, artikel, dan informasi pada aplikasi ini bertujuan sebagai pendamping, <strong>bukan pengganti</strong> konsultasi medis tatap muka, diagnosis pasti, atau tindakan medis langsung. Dalam kondisi kegawatdaruratan, segera kunjungi fasilitas kesehatan terdekat.</p>
              </div>
              <div>
                <strong className="text-slate-900 block mb-1">Tanggung Jawab Pengguna</strong>
                <p>Anda wajib memberikan informasi medis dan data diri yang akurat serta jujur demi ketepatan penanganan. Anda juga bertanggung jawab penuh menjaga kerahasiaan kredensial akun dan tidak menyalahgunakan aplikasi.</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" className="bg-secondary hover:bg-secondary/90 text-white font-bold px-6" onClick={() => setShowPrivacyModal(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}






