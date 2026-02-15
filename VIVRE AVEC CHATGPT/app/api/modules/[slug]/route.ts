import { NextResponse } from "next/server";
import { canAccessModule, listModulesForUser } from "@/lib/modules/progress-service";
import { toPublicQuiz } from "@/lib/modules/content-loader";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const modules = await listModulesForUser(supabase, user.id);
    const module = modules.find((item) => item.slug === slug);

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    if (!canAccessModule(module)) {
      return NextResponse.json({ error: "Module locked" }, { status: 403 });
    }

    return NextResponse.json({
      slug: module.slug,
      title: module.title,
      moduleIndex: module.moduleIndex,
      markdown: module.markdown,
      quiz: toPublicQuiz(module.quiz)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load module." },
      { status: 500 }
    );
  }
}
