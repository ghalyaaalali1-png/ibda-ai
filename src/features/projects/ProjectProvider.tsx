"use client";

import { createContext, useContext } from "react";
import { routes } from "@/config/site";
import { projectRoutes, type JourneyRoutes, type ProjectView } from "./types";

const ProjectContext = createContext<ProjectView | null>(null);

/** Wraps a saved project's screens: they show its plan and link within it. */
export function ProjectProvider({ view, children }: { view: ProjectView; children: React.ReactNode }) {
  return <ProjectContext.Provider value={view}>{children}</ProjectContext.Provider>;
}

/** The saved project on screen, or null in the journey without an account. */
export const useProject = () => useContext(ProjectContext);

const sessionRoutes: JourneyRoutes = {
  analysis: routes.analysis,
  plan: routes.plan,
  suppliers: routes.suppliers,
  marketing: routes.marketing,
  launchPack: routes.launchPack,
  // Editing needs a saved project; without one it leads to My projects.
  edit: routes.projects,
};

/** Links between the journey's pages: inside the saved project, or the no-account pages. */
export function useJourneyRoutes(): JourneyRoutes {
  const project = useProject();
  return project ? projectRoutes(project.id) : sessionRoutes;
}
