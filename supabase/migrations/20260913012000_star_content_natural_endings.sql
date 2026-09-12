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
('minor:천마', '변화와 이동을 반기고 새로운 경험을 찾아 나서는 모습으로 풀이합니다.', '변화와 이동을 반기고 새로운 경험을 찾아 나섭니다.'),
('minor:지공', '실행에 앞서 머릿속에서 다양한 가능성을 그리는 모습으로 풀이합니다.', '실행에 앞서 머릿속에서 다양한 가능성을 그립니다.'),
('minor:좌보', '앞에서 방향을 안내하고 다른 사람을 직접 돕는 모습으로 풀이합니다.', '앞에서 방향을 안내하고 다른 사람을 직접 돕습니다.'),
('minor:우필', '상대의 말을 듣고 뒤에서 부드럽게 돕는 모습으로 풀이합니다.', '상대의 말을 듣고 뒤에서 부드럽게 돕습니다.'),
('minor:경양', '생각을 오래 이어가기보다 행동으로 표현하고 도전에 맞서는 모습으로 풀이합니다.', '생각을 오래 이어가기보다 행동으로 표현하고 도전에 맞섭니다.'),
('minor:타라', '한 가지를 반복해서 살피고 원리를 깊이 연구하는 모습으로 풀이합니다.', '한 가지를 반복해서 살피고 원리를 깊이 연구합니다.'),
('minor:화성', '감정과 생각이 빠르게 달아오르고 밖으로 드러나는 모습으로 풀이합니다.', '감정과 생각이 빠르게 달아오르고 겉으로 드러납니다.'),
('minor:령성', '감정을 바로 드러내기보다 안에서 생각하고 소화하는 모습으로 풀이합니다.', '감정을 바로 드러내기보다 혼자 생각하며 정리합니다.'),
('minor:지겁', '기회를 쉽게 받아들이기보다 위험과 자신의 기준을 따져보는 모습으로 설명합니다.', '기회를 쉽게 받아들이기보다 위험과 자신의 기준을 따져봅니다.'),
('adjective:천요', '사람들과 어울리고 관심을 받으며 자신을 표현하는 모습으로 설명합니다.', '사람들과 어울리고 관심을 받으며 자신을 표현합니다.'),
('adjective:천관', '지위와 권한을 의식하고 자신의 역할을 드러내려는 모습으로 설명합니다.', '지위와 권한을 의식하고 자신의 역할을 드러내려 합니다.'),
('adjective:천귀', '다른 사람을 돕고 그 도움에 좋은 반응이 돌아오는 모습으로 설명합니다.', '다른 사람을 도우며 긍정적인 반응을 얻을 수 있습니다.'),
('adjective:천복', '낙관적인 마음으로 평온한 생활을 바라는 모습으로 설명합니다.', '낙관적인 마음으로 평온한 생활을 바랍니다.'),
('adjective:천재', '이해와 반응이 빠르고 새로운 내용을 알아차리는 모습으로 설명합니다.', '이해와 반응이 빠르고 새로운 내용을 잘 알아차립니다.')
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
