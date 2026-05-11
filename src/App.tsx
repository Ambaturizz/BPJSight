import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth/AuthProvider";
import AppRouter from "@/app/router";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider onTimeout={() => toast.warning("Sesi berakhir karena tidak aktif. Silakan masuk kembali.")}>
        <Toaster />
        <Sonner />
        <AppRouter />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
