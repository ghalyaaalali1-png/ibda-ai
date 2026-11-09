import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { routes } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { AccountSettings } from "@/features/account/components/AccountSettings";
import { SignedInActions } from "@/features/account/components/SignedInActions";
import { accountDetails } from "@/features/account/server";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.account;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

/** Account settings for the signed-in founder. */
export default async function AccountPage() {
  const account = await accountDetails();
  if (!account) redirect(`${routes.login}?next=${encodeURIComponent(routes.account)}`);
  return (
    <>
      <AuthHeader actions={<SignedInActions page="account" />} />
      <main>
        <Container className="py-12 sm:py-16">
          <AccountSettings account={account} />
        </Container>
      </main>
    </>
  );
}
