import type { CategoryInfo, SourcingBrief, Supplier, SupplierCategory } from "./types";

export type RfqTone = "formal" | "concise";

export type RfqDraft = {
  subject: string;
  body: string;
};

// The abaya demo's first run: 6 designs × 6 pieces.
const DEMO_DESIGNS = 6;
const DEMO_PIECES_PER_DESIGN = 6;

function demoRequestFor(category: SupplierCategory) {
  const designs = DEMO_DESIGNS;
  const piecesPerDesign = DEMO_PIECES_PER_DESIGN;
  const total = designs * piecesPerDesign;
  switch (category) {
    case "fabric":
      return {
        need: `fabric for a first collection of ${designs} designs (${piecesPerDesign} pieces each, ${total} pieces in total)`,
        questions: [
          "Price per metre for your premium black crepe and nida, including any colour options",
          "Minimum cut per colour, and whether you can supply around 20–25 m per colour",
          "Availability of swatches before we order",
          "Current lead time and whether the same lot can be reserved for reorders",
        ],
      };
    case "tailoring":
      return {
        need: `sampling and production for ${designs} abaya designs, with a small initial run of ${piecesPerDesign} pieces per design (${total} pieces)`,
        questions: [
          "Cost per sample and per production piece, including pattern making",
          `Whether you accept ${piecesPerDesign} pieces per design as a minimum`,
          "Lead time for samples and for the first production run",
          "Your quality checks and how alterations or defects are handled",
        ],
      };
    case "embellishment":
      return {
        need: `trims or embellishment for 1–2 signature designs within a ${total}-piece first collection`,
        questions: [
          "Price per metre or per panel for subtle, premium detailing",
          "Minimum order and whether you can supply around 10 m",
          "Whether samples can be sent to our tailor for a fitting",
          "Lead time and colour-matching options",
        ],
      };
    case "packaging":
      return {
        need: `premium gift boxes for a first run of ${total} pieces, with a simple foil logo`,
        questions: [
          "Price per box at 50 and 100 units, including logo printing",
          "Available sizes for a folded abaya, and insert or tissue options",
          "Artwork requirements and a proof before production",
          "Lead time and delivery within Dubai",
        ],
      };
    default:
      return { need: "a quotation for your products or services", questions: ["Unit price", "Minimum order", "Lead time", "Delivery"] };
  }
}

/**
 * Builds the enquiry from the brief and the category's request. Live
 * categories carry Claude's request; the demo uses its own copy. Live options
 * are supplier types, so the greeting is addressed generically.
 */
export function generateRfq(
  supplier: Supplier,
  category: CategoryInfo,
  brief: SourcingBrief,
  tone: RfqTone,
): RfqDraft {
  const { need, questions } = category.rfq ?? demoRequestFor(category.id);
  const subject = `Quote request: ${supplier.offering.toLowerCase()} for ${brief.brand}`;
  const isType = Boolean(category.rfq);

  if (tone === "concise") {
    return {
      subject,
      body: [
        isType ? "Hi there," : `Hi ${supplier.name} team,`,
        "",
        `I'm launching ${brief.brand} in ${brief.location} and I'm looking for ${need}.`,
        "",
        "Could you share:",
        ...questions.map((q) => `• ${q}`),
        "",
        `We're aiming to launch ${brief.launchWindow}. Thanks — happy to visit or jump on a call.`,
        "",
        "Best regards,",
        "[Your name]",
      ].join("\n"),
    };
  }

  return {
    subject,
    body: [
      isType ? "Dear Sir or Madam," : `Dear ${supplier.name} team,`,
      "",
      `I am the founder of ${brief.brand} based in ${brief.location}. ${brief.positioningSentence}`,
      "",
      `We would like to request a quotation for ${need}.`,
      "",
      "Could you please confirm the following:",
      ...questions.map((q, i) => `${i + 1}. ${q}`),
      "",
      `We are planning to launch ${brief.launchWindow}, so we would appreciate your quotation and availability at your earliest convenience. ${
        isType ? "We would be glad to arrange a call or meeting to discuss further." : "We would also be glad to visit your premises to review samples."
      }`,
      "",
      "Kind regards,",
      "[Your name]",
      "[Brand name] · [Phone] · [Email]",
    ].join("\n"),
  };
}
