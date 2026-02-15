import { NextResponse } from "next/server";
import {
  computeCompletionPercentage,
  listModulesForUser
} from "@/lib/modules/progress-service";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const modules = await listModulesForUser(supabase, user.id);

    return NextResponse.json({
      completion: computeCompletionPercentage(modules),
      modules: modules.map((module) => ({
        slug: module.slug,
        title: module.title,
        moduleIndex: module.moduleIndex,
        estimatedMinutes: module.estimatedMinutes,
        status: module.status,
        bestScore: module.bestScore,
        attemptsCount: module.attemptsCount
      }))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load modules." },
      { status: 500 }
    );
  }
}
