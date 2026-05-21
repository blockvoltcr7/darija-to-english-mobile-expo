import dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

class ServerEnvError extends Error {
  constructor(messages) {
    super(
      [
        'Server environment configuration error.',
        ...messages.map((message) => `- ${message}`),
      ].join('\n'),
    );
    this.name = 'ServerEnvError';
  }
}

function readString(rawEnv, name, defaultValue = undefined) {
  const value = rawEnv[name]?.trim();
  return value || defaultValue;
}

function readBoolean(rawEnv, name, defaultValue = false, errors) {
  const rawValue = readString(rawEnv, name);

  if (rawValue === undefined) {
    return defaultValue;
  }

  const normalized = rawValue.toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  errors.push(`${name} must be a boolean value.`);
  return defaultValue;
}

function readNumber(rawEnv, name, defaultValue, errors, options = {}) {
  const rawValue = readString(rawEnv, name);
  const value = rawValue === undefined ? defaultValue : Number(rawValue);

  if (!Number.isFinite(value)) {
    errors.push(`${name} must be a number.`);
    return defaultValue;
  }

  if (options.integer && !Number.isInteger(value)) {
    errors.push(`${name} must be an integer.`);
  }

  if (options.min !== undefined && value < options.min) {
    errors.push(`${name} must be greater than or equal to ${options.min}.`);
  }

  if (options.max !== undefined && value > options.max) {
    errors.push(`${name} must be less than or equal to ${options.max}.`);
  }

  return value;
}

function findPublicSupabaseSecretEnv(rawEnv) {
  const publicEnvPrefix = ['EXPO', 'PUBLIC'].join('_');
  const publicSupabasePrefix = `${publicEnvPrefix}_SUPABASE_`;

  return Object.keys(rawEnv)
    .filter((name) => name.startsWith(publicSupabasePrefix))
    .filter((name) => /(?:SECRET|SERVICE_ROLE|SERVICE|JWT|PASSWORD|PRIVATE)/.test(name))
    .sort();
}

function findPublicTriggerSecretEnv(rawEnv) {
  const publicEnvPrefix = ['EXPO', 'PUBLIC'].join('_');
  const publicTriggerPrefix = `${publicEnvPrefix}_TRIGGER_`;

  return Object.keys(rawEnv)
    .filter((name) => name.startsWith(publicTriggerPrefix))
    .filter((name) => /(?:SECRET|TOKEN|API[_-]?KEY|PRIVATE)/.test(name))
    .sort();
}

function findPublicProviderSecretEnv(rawEnv) {
  const publicEnvPrefix = ['EXPO', 'PUBLIC'].join('_');
  const publicProviderPrefixes = [
    `${publicEnvPrefix}_OPENAI_`,
    `${publicEnvPrefix}_TTS_`,
  ];

  return Object.keys(rawEnv)
    .filter((name) => publicProviderPrefixes.some((prefix) => name.startsWith(prefix)))
    .filter((name) => /(?:SECRET|TOKEN|API[_-]?KEY|PRIVATE|CREDENTIAL)/.test(name))
    .sort();
}

function buildTranscribeUrl(asrBaseUrl) {
  if (!asrBaseUrl) {
    return undefined;
  }

  return asrBaseUrl.endsWith('/transcribe')
    ? asrBaseUrl
    : `${asrBaseUrl}/transcribe`;
}

function validateSupabaseUrl(value, errors) {
  if (!value) {
    errors.push('SUPABASE_URL is required.');
    return;
  }

  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) {
      errors.push('SUPABASE_URL must use http or https.');
    }
  } catch {
    errors.push('SUPABASE_URL must be a valid URL.');
  }
}

