/** A follow-up question KHITTA asks before starting its analysis. */
export type Question = {
  id: string;
  /**
   * Stored answer values. They stay in English whatever the interface
   * language, so the analysis input is the same; the dictionary shows them.
   */
  options: string[];
  /** Label stored with this answer (in English, like the answer). */
  summaryLabel: string;
  /** Question copy from an agent that writes its own; the dictionary's copy for this id is shown when there is one. */
  prompt?: string;
  helper?: string;
  reactions?: Partial<Record<string, string>>;
};

/** Something KHITTA already understood from the idea itself. */
export type KnownFact = {
  id: string;
  label: string;
  value: string;
};

/** KHITTA's reading of the user's idea: what it knows and what it still needs. */
export type IdeaAnalysis = {
  facts: KnownFact[];
  questions: Question[];
};

export type SummaryItem = {
  /** Matches the fact or question id. */
  id: string;
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
