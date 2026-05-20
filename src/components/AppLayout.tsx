import type { ReactNode } from "react";
import { BackgroundOrnaments } from "./BackgroundOrnaments";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  withOrnaments?: boolean;
}

export function AppLayout({ children, className = "", withOrnaments = true }: AppLayoutProps) {
  return (
    <div className={`relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#070d1d] text-slate-900 dark:text-slate-100 ${className}`}>
      {withOrnaments && <BackgroundOrnaments />}
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
