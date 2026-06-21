create table if not exists push_subscriptions (
  id         serial primary key,
  card_id    uuid not null references cards(id) on delete cascade,
  endpoint   text    not null unique,
  p256dh     text    not null,
  auth       text    not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_card_id_idx on push_subscriptions(card_id);
