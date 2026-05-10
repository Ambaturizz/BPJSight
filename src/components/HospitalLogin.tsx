import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Building2, Eye, EyeOff } from "lucide-react";
import { writeSession } from "@/hooks/useSession";

interface HospitalLoginProps {
  onBack: () => void;
  onLogin: () => void;
}

const HospitalLogin = ({ onBack, onLogin }: HospitalLoginProps) => {
  const [faskesCode, setFaskesCode] = useState("");
  const [npwp, setNpwp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    writeSession({ role: "hospital", name: hospitalName || "RS MBG", loginAt: Date.now(), remember });
    onLogin();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-info/6 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 w-full max-w-md">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </button>

        <Card className="animate-slide-up border-border/60 p-8" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground tracking-tight">BPJSight</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {isRegistering ? "Registrasi Rumah Sakit" : "Login Rumah Sakit"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isRegistering
                ? "Daftar institusi dengan kode faskes dan NPWP"
                : "Masuk ke portal manajemen klaim rumah sakit"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="hospitalName" className="text-sm font-semibold">Nama Rumah Sakit</Label>
                <Input
                  id="hospitalName"
                  placeholder="Masukkan nama rumah sakit"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  required
                  className="h-11 rounded-xl bg-muted/50 border-border/60"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="faskes" className="text-sm font-semibold">Kode Faskes BPJS</Label>
              <Input
                id="faskes"
                placeholder="Masukkan kode faskes resmi"
                value={faskesCode}
                onChange={(e) => setFaskesCode(e.target.value)}
                required
                className="h-11 rounded-xl bg-muted/50 border-border/60"
              />
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="npwp" className="text-sm font-semibold">NPWP Institusi</Label>
                <Input
                  id="npwp"
                  placeholder="Masukkan NPWP rumah sakit"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  required
                  className="h-11 rounded-xl bg-muted/50 border-border/60"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email Admin</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@rumahsakit.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl bg-muted/50 border-border/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl pr-10 bg-muted/50 border-border/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-border/60 accent-primary"
              />
              Ingat sesi institusi
            </label>

            <Button type="submit" className="w-full h-11 rounded-xl gradient-primary border-0 text-primary-foreground font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200" size="lg">
              {isRegistering ? "Daftar Rumah Sakit" : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isRegistering ? (
              <>
                Sudah terdaftar?{" "}
                <button onClick={() => setIsRegistering(false)} className="font-semibold text-primary hover:underline transition-colors">
                  Masuk di sini
                </button>
              </>
            ) : (
              <>
                Belum terdaftar?{" "}
                <button onClick={() => setIsRegistering(true)} className="font-semibold text-primary hover:underline transition-colors">
                  Daftar institusi
                </button>
              </>
            )}
          </div>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Dilindungi oleh enkripsi end-to-end • BPJSight © 2024
        </p>
      </div>
    </div>
  );
};

export default HospitalLogin;
