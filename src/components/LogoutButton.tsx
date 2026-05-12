import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthProvider";

interface LogoutButtonProps {
  onLoggedOut?: () => void;
  compact?: boolean;
}

const LogoutButton = ({ onLoggedOut, compact = false }: LogoutButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = async () => {
    setLoading(true);

    try {
      await logout();
      toast.success("Berhasil keluar dari akun.");
      onLoggedOut?.();
      navigate("/", { replace: true });
    } catch {
      toast.error("Gagal keluar. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className={`flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/10 font-semibold text-destructive transition-colors hover:bg-destructive/15 ${
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
            Sesi prototype akan dihapus dari perangkat ini. Data sensitif seperti password, NIK penuh, dan nomor BPJS penuh tidak disimpan di sesi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void doLogout();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Keluar...
              </>
            ) : (
              "Ya, Keluar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutButton;


