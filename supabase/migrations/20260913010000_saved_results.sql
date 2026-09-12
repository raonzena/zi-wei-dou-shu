begin;
create table public.saved_results (
  id uuid primary key,
  owner_hash text not null check (owner_hash ~ '^[a-f0-9]{64}$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and payload->>'version' = '1'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days',
  constraint saved_results_expiry check (expires_at > created_at)
);
create index saved_results_expiry_idx on public.saved_results (expires_at);
alter table public.saved_results enable row level security;
revoke all on public.saved_results from public, anon, authenticated;
grant select, insert, update, delete on public.saved_results to service_role;
-- Browser roles cannot list snapshots directly. Owner digest is checked for mutations.
select cron.schedule('purge-expired-saved-results', '15 * * * *',
  $$delete from public.saved_results where expires_at <= now()$$);

commit;
