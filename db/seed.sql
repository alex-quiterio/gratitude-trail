-- Seed one demo card + a small timeline so /c/demo-card-001 works immediately.
-- Apply after migrations: psql "$POSTGRES_URL" -f db/seed.sql

insert into cards (qr_token, title)
values ('demo-card-001', 'Demo gratitude token')
on conflict (qr_token) do nothing;

insert into entries (card_id, username, message, created_at)
select c.id, v.username, v.message, v.created_at
from cards c
cross join (values
    ('alex',  'Passing this on — thank you!',        now() - interval '3 days'),
    ('mira',  'Made my week, sending it forward.',   now() - interval '2 days'),
    ('jonas', null,                                   now() - interval '1 day')
) as v(username, message, created_at)
where c.qr_token = 'demo-card-001'
on conflict do nothing;
