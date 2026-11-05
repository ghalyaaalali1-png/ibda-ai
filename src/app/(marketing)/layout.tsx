import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { currentUser } from "@/features/auth/session";

/** Shell for public marketing pages. App screens live in a separate route group. */
export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const signedIn = (await currentUser()) !== null;
  return (
    <div className="relative isolate min-h-dvh overflow-x-clip">
      <Navbar signedIn={signedIn} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
