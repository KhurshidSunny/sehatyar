/** Shared content shapes aligned with apps/api/schemas and data/*.json */

export type DangerLevel = "info" | "clinic" | "emergency";
export type ReviewStatus = "draft" | "reviewed";
export type FeedbackTargetType = "faq" | "medicine";

export interface ContentSource {
  title: string;
  url: string | null;
}

export interface FaqCategory {
  id: string;
  namePs: string;
  nameEn: string;
  order: number;
}

export interface Faq {
  id: string;
  category: string;
  questionPs: string;
  questionEn: string;
  answerPs: string;
  answerEn: string;
  paraphrasesPs: string[];
  audioUrl: string | null;
  dangerLevel: DangerLevel;
  source: ContentSource;
  lastReviewed: string; // YYYY-MM-DD
  reviewStatus: ReviewStatus;
}

export interface FaqSummary {
  id: string;
  category: string;
  questionPs: string;
  questionEn: string;
  dangerLevel: DangerLevel;
  audioUrl: string | null;
}

export interface MedicineCategory {
  id: string;
  namePs: string;
  nameEn: string;
  order: number;
}

export interface Medicine {
  id: string;
  category: string;
  names: string[];
  usesPs: string;
  usesEn: string;
  warningsPs: string;
  warningsEn: string;
  audioUrl: string | null;
  source: ContentSource;
  lastReviewed: string; // YYYY-MM-DD
  reviewStatus: ReviewStatus;
}

export interface MedicineSummary {
  id: string;
  category: string;
  names: string[];
  usesPs: string;
  usesEn: string;
  warningsPs: string;
  warningsEn: string;
  audioUrl: string | null;
}

export interface FeedbackCreate {
  targetType: FeedbackTargetType;
  targetId: string;
  helpful: boolean;
}

export interface FeedbackRecord extends FeedbackCreate {
  id: string;
  createdAt: string; // ISO timestamp
}
