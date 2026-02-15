import type { SupabaseClient } from "@supabase/supabase-js";
import type { LearningModule, QuizAnswerInput } from "@/lib/modules/types";

const PASSING_SCORE = 80;

function round2(value: number) {
  return Number(value.toFixed(2));
}

export function gradeQuiz(module: LearningModule, answers: QuizAnswerInput[]): number {
  if (module.quiz.length === 0) {
    return 0;
  }

  const answersById = new Map(answers.map((answer) => [answer.questionId, answer]));
  let correctAnswers = 0;

  for (const question of module.quiz) {
    const answer = answersById.get(question.id);
    if (answer?.selectedOption === question.correctOption) {
      correctAnswers += 1;
    }
  }

  return round2((correctAnswers / module.quiz.length) * 100);
}

interface PersistAttemptInput {
  supabase: SupabaseClient;
  userId: string;
  module: LearningModule;
  answers: QuizAnswerInput[];
  passingScore?: number;
}

interface PersistAttemptResult {
  score: number;
  passed: boolean;
  threshold: number;
  justPassed: boolean;
}

export async function persistAttempt({
  supabase,
  userId,
  module,
  answers,
  passingScore = PASSING_SCORE
}: PersistAttemptInput): Promise<PersistAttemptResult> {
  const score = gradeQuiz(module, answers);
  const passedInAttempt = score >= passingScore;
  const timestamp = new Date().toISOString();

  const { error: attemptError } = await supabase.from("module_attempts").insert({
    user_id: userId,
    module_slug: module.slug,
    module_index: module.moduleIndex,
    answers,
    score,
    passed: passedInAttempt
  });

  if (attemptError) {
    throw attemptError;
  }

  const { data: currentProgress, error: readError } = await supabase
    .from("module_progress")
    .select("best_score,attempts_count,passed,passed_at")
    .eq("user_id", userId)
    .eq("module_slug", module.slug)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  const wasPassed = Boolean(currentProgress?.passed);
  const passed = wasPassed || passedInAttempt;
  const previousBestScore = Number(currentProgress?.best_score ?? 0);
  const bestScore = Math.max(previousBestScore, score);
  const attemptsCount = Number(currentProgress?.attempts_count ?? 0) + 1;
  const passedAt =
    currentProgress?.passed_at ?? (passed ? timestamp : null);

  const { error: upsertError } = await supabase.from("module_progress").upsert(
    {
      user_id: userId,
      module_slug: module.slug,
      module_index: module.moduleIndex,
      best_score: bestScore,
      passed,
      attempts_count: attemptsCount,
      passed_at: passedAt,
      updated_at: timestamp
    },
    { onConflict: "user_id,module_slug" }
  );

  if (upsertError) {
    throw upsertError;
  }

  return {
    score,
    passed,
    threshold: passingScore,
    justPassed: !wasPassed && passed
  };
}
