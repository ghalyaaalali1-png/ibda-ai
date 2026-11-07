import { notFound, redirect } from "next/navigation";
import { routes } from "@/config/site";
import { currentUser } from "@/features/auth/session";
import { getLocale } from "@/i18n/server";
import { ProjectProvider } from "./ProjectProvider";
import { projectView } from "./server";

/**
 * A saved project's screen: signed-in owners only (anyone else is asked to
 * log in, or gets "not found"). The existing journey screen inside it shows
 * the project's plan and links within the project.
 */
export async function ProjectPage({ id, path, children }: { id: string; path: string; children: React.ReactNode }) {
  if (!(await currentUser())) redirect(`${routes.login}?next=${encodeURIComponent(`/projects/${id}${path}`)}`);
  const view = await projectView(id, await getLocale());
  if (!view) notFound();
  return <ProjectProvider view={view}>{children}</ProjectProvider>;
}
