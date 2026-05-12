import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title = "Data belum tersedia",
  description = "Belum ada data yang dapat ditampilkan saat ini.",
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`flex flex-col items-center justify-center rounded-2xl border-border/60 p-8 text-center ${className}`} style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-muted-foreground">
        {icon ?? <Inbox className="h-7 w-7" aria-hidden="true" />}
      </div>
      <h3 className="mt-4 text-base font-extrabold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}


