/** Shell for the KHITTA app screens (onboarding, and later analysis). */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative isolate min-h-dvh overflow-x-clip">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 print:hidden">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-60 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[140px]" />
        <div className="absolute end-[-15%] bottom-[-20%] h-[420px] w-[520px] rounded-full bg-electric-500/10 blur-[120px]" />
      </div>
      {children}
    </div>
  );
}
