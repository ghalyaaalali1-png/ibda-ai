import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import { captionCopySchema, captionRequestSchema } from "@/features/marketing/captionSchema";
import { contentTypes } from "@/features/marketing/captions";
import { IBDA_MODEL, getAnthropic, hasAnthropicKey } from "@/lib/server/anthropic";
import { captionSystemPrompt } from "@/lib/server/ibda-agent-guide";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Writes one ready-to-review Instagram or TikTok post for the founder's
 * business. Runs on the server only; the API key never reaches the browser.
 */
export async function POST(request: Request) {
  if (!hasAnthropicKey()) return fail("The AI service isn't configured.", 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }
  const input = captionRequestSchema.safeParse(body);
  if (!input.success) return fail("Invalid caption request.", 400);

  const { type, platform, language, context } = input.data;
  const kind = contentTypes.find((c) => c.id === type)!;
  const purpose = type === "styling" ? "Show the product or service in use" : kind.objective;

  try {
    const response = await getAnthropic().beta.messages.parse({
      model: IBDA_MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: captionSystemPrompt,
      output_config: { effort: "low", format: betaZodOutputFormat(captionCopySchema) },
      messages: [
        {
          role: "user",
          content: `Write one ${platform === "instagram" ? "Instagram post" : "TikTok video"} in ${
            language === "ar" ? "natural Gulf-appropriate Modern Standard Arabic (not a literal translation)" : "English"
          }.
Content type: ${kind.label === "Styling" ? "Product in use" : kind.label} — goal: ${purpose}.

<founder_input>
Business: ${context.business}
Location: ${context.location}
Positioning: ${context.positioning}
Target customer: ${context.targetCustomer}
Price: ${context.priceRange}
Channels: ${context.channels.join(", ")}
</founder_input>`,
        },
      ],
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return fail("The caption couldn't be written. Please try again.", 422);
    }
    return NextResponse.json({ copy: response.parsed_output });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return fail("The AI service is busy. Please try again shortly.", 503);
    if (error instanceof Anthropic.APIConnectionError) return fail("Couldn't reach the AI service.", 503);
    if (error instanceof Anthropic.APIError) {
      console.error("Caption API error", error.status, error.message);
      const detail = process.env.NODE_ENV === "production" ? "" : ` (${error.status}: ${error.message})`;
      return fail(`The AI service returned an error.${detail}`, 502);
    }
    console.error("Caption failed", error);
    return fail("Something went wrong writing the caption.", 500);
  }
}
