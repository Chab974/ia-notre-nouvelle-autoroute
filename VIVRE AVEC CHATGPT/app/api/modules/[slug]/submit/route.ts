import { NextResponse } from "next/server";
import { z } from "zod";
import { canAccessModule, listModulesForUser } from "@/lib/modules/progress-service";
import { persistAttempt } from "@/lib/modules/quiz-service";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOption: z.number().int().nonnegative()
      })
    )
    .min(1)
});

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const parsedBody = submitSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const modules = await listModulesForUser(supabase, user.id);
    const moduleIndex = modules.findIndex((module) => module.slug === slug);
    if (moduleIndex < 0) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const module = modules[moduleIndex];
    if (!canAccessModule(module)) {
      return NextResponse.json({ error: "Module locked" }, { status: 403 });
    }

    if (parsedBody.data.answers.length !== module.quiz.length) {
      return NextResponse.json(
        { error: "All quiz questions must be answered." },
        { status: 400 }
      );
    }

    const result = await persistAttempt({
      supabase,
      userId: user.id,
      module,
      answers: parsedBody.data.answers
    });

    const hasNextModule = Boolean(modules[moduleIndex + 1]);
    return NextResponse.json({
      score: result.score,
      passed: result.passed,
      threshold: result.threshold,
      nextModuleUnlocked: result.justPassed && hasNextModule
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to submit quiz." },
      { status: 500 }
    );
  }
}
