import type { SourcingBrief, Supplier, SupplierCategory } from "./types";

export type RfqTone = "formal" | "concise";

export type RfqDraft = {
  subject: string;
  body: string;
};

function requestFor(category: SupplierCategory, brief: SourcingBrief) {
  const total = brief.designs * brief.piecesPerDesign;
  switch (category) {
    case "fabric":
      return {
        need: `fabric for a first collection of ${brief.designs} designs (${brief.piecesPerDesign} pieces each, ${total} pieces in total)`,
        questions: [
          "Price per metre for your premium black crepe and nida, including any colour options",
          "Minimum cut per colour, and whether you can supply around 20–25 m per colour",
          "Availability of swatches before we order",
          "Current lead time and whether the same lot can be reserved for reorders",
        ],
      };
    case "tailoring":
      return {
        need: `sampling and production for ${brief.designs} abaya designs, with a small initial run of ${brief.piecesPerDesign} pieces per design (${total} pieces)`,
        questions: [
          "Cost per sample and per production piece, including pattern making",
          `Whether you accept ${brief.piecesPerDesign} pieces per design as a minimum`,
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
  }
}

/**
 * Prototype RFQ writer. A real agent would draft this with a model, using the
 * same brief and supplier inputs.
 */
export function generateRfq(
  supplier: Supplier,
  brief: SourcingBrief,
  tone: RfqTone,
): RfqDraft {
  const { need, questions } = requestFor(supplier.category, brief);
  const subject = `Quote request: ${supplier.offering.toLowerCase()} for a new abaya brand`;

  if (tone === "concise") {
    return {
      subject,
      body: [
        `Hi ${supplier.name} team,`,
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
      `Dear ${supplier.name} team,`,
      "",
      `I am the founder of ${brief.brand} based in ${brief.location}. We are preparing our first collection, positioned at the ${brief.positioning} end of the market with a target retail price of ${brief.targetRetail}.`,
      "",
      `We would like to request a quotation for ${need}.`,
      "",
      "Could you please confirm the following:",
      ...questions.map((q, i) => `${i + 1}. ${q}`),
      "",
      `We are planning to launch ${brief.launchWindow}, so we would appreciate your quotation and availability at your earliest convenience. We would also be glad to visit your premises to review samples.`,
      "",
      "Kind regards,",
      "[Your name]",
      "[Brand name] · [Phone] · [Email]",
    ].join("\n"),
  };
}
