import type { SupabaseClient } from "@supabase/supabase-js";
import { loadAllModules } from "@/lib/modules/content-loader";
import type {
  LearningModule,
  ModuleProgressRow,
  ModuleStatus,
  ModuleWithStatus
} from "@/lib/modules/types";

function round2(value: number) {
  return Number(value.toFixed(2));
}

export function computeModuleStatuses(
  modules: LearningModule[],
  progressRows: ModuleProgressRow[]
): ModuleWithStatus[] {
  const progressBySlug = new Map(progressRows.map((row) => [row.module_slug, row]));

  return modules.map((module, index, all) => {
    const row = progressBySlug.get(module.slug);
    const alreadyPassed = Boolean(row?.passed);

    let status: ModuleStatus = "locked";
    if (alreadyPassed) {
      status = "passed";
    } else if (index === 0) {
      status = "unlocked";
    } else if (all[index - 1]) {
      const previousRow = progressBySlug.get(all[index - 1].slug);
      status = previousRow?.passed ? "unlocked" : "locked";
    }

    return {
      ...module,
      status,
      bestScore: row?.best_score ?? 0,
      attemptsCount: row?.attempts_count ?? 0
    };
  });
}

export function canAccessModule(module: ModuleWithStatus): boolean {
  return module.status === "unlocked" || module.status === "passed";
}

export function computeCompletionPercentage(modules: ModuleWithStatus[]): number {
  if (modules.length === 0) {
    return 0;
  }
  const passedCount = modules.filter((module) => module.status === "passed").length;
  return round2((passedCount / modules.length) * 100);
}

export async function loadProgressRows(
  supabase: SupabaseClient,
  userId: string
): Promise<ModuleProgressRow[]> {
  const { data, error } = await supabase
    .from("module_progress")
    .select("module_slug,module_index,best_score,passed,attempts_count")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    module_slug: String(row.module_slug),
    module_index: Number(row.module_index),
    best_score: Number(row.best_score ?? 0),
    passed: Boolean(row.passed),
    attempts_count: Number(row.attempts_count ?? 0)
  }));
}

export async function listModulesForUser(
  supabase: SupabaseClient,
  userId: string,
  rootDir = process.cwd()
): Promise<ModuleWithStatus[]> {
  const modules = loadAllModules(rootDir);
  const progressRows = await loadProgressRows(supabase, userId);
  return computeModuleStatuses(modules, progressRows);
}
