import webpush from "web-push";
import { sql } from "./db";

const subject = process.env.VAPID_SUBJECT;
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (!subject || !publicKey || !privateKey) {
  console.error("[push] VAPID env vars missing — push notifications will not work", {
    VAPID_SUBJECT: !!subject,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: !!publicKey,
    VAPID_PRIVATE_KEY: !!privateKey,
  });
} else {
  webpush.setVapidDetails(subject, publicKey, privateKey);
  console.log("[push] VAPID configured ok");
}

export type PushSubscriptionRow = {
  id: string;
  card_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  updated_at: string;
};

export async function saveSubscription(
  cardId: string,
  sub: PushSubscriptionJSON,
): Promise<void> {
  const { endpoint, keys } = sub as { endpoint: string; keys: { p256dh: string; auth: string } };
  console.log(`[push] saving subscription card=${cardId} endpoint=${endpoint.slice(0, 40)}…`);
  await sql`
    insert into push_subscriptions (card_id, endpoint, p256dh, auth)
    values (${cardId}, ${endpoint}, ${keys.p256dh}, ${keys.auth})
    on conflict (endpoint) do update set card_id = excluded.card_id, updated_at = now()
  `;
  console.log(`[push] subscription saved card=${cardId}`);
}

export async function removeSubscription(endpoint: string): Promise<void> {
  await sql`delete from push_subscriptions where endpoint = ${endpoint}`;
}

export async function notifyCardSubscribers(
  cardId: string,
  payload: object,
): Promise<void> {
  const rows: PushSubscriptionRow[] = await sql`
    select id, endpoint, p256dh, auth
    from push_subscriptions
    where card_id = ${cardId}
  `;

  console.log(`[push] notifying ${rows.length} subscriber(s) for card=${cardId}`);

  if (rows.length === 0) return;

  const dead: string[] = [];

  await Promise.allSettled(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          JSON.stringify(payload),
        );
        console.log(`[push] sent ok endpoint=${row.endpoint.slice(0, 40)}…`);
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        console.error(`[push] send failed endpoint=${row.endpoint.slice(0, 40)}… status=${status}`, err);
        if (status === 410 || status === 404) dead.push(row.endpoint);
      }
    }),
  );

  if (dead.length > 0) {
    console.log(`[push] pruning ${dead.length} dead subscription(s)`);
    await sql`delete from push_subscriptions where endpoint = any(${dead})`;
  }
}
