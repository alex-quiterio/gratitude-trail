import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);

export const sql = client;

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
