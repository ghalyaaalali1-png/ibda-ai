/** A follow-up question Ibda asks before starting its analysis. */
export type Question = {
  id: string;
  prompt: string;
  /** Short line explaining why Ibda is asking. */
  helper?: string;
  options: string[];
  /** Label used for this answer in the summary card. */
  summaryLabel: string;
  /** Optional short reaction Ibda gives to each answer. */
  reactions?: Partial<Record<string, string>>;
};

/** Something Ibda already understood from the idea itself. */
export type KnownFact = {
  id: string;
  label: string;
  value: string;
};

/** Ibda's reading of the user's idea: what it knows and what it still needs. */
export type IdeaAnalysis = {
  facts: KnownFact[];
  acknowledgement: string;
  questions: Question[];
};

export type SummaryItem = {
  label: string;
  value: string;
  /** Set when the value came from a question, so it can be edited. */
  questionIndex?: number;
};

/**
 * The contract the onboarding UI depends on. The prototype implements it
 * with local rules; a real AI model/API can replace it without UI changes.
 */
export interface OnboardingAgent {
  analyzeIdea(idea: string): Promise<IdeaAnalysis>;
}
