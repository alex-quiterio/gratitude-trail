import { NextRequest, NextResponse } from "next/server";
import { getActiveCardByToken } from "@/lib/cards";
import { saveSubscription, removeSubscription } from "@/lib/push";

// POST /api/cards/:token/subscribe  { subscription: PushSubscriptionJSON }
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  const card = await getActiveCardByToken(params.token);
  if (!card) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let body: { subscription?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const sub = body.subscription;
  if (
    !sub ||
    typeof (sub as PushSubscriptionJSON).endpoint !== "string" ||
    !(sub as { keys?: unknown }).keys
  ) {
    return NextResponse.json({ error: "invalid_subscription" }, { status: 422 });
  }

  try {
    await saveSubscription(card.id, sub as PushSubscriptionJSON);
  } catch (err) {
    console.error(`[subscribe:POST] failed to save subscription card=${card.id}`, err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
  console.log(`[subscribe:POST] subscription saved card=${card.id}`);
  return NextResponse.json({ ok: true }, { status: 201 });
}

// DELETE /api/cards/:token/subscribe  { endpoint: string }
export async function DELETE(
  req: NextRequest,
  { params: _ }: { params: { token: string } },
) {
  let body: { endpoint?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof body.endpoint !== "string") {
    return NextResponse.json({ error: "invalid_endpoint" }, { status: 422 });
  }

  await removeSubscription(body.endpoint);
  return NextResponse.json({ ok: true });
}
