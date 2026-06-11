-- 0002_message_len_10000 — raise the message length cap from 280 to 10 000.
-- Apply: psql "$POSTGRES_URL" -f db/migrations/0002_message_len_10000.sql

begin;

alter table entries
    drop constraint message_len,
    add  constraint message_len check (message is null or char_length(message) <= 10000);

commit;
