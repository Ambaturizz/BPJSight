import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { LogOut, Loader2 } from "lucide-react";
import { clearSession } from "@/hooks/useSession";
import { toast } from "sonner";

interface Props { onLoggedOut: () => void; compact?: boolean }

const LogoutButton = ({ onLoggedOut, compact }: Props) => {
  const [loading, setLoading] = useState(false);

  const doLogout = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    clearSession();
    setLoading(false);
    toast.success("Berhasil keluar dari akun");
    onLoggedOut();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className={`flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15 transition-colors font-semibold ${
            compact ? "h-9 w-9 justify-center" : "px-3 py-2 text-sm"
          }`}
          aria-label="Keluar"
        >
          <LogOut className="h-4 w-4" />
          {!compact && "Keluar"}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Keluar dari BPJSight?</AlertDialogTitle>
          <AlertDialogDescription>
            Sesi Anda akan diakhiri dan token akses dihapus dari perangkat ini.
            Anda perlu masuk kembali untuk mengakses dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); doLogout(); }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Keluar...</> : "Ya, Keluar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutButton;
