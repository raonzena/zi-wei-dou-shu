-- Atomically replace a published version; avoid an accidental zero-row second update.
create function public.publish_star_content(p_id bigint) returns void
language plpgsql security invoker set search_path = '' as $$
declare target public.star_content%rowtype;
begin
  select * into target from public.star_content where id = p_id for update;
  if not found or target.status <> 'reviewed' then
    raise exception 'A reviewed revision is required';
  end if;
  update public.star_content set status = 'archived'
  where star_key = target.star_key and locale = target.locale and status = 'published';
  update public.star_content set status = 'published' where id = target.id;
end;
$$;
revoke all on function public.publish_star_content(bigint) from public, anon, authenticated;
grant execute on function public.publish_star_content(bigint) to service_role;
