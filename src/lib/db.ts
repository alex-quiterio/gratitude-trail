// Thin re-export of the Vercel Postgres client. `sql` is a tagged-template
// that parameterises inputs (no string concatenation → no SQL injection).
//
// It connects using the POSTGRES_URL env var, which works both on Vercel
// (auto-injected by an attached Postgres/Neon store) and locally (point it at
// any Postgres instance — see .env.example).
export { sql } from "@vercel/postgres";

export type Card = {
  id: string;
  qr_token: string;
  title: string | null;
  created_at: string;
  retired_at: string | null;
};

export type Entry = {
  id: string;
  card_id: string;
  username: string;
  message: string | null;
  created_at: string;
};
