import { english, type Dictionary } from "@/i18n";
import type { CategoryInfo, SourcingBrief, Supplier, SupplierCategory } from "./types";

export type RfqTone = "formal" | "concise";

export type RfqDraft = {
  subject: string;
  body: string;
};

// The abaya demo's first run: 6 designs × 6 pieces.
const DEMO_DESIGNS = 6;
const DEMO_PIECES_PER_DESIGN = 6;

function demoRequestFor(category: SupplierCategory, t: Dictionary) {
  const draft = t.suppliers.rfq.draft;
  const request = draft.demo[category as keyof typeof draft.demo];
  return request
    ? request(DEMO_DESIGNS, DEMO_PIECES_PER_DESIGN, DEMO_DESIGNS * DEMO_PIECES_PER_DESIGN)
    : draft.fallback;
}

/**
 * Builds the enquiry from the brief and the category's request, worded in
 * the interface language. Live categories carry Claude's request; the demo
 * uses its own copy. Live options are supplier types, so the greeting is
 * addressed generically.
 */
export function generateRfq(
  supplier: Supplier,
  category: CategoryInfo,
  brief: SourcingBrief,
  tone: RfqTone,
  t: Dictionary = english,
): RfqDraft {
  const draft = t.suppliers.rfq.draft;
  const { need, questions } = category.rfq ?? demoRequestFor(category.id, t);
  const subject = draft.subject(supplier.offering, brief.brand);
  const isType = Boolean(category.rfq);
  const name = isType ? null : supplier.name;

  if (tone === "concise") {
    const c = draft.concise;
    return {
      subject,
      body: [
        c.greeting(name),
        "",
        c.intro(brief.brand, brief.location, need),
        "",
        c.ask,
        ...questions.map((q) => `• ${q}`),
        "",
        c.close(brief.launchWindow),
        "",
        c.signOff,
        draft.yourName,
      ].join("\n"),
    };
  }

  const f = draft.formal;
  return {
    subject,
    body: [
      f.greeting(name),
      "",
      f.intro(brief.brand, brief.location, brief.positioningSentence),
      "",
      f.request(need),
      "",
      f.ask,
      ...questions.map((q, i) => `${i + 1}. ${q}`),
      "",
      f.close(brief.launchWindow, isType),
      "",
      f.signOff,
      draft.yourName,
      f.footer,
    ].join("\n"),
  };
}
