import { LegalPage, legalMetadata } from "@/features/legal/LegalPage";

export const generateMetadata = () => legalMetadata("privacy");

export default function PrivacyPage() {
  return <LegalPage page="privacy" />;
}
