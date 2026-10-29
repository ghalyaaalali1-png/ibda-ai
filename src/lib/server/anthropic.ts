// Importing this module from a Client Component fails the build, so the key
// can never be bundled into browser JavaScript.
import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/** Model used for Ibda's agent features. */
export const IBDA_MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;

/** True when ANTHROPIC_API_KEY is present in the server environment. */
export function hasAnthropicKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

/**
 * Shared server-side client. The SDK reads ANTHROPIC_API_KEY from the
 * environment (.env.local in development, the host's secret settings in
 * production) — the key is never passed around in code.
 */
export function getAnthropic() {
  if (!hasAnthropicKey()) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example) and restart the dev server.",
    );
  }
  client ??= new Anthropic();
  return client;
}
