import { URL } from 'node:url';
import process from 'node:process';
import console from 'node:console';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';

// Only a disposable Docker database is used. Never reads application credentials.
const name = `ziwei-result-test-${process.pid}`;
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
  for (const migration of [
    '20260913010000_saved_results.sql',
    '20260913011000_remove_manual_result_deletion.sql',
    '20260913015000_result_deduplication.sql',
  ])
    sql(
      readFileSync(
        new URL(`../supabase/migrations/${migration}`, import.meta.url),
        'utf8',
      ),
    );
  const query = (actor, fingerprint) =>
    `select public.save_or_reuse_result('${hash(actor)}','${hash(fingerprint)}','{"version":1}');`;
  const results = await Promise.all(
    Array.from({ length: 8 }, () => concurrent(query(1, 1))),
  );
  assert.equal(new Set(results.map((r) => r.id)).size, 1);
  assert.equal(results.filter((r) => r.created).length, 1);
  assert.equal(sql('select count(*) from public.saved_results;'), '1');
  const first = results[0].id;
  const expiry = sql(
    `select expires_at from public.saved_results where id='${first}';`,
  );
  assert.equal(JSON.parse(sql(query(1, 1))).created, false);
  assert.equal(
    sql(`select expires_at from public.saved_results where id='${first}';`),
    expiry,
  );
  assert.notEqual(JSON.parse(sql(query(2, 1))).id, first);
  assert.notEqual(JSON.parse(sql(query(1, 2))).id, first);
  sql(
    `update public.saved_results set created_at=now()-interval '31 days', expires_at=now()-interval '1 second' where id='${first}';`,
  );
  const renewed = JSON.parse(sql(query(1, 1)));
  assert(renewed.created);
  assert.notEqual(renewed.id, first);
  assert.equal(
    sql(
      `select expires_at < now() and fingerprint is null from public.saved_results where id='${first}';`,
    ),
    't',
  );
  for (const role of ['anon', 'authenticated']) {
    assert.throws(() => sql(`set role ${role}; ${query(1, 1)}`));
    assert.throws(() =>
      sql(`set role ${role}; select * from public.saved_results;`),
    );
  }
  assert(sql(`set role service_role; ${query(1, 1)}`).includes(renewed.id));
  assert.throws(() =>
    sql("select public.save_or_reuse_result(null,null,'{}');"),
  );
  assert.throws(() =>
    sql(
      `set role service_role; insert into public.saved_results(id,owner_hash,fingerprint,payload) values(gen_random_uuid(),'${hash(1)}','${hash(1)}','{"version":1}');`,
    ),
  );
  console.log(
    'PASS: concurrent deduplication, owner isolation, identity changes, retention, expiry and RPC privileges',
  );
} finally {
  if (started) docker(['stop', name]);
}
