begin;
alter table public.saved_results add column fingerprint text
  check (fingerprint ~ '^[a-f0-9]{64}$');
-- Existing snapshots have no original birth identity and cannot be backfilled.
create unique index saved_results_owner_fingerprint_idx
  on public.saved_results(owner_hash, fingerprint);
create function public.save_or_reuse_result(p_owner_hash text, p_fingerprint text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  existing_id uuid;
  created_id uuid;
  request_time timestamptz;
begin
  if p_owner_hash is null or p_owner_hash !~ '^[a-f0-9]{64}$'
    or p_fingerprint is null or p_fingerprint !~ '^[a-f0-9]{64}$'
    or p_payload is null or jsonb_typeof(p_payload) <> 'object'
    or (p_payload->>'version') is distinct from '1' then
    raise exception 'Invalid result';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_owner_hash || p_fingerprint, 0));
  request_time := clock_timestamp();
  select id into existing_id from public.saved_results
    where owner_hash = p_owner_hash and fingerprint = p_fingerprint
      and expires_at > request_time;
  if found then
    return jsonb_build_object('id', existing_id, 'created', false);
  end if;
  -- Preserve the old ID's expired state; never extend its retention or replace its payload.
  update public.saved_results set fingerprint = null
    where owner_hash = p_owner_hash and fingerprint = p_fingerprint
      and expires_at <= request_time;
  insert into public.saved_results(id, owner_hash, fingerprint, payload, created_at, expires_at)
    values (gen_random_uuid(), p_owner_hash, p_fingerprint, p_payload,
      request_time, request_time + interval '30 days') returning id into created_id;
  return jsonb_build_object('id', created_id, 'created', true);
end $$;
revoke all on function public.save_or_reuse_result(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.save_or_reuse_result(text,text,jsonb) to service_role;
commit;
