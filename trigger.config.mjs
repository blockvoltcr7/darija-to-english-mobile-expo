import { defineConfig } from '@trigger.dev/sdk';
import { syncEnvVars } from '@trigger.dev/build/extensions/core';
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'dotenv';

const TRIGGER_SYNC_ENV_NAMES = [
  'AUDIO_RETENTION_DAYS',
  'AUDIO_UPLOAD_MAX_BYTES',
  'CONVEX_DEPLOYMENT',
  'CONVEX_SERVER_SECRET',
  'CONVEX_SITE_URL',
  'CONVEX_URL',
  'DARIJA_ASR_API_KEY',
  'DARIJA_ASR_BASE_URL',
  'DARIJA_ASR_TIMEOUT_MS',
  'DARIJA_ASR_URL',
  'ENABLE_RESPONSE_TTS',
  'ENABLE_TTS',
  'EXPO_PUBLIC_CONVEX_SITE_URL',
  'EXPO_PUBLIC_CONVEX_URL',
  'OPENAI_API_KEY',
  'OPENAI_CONSOLIDATION_MODEL',
  'OPENAI_RESPONSE_TTS_MODEL',
  'OPENAI_RESPONSE_TTS_VOICE',
  'OPENAI_TRANSLATION_MODEL',
  'OPENAI_TRANSCRIPTION_MODEL',
  'OPENAI_TTS_MODEL',
  'OPENAI_TTS_VOICE',
  'RESPONSE_TTS_FORMAT',
  'RESPONSE_TTS_LANGUAGE',
  'RESPONSE_TTS_PROVIDER',
  'TRIGGER_ENVIRONMENT',
  'TTS_LANGUAGE',
  'TTS_PROVIDER',
  'TTS_RESPONSE_FORMAT',
];

function readLocalEnvFile(path) {
  return existsSync(path) ? parse(readFileSync(path, 'utf8')) : {};
}

function triggerTaskEnv() {
  const localEnv = {
    ...readLocalEnvFile('.env'),
    ...readLocalEnvFile('.env.local'),
    ...process.env,
  };
  const syncedEnv = {};

  for (const name of TRIGGER_SYNC_ENV_NAMES) {
    const value = localEnv[name]?.trim();

    if (value) {
      syncedEnv[name] = value;
    }
  }

  if (!syncedEnv.CONVEX_URL && syncedEnv.EXPO_PUBLIC_CONVEX_URL) {
    syncedEnv.CONVEX_URL = syncedEnv.EXPO_PUBLIC_CONVEX_URL;
  }

  if (!syncedEnv.CONVEX_SITE_URL && syncedEnv.EXPO_PUBLIC_CONVEX_SITE_URL) {
    syncedEnv.CONVEX_SITE_URL = syncedEnv.EXPO_PUBLIC_CONVEX_SITE_URL;
  }

  return syncedEnv;
}

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF || 'proj_tehveeweadzwantwpvpr',
  dirs: ['./trigger'],
  build: {
    extensions: [syncEnvVars(async () => triggerTaskEnv())],
  },
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
      factor: 2,
      randomize: true,
    },
  },
  maxDuration: 900,
});
