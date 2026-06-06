# Gratitude Token

A physical *gratitude token card* carries a QR code. Scanning it opens a page
where you post a username; that name is appended to **the timeline of everyone
who has held that card**. The card travels from person to person and
accumulates a public chain of holders.

```
  ┌──────────────┐   scan QR    ┌────────────────────┐   POST name   ┌──────────────┐
  │ physical card│ ───────────▶ │  /c/<qr_token> page │ ────────────▶ │ entries table│
  │  (QR token)  │              │  timeline + form    │               │ (append-only)│
  └──────────────┘              └────────────────────┘               └──────────────┘
```

## Data model

Two tables. The whole idea is an **append-only log keyed by card** — the
ordered `entries` for a card *are* the timeline.

### `cards` — one row per physical card

| column       | type          | notes                                                        |
|--------------|---------------|--------------------------------------------------------------|
| `id`         | `uuid` PK     | internal id, what foreign keys point at                      |
| `qr_token`   | `text` unique | random unguessable slug encoded in the QR URL                |
| `title`      | `text` null   | optional label (e.g. "Team retro 2026")                      |
| `created_at` | `timestamptz` | mint time                                                    |
| `retired_at` | `timestamptz` | soft-stop: scans rejected, history preserved                 |

### `entries` — the timeline of holders

| column       | type          | notes                                                        |
|--------------|---------------|--------------------------------------------------------------|
| `id`         | `uuid` PK     |                                                              |
| `card_id`    | `uuid` FK     | → `cards.id`, `on delete cascade`                            |
| `username`   | `text`        | free-text display name, 1–40 chars (CHECK)                   |
| `message`    | `text` null   | optional note, ≤280 chars (CHECK)                            |
| `created_at` | `timestamptz` | ordering key for the timeline                                |

Timeline query: `select … from entries where card_id = $1 order by created_at asc`,
served by the `entries_card_created_idx` index.

## Design decisions (and the trade-offs)

**QR encodes a random token, not the primary key.** The QR URL is
`/c/<qr_token>` where the token is a 12-char nanoid (~71 bits). If we'd put the
row id or a sequential number in the QR, anyone could enumerate every card in
the system (`/c/1`, `/c/2`, …). The token is a *capability*: holding the printed
card is what grants access to its page. The `uuid` PK stays internal.

**Append-only entries, never updated or deleted.** A gratitude timeline is a
historical record; mutating it would let someone rewrite who held the card.
Treating `entries` as an immutable log keeps the model simple and the history
trustworthy. "Editing" is just appending.

**Soft retire instead of delete.** A printed QR can't be unprinted. `retired_at`
lets you stop accepting new scans on a card while keeping its history viewable,
and `getActiveCardByToken` returns `null` for both unknown *and* retired tokens
so the API never leaks whether a card exists.

**Username as free text in v1.** The use-case is "post a username" — people
self-identify by a display name, the same name may legitimately recur across
cards, and there's no auth. A `users` table with uniqueness would force awkward
decisions (is "alex" on card A the same person as "alex" on card B?). Storing
the name on the entry sidesteps that. See *Normalising usernames* for when to
change this.

**Postgres over Firestore.** Both fit a serverless/Vercel deploy. Postgres wins
here because the core operation is an *ordered, relational* read (timeline by
`created_at`), CHECK constraints enforce data quality at the storage layer, and
the model is plain SQL — easy to query, migrate, and reason about. Firestore
would model this as a `cards/{id}/entries` subcollection; that works, but
ordering/integrity/relational growth (a real `users` table, analytics) are more
natural in Postgres, and `@vercel/postgres` is a first-class Vercel primitive.
If you expected millions of cards with no relational queries and wanted zero
schema management, Firestore would be the lighter choice.

## What's *not* here yet (deliberately)

- **Abuse & rate limiting.** Anyone with the URL can POST. Before going public,
  add a per-IP rate limit (Vercel KV or Upstash) and consider an app-level
  guard against the same name appending twice in a row. Hooks are noted in
  `db/schema.sql` and the API route.
- **Normalising usernames.** To attribute timelines to real accounts later: add
  a `users` table (`id`, `normalized_username` unique), add a nullable
  `entries.user_id` FK, backfill, then make it required. The free-text
  `username` can stay as the displayed-at-time-of-signing value.
- **Moderation / takedown** of individual entries (would be the one exception to
  append-only — a `hidden_at` soft-flag rather than a hard delete).

## Stack

Next.js (App Router) + `@vercel/postgres`. Deploys to Vercel; runs locally
against any Postgres. The data layer (`db/`, `src/lib/`) is the substance — the
page is a thin reference UI.

```
db/
  schema.sql              canonical schema (source of truth)
  migrations/0001_init.sql ordered, runnable migration
  seed.sql                demo card "demo-card-001" + sample timeline
src/
  lib/db.ts               @vercel/postgres client + row types
  lib/cards.ts            data access: resolve token, read timeline, append, mint
  app/c/[token]/page.tsx  scan landing — timeline + sign form
  app/api/cards/[token]/entries/route.ts   GET timeline / POST username
scripts/new-card.ts       mint a card, print the QR URL
```

## Local setup

```bash
cp .env.example .env        # point POSTGRES_URL at your local Postgres
pnpm install
createdb gratitude          # or any Postgres you control
pnpm db:migrate
pnpm db:seed                # optional demo data
pnpm dev                    # http://localhost:3000/c/demo-card-001
pnpm card:new "My card"     # mint a real card + get its QR URL
```

Turn the printed QR URL into an image with any QR generator pointed at
`https://<your-domain>/c/<token>`.

## Deploy to Vercel

1. Push this folder to a repo and import it in Vercel.
2. Add a Postgres store (Storage → Postgres / Neon) — `POSTGRES_URL` is injected.
3. Run `0001_init.sql` against it once (Vercel's SQL console or `psql`).
4. Set `NEXT_PUBLIC_BASE_URL` to your production domain.
