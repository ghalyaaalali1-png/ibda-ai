import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { IBDA_MODEL, getAnthropic, hasAnthropicKey } from "@/lib/server/anthropic";

export const dynamic = "force-dynamic";

/**
 * Development-only check that the API key is configured and accepted.
 * Looks up the model (no tokens generated, no cost) and never returns the key.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  if (!hasAnthropicKey()) {
    return NextResponse.json({
      configured: false,
      connected: false,
      message: "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.",
    });
  }

  try {
    const model = await getAnthropic().models.retrieve(IBDA_MODEL);
    return NextResponse.json({ configured: true, connected: true, model: model.id });
  } catch (error) {
    let message = "Could not reach the Anthropic API.";
    if (error instanceof Anthropic.AuthenticationError) {
      message = "The API key was rejected. Check that it was copied correctly and is still active.";
    } else if (error instanceof Anthropic.PermissionDeniedError) {
      message = "The API key doesn't have access to this model.";
    } else if (error instanceof Anthropic.RateLimitError) {
      message = "Rate limited — try again shortly.";
    } else if (error instanceof Anthropic.APIConnectionError) {
      message = "Network error — check your internet connection.";
    } else if (error instanceof Anthropic.APIError) {
      message = `Anthropic API error (${error.status}).`;
    }
    return NextResponse.json({ configured: true, connected: false, message });
  }
}
