import { describe, expect, it } from "vitest";
import {
  canAccessModule,
  computeModuleStatuses
} from "../lib/modules/progress-service";
import type { LearningModule, ModuleProgressRow } from "../lib/modules/types";

function buildModule(index: number): LearningModule {
  return {
    slug: `m-${index}`,
    moduleId: `m_${index}`,
    title: `Module ${index}`,
    estimatedMinutes: 10,
    moduleIndex: index,
    sourceFile: `${index}_module.md`,
    markdown: "Contenu",
    quiz: [
      { id: "q1", question: "Q1", options: ["a", "b"], correctOption: 0 },
      { id: "q2", question: "Q2", options: ["a", "b"], correctOption: 1 },
      { id: "q3", question: "Q3", options: ["a", "b"], correctOption: 0 }
    ]
  };
}

describe("computeModuleStatuses", () => {
  const modules = [buildModule(0), buildModule(6), buildModule(7)];

  it("unlocks only the first module for a new user", () => {
    const statuses = computeModuleStatuses(modules, []);
    expect(statuses[0].status).toBe("unlocked");
    expect(statuses[1].status).toBe("locked");
    expect(statuses[2].status).toBe("locked");
  });

  it("unlocks module 2 when module 1 is passed", () => {
    const progress: ModuleProgressRow[] = [
      {
        module_slug: "m-0",
        module_index: 0,
        best_score: 100,
        passed: true,
        attempts_count: 1
      }
    ];
    const statuses = computeModuleStatuses(modules, progress);
    expect(statuses[0].status).toBe("passed");
    expect(statuses[1].status).toBe("unlocked");
    expect(statuses[2].status).toBe("locked");
    expect(canAccessModule(statuses[1])).toBe(true);
    expect(canAccessModule(statuses[2])).toBe(false);
  });
});
