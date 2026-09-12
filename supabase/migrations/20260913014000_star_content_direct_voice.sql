-- Editorial revision; preserve published history and original sources.
begin;
lock table public.star_content in share row exclusive mode;
do $$
declare
  change record;
  previous public.star_content%rowtype;
  draft_id bigint;
  sentence record;
  revised_text text;
begin
  for change in select star_key, jsonb_object_agg(old_sentence, new_sentence) as replacements from (values
('minor:우필', '위로나 격려를 건네며 관계의 날카로운 부분을 누그러뜨리는 역할로 설명합니다.', '위로나 격려를 건네며 관계에서 생기는 긴장과 갈등을 누그러뜨립니다.'),
('minor:타라', '서두르지 않고 차근차근 쌓는 힘과, 결정을 망설이거나 미루는 모습이 함께 설명됩니다.', '서두르지 않고 차근차근 쌓는 힘이 있지만, 결정을 망설이거나 미루기도 합니다.'),
('major:천동', '불필요한 다툼을 줄이고 지금의 생활에서 만족할 부분을 찾는 모습도 천동의 특징으로 소개됩니다.', '불필요한 다툼을 줄이고 지금의 생활에서 만족할 부분을 찾기도 합니다.'),
('minor:령성', '신중하게 계획하고 세부를 따지는 태도가 특징으로 소개됩니다.', '신중하게 계획하고 세부를 따집니다.'),
('adjective:삼태', '팔좌와 함께 명예와 지위, 생활의 격식과 만족을 중시하는 별로 설명합니다.', '팔좌와 함께 명예와 지위, 생활의 격식과 만족을 중시하는 별입니다.'),
('adjective:은광', '받은 도움을 기억하고 보답하려는 태도로 설명합니다.', '받은 도움을 기억하고 보답하려 합니다.'),
('adjective:천희', '밝고 활발하게 사람을 대하는 친화력으로 설명합니다.', '밝고 활발하게 사람을 대하며 친화력이 있습니다.'),
('adjective:팔좌', '삼태와 짝을 이루어 명예와 지위, 생활의 격식과 만족을 중시하는 별로 설명합니다.', '삼태와 짝을 이루어 명예와 지위, 생활의 격식과 만족을 중시하는 별입니다.'),
('adjective:팔좌', '간섭을 적게 받고 자신의 생활을 즐기려는 모습도 함께 소개됩니다.', '간섭을 적게 받고 자신의 생활을 즐기려는 모습도 있습니다.'),
('adjective:함지', '사람의 관심을 끄는 매력과 자신을 가꾸는 관심으로 설명합니다.', '사람의 관심을 끄는 매력이 있고 자신을 가꾸는 데 관심이 있습니다.'),
('adjective:홍란', '친근하면서도 조심스럽게 감정을 표현하는 분위기로 설명합니다.', '친근하게 다가가면서도 감정은 조심스럽게 표현합니다.'),
('minor:록존', '자신이 가진 기반과 자원을 신중하게 지키는 태도로 설명합니다.', '자신이 가진 기반과 자원을 신중하게 지킵니다.'),
('minor:천괴', '사람을 이끌거나 결정을 분명히 하는 태도도 함께 설명됩니다.', '사람을 이끌거나 결정을 분명히 하기도 합니다.'),
('minor:천월', '상황을 분석하고 문제의 원인을 줄이는 간접적인 도움으로 설명합니다.', '상황을 분석하고 문제의 원인을 줄여 간접적으로 돕습니다.'),
('major:태양', '일에 대한 의욕과 조직하는 능력이 주요 강점으로 소개됩니다.', '일에 대한 의욕이 높고 사람들의 역할과 일을 정리하는 데 강점이 있습니다.'),
('major:파군', '단순히 행동만 앞서는 별로 설명되지는 않으며, 특히 창의적인 표현이나 관심을 가진 분야에서 자신만의 방법을 찾고 깊이 익히는 모습도 소개됩니다.', '행동만 앞서는 것은 아니며, 특히 창의적인 표현이나 관심을 가진 분야에서 자신만의 방법을 찾고 깊이 익히기도 합니다.')
  ) as edits(star_key, old_sentence, new_sentence) group by star_key
  loop
    select * into strict previous from public.star_content
      where star_key = change.star_key and locale = 'ko' and status = 'published';
    revised_text := previous.translation;
    for sentence in select * from jsonb_each_text(change.replacements)
    loop
      if position(sentence.key in revised_text) = 0 then
        raise exception 'Expected sentence not found: %', change.star_key;
      end if;
      revised_text := replace(revised_text, sentence.key, sentence.value);
    end loop;
    insert into public.star_content
      (star_key, locale, version, title, source_url, source_version, source_text, translation, translation_kind, license)
    values (previous.star_key, previous.locale,
      (select max(version) + 1 from public.star_content where star_key = previous.star_key and locale = previous.locale),
      previous.title, previous.source_url, previous.source_version, previous.source_text,
      revised_text, previous.translation_kind, previous.license)
    returning id into draft_id;
    update public.star_content set status = 'reviewed', reviewed_by = 'Codex',
      review_notes = '사용자 요청에 따른 한국어 문장 편집 검수. 해설을 전달하는 어투를 직접적인 문장으로 다듬고 기존 의미와 나머지 문장, 원문 출처를 유지했다. 원문 재번역이나 전문가 검수가 아니다.'
      where id = draft_id;
    perform public.publish_star_content(draft_id);
  end loop;
end $$;
commit;
