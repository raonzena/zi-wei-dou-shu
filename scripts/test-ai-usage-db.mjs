import { URL } from 'node:url';
import process from 'node:process';
import console from 'node:console';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';

// Only a disposable Docker database is used. Never reads application credentials.
const name = `ziwei-ai-test-${process.pid}`;
const image = 'ghcr.io/supabase/postgres:17.6.1.166';
function docker(args, input) {
  return execFileSync('docker', args, {
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}
function sql(query, role = 'postgres') {
  return docker(
    [
      'exec',
      '-i',
      name,
      'psql',
      '-XAt',
      '-U',
      role,
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
    ],
    query,
  );
}
function concurrent(query) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', [
      'exec',
      '-i',
      name,
      'psql',
      '-XAt',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
    ]);
    let out = '';
    let error = '';
    child.stdout.on('data', (data) => {
      out += data;
    });
    child.stderr.on('data', (data) => {
      error += data;
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve(JSON.parse(out.trim())) : reject(new Error(error)),
    );
    child.stdin.end(query);
  });
}
const hash = (value) => value.toString(16).padStart(64, '0');
function reserve(actor, fingerprint, hourly = 3, daily = 20, budget = 2000000) {
  return `select public.reserve_ai_request('${hash(actor)}','${hash(fingerprint)}','gpt-5.4-mini-2026-03-17','test-v1',${hourly},${daily},${budget});`;
}
const admitted = (actor, fingerprint, hourly, daily, budget) =>
  JSON.parse(sql(reserve(actor, fingerprint, hourly, daily, budget)));
const reset = () => sql('truncate ai_private.requests;');
let started = false;
try {
  docker([
    'run',
    '--rm',
    '-d',
    '--name',
    name,
    '-e',
    'POSTGRES_PASSWORD=disposable-test-only',
    image,
    '-c',
    'shared_preload_libraries=pg_cron',
    '-c',
    'cron.database_name=postgres',
  ]);
  started = true;
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      docker(['exec', name, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']);
      ready = true;
      break;
    } catch {
      await setTimeout(500);
    }
  }
  assert(ready, 'Postgres did not become ready');
  sql('create extension if not exists pg_cron;', 'supabase_admin');
  sql(
    readFileSync(
      new URL(
        '../supabase/migrations/20260912000000_ai_usage_controls.sql',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  assert.equal(
    sql(
      "select count(*) from cron.job where jobname='ziwei-ai-usage-retention' and active;",
    ),
    '1',
  );
  const duplicate = await Promise.all(
    Array.from({ length: 8 }, () => concurrent(reserve(1, 1))),
  );
  assert.equal(duplicate.filter((v) => v.allowed).length, 1);
  assert.equal(duplicate.filter((v) => v.reason === 'duplicate').length, 7);
  reset();
  const hourly = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      concurrent(reserve(1, i, 3, 20, 10000000)),
    ),
  );
  assert.equal(hourly.filter((v) => v.allowed).length, 3);
  assert.equal(hourly.filter((v) => v.reason === 'hourly').length, 5);
  reset();
  const daily = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      concurrent(reserve(i, i, 3, 4, 10000000)),
    ),
  );
  assert.equal(daily.filter((v) => v.allowed).length, 4);
  reset();
  const budget = await Promise.all(
    Array.from({ length: 8 }, (_, i) => concurrent(reserve(i, i))),
  );
  assert.equal(budget.filter((v) => v.allowed).length, 5);
  assert.equal(
    sql('select sum(reserved_microusd) from ai_private.requests;'),
    '2000000',
  );
  console.log('PASS: concurrent duplicate, hourly, daily and budget admission');

  reset();
  const first = admitted(1, 1, 3, 20, 400000);
  assert(first.allowed);
  assert.equal(admitted(2, 2, 3, 20, 400000).reason, 'daily');
  assert.equal(
    sql(
      `select public.finish_ai_request('${first.id}','invalid-response',1200,1000,200,100);`,
    ),
    't',
  );
  assert.equal(
    sql(`select public.finish_ai_request('${first.id}','ready',1,0,0,0);`),
    'f',
  );
  assert.equal(sql('select cost_microusd from ai_private.requests;'), '1065');
  assert(admitted(2, 2, 3, 20, 401065).allowed);
  assert.equal(admitted(3, 3, 3, 20, 401065).reason, 'daily');
  const summary = JSON.parse(sql('select public.ai_usage_summary();'))[0];
  assert.equal(summary.invalid_response, 1);
  assert.equal(summary.failure_percent, 50);
  assert.equal(summary.average_known_estimated_cost_microusd, 1065);
  assert.equal(summary.unfinished, 1);
  assert.equal(summary.unknown_cost, 1);
  assert.equal(summary.budget_charge_microusd, 401065);
  assert.equal(summary.input_tokens, 1000);
  assert.equal(summary.p95_duration_ms, 1200);
  reset();
  const timeout = admitted(1, 1, 3, 20, 400000);
  sql(`select public.finish_ai_request('${timeout.id}','timeout',150000);`);
  assert.equal(admitted(2, 2, 3, 20, 400000).reason, 'daily');
  assert.equal(
    JSON.parse(sql('select public.ai_usage_summary();'))[0].unknown_cost,
    1,
  );
  assert.throws(() =>
    sql(`select public.finish_ai_request('${timeout.id}',null,1);`),
  );
  assert.throws(() =>
    sql(`select public.finish_ai_request('${timeout.id}','ready',1,1,2,1);`),
  );
  assert.throws(() =>
    sql(`select public.finish_ai_request('${timeout.id}','ready',1,1,null,1);`),
  );
  console.log(
    'PASS: known/unknown costs, failure accounting and idempotent settlement',
  );

  reset();
  admitted(1, 1);
  sql(
    "update ai_private.requests set started_at=(date_trunc('day',now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul')-interval '1 second';",
  );
  assert(admitted(2, 2, 3, 1, 400000).allowed);
  assert.equal(admitted(3, 3, 3, 1, 400000).reason, 'daily');
  sql(
    `update ai_private.requests set started_at=now()-interval '31 days' where actor_hash='${hash(1)}'; select public.purge_ai_usage();`,
  );
  assert.equal(sql('select count(*) from ai_private.requests;'), '1');
  for (const role of ['anon', 'authenticated', 'service_role']) {
    assert.throws(() =>
      sql(`set role ${role}; select * from ai_private.requests;`),
    );
  }
  for (const role of ['anon', 'authenticated']) {
    assert.throws(() => sql(`set role ${role}; ${reserve(5, 5)}`));
    assert.throws(() =>
      sql(
        `set role ${role}; select public.finish_ai_request('${timeout.id}','ready',1,0,0,0);`,
      ),
    );
    assert.throws(() =>
      sql(`set role ${role}; select public.ai_usage_summary();`),
    );
    assert.throws(() =>
      sql(`set role ${role}; select public.purge_ai_usage();`),
    );
  }
  assert(
    sql(`set role service_role; ${reserve(6, 6)}`).includes('"allowed": true'),
  );
  assert(
    sql('set role service_role; select public.ai_usage_summary();').includes(
      'attempts',
    ),
  );
  assert.equal(
    sql(
      "select relrowsecurity from pg_class where oid='ai_private.requests'::regclass;",
    ),
    't',
  );
  console.log('PASS: KST day boundary, retention, RLS and RPC privileges');
} finally {
  if (started) docker(['stop', name]);
}
