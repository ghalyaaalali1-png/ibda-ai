import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

/** Shell for public marketing pages. App screens will live in a separate route group. */
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative isolate min-h-dvh overflow-x-clip">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
