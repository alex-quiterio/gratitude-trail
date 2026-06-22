// Mint N cards and print them as CSV (URL;Title) ready for a QR batch job.
//
//   pnpm card:bulk 10
import { createCard } from "../src/lib/cards";

async function main() {
  const count = parseInt(process.argv[2] ?? "", 10);
  if (!count || count < 1) {
    console.error("Usage: pnpm card:bulk <count>");
    process.exit(1);
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  console.log("URL;Title");
  for (let i = 0; i < count; i++) {
    const card = await createCard();
    console.log(`${base}/c/${card.qr_token};${card.title ?? ""}`);
  }
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
