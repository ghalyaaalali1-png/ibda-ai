"use server";

import { assessmentRequestSchema } from "@/features/assessment/schema";
import { currentUser } from "@/features/auth/session";
import { createProject } from "./server";

export type SaveProjectResult =
  /** Saved: continue inside the project. */
  | { status: "saved"; id: string }
  /** No account: the journey continues in the browser session, as before. */
  | { status: "noAccount" }
  /** Signed in but not saved: the founder is told, and nothing is generated. */
  | { status: "failed" };

/** Saves a finished onboarding as a new project for the signed-in founder. */
export async function saveNewProject(input: {
  idea: string;
  profile: { id: string; label: string; value: string }[];
}): Promise<SaveProjectResult> {
  if (!(await currentUser())) return { status: "noAccount" };
  const parsed = assessmentRequestSchema.safeParse(input);
  if (!parsed.success) return { status: "failed" };
  try {
    return { status: "saved", id: await createProject(parsed.data) };
  } catch (error) {
    console.error("Project not saved", error instanceof Error ? error.message : error);
    return { status: "failed" };
  }
}
