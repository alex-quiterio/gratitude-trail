"use client";

import { useEffect, useState } from "react";

type CardSummary = {
  token: string;
  title: string;
  entryCount: number;
};

export function SignedCards() {
  const [cards, setCards] = useState<CardSummary[]>([]);

  useEffect(() => {
    const tokens: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("gt_signed_")) {
        tokens.push(key.slice("gt_signed_".length));
      }
    }
    if (tokens.length === 0) return;

    Promise.all(
      tokens.map(async (token) => {
        try {
          const res = await fetch(`/api/cards/${token}/entries`);
          if (!res.ok) return null;
          const data = await res.json();
          return {
            token,
            title: data.card.title ?? "A Moment Worth Carrying",
            entryCount: data.entries.length,
          } satisfies CardSummary;
        } catch {
          return null;
        }
      }),
    ).then((results) => setCards(results.filter(Boolean) as CardSummary[]));
  }, []);

  if (cards.length === 0) return null;

  return (
    <section
      style={{
        marginTop: "3rem",
        textAlign: "left",
        maxWidth: 420,
        margin: "3rem auto 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".8rem",
          marginBottom: "1.2rem",
        }}
      >
        <div style={{ height: 1, flex: 1, background: "#e8ddd0" }} />
        <p
          style={{
            fontSize: ".63rem",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "#b09880",
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          Your journey
        </p>
        <div style={{ height: 1, flex: 1, background: "#e8ddd0" }} />
      </div>

      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: ".5rem",
        }}
      >
        {cards.map((card) => (
          <li key={card.token}>
            <a
              href={`/c/${card.token}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: ".75rem 1rem .75rem 1.2rem",
                borderLeft: "3px solid #c4864a60",
                background: "#fffcf7",
                borderRadius: "0 12px 12px 0",
                boxShadow: "0 1px 4px rgba(45, 35, 24, .05)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-heading), Georgia, serif",
                  fontSize: "1rem",
                  fontStyle: "italic",
                  color: "#2d2318",
                }}
              >
                {card.title}
              </span>
              <span
                style={{
                  fontSize: ".72rem",
                  color: "#b09880",
                  letterSpacing: ".08em",
                  whiteSpace: "nowrap",
                  marginLeft: "1rem",
                }}
              >
                {card.entryCount} {card.entryCount === 1 ? "soul" : "souls"}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
