// Mint a new gratitude token card and print the URL to encode in its QR code.
//
//   pnpm card:new "Team retro 2026"
//
// Requires POSTGRES_URL in the environment (see .env.example).
import { createCard } from "../src/lib/cards";

async function main() {
  const title = process.argv.slice(2).join(" ") || null;
  const card = await createCard(title);

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const url = `${base}/c/${card.qr_token}`;

  console.log("Created card:");
  console.log("  id:    ", card.id);
  console.log("  token: ", card.qr_token);
  console.log("  title: ", card.title ?? "(none)");
  console.log("\nEncode this URL in the QR code:");
  console.log("  " + url);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
