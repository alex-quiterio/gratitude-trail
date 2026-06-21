"use client";

import { useEffect, useRef, useState } from "react";
import type { Entry } from "@/lib/db";
import { useEntries } from "./entries-context";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function LiveEntries({
  accent,
}: {
  accent: { primary: string; dark: string; tint: string };
}) {
  const entries = useEntries();
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const knownIds = useRef(new Set(entries.map((e) => e.id)));

  useEffect(() => {
    const fresh = entries.filter((e) => !knownIds.current.has(e.id));
    if (fresh.length === 0) return;

    fresh.forEach((e) => knownIds.current.add(e.id));
    setNewIds((prev) => new Set([...prev, ...fresh.map((e) => e.id)]));

    const t = setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev);
        fresh.forEach((e) => next.delete(e.id));
        return next;
      });
    }, 4000);
    return () => clearTimeout(t);
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <section style={{ marginTop: "3.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
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
          Those who passed it forward
        </p>
        <div style={{ height: 1, flex: 1, background: "#e8ddd0" }} />
      </div>

      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: ".6rem",
        }}
      >
        {entries.map((e) => (
          <li
            key={e.id}
            className="timeline-entry"
            style={{
              padding: ".9rem 1.1rem .9rem 1.3rem",
              borderLeft: `3px solid ${newIds.has(e.id) ? accent.primary : accent.primary + "60"}`,
              background: newIds.has(e.id) ? accent.tint : "#fffcf7",
              borderRadius: "0 12px 12px 0",
              boxShadow: "0 1px 4px rgba(45, 35, 24, .05)",
              transition: "background 1s ease, border-color 1s ease",
            }}
          >
            <strong
              style={{
                fontFamily: "var(--font-heading), Georgia, serif",
                fontSize: "1.05rem",
                color: "#2d2318",
                fontStyle: "italic",
                display: "block",
              }}
            >
              {e.username}
            </strong>
            {e.message && (
              <p
                style={{
                  color: "#6b5a4e",
                  margin: ".3rem 0 0",
                  lineHeight: 1.65,
                  fontSize: ".9rem",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{e.message}&rdquo;
              </p>
            )}
            <time
              style={{
                display: "block",
                fontSize: ".68rem",
                color: "#b09880",
                marginTop: ".4rem",
                letterSpacing: ".1em",
                textTransform: "uppercase",
              }}
              dateTime={e.created_at}
            >
              {formatDate(e.created_at)}
            </time>
          </li>
        ))}
      </ol>
    </section>
  );
}
