import { nanoid } from "nanoid";
import { sql, type Card, type Entry } from "./db";

// Resolve the public QR token to a card. Returns null for unknown OR retired
// cards so the caller can't tell the two apart (don't leak card existence).
export async function getActiveCardByToken(token: string): Promise<Card | null> {
  const rows = await sql<Card>`
    select id, qr_token, title, created_at, retired_at
    from cards
    where qr_token = ${token} and retired_at is null
    limit 1
  `;
  return rows[0] ?? null;
}

// The timeline: every holder of this card, oldest first.
export async function getTimeline(cardId: string): Promise<Entry[]> {
  const rows = await sql<Entry>`
    select id, card_id, username, message, created_at
    from entries
    where card_id = ${cardId}
    order by created_at asc
  `;
  return rows;
}

// Append a holder to the timeline. `username` is trimmed; the DB CHECK
// constraints enforce length, so a bad value surfaces as a thrown error.
export async function addEntry(
  cardId: string,
  username: string,
  message?: string | null,
): Promise<Entry> {
  const rows = await sql<Entry>`
    insert into entries (card_id, username, message)
    values (${cardId}, ${username.trim()}, ${message?.trim() || null})
    returning id, card_id, username, message, created_at
  `;
  return rows[0];
}

// Mint a new physical card with an unguessable QR token.
export async function createCard(title?: string | null): Promise<Card> {
  const token = nanoid(12); // url-safe, ~71 bits of entropy
  const rows = await sql<Card>`
    insert into cards (qr_token, title)
    values (${token}, ${title ?? null})
    returning id, qr_token, title, created_at, retired_at
  `;
  return rows[0];
}
