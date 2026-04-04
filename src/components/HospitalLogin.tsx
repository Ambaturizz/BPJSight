import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Building2, Eye, EyeOff } from "lucide-react";

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
              <Building2 className="h-7 w-7" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">BPJSight</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              {isRegistering ? "Registrasi Rumah Sakit" : "Login Rumah Sakit"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isRegistering
                ? "Daftar institusi dengan kode faskes dan NPWP"
                : "Masuk ke portal manajemen klaim rumah sakit"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Nama Rumah Sakit</Label>
                <Input
                  id="hospitalName"
                  placeholder="Masukkan nama rumah sakit"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="faskes">Kode Faskes BPJS</Label>
              <Input
                id="faskes"
                placeholder="Masukkan kode faskes resmi"
                value={faskesCode}
                onChange={(e) => setFaskesCode(e.target.value)}
                required
              />
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="npwp">NPWP Institusi</Label>
                <Input
                  id="npwp"
                  placeholder="Masukkan NPWP rumah sakit"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Admin</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@rumahsakit.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {isRegistering ? "Daftar Rumah Sakit" : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isRegistering ? (
              <>
                Sudah terdaftar?{" "}
                <button onClick={() => setIsRegistering(false)} className="font-medium text-primary hover:underline">
                  Masuk di sini
                </button>
              </>
            ) : (
              <>
                Belum terdaftar?{" "}
                <button onClick={() => setIsRegistering(true)} className="font-medium text-primary hover:underline">
                  Daftar institusi
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HospitalLogin;
