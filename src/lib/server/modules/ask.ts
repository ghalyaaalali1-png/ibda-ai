import "server-only";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { IBDA_MODEL, getAnthropic } from "@/lib/server/anthropic";

/** A failure with a message that's safe to show the founder, and its HTTP status. */
export class AssessmentError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type Completeness<T> = (output: T) => string[];

/** Lists required parts that came back empty, e.g. ["setup.options", "nextActions"]. */
export function emptyParts(checks: Record<string, unknown>) {
  return Object.entries(checks)
    .filter(([, v]) => (Array.isArray(v) ? v.length === 0 : typeof v === "string" ? !v.trim() : !v))
    .map(([k]) => k);
}

/**
 * One structured request to Claude; returns the parsed, schema-valid output.
 * A schema-valid answer can still leave sections empty, so `missing` checks
 * the parts the screens need and the request is retried once if any are empty.
 */
export async function ask<T extends z.ZodType>(
  system: string,
  schema: T,
  founderInput: string,
  task: string,
  missing: Completeness<z.infer<T>>,
  effort: "low" | "medium" = "medium",
) {
  let reminder = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await getAnthropic().beta.messages.parse({
      model: IBDA_MODEL,
      max_tokens: 16000,
      // If the model declines, the API retries on a fallback model automatically.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      output_config: { effort, format: betaZodOutputFormat(schema) },
      messages: [{ role: "user", content: `${task}${reminder}\n\n${founderInput}` }],
    });
    if (response.stop_reason === "refusal") {
      throw new AssessmentError("The assessment couldn't be completed for this idea.", 422);
    }
    const output = response.parsed_output as z.infer<T> | null;
    const gaps = output ? missing(output) : ["the whole response"];
    if (output && gaps.length === 0) return output;
    console.warn("Incomplete structured output", { task: task.slice(0, 40), stop: response.stop_reason, gaps });
    reminder = `\n\nIMPORTANT: fill in every field with real content. A previous answer left these empty: ${gaps.join(", ")}.`;
  }
  throw new AssessmentError("The assessment came back incomplete. Please try again.", 502);
}
