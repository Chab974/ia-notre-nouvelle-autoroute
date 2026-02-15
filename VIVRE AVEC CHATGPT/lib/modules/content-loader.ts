import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type {
  LearningModule,
  PublicQuizQuestion,
  QuizQuestion
} from "@/lib/modules/types";

const moduleFilenamePattern = /^(\d+)_.*\.md$/i;

const frontmatterSchema = z.object({
  module_id: z.string().min(2),
  title: z.string().min(2),
  estimated_minutes: z.number().int().positive(),
  quiz: z
    .array(
      z.object({
        id: z.string().min(1),
        question: z.string().min(3),
        options: z.array(z.string().min(1)).min(2),
        correct_option: z.number().int().nonnegative()
      })
    )
    .min(3)
});

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractNumericPrefix(filename: string): number | null {
  const match = filename.match(moduleFilenamePattern);
  if (!match) {
    return null;
  }
  return Number.parseInt(match[1], 10);
}

export function listModuleFiles(rootDir = process.cwd()): string[] {
  return fs
    .readdirSync(rootDir)
    .filter((filename) => moduleFilenamePattern.test(filename))
    .sort((a, b) => {
      const prefixA = extractNumericPrefix(a) ?? Number.MAX_SAFE_INTEGER;
      const prefixB = extractNumericPrefix(b) ?? Number.MAX_SAFE_INTEGER;
      return prefixA - prefixB;
    });
}

function validateQuizOptions(quiz: QuizQuestion[], filename: string) {
  quiz.forEach((question) => {
    if (question.correctOption >= question.options.length) {
      throw new Error(
        `Invalid correct_option in ${filename} for question "${question.id}".`
      );
    }
  });
}

export function loadAllModules(rootDir = process.cwd()): LearningModule[] {
  return listModuleFiles(rootDir).map((filename) => {
    const fullPath = path.join(rootDir, filename);
    const fileContent = fs.readFileSync(fullPath, "utf8");
    const parsed = matter(fileContent);
    const validated = frontmatterSchema.safeParse(parsed.data);

    if (!validated.success) {
      throw new Error(
        `Invalid frontmatter in ${filename}: ${validated.error.message}`
      );
    }

    const moduleIndex = extractNumericPrefix(filename);
    if (moduleIndex === null) {
      throw new Error(`Invalid module file name format: ${filename}`);
    }

    const quiz: QuizQuestion[] = validated.data.quiz.map((question) => ({
      id: question.id,
      question: question.question,
      options: question.options,
      correctOption: question.correct_option
    }));
    validateQuizOptions(quiz, filename);

    return {
      slug: toSlug(validated.data.module_id),
      moduleId: validated.data.module_id,
      title: validated.data.title,
      estimatedMinutes: validated.data.estimated_minutes,
      moduleIndex,
      sourceFile: filename,
      markdown: parsed.content,
      quiz
    };
  });
}

export function findModuleBySlug(
  slug: string,
  modules: LearningModule[]
): LearningModule | undefined {
  return modules.find((module) => module.slug === slug);
}

export function toPublicQuiz(quiz: QuizQuestion[]): PublicQuizQuestion[] {
  return quiz.map((question) => ({
    id: question.id,
    question: question.question,
    options: question.options
  }));
}
