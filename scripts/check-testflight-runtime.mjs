import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'], quiet: true });

const execFileAsync = promisify(execFile);
const DEFAULT_STAGING_API_URL =
  'https://darija-api-staging-nwjxqrn2ra-uc.a.run.app';
const apiBaseUrl =
  process.env.TESTFLIGHT_API_BASE_URL?.trim() || DEFAULT_STAGING_API_URL;

function isTriggerDevCommand(command) {
  return (
    /\btrigger\b/.test(command) &&
    /\bdev\b/.test(command) &&
    command.includes('--config trigger.config.mjs') &&
    !command.includes(' trigger mcp')
  );
}

async function checkApiHealth() {
  const endpoint = `${apiBaseUrl.replace(/\/+$/, '')}/health`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    const payload = await response.json().catch(() => null);

    if (!response.ok || payload?.ok !== true) {
      throw new Error(`health returned ${response.status}`);
    }

    return {
      endpoint,
      models: payload.models || {},
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkTriggerWorker() {
  const { stdout } = await execFileAsync('ps', ['-axo', 'pid=,command='], {
    maxBuffer: 1024 * 1024,
  });
  const workerLines = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(isTriggerDevCommand);

  if (workerLines.length === 0) {
    throw new Error(
      'local Trigger.dev Development worker is not running. Start it with: ENABLE_TTS=true npm run trigger:dev -- --env-file .env.local --skip-update-check',
    );
  }

  return workerLines.map((line) => line.split(/\s+/, 1)[0]);
}

try {
  const [health, workerPids] = await Promise.all([
    checkApiHealth(),
    checkTriggerWorker(),
  ]);

  console.log('TestFlight runtime preflight passed.');
  console.log(`API health: ${health.endpoint}`);
  console.log(
    `Models: openai_transcription=${health.models.openai_transcription || 'n/a'} consolidation=${health.models.consolidation || 'n/a'} translation=${health.models.translation || 'n/a'}`,
  );
  console.log(`Trigger.dev worker PID(s): ${workerPids.join(', ')}`);
} catch (error) {
  console.error('TestFlight runtime preflight failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
