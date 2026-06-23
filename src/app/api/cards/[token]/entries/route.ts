import { NextRequest, NextResponse } from "next/server";
import { getActiveCardByToken, getTimeline, addEntry } from "@/lib/cards";
import { notifyCardSubscribers } from "@/lib/push";

// GET /api/cards/:token/entries → the timeline for this card.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  console.log(`[entries:GET] token=${token}`);

  const card = await getActiveCardByToken(token);
  if (!card) {
    console.warn(`[entries:GET] card not found token=${token}`);
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const entries = await getTimeline(card.id);
  console.log(`[entries:GET] card=${card.id} entries=${entries.length}`);
  return NextResponse.json({ card: { title: card.title }, entries });
}

// POST /api/cards/:token/entries  { username, message? } → append a holder.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  console.log(`[entries:POST] token=${token}`);

  const card = await getActiveCardByToken(token);
  if (!card) {
    console.warn(`[entries:POST] card not found token=${token}`);
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: { username?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    console.warn(`[entries:POST] invalid JSON card=${card.id}`);
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const message = typeof body.message === "string" ? body.message : null;

  if (username.length < 1 || username.length > 40) {
    console.warn(`[entries:POST] invalid username="${username}" card=${card.id}`);
    return NextResponse.json({ error: "invalid_username" }, { status: 422 });
  }

  let entry;
  try {
    entry = await addEntry(card.id, username, message);
    console.log(`[entries:POST] entry created id=${entry.id} card=${card.id} username="${username}"`);
  } catch (err) {
    console.error(`[entries:POST] addEntry failed card=${card.id}`, err);
    return NextResponse.json({ error: "invalid_message" }, { status: 422 });
  }

  // Fan-out push notifications to all subscribers of this card (fire-and-forget).
  // Dead subscriptions (410/404) are pruned inside notifyCardSubscribers.
  notifyCardSubscribers(card.id, {
    title: card.title ?? "Gratitude Token",
    body: `${username} just passed it forward ✦`,
    token,
  }).then(() => {
    console.log(`[entries:POST] push notifications sent card=${card.id}`);
  }).catch((err) => {
    console.error(`[entries:POST] push notification failed card=${card.id}`, err);
  });

  return NextResponse.json({ entry }, { status: 201 });
}
