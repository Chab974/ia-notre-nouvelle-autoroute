import { redirect } from "next/navigation";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/dashboard";

  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="container" style={{ paddingTop: "8vh" }}>
      <section className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 className="title">Vivre avec ChatGPT</h1>
        <p className="subtle">
          Plateforme de formation progressive. Chaque module se debloque
          uniquement apres validation du precedent.
        </p>
        <GoogleLoginButton nextPath={nextPath} />
      </section>
    </main>
  );
}
