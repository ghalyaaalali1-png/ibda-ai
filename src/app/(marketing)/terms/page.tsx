import { LegalPage, legalMetadata } from "@/features/legal/LegalPage";

export const generateMetadata = () => legalMetadata("terms");

export default function TermsPage() {
  return <LegalPage page="terms" />;
}
