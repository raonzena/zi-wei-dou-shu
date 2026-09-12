-- Editorial revision; preserve published history and original sources.
begin;
lock table public.star_content in share row exclusive mode;
do $$
declare
  change record;
  previous public.star_content%rowtype;
  draft_id bigint;
begin
  for change in select * from (values
('major:거문', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:무곡', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:염정', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:자미', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:천기', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:천동', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:천량', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:천부', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:천상', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:칠살', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:탐랑', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:태양', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:태음', '성향으로 풀이합니다.', '성향을 나타냅니다.'),
('major:파군', '성향으로 풀이합니다.', '성향을 나타냅니다.')
  ) as edits(star_key, old_sentence, new_sentence)
  loop
    select * into strict previous from public.star_content
      where star_key = change.star_key and locale = 'ko' and status = 'published';
    if position(change.old_sentence in previous.translation) = 0 then
      raise exception 'Expected sentence not found: %', change.star_key;
    end if;
    insert into public.star_content
      (star_key, locale, version, title, source_url, source_version, source_text, translation, translation_kind, license)
    values (previous.star_key, previous.locale,
      (select max(version) + 1 from public.star_content where star_key = previous.star_key and locale = previous.locale),
      previous.title, previous.source_url, previous.source_version, previous.source_text,
      replace(previous.translation, change.old_sentence, change.new_sentence), previous.translation_kind, previous.license)
    returning id into draft_id;
    update public.star_content set status = 'reviewed', reviewed_by = 'Codex',
      review_notes = '사용자 요청에 따른 한국어 문장 편집 검수. 첫 문장의 종결 표현만 다듬고 기존 의미와 나머지 문장, 원문 출처를 유지했다. 원문 재번역이나 전문가 검수가 아니다.'
      where id = draft_id;
    perform public.publish_star_content(draft_id);
  end loop;
end $$;
commit;
