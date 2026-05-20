import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="mb-4 text-7xl font-extrabold text-primary">404</h1>
          <p className="mb-6 text-xl text-muted-foreground font-semibold">Halaman tidak ditemukan</p>
          <Button asChild className="rounded-xl px-8 h-12 text-base font-bold">
            <a href="/">Kembali ke Beranda</a>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;


