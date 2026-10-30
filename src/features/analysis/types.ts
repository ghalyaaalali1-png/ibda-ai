import type { LucideIcon } from "lucide-react";

/** The kind of action an activity represents, shown in the activity panel. */
export type AgentAction =
  | "Reviewing"
  | "Researching"
  | "Calculating"
  | "Comparing"
  | "Checking sources"
  | "Planning"
  | "Assuming"
  | "Needs input";

export type AgentActivity = {
  id: string;
  /** May contain {profileFieldId} placeholders, e.g. "Testing {budget} budget". */
  label: string;
  action: AgentAction;
  /** Prototype only: how long the simulated activity runs. */
  durationMs?: number;
};

export type AgentStage = {
  id: string;
  title: string;
  icon: LucideIcon;
  /** One-line outcome shown once the stage completes. */
  result: string;
  activities: AgentActivity[];
};

export type StepStatus = "pending" | "active" | "done";

export type ActivityLogEntry = {
  key: string;
  action: AgentAction;
  label: string;
  stageTitle: string;
  /** Milliseconds since the run started. */
  atMs: number;
  status: Exclude<StepStatus, "pending">;
};
