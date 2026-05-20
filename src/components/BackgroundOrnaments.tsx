export function BackgroundOrnaments() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 dark:bg-[radial-gradient(circle_at_72%_18%,rgba(45,212,191,0.28),transparent_28%),radial-gradient(circle_at_0%_72%,rgba(14,165,233,0.20),transparent_22%),linear-gradient(180deg,#070d1d_0%,#09142a_55%,#071025_100%)]" />
      <div className="absolute inset-0 dark:bg-[linear-gradient(rgba(94,234,212,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(94,234,212,0.08)_1px,transparent_1px)] bg-[size:58px_58px] opacity-70" />
      <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute left-[58%] top-[10%] h-72 w-72 rounded-full bg-primary/15 blur-[90px]" />
    </div>
  );
}
