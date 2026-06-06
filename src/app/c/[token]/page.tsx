import { notFound } from "next/navigation";
import { getActiveCardByToken, getTimeline } from "@/lib/cards";
import { SignForm } from "./sign-form";

// The page a QR scan lands on: /c/<qr_token>
// Shows the card's running timeline and a form to add yourself.
export default async function CardPage({
  params,
}: {
  params: { token: string };
}) {
  const card = await getActiveCardByToken(params.token);
  if (!card) notFound();

  const entries = await getTimeline(card.id);

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2.5rem 1.25rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: ".25rem" }}>
        {card.title ?? "Gratitude token"}
      </h1>
      <p style={{ color: "#6b6258", marginTop: 0 }}>
        {entries.length} {entries.length === 1 ? "person has" : "people have"}{" "}
        held this card.
      </p>

      <SignForm token={card.qr_token} />

      <ol style={{ listStyle: "none", padding: 0, marginTop: "2rem" }}>
        {entries.map((e) => (
          <li
            key={e.id}
            style={{
              padding: ".75rem 0",
              borderTop: "1px solid #ece5da",
            }}
          >
            <strong>{e.username}</strong>
            {e.message && (
              <div style={{ color: "#6b6258", marginTop: ".15rem" }}>
                {e.message}
              </div>
            )}
            <time
              style={{ fontSize: ".8rem", color: "#9a9085" }}
              dateTime={e.created_at}
            >
              {new Date(e.created_at).toLocaleDateString()}
            </time>
          </li>
        ))}
      </ol>
    </main>
  );
}
