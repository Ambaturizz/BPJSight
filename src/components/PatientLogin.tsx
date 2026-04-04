import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, User, Eye, EyeOff } from "lucide-react";

interface PatientLoginProps {
  onBack: () => void;
  onLogin: () => void;
}

const PatientLogin = ({ onBack, onLogin }: PatientLoginProps) => {
  const [nik, setNik] = useState("");
  const [bpjsNumber, setBpjsNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </button>

        <Card className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <User className="h-7 w-7" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">BPJSight</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              {isRegistering ? "Registrasi Pasien" : "Login Pasien"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isRegistering
                ? "Daftar menggunakan NIK dan nomor BPJS Anda"
                : "Masuk dengan NIK dan nomor kartu BPJS Kesehatan"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nik">Nomor NIK (KTP)</Label>
              <Input
                id="nik"
                placeholder="Masukkan 16 digit NIK"
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                maxLength={16}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bpjs">Nomor Kartu BPJS</Label>
              <Input
                id="bpjs"
                placeholder="Masukkan 13 digit nomor BPJS"
                value={bpjsNumber}
                onChange={(e) => setBpjsNumber(e.target.value.replace(/\D/g, "").slice(0, 13))}
                maxLength={13}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              {isRegistering ? "Daftar Sekarang" : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isRegistering ? (
              <>
                Sudah punya akun?{" "}
                <button onClick={() => setIsRegistering(false)} className="font-medium text-primary hover:underline">
                  Masuk di sini
                </button>
              </>
            ) : (
              <>
                Belum punya akun?{" "}
                <button onClick={() => setIsRegistering(true)} className="font-medium text-primary hover:underline">
                  Daftar sekarang
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientLogin;
