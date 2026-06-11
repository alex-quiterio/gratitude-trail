-- Gratitude Token — canonical schema (current state of the database).
-- This file is the source of truth for the data model. Apply ordered changes
-- via db/migrations/*.sql; this file should always reflect the latest migration.

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ─────────────────────────────────────────────────────────────────────────────
-- cards: one row per physical gratitude token card.
--
-- The QR printed on the card encodes a URL containing `qr_token`, NOT the
-- primary key. The token is a random, unguessable slug so cards cannot be
-- enumerated (/c/abc123 reveals nothing about /c/<next>). The uuid `id` stays
-- internal and is what foreign keys point at.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists cards (
    id          uuid        primary key default gen_random_uuid(),
    qr_token    text        not null unique,
    title       text,                                  -- optional label, e.g. "Team retro 2026"
    created_at  timestamptz not null default now(),
    retired_at  timestamptz,                           -- soft stop: scans rejected, history kept
    constraint qr_token_format check (char_length(qr_token) between 6 and 64)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- entries: the append-only timeline of holders.
--
-- Each scan-and-post appends one immutable row. The ordered set of entries for
-- a card IS "the timeline of people that received that gratitude token card".
-- We never update or delete entries in normal operation — it's a log.
--
-- `username` is stored as free text in v1 (people self-identify by display
-- name). See README "Normalising usernames" for the path to a real users table.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists entries (
    id          uuid        primary key default gen_random_uuid(),
    card_id     uuid        not null references cards(id) on delete cascade,
    username    text        not null,
    message     text,                                  -- optional note from the holder
    created_at  timestamptz not null default now(),
    constraint username_len check (char_length(btrim(username)) between 1 and 40),
    constraint message_len  check (message is null or char_length(message) <= 10000)
);

-- Primary access pattern: fetch a card's timeline in chronological order.
create index if not exists entries_card_created_idx
    on entries (card_id, created_at);

-- Optional guard: stop the same name appending twice in a row within a short
-- window. Left as a comment because it needs app-level logic, not a constraint.
-- See README "Abuse & rate limiting".
