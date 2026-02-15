import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  computeCompletionPercentage,
  listModulesForUser
} from "@/lib/modules/progress-service";

export const dynamic = "force-dynamic";

function statusLabel(status: "locked" | "unlocked" | "passed") {
  if (status === "passed") return "Valide";
  if (status === "unlocked") return "Disponible";
  return "Verrouille";
}

function statusColor(status: "locked" | "unlocked" | "passed") {
  if (status === "passed") return "var(--ok)";
  if (status === "unlocked") return "var(--warn)";
  return "var(--locked)";
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const modules = await listModulesForUser(supabase, user.id);
  const completion = computeCompletionPercentage(modules);

  return (
    <main className="container" style={{ paddingBlock: "2rem" }}>
      <header
        className="card"
        style={{
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h1 className="title">Tableau de bord</h1>
          <p className="subtle" style={{ margin: "0.35rem 0 0" }}>
            Progression globale: {completion}%
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="btn btn-danger" type="submit">
            Se deconnecter
          </button>
        </form>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "0.9rem"
        }}
      >
        {modules.map((module) => {
          const isLocked = module.status === "locked";
          return (
            <article key={module.slug} className="card">
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
                Module {module.moduleIndex}
              </p>
              <h2 style={{ margin: "0.4rem 0 0.65rem", fontSize: "1.05rem" }}>
                {module.title}
              </h2>
              <p style={{ margin: "0 0 0.3rem", color: statusColor(module.status) }}>
                {statusLabel(module.status)}
              </p>
              <p style={{ margin: "0 0 0.7rem", color: "var(--muted)" }}>
                Duree estimee: {module.estimatedMinutes} min
              </p>
              <p style={{ margin: "0 0 0.9rem", color: "var(--muted)" }}>
                Meilleur score: {module.bestScore}% - Tentatives: {module.attemptsCount}
              </p>
              {isLocked ? (
                <button className="btn" disabled style={{ width: "100%" }}>
                  Module verrouille
                </button>
              ) : (
                <Link href={`/formation/${module.slug}`} className="btn btn-secondary">
                  Ouvrir le module
                </Link>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
