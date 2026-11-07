import type { InitialAssessment } from "@/features/assessment/schema";
import type { LaunchProfile } from "@/features/launch-profile/profile";
import type { Locale } from "@/i18n/config";

export type ProjectStatus = "draft" | "generating" | "ready" | "failed" | "archived";

/**
 * A saved business as one screen needs it, in the interface language.
 * `state`: no plan yet, the plan ready to show, or a plan (or business name)
 * still to be translated into this language.
 */
export type ProjectView = {
  id: string;
  name: string;
  status: ProjectStatus;
  idea: string;
  /** The onboarding answers as given. */
  answers: LaunchProfile;
  /** The same answers with the business name in the interface language, when known. */
  profile: LaunchProfile;
  state: "notGenerated" | "ready" | "needsTranslation";
  assessment: InitialAssessment | null;
  updatedAt: string;
};

/** One card on My projects. */
export type ProjectSummary = {
  id: string;
  name: string;
  /** The business name in another interface language, when it was translated. */
  nameTranslations: Partial<Record<Locale, string>>;
  status: ProjectStatus;
  answers: LaunchProfile;
  updatedAt: string;
};

/** The journey's pages inside one saved project. */
export const projectRoutes = (id: string) => ({
  analysis: `/projects/${id}`,
  plan: `/projects/${id}/plan`,
  suppliers: `/projects/${id}/suppliers`,
  marketing: `/projects/${id}/marketing`,
  launchPack: `/projects/${id}/launch-pack`,
});

export type JourneyRoutes = ReturnType<typeof projectRoutes>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isProjectId = (id: string) => UUID.test(id);
