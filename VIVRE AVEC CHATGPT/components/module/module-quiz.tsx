"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicQuizQuestion } from "@/lib/modules/types";

interface QuizResult {
  score: number;
  passed: boolean;
  threshold: number;
  nextModuleUnlocked: boolean;
}

interface ModuleQuizProps {
  moduleSlug: string;
  quiz: PublicQuizQuestion[];
  nextModuleSlug: string | null;
  nextModuleInitiallyAccessible: boolean;
}

export function ModuleQuiz({
  moduleSlug,
  quiz,
  nextModuleSlug,
  nextModuleInitiallyAccessible
}: ModuleQuizProps) {
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = useMemo(
    () => quiz.every((question) => typeof selections[question.id] === "number"),
    [quiz, selections]
  );

  function onSelect(questionId: string, optionIndex: number) {
    setSelections((previous) => ({ ...previous, [questionId]: optionIndex }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/modules/${moduleSlug}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          answers: quiz.map((question) => ({
            questionId: question.id,
            selectedOption: selections[question.id]
          }))
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Soumission impossible.");
        return;
      }

      setResult(payload as QuizResult);
    } catch {
      setError("Erreur reseau. Reessaie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const showNextLink =
    Boolean(nextModuleSlug) &&
    (nextModuleInitiallyAccessible || Boolean(result?.nextModuleUnlocked));

  return (
    <section className="card" style={{ marginTop: "1rem" }}>
      <h2 style={{ marginTop: 0 }}>Quiz de validation</h2>
      <p className="subtle" style={{ marginTop: 0 }}>
        Score requis: 80%. Tentatives illimitees.
      </p>

      <form onSubmit={onSubmit}>
        {quiz.map((question, questionIndex) => (
          <fieldset
            key={question.id}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 12,
              marginBottom: "0.8rem",
              padding: "0.8rem"
            }}
          >
            <legend style={{ fontWeight: 600 }}>
              Q{questionIndex + 1} - {question.question}
            </legend>
            <div style={{ display: "grid", gap: "0.35rem", marginTop: "0.5rem" }}>
              {question.options.map((option, optionIndex) => (
                <label
                  key={option}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem"
                  }}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={optionIndex}
                    checked={selections[question.id] === optionIndex}
                    onChange={() => onSelect(question.id, optionIndex)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !allAnswered}
          >
            {isSubmitting ? "Envoi..." : "Valider le quiz"}
          </button>
          <Link className="btn btn-secondary" href="/dashboard">
            Retour au tableau de bord
          </Link>
          {showNextLink && nextModuleSlug ? (
            <Link className="btn btn-secondary" href={`/formation/${nextModuleSlug}`}>
              Module suivant
            </Link>
          ) : null}
        </div>
      </form>

      {error ? (
        <p style={{ color: "#b91c1c", marginBottom: 0, marginTop: "0.8rem" }}>{error}</p>
      ) : null}

      {result ? (
        <p
          style={{
            marginBottom: 0,
            marginTop: "0.8rem",
            color: result.passed ? "var(--ok)" : "#b91c1c",
            fontWeight: 600
          }}
        >
          Score: {result.score}% -{" "}
          {result.passed ? "module valide, progression debloquee." : "validation non atteinte."}
        </p>
      ) : null}
    </section>
  );
}
