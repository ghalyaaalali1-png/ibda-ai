import { FolderOpen, LogOut, Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { routes } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { logOut } from "@/features/auth/actions";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { currentUser } from "@/features/auth/session";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.projects;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

/** My projects. For now: who's signed in and a way to start a business; saved projects come next. */
export default async function ProjectsPage() {
  const user = await currentUser();
  if (!user) redirect(`${routes.login}?next=${encodeURIComponent(routes.projects)}`);
  const t = await getServerDictionary();
  const copy = t.auth.projects;

  return (
    <>
      <AuthHeader
        actions={
          <form action={logOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-mist/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut aria-hidden className="size-3.5 rtl:-scale-x-100" />
              {t.auth.logOut}
            </button>
          </form>
        }
      />
      <main>
        <Container className="py-12 sm:py-16">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.title}</h1>
          <p className="mt-2 text-sm text-mist/55">{copy.signedInAs(user.email)}</p>

          <section
            aria-labelledby="projects-empty"
            className="glass mt-10 flex flex-col items-center rounded-3xl px-6 py-12 text-center sm:py-16"
          >
            <span className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-mist/60">
              <FolderOpen aria-hidden className="size-5" />
            </span>
            <h2 id="projects-empty" className="mt-5 text-xl font-semibold text-white">
              {copy.emptyTitle}
            </h2>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-mist/60">{copy.emptyBody}</p>
            <ButtonLink href={routes.start} className="mt-7">
              <Plus aria-hidden className="size-4" />
              {copy.newBusiness}
            </ButtonLink>
          </section>
        </Container>
      </main>
    </>
  );
}
