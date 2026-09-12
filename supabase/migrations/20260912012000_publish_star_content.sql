-- Editorial source comparison by Codex, 2026-09-12. Not specialist astrology validation.
-- 14 existing major-star adaptations + 25 supporting-star Korean adaptations.
update public.star_content
set status = 'reviewed', reviewed_by = 'Codex',
    review_notes = 'iztro-docs 431611d05ef5f910f936c3d4c32aec7de2027d96의 별별 원문과 대조한 한국어 편집 설명. 단일 별의 상징만 적용하고 조합·성별·사건 단정은 일반화하지 않음. 전체 직역이나 독립 전문가 검수는 아님.'
where version = 1 and status = 'draft';
update public.star_content set status = 'published' where version = 1 and status = 'reviewed';
