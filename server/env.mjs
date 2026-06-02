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

function findPublicConvexSecretEnv(rawEnv) {
  const publicEnvPrefix = ['EXPO', 'PUBLIC'].join('_');
  const publicConvexPrefix = `${publicEnvPrefix}_CONVEX_`;

  return Object.keys(rawEnv)
    .filter((name) => name.startsWith(publicConvexPrefix))
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

function validateHttpUrl(value, name, errors) {
  if (!value) {
    errors.push(`${name} is required.`);
    return;
  }

  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) {
      errors.push(`${name} must use http or https.`);
    }
  } catch {
    errors.push(`${name} must be a valid URL.`);
  }
}

function isTriggerManagedIndexProcess() {
  return process.argv.some((arg) => /managed-index/i.test(arg));
}

function withTriggerIndexerDefaults(rawEnv) {
  if (!isTriggerManagedIndexProcess()) {
    return rawEnv;
  }

  return {
    CONVEX_SERVER_SECRET: 'trigger-managed-index-placeholder',
    CONVEX_URL: 'https://trigger-managed-index.placeholder',
    ...rawEnv,
  };
}

function loadEnv(rawEnv = process.env) {
  rawEnv = withTriggerIndexerDefaults(rawEnv);
  const errors = [];
  const forbiddenPublicConvexSecretVars = findPublicConvexSecretEnv(rawEnv);
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
  const ephemeralRetentionHours = readNumber(
    rawEnv,
    'EPHEMERAL_RESULT_RETENTION_HOURS',
    24,
    errors,
    { integer: true, min: 1 },
  );
  const asrBaseUrl = readString(
    rawEnv,
    'DARIJA_ASR_BASE_URL',
    readString(rawEnv, 'DARIJA_ASR_URL'),
  )?.replace(/\/+$/, '');
  const convexUrl = readString(
    rawEnv,
    'CONVEX_URL',
    readString(rawEnv, 'EXPO_PUBLIC_CONVEX_URL'),
  );
  const convexSiteUrl = readString(
    rawEnv,
    'CONVEX_SITE_URL',
    readString(rawEnv, 'EXPO_PUBLIC_CONVEX_SITE_URL'),
  );
  const convexServerSecret = readString(rawEnv, 'CONVEX_SERVER_SECRET');
  const clerkWebhookSigningSecret = readString(
    rawEnv,
    'CLERK_WEBHOOK_SIGNING_SECRET',
  );
  const enableTts = readBoolean(rawEnv, 'ENABLE_TTS', false, errors);
  const enableResponseTts = readBoolean(
    rawEnv,
    'ENABLE_RESPONSE_TTS',
    enableTts,
    errors,
  );
  const ttsProvider = readString(rawEnv, 'TTS_PROVIDER', 'openai');
  const ttsLanguage = readString(rawEnv, 'TTS_LANGUAGE', 'en');
  const ttsResponseFormat = readString(rawEnv, 'TTS_RESPONSE_FORMAT', 'aac');
  const responseTtsProvider = readString(rawEnv, 'RESPONSE_TTS_PROVIDER', 'openai');
  const responseTtsLanguage = readString(rawEnv, 'RESPONSE_TTS_LANGUAGE', 'ar');
  const responseTtsFormat = readString(rawEnv, 'RESPONSE_TTS_FORMAT', 'mp3');
  const openaiApiKey = readString(rawEnv, 'OPENAI_API_KEY');
  const retentionCleanupSecret = readString(rawEnv, 'RETENTION_CLEANUP_SECRET');

  if (forbiddenPublicConvexSecretVars.length > 0) {
    errors.push(
      `Convex server secrets must not use EXPO_PUBLIC_* env names: ${forbiddenPublicConvexSecretVars.join(
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

  if (responseTtsProvider !== 'openai') {
    errors.push('RESPONSE_TTS_PROVIDER must be openai for the MVP.');
  }

  if (responseTtsLanguage !== 'ar') {
    errors.push('RESPONSE_TTS_LANGUAGE must be ar for the MVP.');
  }

  if (!['aac', 'mp3'].includes(ttsResponseFormat)) {
    errors.push('TTS_RESPONSE_FORMAT must be aac or mp3.');
  }

  if (!['aac', 'mp3'].includes(responseTtsFormat)) {
    errors.push('RESPONSE_TTS_FORMAT must be aac or mp3.');
  }

  if (enableTts && !openaiApiKey) {
    errors.push('OPENAI_API_KEY is required when ENABLE_TTS is true.');
  }

  if (enableResponseTts && !openaiApiKey) {
    errors.push('OPENAI_API_KEY is required when ENABLE_RESPONSE_TTS is true.');
  }

  validateHttpUrl(convexUrl, 'CONVEX_URL or EXPO_PUBLIC_CONVEX_URL', errors);

  if (!convexServerSecret) {
    errors.push('CONVEX_SERVER_SECRET is required for server-owned Convex writes.');
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
    EPHEMERAL_RESULT_RETENTION_HOURS: ephemeralRetentionHours,
    TERMS_VERSION: readString(rawEnv, 'TERMS_VERSION', '2026-06-02'),
    PRIVACY_POLICY_VERSION: readString(
      rawEnv,
      'PRIVACY_POLICY_VERSION',
      '2026-06-02',
    ),
    AI_PROCESSING_CONSENT_VERSION: readString(
      rawEnv,
      'AI_PROCESSING_CONSENT_VERSION',
      '2026-06-02',
    ),
    PROVIDERS_DISCLOSURE_VERSION: readString(
      rawEnv,
      'PROVIDERS_DISCLOSURE_VERSION',
      '2026-06-02',
    ),
    RETENTION_POLICY_VERSION: readString(
      rawEnv,
      'RETENTION_POLICY_VERSION',
      '2026-06-02',
    ),
    RETENTION_CLEANUP_CONFIGURED: Boolean(retentionCleanupSecret),
    RETENTION_CLEANUP_SECRET: retentionCleanupSecret,
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
    OPENAI_TTS_VOICE: readString(rawEnv, 'OPENAI_TTS_VOICE', 'cedar'),
    ENABLE_RESPONSE_TTS: enableResponseTts,
    RESPONSE_TTS_PROVIDER: responseTtsProvider,
    RESPONSE_TTS_LANGUAGE: responseTtsLanguage,
    RESPONSE_TTS_FORMAT: responseTtsFormat,
    OPENAI_RESPONSE_TTS_MODEL: readString(
      rawEnv,
      'OPENAI_RESPONSE_TTS_MODEL',
      readString(rawEnv, 'OPENAI_TTS_MODEL', 'gpt-4o-mini-tts'),
    ),
    OPENAI_RESPONSE_TTS_VOICE: readString(
      rawEnv,
      'OPENAI_RESPONSE_TTS_VOICE',
      readString(rawEnv, 'OPENAI_TTS_VOICE', 'cedar'),
    ),
    CONVEX_DEPLOYMENT: readString(rawEnv, 'CONVEX_DEPLOYMENT'),
    CONVEX_URL: convexUrl,
    CONVEX_SITE_URL: convexSiteUrl,
    CONVEX_SERVER_SECRET: convexServerSecret,
    CONVEX_CONFIGURED: Boolean(convexUrl && convexServerSecret),
    CLERK_JWT_ISSUER_DOMAIN: readString(rawEnv, 'CLERK_JWT_ISSUER_DOMAIN'),
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
