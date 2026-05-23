import { useState, useEffect, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";
import { patientLoginSchema, patientRegisterSchema } from "@/lib/validators";
import { authService } from "@/services/authService";
import { AppLayout } from "@/components/AppLayout";

interface PatientFormState {
  name: string;
  nik: string;
  bpjs: string;
  password: string;
}

type PatientField = keyof PatientFormState;
type PatientErrors = Partial<Record<PatientField, string>>;

const initialForm: PatientFormState = {
  name: "",
  nik: "",
  bpjs: "",
  password: "",
};

function getRedirectTarget(location: ReturnType<typeof useLocation>): string {
  const state = location.state as { from?: { pathname?: string } } | null;
  return state?.from?.pathname || "/pasien/dashboard";
}

function mapZodErrors(error: ZodError): PatientErrors {
  return error.issues.reduce<PatientErrors>((acc, issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && field in initialForm) {
      acc[field as PatientField] = issue.message;
    }
    return acc;
  }, {});
}

export default function PatientLoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const registerFromQuery = queryParams.get("register") === "true";
  const [isRegistering, setIsRegistering] = useState(registerFromQuery);

  useEffect(() => {
    setIsRegistering(registerFromQuery);
  }, [location.search]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<PatientFormState>(initialForm);
  const [errors, setErrors] = useState<PatientErrors>({});

  const updateField = (field: PatientField) => (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const value = field === "nik" || field === "bpjs" ? rawValue.replace(/\D/g, "") : rawValue;

    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): PatientErrors => {
    const schema = isRegistering ? patientRegisterSchema : patientLoginSchema;
    const payload = isRegistering
      ? form
      : { nik: form.nik, bpjs: form.bpjs, password: form.password };
    const result = schema.safeParse(payload);

    if (result.success) return {};
    return mapZodErrors(result.error);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Periksa kembali data pasien yang Anda isi.");
      return;
    }

    setIsLoading(true);

    try {
      const user = isRegistering
        ? await authService.registerPatient(form)
        : await authService.loginPatient({ nik: form.nik, bpjs: form.bpjs, password: form.password });

      login(user);
      toast.success(isRegistering ? "Registrasi pasien berhasil." : "Login pasien berhasil.");
      navigate(getRedirectTarget(location), { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Autentikasi pasien gagal.";
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
        <Link to="/" className="mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>

        <Card className="border-border/60 p-5 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold tracking-tight text-foreground">BPJSight</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {isRegistering ? "Registrasi Pasien" : "Login Pasien"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Data Anda dilindungi sesuai standar keamanan aplikasi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {isRegistering && (
              <Field label="Nama Lengkap" error={errors.name}>
                <Input
                  value={form.name}
                  onChange={updateField("name")}
                  placeholder="Nama lengkap sesuai KTP"
                  className="h-11 rounded-xl border-border/70 bg-background/80"
                  disabled={isLoading}
                  autoComplete="name"
                />
              </Field>
            )}

            <Field label="Nomor NIK (KTP)" error={errors.nik}>
              <Input
                value={form.nik}
                onChange={updateField("nik")}
                inputMode="numeric"
                maxLength={16}
                placeholder="16 digit NIK"
                className="h-11 rounded-xl border-border/70 bg-background/80"
                disabled={isLoading}
                autoComplete="off"
              />
            </Field>

            <Field label="Nomor Kartu BPJS" error={errors.bpjs}>
              <Input
                value={form.bpjs}
                onChange={updateField("bpjs")}
                inputMode="numeric"
                maxLength={13}
                placeholder="13 digit nomor BPJS"
                className="h-11 rounded-xl border-border/70 bg-background/80"
                disabled={isLoading}
                autoComplete="off"
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
              className="h-11 w-full rounded-xl border-0 gradient-primary font-bold text-primary-foreground shadow-lg shadow-primary/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isRegistering ? "Memproses registrasi..." : "Memeriksa akun..."}
                </>
              ) : isRegistering ? (
                "Daftar Sekarang"
              ) : (
                "Masuk"
              )}
            </Button>

            <p className="mt-4 text-xs text-center text-muted-foreground leading-relaxed">
              Dengan masuk atau mendaftar, Anda menyetujui <a href="/" className="text-primary hover:underline font-semibold">Syarat & Ketentuan</a> dan <a href="/" className="text-primary hover:underline font-semibold">Kebijakan Privasi</a> BPJSight.
            </p>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isRegistering ? "Sudah punya akun? " : "Belum punya akun? "}
            <button onClick={switchMode} className="rounded-lg px-1 font-semibold text-primary hover:underline" disabled={isLoading}>
              {isRegistering ? "Masuk di sini" : "Daftar sekarang"}
            </button>
          </div>
        </Card>
        </div>
      </div>
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


