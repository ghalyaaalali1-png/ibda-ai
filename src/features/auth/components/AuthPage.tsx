import { redirect } from "next/navigation";
import Link from "next/link";
import { routes } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { getServerDictionary } from "@/i18n/server";
import { safeNext } from "../redirects";
import { currentUser } from "../session";
import { AuthForm } from "./AuthForm";
import { AuthHeader } from "./AuthHeader";

type Search = Promise<{ next?: string; error?: string }>;

/** The log-in or sign-up screen. Someone already signed in goes straight on. */
export async function AuthPage({ mode, searchParams }: { mode: "login" | "signup"; searchParams: Search }) {
  const { next: rawNext, error } = await searchParams;
  const next = rawNext ? safeNext(rawNext) : undefined;
  if (await currentUser()) redirect(next ?? routes.projects);
  const t = await getServerDictionary();

  return (
    <>
      <AuthHeader />
      <main>
        <Container className="flex justify-center py-12 sm:py-20">
          <div className="w-full max-w-md">
            <AuthForm mode={mode} next={next} initialError={error === "link" ? "linkInvalid" : error === "google" ? "googleFailed" : undefined} />
            <p className="mt-6 text-center text-sm text-mist/55">
              {t.auth.tryWithout}{" "}
              <Link href={routes.start} className="text-mist/80 underline underline-offset-4 hover:text-white">
                {t.auth.tryWithoutLink}
              </Link>
            </p>
          </div>
        </Container>
      </main>
    </>
  );
}
