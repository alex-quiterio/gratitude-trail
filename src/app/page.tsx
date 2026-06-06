export default function Home() {
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <h1>Gratitude Token</h1>
      <p style={{ color: "#6b6258" }}>
        Scan the QR on a gratitude token card to open its timeline and add
        yourself. Mint a new card with <code>pnpm card:new</code>.
      </p>
    </main>
  );
}
