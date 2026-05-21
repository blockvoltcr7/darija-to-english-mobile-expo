import OpenAI from 'openai';
import { env } from '../env.mjs';

const OPENAI_TTS_INSTRUCTIONS = 'Speak clearly in a warm, neutral voice.';
const MAX_TTS_INPUT_CHARS = 4000;

let openaiClient;

function ttsError(status, code, message, cause) {
  const error = new Error(message);

  error.name = 'TtsProviderError';
  error.status = status;
  error.code = code;
  error.cause = cause;

  return error;
}

function requireEnglishText(englishText) {
  if (typeof englishText !== 'string') {
    throw ttsError(400, 'tts_input_missing', 'English text is required for TTS.');
  }

  const normalized = englishText.trim();

  if (!normalized) {
    throw ttsError(400, 'tts_input_empty', 'English text is empty.');
  }

  if (normalized.length > MAX_TTS_INPUT_CHARS) {
    throw ttsError(
      413,
      'tts_input_too_long',
      'English text is too long for MVP speech generation.',
    );
  }

  return normalized;
}

function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) {
    throw ttsError(500, 'openai_api_key_missing', 'OPENAI_API_KEY is not configured.');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  return openaiClient;
}

function safeProviderError(error) {
  if (error?.name === 'TtsProviderError') {
    return error;
  }

  return ttsError(
    Number.isInteger(error?.status) ? error.status : 502,
    typeof error?.code === 'string' && error.code.trim()
      ? error.code.trim().slice(0, 80)
      : 'openai_tts_failed',
    'Speech generation failed.',
    error,
  );
}

export async function generateOpenAiTtsAudio({
  englishText,
  model = env.OPENAI_TTS_MODEL,
  voice = env.OPENAI_TTS_VOICE,
  format = env.TTS_RESPONSE_FORMAT,
  language = env.TTS_LANGUAGE,
} = {}) {
  const input = requireEnglishText(englishText);
  const client = getOpenAIClient();

  try {
    const response = await client.audio.speech.create({
      model,
      voice,
      input,
      instructions: OPENAI_TTS_INSTRUCTIONS,
      response_format: format,
    });
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    if (audioBuffer.length === 0) {
      throw ttsError(502, 'openai_tts_empty_audio', 'Speech generation returned empty audio.');
    }

    return {
      audioBuffer,
      metadata: {
        provider: 'openai',
        model,
        voice,
        language,
        format,
        byteSize: audioBuffer.length,
        durationSeconds: null,
      },
    };
  } catch (error) {
    throw safeProviderError(error);
  }
}
