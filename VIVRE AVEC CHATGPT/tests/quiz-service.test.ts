import { describe, expect, it } from "vitest";
import { gradeQuiz } from "../lib/modules/quiz-service";
import type { LearningModule } from "../lib/modules/types";

const moduleFixture: LearningModule = {
  slug: "module-test",
  moduleId: "module_test",
  title: "Module test",
  estimatedMinutes: 10,
  moduleIndex: 0,
  sourceFile: "0_module-test.md",
  markdown: "Content",
  quiz: [
    { id: "q1", question: "Question 1", options: ["A", "B"], correctOption: 0 },
    { id: "q2", question: "Question 2", options: ["A", "B"], correctOption: 1 },
    { id: "q3", question: "Question 3", options: ["A", "B"], correctOption: 0 }
  ]
};

describe("gradeQuiz", () => {
  it("returns a 2-decimal score", () => {
    const score = gradeQuiz(moduleFixture, [
      { questionId: "q1", selectedOption: 0 },
      { questionId: "q2", selectedOption: 1 },
      { questionId: "q3", selectedOption: 1 }
    ]);

    expect(score).toBe(66.67);
  });

  it("returns 100 for all correct answers", () => {
    const score = gradeQuiz(moduleFixture, [
      { questionId: "q1", selectedOption: 0 },
      { questionId: "q2", selectedOption: 1 },
      { questionId: "q3", selectedOption: 0 }
    ]);

    expect(score).toBe(100);
  });
});
