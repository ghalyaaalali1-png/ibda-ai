import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { SuppliersWorkspace } from "@/features/suppliers/components/SuppliersWorkspace";

export const metadata: Metadata = {
  title: `Suppliers — ${siteConfig.name}`,
  description: "Sourcing options Ibda researched and ranked for your launch.",
};

export default function SuppliersPage() {
  return <SuppliersWorkspace />;
}