function loadEnv(rawEnv = process.env) {
  const errors = [];
  const forbiddenPublicSecretVars = findPublicSupabaseSecretEnv(rawEnv);
  const forbiddenPublicTriggerSecretVars = findPublicTriggerSecretEnv(rawEnv);
  const forbiddenPublicProviderSecretVars = findPublicProviderSecretEnv(rawEnv);
  const port = readNumber(rawEnv, 'PORT', 8787, errors, {
    integer: true,
    min: 0,
    max: 65535,
  });
  const darijaAsrTimeoutMs = readNumber(
    rawEnv,
    'DARIJA_ASR_TIMEOUT_MS',
    900000,
    errors,
    { integer: true, min: 1 },
  );
  const audioUploadMaxBytes = readNumber(
    rawEnv,
    'AUDIO_UPLOAD_MAX_BYTES',
    50000000,
    errors,
    { integer: true, min: 1 },
  );
  const audioRetentionDays = readNumber(
    rawEnv,
    'AUDIO_RETENTION_DAYS',
    30,
    errors,
    { integer: true, min: 1 },
  );
  const asrBaseUrl = readString(
    rawEnv,
    'DARIJA_ASR_BASE_URL',
    readString(rawEnv, 'DARIJA_ASR_URL'),
  )?.replace(/\/+$/, '');
  const supabaseUrl = readString(rawEnv, 'SUPABASE_URL');
  const supabaseSecretKey = readString(rawEnv, 'SUPABASE_SECRET_KEY');
  const supabaseServiceRoleKey = readString(rawEnv, 'SUPABASE_SERVICE_ROLE_KEY');
  const clerkWebhookSigningSecret = readString(
    rawEnv,
    'CLERK_WEBHOOK_SIGNING_SECRET',
  );
  const enableTts = readBoolean(rawEnv, 'ENABLE_TTS', false, errors);
  const ttsProvider = readString(rawEnv, 'TTS_PROVIDER', 'openai');
  const ttsLanguage = readString(rawEnv, 'TTS_LANGUAGE', 'en');
  const ttsResponseFormat = readString(rawEnv, 'TTS_RESPONSE_FORMAT', 'aac');
  const openaiApiKey = readString(rawEnv, 'OPENAI_API_KEY');

  if (forbiddenPublicSecretVars.length > 0) {
    errors.push(
      `Supabase server secrets must not use EXPO_PUBLIC_* env names: ${forbiddenPublicSecretVars.join(
        ', ',
      )}.`,
    );
  }

  if (forbiddenPublicTriggerSecretVars.length > 0) {
    errors.push(
      `Trigger.dev server secrets must not use EXPO_PUBLIC_* env names: ${forbiddenPublicTriggerSecretVars.join(
        ', ',
      )}.`,
    );
  }

  if (forbiddenPublicProviderSecretVars.length > 0) {
    errors.push(
      `Provider server secrets must not use EXPO_PUBLIC_* env names: ${forbiddenPublicProviderSecretVars.join(
        ', ',
      )}.`,
    );
  }

  if (ttsProvider !== 'openai') {
    errors.push('TTS_PROVIDER must be openai for the MVP.');
  }

  if (ttsLanguage !== 'en') {
    errors.push('TTS_LANGUAGE must be en for English playback.');
  }

  if (!['aac', 'mp3'].includes(ttsResponseFormat)) {
    errors.push('TTS_RESPONSE_FORMAT must be aac or mp3.');
  }

  if (enableTts && !openaiApiKey) {
    errors.push('OPENAI_API_KEY is required when ENABLE_TTS is true.');
  }

  validateSupabaseUrl(supabaseUrl, errors);

  if (!supabaseSecretKey && !supabaseServiceRoleKey) {
    errors.push(
      'SUPABASE_SECRET_KEY is required. SUPABASE_SERVICE_ROLE_KEY is accepted only as a legacy fallback.',
    );
  }

  if (errors.length > 0) {
    throw new ServerEnvError(errors);
  }

  return Object.freeze({
    PORT: port,
    HOST: readString(rawEnv, 'HOST', '0.0.0.0'),
    MAX_JSON_BODY_SIZE: readString(rawEnv, 'MAX_JSON_BODY_SIZE', '70mb'),
    CLERK_PUBLISHABLE_KEY: readString(rawEnv, 'CLERK_PUBLISHABLE_KEY'),
    CLERK_SECRET_KEY: readString(rawEnv, 'CLERK_SECRET_KEY'),
    CLERK_WEBHOOK_SIGNING_SECRET: clerkWebhookSigningSecret,
    CLERK_WEBHOOK_CONFIGURED: Boolean(clerkWebhookSigningSecret),
    CLERK_CONFIGURED: Boolean(
      readString(rawEnv, 'CLERK_PUBLISHABLE_KEY') &&
        readString(rawEnv, 'CLERK_SECRET_KEY'),
    ),
    DARIJA_ASR_BASE_URL: asrBaseUrl,
    DARIJA_ASR_TRANSCRIBE_URL: buildTranscribeUrl(asrBaseUrl),
    DARIJA_ASR_API_KEY: readString(rawEnv, 'DARIJA_ASR_API_KEY'),
    DARIJA_ASR_TIMEOUT_MS: darijaAsrTimeoutMs,
    AUDIO_UPLOAD_MAX_BYTES: audioUploadMaxBytes,
    AUDIO_RETENTION_DAYS: audioRetentionDays,
    OPENAI_API_KEY: openaiApiKey,
    OPENAI_TRANSCRIPTION_MODEL: readString(
      rawEnv,
      'OPENAI_TRANSCRIPTION_MODEL',
      'gpt-4o-mini-transcribe',
    ),
    OPENAI_CONSOLIDATION_MODEL: readString(
      rawEnv,
      'OPENAI_CONSOLIDATION_MODEL',
      readString(rawEnv, 'CONSOLIDATION_MODEL', 'gpt-5.5'),
    ),
    OPENAI_TRANSLATION_MODEL: readString(
      rawEnv,
      'OPENAI_TRANSLATION_MODEL',
      readString(rawEnv, 'TRANSLATION_MODEL', 'gpt-5.5'),
    ),
    ENABLE_TTS: enableTts,
    TTS_PROVIDER: ttsProvider,
    TTS_LANGUAGE: ttsLanguage,
    TTS_RESPONSE_FORMAT: ttsResponseFormat,
    OPENAI_TTS_MODEL: readString(
      rawEnv,
      'OPENAI_TTS_MODEL',
      'gpt-4o-mini-tts',
    ),
    OPENAI_TTS_VOICE: readString(rawEnv, 'OPENAI_TTS_VOICE', 'marin'),
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SECRET_KEY: supabaseSecretKey || supabaseServiceRoleKey,
    SUPABASE_AUDIO_ORIGINALS_BUCKET: readString(
      rawEnv,
      'SUPABASE_AUDIO_ORIGINALS_BUCKET',
      'audio-originals',
    ),
    SUPABASE_TRANSLATION_ARTIFACTS_BUCKET: readString(
      rawEnv,
      'SUPABASE_TRANSLATION_ARTIFACTS_BUCKET',
      'translation-artifacts',
    ),
    SUPABASE_SECRET_KEY_SOURCE: supabaseSecretKey
      ? 'SUPABASE_SECRET_KEY'
      : 'SUPABASE_SERVICE_ROLE_KEY',
    SUPABASE_CONFIGURED: Boolean(
      supabaseUrl && (supabaseSecretKey || supabaseServiceRoleKey),
    ),
    TRIGGER_PROJECT_REF: readString(
      rawEnv,
      'TRIGGER_PROJECT_REF',
      'proj_tehveeweadzwantwpvpr',
    ),
    TRIGGER_SECRET_KEY: readString(rawEnv, 'TRIGGER_SECRET_KEY'),
    TRIGGER_ENVIRONMENT: readString(rawEnv, 'TRIGGER_ENVIRONMENT', 'dev'),
    TRIGGER_CONFIGURED: Boolean(readString(rawEnv, 'TRIGGER_SECRET_KEY')),
  });
}

export const env = loadEnv();
export { ServerEnvError, loadEnv };
