import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, User, Eye, EyeOff } from "lucide-react";
import { patientLoginSchema, patientRegisterSchema, type PatientLoginInput, type PatientRegisterInput } from "@/lib/validators";
import { useAuth } from "@/features/auth/AuthProvider";

export default function PatientLoginRoute() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const { signIn } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const schema = isRegistering ? patientRegisterSchema : patientLoginSchema;
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<PatientRegisterInput>({
      resolver: zodResolver(schema as never),
      defaultValues: { remember: true } as Partial<PatientRegisterInput>,
    });

  const onSubmit = (values: PatientLoginInput | PatientRegisterInput) => {
    signIn({
      role: "patient",
      name: ("name" in values && values.name) ? values.name : "Polisi MBG",
      identifier: values.nik,
      remember: values.remember ?? true,
    });
    const dest = location.state?.from?.pathname || "/pasien/dashboard";
    navigate(dest, { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-info/6 blur-3xl" />
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>

        <Card className="animate-slide-up border-border/60 p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground tracking-tight">BPJSight</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {isRegistering ? "Registrasi Pasien" : "Login Pasien"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Validasi NIK 16 digit & nomor BPJS 13 digit
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {isRegistering && (
              <Field label="Nama Lengkap" error={errors.name?.message}>
                <Input {...register("name")} placeholder="Nama lengkap sesuai KTP" className="h-11 rounded-xl bg-muted/50 border-border/60" />
              </Field>
            )}
            <Field label="Nomor NIK (KTP)" error={errors.nik?.message}>
              <Input inputMode="numeric" maxLength={16} {...register("nik")} placeholder="16 digit NIK" className="h-11 rounded-xl bg-muted/50 border-border/60" />
            </Field>
            <Field label="Nomor Kartu BPJS" error={errors.bpjs?.message}>
              <Input inputMode="numeric" maxLength={13} {...register("bpjs")} placeholder="13 digit BPJS" className="h-11 rounded-xl bg-muted/50 border-border/60" />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} {...register("password")} placeholder="Min 8 karakter, huruf + angka" className="h-11 rounded-xl pr-10 bg-muted/50 border-border/60" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" {...register("remember")} className="h-4 w-4 rounded border-border/60 accent-primary" />
              Ingat saya di perangkat ini
            </label>

            <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl gradient-primary text-primary-foreground border-0 font-bold shadow-lg shadow-primary/30">
              {isRegistering ? "Daftar Sekarang" : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isRegistering ? "Sudah punya akun? " : "Belum punya akun? "}
            <button onClick={() => setIsRegistering(!isRegistering)} className="font-semibold text-primary hover:underline">
              {isRegistering ? "Masuk di sini" : "Daftar sekarang"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
