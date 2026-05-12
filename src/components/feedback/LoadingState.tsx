import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function LoadingState({
  title = "Memuat data...",
  description = "Mohon tunggu sebentar.",
  className = "",
}: LoadingStateProps) {
  return (
    <Card className={`flex flex-col items-center justify-center rounded-2xl border-border/60 p-8 text-center ${className}`} style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      </div>
      <h3 className="text-base font-extrabold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
    </Card>
  );
}


