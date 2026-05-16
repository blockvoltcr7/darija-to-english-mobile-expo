import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';

const parsed = dotenv.parse(readFileSync('.env.local'));

const secrets = [
  ['CLERK_PUBLISHABLE_KEY', 'clerk-publishable-key'],
  ['CLERK_SECRET_KEY', 'clerk-secret-key'],
  ['SUPABASE_URL', 'supabase-url'],
  ['SUPABASE_SECRET_KEY', 'supabase-secret-key'],
  ['OPENAI_API_KEY', 'openai-api-key'],
  ['DARIJA_ASR_BASE_URL', 'darija-asr-base-url'],
  ['DARIJA_ASR_API_KEY', 'darija-asr-api-key'],
  ['TRIGGER_SECRET_KEY', 'trigger-secret-key'],
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: options.input ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'],
    input: options.input,
  });

  return {
    ok: result.status === 0,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
    status: result.status,
  };
}

for (const [envName, secretName] of secrets) {
  const value = parsed[envName];

  if (!value) {
    console.log(`${envName}: missing locally; skipped ${secretName}`);
    continue;
  }

  const describe = run('gcloud', ['secrets', 'describe', secretName]);

  if (!describe.ok) {
    const create = run('gcloud', [
      'secrets',
      'create',
      secretName,
      '--replication-policy=automatic',
    ]);

    if (!create.ok) {
      console.error(`${secretName}: create failed`);
      process.exit(create.status || 1);
    }
  }

  const version = run(
    'gcloud',
    ['secrets', 'versions', 'add', secretName, '--data-file=-'],
    { input: value },
  );

  if (!version.ok) {
    console.error(`${secretName}: version add failed`);
    process.exit(version.status || 1);
  }

  console.log(`${envName}: configured ${secretName}`);
}
