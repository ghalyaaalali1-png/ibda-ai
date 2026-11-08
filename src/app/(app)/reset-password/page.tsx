import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { ResetPasswordForm } from "@/features/auth/components/PasswordForms";
import { currentUser } from "@/features/auth/session";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: `${t.auth.reset.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}` };
}

/** Reached from the reset email (which signs the founder in); without a session the link has expired. */
export default async function ResetPasswordPage() {
  const user = await currentUser();
  return (
    <>
      <AuthHeader />
      <main>
        <Container className="flex justify-center py-12 sm:py-20">
          <div className="w-full max-w-md">
            <ResetPasswordForm expired={!user} />
          </div>
        </Container>
      </main>
    </>
  );
}
