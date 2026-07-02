"use client";

import { useEntries } from "./entries-context";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function daysBetween(iso: string): number {
  const start = new Date(iso).getTime();
  const diff = Date.now() - start;
  return Math.max(0, Math.floor(diff / 86_400_000));
}

export function Journey({
  accent,
}: {
  accent: { primary: string; dark: string; tint: string };
}) {
  const entries = useEntries();
  if (entries.length === 0) return null;

  const first = entries[0];
  const hands = entries.length;
  const days = daysBetween(first.created_at);

  const daysLabel =
    days === 0 ? "since today" : days === 1 ? "1 day carried" : `${days} days carried`;

  return (
    <section
      style={{
        marginTop: "3rem",
        padding: "1.6rem 1.4rem",
        background: accent.tint,
        borderRadius: 14,
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: ".63rem",
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: accent.dark,
          margin: "0 0 1.1rem",
          fontWeight: 600,
        }}
      >
        The Journey So Far
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2.4rem",
          marginBottom: "1.1rem",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-heading), Georgia, serif",
              fontSize: "1.9rem",
              fontStyle: "italic",
              color: accent.dark,
              lineHeight: 1,
            }}
          >
            {hands}
          </div>
          <div
            style={{
              fontSize: ".62rem",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "#8a7565",
              marginTop: ".4rem",
            }}
          >
            {hands === 1 ? "hand" : "hands"}
          </div>
        </div>

        <div style={{ width: 1, background: `${accent.primary}40` }} />

        <div>
          <div
            style={{
              fontFamily: "var(--font-heading), Georgia, serif",
              fontSize: "1.9rem",
              fontStyle: "italic",
              color: accent.dark,
              lineHeight: 1,
            }}
          >
            {days}
          </div>
          <div
            style={{
              fontSize: ".62rem",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "#8a7565",
              marginTop: ".4rem",
            }}
          >
            {days === 1 ? "day" : "days"}
          </div>
        </div>
      </div>

      <p
        style={{
          color: "#7a6555",
          fontSize: ".88rem",
          lineHeight: 1.7,
          margin: 0,
          fontStyle: "italic",
        }}
      >
        It began with{" "}
        <span style={{ color: accent.dark, fontWeight: 600 }}>{first.username}</span>{" "}
        on {formatDate(first.created_at)} — {daysLabel}.
      </p>
    </section>
  );
}
