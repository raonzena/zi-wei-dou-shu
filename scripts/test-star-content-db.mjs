import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import process from 'node:process';
import console from 'node:console';
import { setTimeout } from 'node:timers/promises';
const name = `ziwei-content-test-${process.pid}`;
const docker = (args, input) =>
  execFileSync('docker', args, {
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
const sql = (q) =>
  docker(
    [
      'exec',
      '-i',
      name,
      'psql',
      '-h',
      '127.0.0.1',
      '-XAt',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
    ],
    q,
  );
try {
  docker([
    'run',
    '--rm',
    '-d',
    '--name',
    name,
    '-e',
    'POSTGRES_PASSWORD=test-only',
    'public.ecr.aws/supabase/postgres:17.6.1.166',
  ]);
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      sql('select 1');
      ready = true;
      break;
    } catch {
      await setTimeout(500);
    }
  }
  assert.ok(ready);
  sql(
    "do $$ begin if not exists(select from pg_roles where rolname='anon') then create role anon; end if; if not exists(select from pg_roles where rolname='authenticated') then create role authenticated; end if; if not exists(select from pg_roles where rolname='service_role') then create role service_role bypassrls; end if; end $$;",
  );
  sql(
    readFileSync('supabase/migrations/20260912010000_star_content.sql', 'utf8'),
  );
  sql(
    readFileSync(
      'supabase/migrations/20260912011000_star_content_drafts.sql',
      'utf8',
    ),
  );
  assert.equal(sql('select count(*) from public.star_content'), '39');
  for (const role of ['anon', 'authenticated']) {
    assert.equal(
      sql(`set role ${role}; select count(star_key) from public.star_content;`)
        .split('\n')
        .at(-1),
      '0',
    );
    for (const query of [
      "update public.star_content set title='bad'",
      'delete from public.star_content',
      "insert into public.star_content (star_key) values ('major:bad')",
      'select reviewed_by from public.star_content',
    ])
      assert.throws(() => sql(`set role ${role}; ${query}`));
  }
  assert.throws(() =>
    sql(
      "update public.star_content set status='published' where star_key='major:자미'",
    ),
  );
  assert.throws(() =>
    sql(
      "update public.star_content set status='reviewed' where star_key='major:자미'",
    ),
  );
  sql(
    "update public.star_content set status='reviewed', reviewed_by='test-reviewer', review_notes='test only' where star_key='major:자미';",
  );
  assert.throws(() =>
    sql(
      "update public.star_content set status='published', translation='unreviewed edit' where star_key='major:자미'",
    ),
  );
  sql(
    "update public.star_content set status='published' where star_key='major:자미'",
  );
  for (const role of ['anon', 'authenticated'])
    assert.equal(
      sql(`set role ${role}; select count(star_key) from public.star_content;`)
        .split('\n')
        .at(-1),
      '1',
    );
  assert.throws(() =>
    sql(
      "update public.star_content set translation='changed' where star_key='major:자미'",
    ),
  );
  sql(
    "insert into public.star_content (star_key, version, title, source_url, source_version, source_text, translation, translation_kind) select star_key, 2, title, source_url, source_version, source_text, translation, translation_kind from public.star_content where star_key='major:자미'; update public.star_content set status='reviewed',reviewed_by='test',review_notes='test' where version=2;",
  );
  assert.throws(() =>
    sql("update public.star_content set status='published' where version=2"),
  );
  sql(
    "begin; update public.star_content set status='archived' where star_key='major:자미' and version=1; update public.star_content set status='published' where version=2; commit;",
  );
  assert.equal(
    sql('set role anon; select version from public.star_content; ')
      .split('\n')
      .at(-1),
    '2',
  );
  sql(
    "update public.star_content set status='reviewed',reviewed_by='test',review_notes='test' where star_key='major:천기'; update public.star_content set status='draft',translation='new draft' where star_key='major:천기';",
  );
  assert.equal(
    sql(
      "select reviewed_at is null and reviewed_by is null from public.star_content where star_key='major:천기'",
    ),
    't',
  );
  sql(
    readFileSync(
      'supabase/migrations/20260912012000_publish_star_content.sql',
      'utf8',
    ),
  );
  assert.equal(
    sql("select count(*) from public.star_content where status='published'"),
    '39',
  );
  sql(
    readFileSync(
      'supabase/migrations/20260912013000_publish_star_content_function.sql',
      'utf8',
    ),
  );
  assert.throws(() =>
    sql('set role anon; select public.publish_star_content(1);'),
  );
  assert.throws(() => sql('select public.publish_star_content(-1);'));
  assert.equal(
    sql("select count(*) from public.star_content where status='published'"),
    '39',
  );
  console.log(
    'PASS: 39 drafts; public isolation; review/publish guards; immutable history; atomic replacement; re-review',
  );
} finally {
  docker(['rm', '-f', name]);
}
