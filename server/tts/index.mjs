import { createHash } from 'node:crypto';
import { env } from '../env.mjs';
import { generateOpenAiTtsAudio } from './openai-tts.mjs';

export const TTS_OUTPUT_FORMATS = Object.freeze({
  aac: Object.freeze({ format: 'aac', mimeType: 'audio/aac', extension: 'aac' }),
  mp3: Object.freeze({ format: 'mp3', mimeType: 'audio/mpeg', extension: 'mp3' }),
});

function ttsRouterError(status, code, message) {
  const error = new Error(message);

  error.name = 'TtsRouterError';
  error.status = status;
  error.code = code;

  return error;
}

function normalizeRequiredString(value, fieldName) {
  if (typeof value !== 'string') {
    throw ttsRouterError(400, `${fieldName}_missing`, `${fieldName} is required.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw ttsRouterError(400, `${fieldName}_empty`, `${fieldName} is empty.`);
  }

  return normalized;
}

export function sanitizeEnglishTextForTts(englishText) {
  return normalizeRequiredString(englishText, 'englishText')
    .replace(/\s*\[(?:unclear|inaudible|unintelligible)\]\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

function stableSerialize(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
    .join(',')}}`;
}

export function resolveTtsOutputFormat(format = env.TTS_RESPONSE_FORMAT) {
  const normalized = normalizeRequiredString(format, 'format').toLowerCase();
  const metadata = TTS_OUTPUT_FORMATS[normalized];

  if (!metadata) {
    throw ttsRouterError(400, 'unsupported_tts_format', 'Unsupported TTS response format.');
  }

  return metadata;
}

export function resolveTtsConfig(overrides = {}) {
  const provider = normalizeRequiredString(
    overrides.provider || env.TTS_PROVIDER,
    'provider',
  ).toLowerCase();
  const language = normalizeRequiredString(
    overrides.language || env.TTS_LANGUAGE,
    'language',
  ).toLowerCase();
  const format = resolveTtsOutputFormat(overrides.format || env.TTS_RESPONSE_FORMAT);

  if (provider !== 'openai') {
    throw ttsRouterError(400, 'unsupported_tts_provider', 'Unsupported TTS provider.');
  }

  if (!['en', 'ar'].includes(language)) {
    throw ttsRouterError(400, 'unsupported_tts_language', 'Unsupported TTS language.');
  }

  return {
    enabled: Boolean(overrides.enabled ?? env.ENABLE_TTS),
    provider,
    model: normalizeRequiredString(overrides.model || env.OPENAI_TTS_MODEL, 'model'),
    voice: normalizeRequiredString(overrides.voice || env.OPENAI_TTS_VOICE, 'voice'),
    language,
    format: format.format,
    mimeType: format.mimeType,
    extension: format.extension,
  };
}

export function createTtsInputHash({
  text,
  englishText,
  provider,
  model,
  voice,
  format,
  language,
  kind,
}) {
  const hashInput = {
    text: normalizeRequiredString(text ?? englishText, 'text'),
    provider: normalizeRequiredString(provider, 'provider'),
    model: normalizeRequiredString(model, 'model'),
    voice: normalizeRequiredString(voice, 'voice'),
    format: normalizeRequiredString(format, 'format'),
    language: normalizeRequiredString(language || env.TTS_LANGUAGE, 'language'),
    kind: kind ? normalizeRequiredString(kind, 'kind') : undefined,
  };

  return createHash('sha256').update(stableSerialize(hashInput)).digest('hex');
}

export async function generateTtsAudio({ englishText, configOverrides } = {}) {
  const text = configOverrides?.text ?? englishText;
  const config = resolveTtsConfig(configOverrides);

  if (!config.enabled) {
    return {
      skipped: true,
      reason: 'tts_disabled',
      config,
    };
  }

  if (config.provider !== 'openai') {
    throw ttsRouterError(400, 'unsupported_tts_provider', 'Unsupported TTS provider.');
  }

  const result = await generateOpenAiTtsAudio({
    text,
    model: config.model,
    voice: config.voice,
    format: config.format,
    language: config.language,
  });

  return {
    skipped: false,
    config,
    audioBuffer: result.audioBuffer,
    metadata: {
      ...result.metadata,
      mimeType: config.mimeType,
      extension: config.extension,
    },
  };
}
