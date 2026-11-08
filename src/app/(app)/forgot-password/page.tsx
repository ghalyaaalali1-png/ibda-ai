import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { ForgotPasswordForm } from "@/features/auth/components/PasswordForms";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: `${t.auth.forgot.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}` };
}

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader />
      <main>
        <Container className="flex justify-center py-12 sm:py-20">
          <div className="w-full max-w-md">
            <ForgotPasswordForm />
          </div>
        </Container>
      </main>
    </>
  );
}
