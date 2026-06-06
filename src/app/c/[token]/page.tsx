import { notFound } from "next/navigation";
import { getActiveCardByToken, getTimeline } from "@/lib/cards";
import { SignForm } from "./sign-form";

const ACCENTS = [
  { primary: "#c4864a", dark: "#a3702d", tint: "#fff4e8" }, // amber
  { primary: "#c4625a", dark: "#a34840", tint: "#fff1f0" }, // terracotta
  { primary: "#7a9e7e", dark: "#5a7e5e", tint: "#f0f7f0" }, // sage
  { primary: "#c49e4a", dark: "#a37e2d", tint: "#fff8e8" }, // golden honey
  { primary: "#9e7aaa", dark: "#7e5a8e", tint: "#f7f0fa" }, // soft mauve
  { primary: "#5a96a0", dark: "#3a7680", tint: "#eef6f7" }, // calm teal
  { primary: "#b07a7a", dark: "#8e5858", tint: "#fdf0f0" }, // dusty rose
];

export default async function CardPage({
  params,
}: {
  params: { token: string };
}) {
  const card = await getActiveCardByToken(params.token);
  if (!card) notFound();

  const entries = await getTimeline(card.id);

  const accent = ACCENTS[Math.floor(Math.random() * ACCENTS.length)];

  return (
    <main
      className="page-enter"
      style={
        {
          maxWidth: 580,
          margin: "0 auto",
          padding: "3.5rem 1.25rem 6rem",
          "--accent": accent.primary,
          "--accent-dark": accent.dark,
          "--accent-tint": accent.tint,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "2.75rem" }}>
        <p
          style={{
            fontSize: ".67rem",
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: accent.primary,
            margin: "0 0 .85rem",
            fontWeight: 600,
          }}
        >
          ✦ Gratitude Token ✦
        </p>

        <h1
          style={{
            fontFamily: "var(--font-heading), Georgia, serif",
            fontSize: "clamp(1.85rem, 5vw, 2.5rem)",
            fontWeight: 700,
            fontStyle: "italic",
            lineHeight: 1.15,
            margin: "0 0 1.1rem",
            color: "#2d2318",
            letterSpacing: "-.015em",
          }}
        >
          {card.title ?? "A Moment Worth Carrying"}
        </h1>

        {/* Ornamental divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".8rem",
            justifyContent: "center",
            margin: "0 auto 1.2rem",
            maxWidth: 200,
          }}
        >
          <div
            style={{
              height: 1,
              flex: 1,
              background: `linear-gradient(to right, transparent, ${accent.primary}80)`,
            }}
          />
          <span style={{ color: accent.primary, fontSize: "1.1rem", lineHeight: 1 }}>❧</span>
          <div
            style={{
              height: 1,
              flex: 1,
              background: `linear-gradient(to left, transparent, ${accent.primary}80)`,
            }}
          />
        </div>

        <p
          style={{
            color: "#7a6555",
            fontSize: ".93rem",
            lineHeight: 1.75,
            margin: "0 auto",
            maxWidth: 440,
          }}
        >
          This token has passed through{" "}
          <span
            style={{
              color: accent.dark,
              fontWeight: 600,
              background: accent.tint,
              padding: ".1em .45em",
              borderRadius: 20,
              fontSize: ".9rem",
            }}
          >
            {entries.length} {entries.length === 1 ? "soul" : "souls"}
          </span>
          . Each name here is a quiet act of presence — someone who paused,
          felt something, and chose to leave a trace. You are warmly welcome to
          do the same.
        </p>
      </header>

      <SignForm token={card.qr_token} accent={accent.primary} accentDark={accent.dark} />

      {entries.length > 0 && (
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
                  borderLeft: `3px solid ${accent.primary}60`,
                  background: "#fffcf7",
                  borderRadius: "0 12px 12px 0",
                  boxShadow: "0 1px 4px rgba(45, 35, 24, .05)",
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
                  {new Date(e.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
