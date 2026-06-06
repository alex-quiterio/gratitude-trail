export default function Home() {
  return (
    <main
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "5rem 1.5rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: ".67rem",
          letterSpacing: ".22em",
          textTransform: "uppercase",
          color: "#c4864a",
          margin: "0 0 1rem",
          fontWeight: 600,
        }}
      >
        ✦ Gratitude Token ✦
      </p>

      <h1
        style={{
          fontFamily: "var(--font-heading), Georgia, serif",
          fontSize: "clamp(2rem, 6vw, 2.8rem)",
          fontWeight: 700,
          fontStyle: "italic",
          lineHeight: 1.15,
          color: "#2d2318",
          margin: "0 0 1.5rem",
          letterSpacing: "-.015em",
        }}
      >
        A Token&rsquo;s Journey
      </h1>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".8rem",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
          maxWidth: 180,
        }}
      >
        <div
          style={{
            height: 1,
            flex: 1,
            background: "linear-gradient(to right, transparent, #d4b896)",
          }}
        />
        <span style={{ color: "#c4864a", fontSize: "1.1rem" }}>❧</span>
        <div
          style={{
            height: 1,
            flex: 1,
            background: "linear-gradient(to left, transparent, #d4b896)",
          }}
        />
      </div>

      <p
        style={{
          color: "#7a6555",
          fontSize: "1rem",
          lineHeight: 1.8,
          margin: 0,
        }}
      >
        Every token carries a story. It passes from hand to hand, gathering
        names and moments along the way. Scan the QR code to read its journey —
        and leave a little piece of yours behind.
      </p>
    </main>
  );
}
