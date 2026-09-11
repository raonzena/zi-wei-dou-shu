begin;
create schema if not exists ai_private;
revoke all on schema ai_private from public, anon, authenticated;
create table ai_private.requests (
  id uuid primary key default gen_random_uuid(),
  actor_hash text not null check (actor_hash ~ '^[0-9a-f]{64}$'),
  fingerprint text not null check (fingerprint ~ '^[0-9a-f]{64}$'),
  model text not null,
  prompt_version text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  outcome text check (outcome in ('ready','invalid-response','timeout','quota','rate-limit','unavailable','provider')),
  reserved_microusd bigint not null check (reserved_microusd > 0),
  cost_microusd bigint check (cost_microusd >= 0),
  input_tokens integer check (input_tokens >= 0),
  cached_tokens integer check (cached_tokens between 0 and input_tokens),
  output_tokens integer check (output_tokens >= 0),
  duration_ms integer check (duration_ms >= 0)
);
alter table ai_private.requests enable row level security;
revoke all on ai_private.requests from public, anon, authenticated, service_role;
create index requests_started on ai_private.requests (started_at);
create index requests_actor_started on ai_private.requests (actor_hash, started_at desc);
create index requests_dedup on ai_private.requests (actor_hash, fingerprint, started_at desc);

-- One short database transaction reserves all limits before any provider call.
-- Only service_role may invoke these entrypoints; no browser can change counters.
create function public.reserve_ai_request(
 p_actor text, p_fingerprint text, p_model text, p_prompt text,
 p_hourly_limit integer, p_daily_limit integer, p_daily_budget bigint
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 v_now timestamptz := now();
 v_day timestamptz := date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul';
 v_id uuid;
 v_reserve constant bigint := 400000;
begin
 if p_actor !~ '^[0-9a-f]{64}$' or p_fingerprint !~ '^[0-9a-f]{64}$'
   or p_actor is null or p_fingerprint is null
   or p_hourly_limit is null or p_hourly_limit < 1
   or p_daily_limit is null or p_daily_limit < 1
   or p_daily_budget is null or p_daily_budget < v_reserve
   or p_model <> 'gpt-5.4-mini-2026-03-17' or p_model is null
   or p_prompt is null or length(p_prompt) > 100 then
   raise exception 'Invalid admission parameters';
 end if;
 perform pg_advisory_xact_lock(19290912, 1);
 if exists(select 1 from ai_private.requests where actor_hash=p_actor and fingerprint=p_fingerprint and started_at > v_now - interval '10 minutes') then
   return jsonb_build_object('allowed',false,'reason','duplicate');
 end if;
 if (select count(*) from ai_private.requests where actor_hash=p_actor and started_at > v_now - interval '1 hour') >= p_hourly_limit then
   return jsonb_build_object('allowed',false,'reason','hourly');
 end if;
 if (select count(*) from ai_private.requests where started_at >= v_day) >= p_daily_limit
   or (select coalesce(sum(coalesce(cost_microusd,reserved_microusd)),0) from ai_private.requests where started_at >= v_day) + v_reserve > p_daily_budget then
   return jsonb_build_object('allowed',false,'reason','daily');
 end if;
 insert into ai_private.requests(actor_hash,fingerprint,model,prompt_version,reserved_microusd)
 values(p_actor,p_fingerprint,p_model,p_prompt,v_reserve) returning id into v_id;
 return jsonb_build_object('allowed',true,'id',v_id);
end $$;

-- Missing usage (timeout, broken connection, lost response) keeps the reservation.
-- Completion is idempotent: repeated settlement cannot refund/rewrite an attempt.
create function public.finish_ai_request(
 p_id uuid, p_outcome text, p_duration_ms integer,
 p_input integer default null, p_cached integer default null, p_output integer default null
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_cost bigint; v_count integer;
begin
 if p_id is null or p_outcome is null or p_outcome not in ('ready','invalid-response','timeout','quota','rate-limit','unavailable','provider') or p_duration_ms is null or p_duration_ms < 0 then raise exception 'Invalid completion'; end if;
 if (p_input is null or p_cached is null or p_output is null) and not (p_input is null and p_cached is null and p_output is null) then
   raise exception 'Incomplete usage';
 end if;
 if p_input < 0 or p_cached < 0 or p_cached > p_input or p_output < 0 then raise exception 'Invalid usage'; end if;
 -- Snapshot price: input $0.75, cached $0.075, output $4.50 per million tokens.
 v_cost := case when p_input is null then null else ceil((p_input-p_cached)*0.75 + p_cached*0.075 + p_output*4.5)::bigint end;
 perform pg_advisory_xact_lock(19290912, 1);
 update ai_private.requests set finished_at=now(),outcome=p_outcome,duration_ms=p_duration_ms,
   input_tokens=p_input,cached_tokens=p_cached,output_tokens=p_output,cost_microusd=v_cost
 where id=p_id and finished_at is null;
 get diagnostics v_count = row_count;
 return v_count=1;
end $$;

create function public.ai_usage_summary() returns jsonb
language sql security definer set search_path = '' as $$
 select coalesce(jsonb_agg(row_to_json(day) order by day.date desc),'[]'::jsonb)
 from (
 select (started_at at time zone 'Asia/Seoul')::date as date,model,prompt_version,
 count(*) as attempts,count(*) filter(where outcome='ready') as completed,
 count(*) filter(where outcome is not null and outcome<>'ready') as failed,
 round(100.0*count(*) filter(where outcome='ready')/count(*),2) as completion_percent,
 round(100.0*count(*) filter(where outcome is not null and outcome<>'ready')/count(*),2) as failure_percent,
 count(*) filter(where outcome='invalid-response') as invalid_response,
 count(*) filter(where outcome='timeout') as timeout,
 count(*) filter(where outcome in ('quota','rate-limit','unavailable','provider')) as provider_error,
 count(*) filter(where finished_at is null) as unfinished,
 count(*) filter(where cost_microusd is null) as unknown_cost,
 avg(duration_ms)::integer as average_duration_ms,
 percentile_cont(0.95) within group(order by duration_ms)::integer as p95_duration_ms,
 sum(coalesce(cost_microusd,reserved_microusd)) as budget_charge_microusd,
 sum(cost_microusd) as known_estimated_cost_microusd,
 avg(cost_microusd)::bigint as average_known_estimated_cost_microusd,
 sum(input_tokens) as input_tokens,sum(cached_tokens) as cached_tokens,sum(output_tokens) as output_tokens
 from ai_private.requests where started_at >= now()-interval '30 days'
 group by 1,2,3
 ) day;
$$;

create function public.purge_ai_usage() returns void language sql security definer set search_path = '' as $$
 delete from ai_private.requests where started_at < now()-interval '30 days';
$$;
revoke all on function public.reserve_ai_request(text,text,text,text,integer,integer,bigint) from public,anon,authenticated;
revoke all on function public.finish_ai_request(uuid,text,integer,integer,integer,integer) from public,anon,authenticated;
revoke all on function public.ai_usage_summary() from public,anon,authenticated;
revoke all on function public.purge_ai_usage() from public,anon,authenticated;
grant execute on function public.reserve_ai_request(text,text,text,text,integer,integer,bigint) to service_role;
grant execute on function public.finish_ai_request(uuid,text,integer,integer,integer,integer) to service_role;
grant execute on function public.ai_usage_summary() to service_role;
grant execute on function public.purge_ai_usage() to service_role;
-- The scheduler runs as the migration owner, even while AI generation is disabled.
create extension if not exists pg_cron;
select cron.schedule('ziwei-ai-usage-retention', '17 3 * * *', 'select public.purge_ai_usage()');
commit;
