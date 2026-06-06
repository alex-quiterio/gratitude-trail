import { NextRequest, NextResponse } from "next/server";
import { getActiveCardByToken, getTimeline, addEntry } from "@/lib/cards";

// GET /api/cards/:token/entries → the timeline for this card.
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  const card = await getActiveCardByToken(params.token);
  if (!card) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const entries = await getTimeline(card.id);
  return NextResponse.json({ card: { title: card.title }, entries });
}

// POST /api/cards/:token/entries  { username, message? } → append a holder.
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  const card = await getActiveCardByToken(params.token);
  if (!card) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let body: { username?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const message = typeof body.message === "string" ? body.message : null;

  if (username.length < 1 || username.length > 40) {
    return NextResponse.json({ error: "invalid_username" }, { status: 422 });
  }

  try {
    const entry = await addEntry(card.id, username, message);
    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    // CHECK constraint violations etc. land here.
    return NextResponse.json({ error: "rejected" }, { status: 422 });
  }
}
