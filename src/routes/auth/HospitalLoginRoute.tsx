import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Building2, Eye, EyeOff } from "lucide-react";
import { hospitalLoginSchema, hospitalRegisterSchema, type HospitalLoginInput, type HospitalRegisterInput } from "@/lib/validators";
import { useAuth } from "@/features/auth/AuthProvider";

export default function HospitalLoginRoute() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const { signIn } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const schema = isRegistering ? hospitalRegisterSchema : hospitalLoginSchema;
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<HospitalRegisterInput>({
      resolver: zodResolver(schema as never),
      defaultValues: { remember: true } as Partial<HospitalRegisterInput>,
    });

  const onSubmit = (values: HospitalLoginInput | HospitalRegisterInput) => {
    signIn({
      role: "hospital",
      name: ("hospitalName" in values && values.hospitalName) ? values.hospitalName : "RS MBG",
      identifier: values.faskes,
      remember: values.remember ?? true,
    });
    const dest = location.state?.from?.pathname || "/rs";
    navigate(dest, { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-info/6 blur-3xl" />
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>
        <Card className="animate-slide-up border-border/60 p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground tracking-tight">BPJSight</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {isRegistering ? "Registrasi Rumah Sakit" : "Login Rumah Sakit"}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {isRegistering && (
              <Field label="Nama Rumah Sakit" error={errors.hospitalName?.message}>
                <Input {...register("hospitalName")} placeholder="Nama institusi" className="h-11 rounded-xl bg-muted/50 border-border/60" />
              </Field>
            )}
            <Field label="Kode Faskes BPJS" error={errors.faskes?.message}>
              <Input {...register("faskes")} placeholder="4–12 karakter alfanumerik" className="h-11 rounded-xl bg-muted/50 border-border/60" />
            </Field>
            {isRegistering && (
              <Field label="NPWP Institusi" error={errors.npwp?.message}>
                <Input inputMode="numeric" {...register("npwp")} placeholder="15–16 digit NPWP" className="h-11 rounded-xl bg-muted/50 border-border/60" />
              </Field>
            )}
            <Field label="Email Admin" error={errors.email?.message}>
              <Input type="email" {...register("email")} placeholder="admin@rumahsakit.co.id" className="h-11 rounded-xl bg-muted/50 border-border/60" />
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
              Ingat sesi institusi
            </label>

            <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl gradient-primary text-primary-foreground border-0 font-bold shadow-lg shadow-primary/30">
              {isRegistering ? "Daftar Rumah Sakit" : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isRegistering ? "Sudah terdaftar? " : "Belum terdaftar? "}
            <button onClick={() => setIsRegistering(!isRegistering)} className="font-semibold text-primary hover:underline">
              {isRegistering ? "Masuk di sini" : "Daftar institusi"}
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
