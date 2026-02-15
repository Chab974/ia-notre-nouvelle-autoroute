export type ModuleStatus = "locked" | "unlocked" | "passed";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
}

export interface PublicQuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface LearningModule {
  slug: string;
  moduleId: string;
  title: string;
  estimatedMinutes: number;
  moduleIndex: number;
  sourceFile: string;
  markdown: string;
  quiz: QuizQuestion[];
}

export interface ModuleProgressRow {
  module_slug: string;
  module_index: number;
  best_score: number;
  passed: boolean;
  attempts_count: number;
}

export interface ModuleWithStatus extends LearningModule {
  status: ModuleStatus;
  bestScore: number;
  attemptsCount: number;
}

export interface QuizAnswerInput {
  questionId: string;
  selectedOption: number;
}
