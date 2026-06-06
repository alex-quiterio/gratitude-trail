-- 0001_init — create cards + entries.
-- Apply: psql "$POSTGRES_URL" -f db/migrations/0001_init.sql

begin;

create extension if not exists pgcrypto;

create table if not exists cards (
    id          uuid        primary key default gen_random_uuid(),
    qr_token    text        not null unique,
    title       text,
    created_at  timestamptz not null default now(),
    retired_at  timestamptz,
    constraint qr_token_format check (char_length(qr_token) between 6 and 64)
);

create table if not exists entries (
    id          uuid        primary key default gen_random_uuid(),
    card_id     uuid        not null references cards(id) on delete cascade,
    username    text        not null,
    message     text,
    created_at  timestamptz not null default now(),
    constraint username_len check (char_length(btrim(username)) between 1 and 40),
    constraint message_len  check (message is null or char_length(message) <= 280)
);

create index if not exists entries_card_created_idx
    on entries (card_id, created_at);

commit;
