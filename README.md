# Gratitude Trail

<img width="1536" height="1024" alt="gratitude-tokens" src="https://github.com/user-attachments/assets/7039b93c-d38a-44b4-bf9e-70ff7814d34f" />


A small experiment in physical gratitude. A printed card carries a QR code.
When someone scans it, they land on a page that shows every person who has held
that card before them — and they can leave their own name, and a note.

The card travels. The list grows. Each scan is a quiet act of presence.

```
  ┌──────────────┐   scan QR    ┌─────────────────────┐   leave a name   ┌──────────────┐
  │ physical card│ ───────────▶ │  /c/<qr_token> page  │ ───────────────▶ │ entries table│
  │  (QR token)  │              │  timeline + sign form│                  │ (append-only)│
  └──────────────┘              └─────────────────────┘                  └──────────────┘
```

Each token page picks a random warm accent color on every load — amber,
terracotta, sage, teal, mauve — so no two visits feel quite the same.

---

## Data model

Two tables. The whole idea is an **append-only log keyed by card** — the
ordered `entries` for a card *are* the timeline.

### `cards` — one row per physical card

| column       | type          | notes                                                    |
|--------------|---------------|----------------------------------------------------------|
| `id`         | `uuid` PK     | internal id; what foreign keys point at                  |
| `qr_token`   | `text` unique | random unguessable slug encoded in the QR URL            |
| `title`      | `text` null   | optional label, e.g. *"Morning Fog on Water"*            |
| `created_at` | `timestamptz` | mint time                                                |
| `retired_at` | `timestamptz` | soft-stop: scans rejected, history preserved             |

### `entries` — the timeline of holders

| column       | type          | notes                                                    |
|--------------|---------------|----------------------------------------------------------|
| `id`         | `uuid` PK     |                                                          |
| `card_id`    | `uuid` FK     | → `cards.id`, `on delete cascade`                        |
| `username`   | `text`        | free-text display name, 1–40 chars (CHECK)               |
| `message`    | `text` null   | optional note, ≤ 280 chars (CHECK)                       |
| `created_at` | `timestamptz` | ordering key for the timeline                            |

Timeline query: `select … from entries where card_id = $1 order by created_at asc`,
served by the `entries_card_created_idx` index.

---

## Design decisions

**QR encodes a random token, not the primary key.**
The URL is `/c/<qr_token>` where the token is a 12-char nanoid (~71 bits of
entropy). A sequential ID or UUID in the URL would let anyone enumerate every
card. The token is a *capability* — holding the printed card is what grants
access. The `uuid` PK stays internal.

**Append-only entries, never updated or deleted.**
A gratitude timeline is a record of moments; mutating it would let someone
rewrite history. Treating `entries` as an immutable log keeps the model simple
and the timeline trustworthy. "Editing" is just appending.

**Soft retire instead of delete.**
A printed QR can't be unprinted. `retired_at` lets you stop accepting new
scans on a card while keeping its full history intact. `getActiveCardByToken`
returns `null` for both unknown *and* retired tokens — the API never leaks
whether a card exists.

**Username as free text in v1.**
People self-identify by a display name. The same name may legitimately appear
across cards, and there is no auth. A `users` table with uniqueness would force
awkward questions ("is *alex* on card A the same person as *alex* on card B?").
Storing the name on the entry sidesteps that entirely. See *Not here yet* for
the upgrade path.

**Postgres over Firestore.**
The core operation is an *ordered, relational* read. Postgres wins here: CHECK
constraints enforce data quality at the storage layer, the timeline is a plain
SQL query, and relational growth (a real `users` table, analytics) is natural.
`@vercel/postgres` is also a first-class Vercel primitive. Firestore would work,
but ordering and integrity are more awkward and schema management is harder to
reason about long-term.

---

## What's not here yet (deliberately)

- **Rate limiting.** Anyone with the URL can POST. Before going public add a
  per-IP limit (Vercel KV / Upstash) and consider guarding against the same
  name appending twice in a row.
- **Normalising usernames.** To attribute timelines to real accounts later: add
  a `users` table, a nullable `entries.user_id` FK, backfill, make it required.
  The free-text `username` can stay as the displayed-at-signing value.
- **Moderation.** A `hidden_at` soft-flag on entries would be the one exception
  to append-only — a hard delete is never the right move on a timeline.

---

## Stack

Next.js 14 (App Router) · `@vercel/postgres` · Playfair Display + Lora via
`next/font/google`. Deploys to Vercel; runs locally against any Postgres.

```
db/
  schema.sql                    canonical schema (source of truth)
  migrations/0001_init.sql      ordered, runnable migration
  seed.sql                      demo card + sample timeline

src/
  lib/db.ts                     @vercel/postgres client + row types
  lib/cards.ts                  data access: resolve token, read timeline, append, mint
  app/layout.tsx                fonts + global styles
  app/globals.css               animations, hover states, CSS variable theming
  app/c/[token]/page.tsx        scan landing — random accent + timeline
  app/c/[token]/sign-form.tsx   client form component
  app/api/cards/[token]/entries/route.ts   GET timeline / POST entry

scripts/new-card.ts             mint a card and print its QR URL
```

---

## Local setup

```bash
cp .env.example .env        # point POSTGRES_URL at your local Postgres
pnpm install
createdb gratitude          # or any Postgres instance you control
pnpm db:migrate
pnpm db:seed                # optional — loads a demo card + sample timeline
pnpm dev                    # → http://localhost:3000/c/demo-card-001
```

Mint a new card:

```bash
pnpm card:new "Morning Fog on Water"
# prints: /c/<token>  — paste into any QR generator
```

---

## Deploy to Vercel

1. Push this repo and import it in Vercel.
2. Add a Postgres store (Storage → Postgres / Neon) — `POSTGRES_URL` is
   injected automatically.
3. Run `0001_init.sql` once against it (Vercel's SQL console or `psql`).
4. Set `NEXT_PUBLIC_BASE_URL` to your production domain.
5. Mint cards, print QR codes, set them free.
