alter table push_subscriptions
  add column if not exists updated_at timestamptz not null default now();
