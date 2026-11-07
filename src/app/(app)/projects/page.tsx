import { ArrowRight, FolderOpen, Loader2, LogOut, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { routes } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { logOut } from "@/features/auth/actions";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { currentUser } from "@/features/auth/session";
import { profileValue } from "@/features/launch-profile/profile";
import { updatedOn } from "@/features/projects/format";
import { listProjects } from "@/features/projects/server";
import { projectRoutes, type ProjectSummary } from "@/features/projects/types";
import { displayValue, nameNeedsTranslation, type Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.projects;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

/** The business name as the founder typed it, or its translation into this language. */
function projectName(p: ProjectSummary, t: Dictionary) {
  const translated = nameNeedsTranslation(p.name, t.locale) ? p.nameTranslations[t.locale] : undefined;
  return translated ?? displayValue(t, p.name);
}

function ProjectCard({ project, t, locale }: { project: ProjectSummary; t: Dictionary; locale: Locale }) {
  const copy = t.auth.projects;
  const name = projectName(project, t);
  const location = profileValue(project.answers, "location");
  const budget = profileValue(project.answers, "budget");
  const ready = project.status === "ready";
  const href = ready ? projectRoutes(project.id).plan : projectRoutes(project.id).analysis;
  return (
    <li>
      <Link
        href={href}
        aria-label={copy.open(name)}
        className="group glass flex h-full flex-col rounded-3xl p-6 transition-colors hover:border-brand-400/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">{name}</h2>
          <ArrowRight
            aria-hidden
            className="mt-1 size-4 shrink-0 text-mist/30 transition-all group-hover:translate-x-0.5 group-hover:text-brand-300 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
          />
        </div>
        <dl className="mt-3 flex flex-col gap-1 text-sm text-mist/65">
          {location && (
            <div>
              <dt className="sr-only">{t.profile.labels.location}</dt>
              <dd>{displayValue(t, location)}</dd>
            </div>
          )}
          {budget && (
            <div>
              <dt className="sr-only">{t.profile.labels.budget}</dt>
              <dd>{displayValue(t, budget)}</dd>
            </div>
          )}
        </dl>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5">
          <p className="text-xs text-mist/45">{copy.updated(updatedOn(project.updatedAt, locale, t))}</p>
          {!ready && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-mist/60">
              {project.status === "generating" && <Loader2 aria-hidden className="size-3 animate-spin" />}
              {copy.status[project.status]}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

/** My projects: the signed-in founder's saved businesses, and a way to start a new one. */
export default async function ProjectsPage() {
  const user = await currentUser();
  if (!user) redirect(`${routes.login}?next=${encodeURIComponent(routes.projects)}`);
  const t = await getServerDictionary();
  const copy = t.auth.projects;
  const projects = await listProjects();

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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.title}</h1>
              <p className="mt-2 text-sm text-mist/55">{copy.signedInAs(user.email)}</p>
            </div>
            {projects.length > 0 && (
              <ButtonLink href={routes.start}>
                <Plus aria-hidden className="size-4" />
                {copy.newProject}
              </ButtonLink>
            )}
          </div>

          {projects.length > 0 ? (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} t={t} locale={t.locale} />
              ))}
              <li>
                <Link
                  href={routes.start}
                  className="flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-white/15 p-6 text-sm text-mist/60 transition-colors hover:border-brand-400/40 hover:text-white"
                >
                  <Plus aria-hidden className="size-5" />
                  {copy.newProject}
                </Link>
              </li>
            </ul>
          ) : (
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
          )}
        </Container>
      </main>
    </>
  );
}
