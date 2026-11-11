import { NextResponse } from "next/server";
import { z } from "zod";
import { assessmentRequestSchema } from "@/features/assessment/schema";
import { cleanItem } from "@/features/suppliers/items";
import { hasAnthropicKey } from "@/lib/server/anthropic";
import { fail, generationFailure, plainLabels } from "@/lib/server/assessmentOutput";
import { generateSupplierItem } from "@/lib/server/modules/generators";
import { allowRequest, hourlyLimits, LIMIT_MESSAGE, requesterKey } from "@/lib/server/rateLimit";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const bodySchema = assessmentRequestSchema.and(
  z.object({
    item: z.string().min(1).max(200),
    existing: z.array(z.string().max(300)).max(20).default([]),
  }),
);

/**
 * One supplier group for an item the founder names ("cups"), for the journey
 * without an account: the browser adds it to the plan it keeps. Saved
 * projects use /api/projects/[id]/suppliers, which also saves it.
 */
export async function POST(request: Request) {
  if (!hasAnthropicKey()) return fail("The AI service isn't configured.", 503);
  let body: z.infer<typeof bodySchema>;
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return fail("Invalid request.", 400);
    body = parsed.data;
  } catch {
    return fail("Invalid request.", 400);
  }
  const item = cleanItem(body.item);
  if (!item) return fail("Invalid request.", 400);
  if (!allowRequest(`supplier-item:${requesterKey(request)}`, hourlyLimits.supplierItem)) return fail(LIMIT_MESSAGE, 429);

  try {
    const locale = body.locale ?? "en";
    const generated = await generateSupplierItem({ idea: body.idea, profile: body.profile, locale }, item, body.existing);
    return NextResponse.json({ item, group: plainLabels(generated, locale) });
  } catch (error) {
    return generationFailure(error);
  }
}
