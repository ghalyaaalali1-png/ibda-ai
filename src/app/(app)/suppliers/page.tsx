import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LiveSuppliers } from "@/features/suppliers/components/LiveSuppliers";

export const metadata: Metadata = {
  title: `Suppliers — ${siteConfig.name}`,
  description: "Sourcing options Ibda researched and ranked for your launch.",
};

export default function SuppliersPage() {
  // Live supplier planning when an assessment exists; the abaya demo otherwise.
  return <LiveSuppliers />;
}
