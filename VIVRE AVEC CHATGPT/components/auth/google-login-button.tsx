"use client";

import { useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface GoogleLoginButtonProps {
  nextPath?: string;
}

export function GoogleLoginButton({ nextPath = "/dashboard" }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  async function onLogin() {
    setIsLoading(true);

    const redirectBase =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const redirectTo = `${redirectBase}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo
      }
    });

    if (error) {
      setIsLoading(false);
      alert("Connexion Google impossible. Verifie la configuration Supabase.");
      return;
    }

    if (data.url) {
      window.location.assign(data.url);
    }
  }

  return (
    <button className="btn btn-primary" onClick={onLogin} disabled={isLoading}>
      {isLoading ? "Connexion..." : "Continuer avec Google"}
    </button>
  );
}
