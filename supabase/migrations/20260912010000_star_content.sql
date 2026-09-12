-- Each row is one editorial revision; published revisions are immutable.
create table public.star_content (
  id bigint generated always as identity primary key,
  star_key text not null check (star_key ~ '^(major|minor|adjective):.+$'),
  locale text not null default 'ko' check (locale = 'ko'),
  version integer not null check (version > 0),
  title text not null check (length(trim(title)) > 0),
  source_url text not null check (source_url ~ '^https://iztro.com/'),
  source_version text not null check (length(trim(source_version)) > 0),
  source_text text not null check (length(trim(source_text)) > 0),
  translation text not null check (length(trim(translation)) > 0),
  translation_kind text not null check (translation_kind in ('adaptation', 'full_translation')),
  license text not null default 'MIT · Copyright (c) 2023 Sylar Long',
  status text not null default 'draft' check (status in ('draft','reviewed','published','archived')),
  reviewed_by text,
  review_notes text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (star_key, locale, version),
  check (status not in ('reviewed','published') or
    (length(trim(reviewed_by)) > 0 and reviewed_by is not null and reviewed_at is not null and length(trim(review_notes)) > 0 and review_notes is not null)),
  check (status <> 'published' or published_at is not null)
);
create unique index star_content_one_published on public.star_content (star_key, locale) where status = 'published';

create function public.guard_star_content() returns trigger
language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    if new.status <> 'draft' then raise exception 'Create a draft before review'; end if;
    new.reviewed_at := null; new.published_at := null;
    new.reviewed_by := null; new.review_notes := null;
  else
    if old.status in ('published','archived') then
      if (to_jsonb(new) - 'status' - 'updated_at') is distinct from (to_jsonb(old) - 'status' - 'updated_at')
         or not (new.status = old.status or (old.status = 'published' and new.status = 'archived')) then
        raise exception 'Published history is immutable; create a new revision';
      end if;
    elsif new.status = 'published' then
      if old.status <> 'reviewed' or
         (to_jsonb(new) - 'status' - 'updated_at' - 'published_at') is distinct from (to_jsonb(old) - 'status' - 'updated_at' - 'published_at') then
        raise exception 'Publish an unchanged reviewed revision';
      end if;
      new.published_at := now();
    elsif new.status = 'reviewed' then
      if old.status <> 'draft' then raise exception 'Return to draft before editing'; end if;
      new.reviewed_at := now();
      new.published_at := null;
    elsif new.status = 'draft' then
      new.reviewed_by := null; new.review_notes := null;
      new.reviewed_at := null; new.published_at := null;
    else
      raise exception 'Only published revisions can be archived';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger star_content_editorial_guard before insert or update on public.star_content
for each row execute function public.guard_star_content();
revoke all on function public.guard_star_content() from public, anon, authenticated;
alter table public.star_content enable row level security;
revoke all on public.star_content from public, anon, authenticated;
grant select (star_key, locale, version, title, translation, translation_kind, source_url, source_version, license, status, published_at) on public.star_content to anon, authenticated;
create policy published_star_content on public.star_content for select to anon, authenticated using (status = 'published');
grant select, insert, update on public.star_content to service_role;
revoke delete on public.star_content from service_role;
grant usage, select on sequence public.star_content_id_seq to service_role;
