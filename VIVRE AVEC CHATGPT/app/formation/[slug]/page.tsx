import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModuleQuiz } from "@/components/module/module-quiz";
import { canAccessModule, listModulesForUser } from "@/lib/modules/progress-service";
import { toPublicQuiz } from "@/lib/modules/content-loader";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface FormationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function FormationPage({ params }: FormationPageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const modules = await listModulesForUser(supabase, user.id);
  const currentIndex = modules.findIndex((module) => module.slug === slug);

  if (currentIndex < 0) {
    notFound();
  }

  const module = modules[currentIndex];
  if (!canAccessModule(module)) {
    redirect("/dashboard");
  }

  const nextModule = modules[currentIndex + 1] ?? null;
  const nextModuleInitiallyAccessible = Boolean(
    nextModule && (nextModule.status === "unlocked" || nextModule.status === "passed")
  );

  return (
    <main className="container" style={{ paddingBlock: "1.2rem 2rem" }}>
      <p style={{ marginTop: 0 }}>
        <Link href="/dashboard" className="subtle">
          Retour au tableau de bord
        </Link>
      </p>
      <article className="card">
        <p style={{ marginTop: 0, color: "var(--muted)" }}>Module {module.moduleIndex}</p>
        <h1 className="title">{module.title}</h1>
        <div style={{ marginTop: "1rem", lineHeight: 1.6 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{module.markdown}</ReactMarkdown>
        </div>
      </article>

      <ModuleQuiz
        moduleSlug={module.slug}
        quiz={toPublicQuiz(module.quiz)}
        nextModuleSlug={nextModule?.slug ?? null}
        nextModuleInitiallyAccessible={nextModuleInitiallyAccessible}
      />
    </main>
  );
}
