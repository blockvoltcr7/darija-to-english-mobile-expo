import OpenAI, { toFile } from 'openai';
import { env } from './env.mjs';
import { downloadStoredObject } from './storage.mjs';
import {
  claimTranslationJobForProcessing,
  markTranslationJobFailed,
  markTranslationJobSucceeded,
  PROVIDER_OPERATIONS,
  PROVIDER_RUN_STATUS,
  PROVIDERS,
  recordProviderRun,
  TRANSLATION_JOB_STATUS,
  writeTranslationResult,
} from './translations.mjs';

const {
  DARIJA_ASR_BASE_URL: ASR_BASE_URL,
  DARIJA_ASR_TRANSCRIBE_URL: ASR_TRANSCRIBE_URL,
  DARIJA_ASR_API_KEY: ASR_API_KEY,
  DARIJA_ASR_TIMEOUT_MS: ASR_TIMEOUT_MS,
  OPENAI_API_KEY,
  OPENAI_CONSOLIDATION_MODEL: CONSOLIDATION_MODEL,
  OPENAI_TRANSLATION_MODEL: TRANSLATION_MODEL,
  OPENAI_TRANSCRIPTION_MODEL,
} = env;

let openaiClient;

function noop() {}

function httpError(status, message, cause) {
  const error = new Error(message);
  error.status = status;
  error.cause = cause;
  return error;
}

function safeErrorMessage(error) {
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim().slice(0, 500);
  }

  return 'Translation processing failed.';
}

function safeErrorCode(error, fallback = 'provider_error') {
  if (typeof error?.code === 'string' && error.code.trim()) {
    return error.code.trim().slice(0, 80);
  }

  if (Number.isInteger(error?.status)) {
    return `http_${error.status}`;
  }

  if (typeof error?.name === 'string' && error.name.trim()) {
    return error.name.trim().slice(0, 80);
  }

  return fallback;
}

function base64Payload(audioBase64) {
  return audioBase64.includes(',') ? audioBase64.split(',', 2)[1] : audioBase64;
}

function decodeAudioBase64(audioBase64) {
  return Buffer.from(base64Payload(audioBase64), 'base64');
}

function getOpenAIClient() {
  if (!OPENAI_API_KEY) {
    throw httpError(500, 'OPENAI_API_KEY is not configured.');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  return openaiClient;
}

function requireAsrConfig() {
  if (!ASR_BASE_URL) {
    throw httpError(500, 'DARIJA_ASR_BASE_URL is not configured.');
  }

  if (!ASR_API_KEY) {
    throw httpError(500, 'DARIJA_ASR_API_KEY is not configured.');
  }
}

async function recordProviderOperation({
  traceId,
  jobId,
  clerkUserId,
  provider,
  operation,
  model,
  inputMetadata,
  outputMetadata,
  execute,
  logTrace = noop,
}) {
  const startedAt = new Date();
  const startedMs = Date.now();
  let result;

  try {
    result = await execute();
  } catch (error) {
    const completedAt = new Date();

    try {
      await recordProviderRun({
        jobId,
        clerkUserId,
        provider,
        operation,
        model,
        status: PROVIDER_RUN_STATUS.FAILED,
        latencyMs: Date.now() - startedMs,
        inputMetadata,
        errorCode: safeErrorCode(error),
        errorMessage: safeErrorMessage(error),
        startedAt,
        completedAt,
      });
    } catch (recordError) {
      logTrace(traceId, 'Provider failure recording failed', {
        operation,
        provider,
        errorName: recordError?.name,
        errorCode: recordError?.supabase?.code,
      });
    }

    throw error;
  }

  await recordProviderRun({
    jobId,
    clerkUserId,
    provider,
    operation,
    model,
    status: PROVIDER_RUN_STATUS.SUCCEEDED,
    latencyMs: Date.now() - startedMs,
    inputMetadata,
    outputMetadata:
      typeof outputMetadata === 'function' ? outputMetadata(result) : outputMetadata,
    startedAt,
    completedAt: new Date(),
  });

  return result;
}

async function transcribeAudio({ filename, audioBase64 }, traceId, logTrace = noop) {
  requireAsrConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ASR_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    logTrace(traceId, 'ASR request start', {
      filename,
      base64Chars: audioBase64.length,
      endpoint: ASR_TRANSCRIBE_URL,
    });

    const response = await fetch(ASR_TRANSCRIBE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ASR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        audio_base64: audioBase64,
      }),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let payload;

    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = null;
    }

    if (!response.ok) {
      logTrace(traceId, 'ASR request failed', {
        status: response.status,
        durationMs: Date.now() - startedAt,
        body: responseText.slice(0, 500),
      });
      throw httpError(
        response.status,
        payload?.detail || payload?.error || responseText || 'ASR request failed.',
      );
    }

    if (!payload?.text) {
      throw httpError(502, 'ASR response did not include transcript text.');
    }

    logTrace(traceId, 'ASR request complete', {
      status: response.status,
      durationMs: Date.now() - startedAt,
      transcriptChars: payload.text.length,
      audioBytes: payload.audio_bytes,
    });

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw httpError(504, 'ASR request timed out.', error);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function transcribeAudioWithOpenAI(
  { filename, audioBase64 },
  traceId,
  logTrace = noop,
) {
  const client = getOpenAIClient();
  const audioBytes = decodeAudioBase64(audioBase64);
  const startedAt = Date.now();

  logTrace(traceId, 'OpenAI transcription start', {
    filename,
    bytes: audioBytes.length,
    model: OPENAI_TRANSCRIPTION_MODEL,
  });

  const response = await client.audio.transcriptions.create({
    file: await toFile(audioBytes, filename),
    model: OPENAI_TRANSCRIPTION_MODEL,
    language: 'ar',
    prompt:
      'This audio is Moroccan Darija, sometimes mixed with Arabic and French. Preserve names, places, numbers, legal terms, and colloquial phrasing as accurately as possible.',
    response_format: 'json',
  });

  const text = response.text?.trim();

  if (!text) {
    throw httpError(502, 'OpenAI transcription response did not include text.');
  }

  logTrace(traceId, 'OpenAI transcription complete', {
    durationMs: Date.now() - startedAt,
    transcriptChars: text.length,
  });

  return {
    text,
    model: OPENAI_TRANSCRIPTION_MODEL,
    filename,
    audio_bytes: audioBytes.length,
    duration_seconds: Number(((Date.now() - startedAt) / 1000).toFixed(3)),
  };
}

async function consolidateArabicTranscript(
  { openaiTranscript, darijaTranscript },
  traceId,
  logTrace = noop,
) {
  const client = getOpenAIClient();
  const startedAt = Date.now();

  logTrace(traceId, 'OpenAI consolidation start', {
    openaiTranscriptChars: openaiTranscript.length,
    darijaTranscriptChars: darijaTranscript.length,
    model: CONSOLIDATION_MODEL,
  });

  const response = await client.responses.create({
    model: CONSOLIDATION_MODEL,
    input: [
      {
        role: 'system',
        content: [
          'You are a Moroccan Darija ASR consolidation specialist.',
          '',
          'Goal:',
          'Produce one final consolidated Arabic/Darija transcript by reconciling multiple ASR hypotheses.',
          '',
          'Core principle:',
          'The inputs are noisy ASR hypotheses, not guaranteed facts. Preserve only what is supported by the inputs. Do not invent missing words, names, document titles, places, numbers, dates, or legal terms.',
          '',
          'Rules:',
          '1) Preserve the speaker\'s meaning exactly.',
          '2) Prefer wording that is more coherent in Moroccan Darija context when hypotheses conflict.',
          '3) Keep Moroccan Darija as spoken; do not convert it into formal MSA unless the speech clearly uses formal wording.',
          '4) Keep French code-switched words naturally, for example: Donc en bref, bien sûr.',
          '5) Correct obvious ASR noise, repetitions, and filler artifacts only when confidence is high.',
          '6) Preserve legal and administrative terms carefully, especially: القايد/القائد، القيادة، وزارة الداخلية، ذوي الحقوق، المرفقات، كروكيات، الاستغلال.',
          '7) Do not create or preserve a supposed name/title from a noisy span unless it is clearly supported by the hypotheses.',
          '8) If a span is unclear in both hypotheses, use [غير واضح] rather than guessing.',
          '9) If one hypothesis is clearly better for a span, rely on it. If both are noisy, choose the safest conservative wording.',
          '10) Preserve ownership and roles accurately. Do not change the father\'s lands into their lands unless the input clearly says that.',
          '11) Output only the final consolidated transcript text.',
          '12) No explanations, no labels, no bullets, and no quotes.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: [
          'Consolidate these two Arabic transcription hypotheses into one final Arabic/Darija transcript.',
          'Important:',
          '- Do not invent content.',
          '- Do not force unclear sounds into names or document titles.',
          '- Use [غير واضح] for unclear spans.',
          '- Prefer the hypothesis that better fits Moroccan Darija and the legal/administrative context.',
          '',
          'Hypothesis A (OpenAI):',
          openaiTranscript,
          '',
          'Hypothesis B (Darija custom model):',
          darijaTranscript,
        ].join('\n'),
      },
    ],
  });

  const consolidatedTranscript = response.output_text?.trim() || openaiTranscript;

  if (!consolidatedTranscript) {
    throw httpError(502, 'OpenAI consolidation response did not include text.');
  }

  logTrace(traceId, 'OpenAI consolidation complete', {
    durationMs: Date.now() - startedAt,
    transcriptChars: consolidatedTranscript.length,
    fallbackToOpenaiText: !response.output_text?.trim(),
  });

  return consolidatedTranscript;
}

async function translateConsolidatedTranscript(
  consolidatedTranscript,
  traceId,
  logTrace = noop,
) {
  const client = getOpenAIClient();
  const startedAt = Date.now();

  logTrace(traceId, 'OpenAI translation start', {
    transcriptChars: consolidatedTranscript.length,
    model: TRANSLATION_MODEL,
  });

  const response = await client.responses.create({
    model: TRANSLATION_MODEL,
    input: [
      {
        role: 'system',
        content: [
          'You are a Moroccan Darija to English translator specializing in administrative and legal context.',
          'Translate the consolidated Moroccan Darija transcript into clear English.',
          'Rules:',
          '1) Preserve the meaning exactly.',
          '2) Do not add information not present in the transcript.',
          '3) Do not invent names, document titles, dates, numbers, places, or legal details.',
          '4) Translate unclear spans marked [غير واضح] as [unclear].',
          '5) Keep culturally specific terms when needed and briefly clarify them in English, for example:',
          '   - douar = village/community',
          '   - caid = local administrative official',
          '   - caidat/قيادة = local administrative authority',
          '   - ذوي الحقوق = rights-holders/recognized beneficiaries',
          '6) Preserve who owns what and who is submitting the request.',
          '7) Output only the English translation.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: [
          'Translate this consolidated Moroccan Darija transcript into English:',
          consolidatedTranscript,
        ].join('\n'),
      },
    ],
  });

  const translation = response.output_text?.trim();

  if (!translation) {
    throw httpError(502, 'OpenAI translation response did not include text.');
  }

  logTrace(traceId, 'OpenAI translation complete', {
    durationMs: Date.now() - startedAt,
    translationChars: translation.length,
  });

  return translation;
}

export async function runTranslationProviderPipeline({
  traceId,
  jobId,
  clerkUserId,
  filename,
  audioBase64,
  audioBytes,
  audioStorageMetadata = {},
  logTrace = noop,
}) {
  const providerPayload = { filename, audioBase64 };
  const baseInputMetadata = {
    filename,
    audioBytes,
    ...audioStorageMetadata,
  };

  logTrace(traceId, 'STT parallel start', {
    jobId,
    requirement: 'openai_and_darija_required_before_consolidation',
  });

  const [darijaAsrOutcome, openaiAsrOutcome] = await Promise.allSettled([
    recordProviderOperation({
      traceId,
      jobId,
      clerkUserId,
      provider: PROVIDERS.MODAL,
      operation: PROVIDER_OPERATIONS.MODAL_DARIJA_ASR,
      model: 'modal-darija-asr',
      inputMetadata: baseInputMetadata,
      outputMetadata: (result) => ({
        transcriptChars: result.text?.length || 0,
        audioBytes: result.audio_bytes,
        durationSeconds: result.duration_seconds,
        model: result.model,
        baseModel: result.base_model,
      }),
      execute: () => transcribeAudio(providerPayload, traceId, logTrace),
      logTrace,
    }),
    recordProviderOperation({
      traceId,
      jobId,
      clerkUserId,
      provider: PROVIDERS.OPENAI,
      operation: PROVIDER_OPERATIONS.OPENAI_TRANSCRIPTION,
      model: OPENAI_TRANSCRIPTION_MODEL,
      inputMetadata: {
        ...baseInputMetadata,
        language: 'ar',
      },
      outputMetadata: (result) => ({
        transcriptChars: result.text?.length || 0,
        audioBytes: result.audio_bytes,
        durationSeconds: result.duration_seconds,
        model: result.model,
      }),
      execute: () => transcribeAudioWithOpenAI(providerPayload, traceId, logTrace),
      logTrace,
    }),
  ]);

  if (darijaAsrOutcome.status === 'rejected') {
    throw darijaAsrOutcome.reason;
  }

  if (openaiAsrOutcome.status === 'rejected') {
    throw openaiAsrOutcome.reason;
  }

  const darijaAsr = darijaAsrOutcome.value;
  const openaiAsr = openaiAsrOutcome.value;

  if (!darijaAsr.text?.trim()) {
    throw httpError(502, 'Darija transcription returned empty text.');
  }

  if (!openaiAsr.text?.trim()) {
    throw httpError(502, 'OpenAI transcription returned empty text.');
  }

  const consolidatedArabicText = await recordProviderOperation({
    traceId,
    jobId,
    clerkUserId,
    provider: PROVIDERS.OPENAI,
    operation: PROVIDER_OPERATIONS.OPENAI_CONSOLIDATION,
    model: CONSOLIDATION_MODEL,
    inputMetadata: {
      openaiTranscriptChars: openaiAsr.text.length,
      darijaTranscriptChars: darijaAsr.text.length,
    },
    outputMetadata: (result) => ({
      transcriptChars: result.length,
    }),
    execute: () =>
      consolidateArabicTranscript(
        {
          openaiTranscript: openaiAsr.text,
          darijaTranscript: darijaAsr.text,
        },
        traceId,
        logTrace,
      ),
    logTrace,
  });
  const englishText = await recordProviderOperation({
    traceId,
    jobId,
    clerkUserId,
    provider: PROVIDERS.OPENAI,
    operation: PROVIDER_OPERATIONS.OPENAI_TRANSLATION,
    model: TRANSLATION_MODEL,
    inputMetadata: {
      consolidatedTranscriptChars: consolidatedArabicText.length,
    },
    outputMetadata: (result) => ({
      translationChars: result.length,
    }),
    execute: () =>
      translateConsolidatedTranscript(consolidatedArabicText, traceId, logTrace),
    logTrace,
  });

  const modelMetadata = {
    models: {
      openaiTranscription: openaiAsr.model,
      darija: darijaAsr.model,
      darijaBase: darijaAsr.base_model,
      consolidation: CONSOLIDATION_MODEL,
      translation: TRANSLATION_MODEL,
    },
    asr: {
      openai: {
        audioBytes: openaiAsr.audio_bytes,
        durationSeconds: openaiAsr.duration_seconds,
      },
      darija: {
        audioBytes: darijaAsr.audio_bytes,
        durationSeconds: darijaAsr.duration_seconds,
      },
    },
  };

  await writeTranslationResult({
    jobId,
    clerkUserId,
    openaiArabicText: openaiAsr.text,
    darijaArabicText: darijaAsr.text,
    consolidatedArabicText,
    englishText,
    modelMetadata,
  });

  return {
    openaiAsr,
    darijaAsr,
    consolidatedArabicText,
    englishText,
    modelMetadata,
    models: {
      consolidation: CONSOLIDATION_MODEL,
      translation: TRANSLATION_MODEL,
    },
  };
}

export async function processStoredTranslationJob({ jobId, traceId, logTrace = noop }) {
  logTrace(traceId, 'Attempting to claim stored translation job', { jobId });

  const claim = await claimTranslationJobForProcessing({ jobId });
  const job = claim.job;

  if (!job) {
    throw httpError(404, 'Translation job not found.');
  }

  if (!claim.claimed) {
    logTrace(traceId, 'Stored translation job was not claimed', {
      jobId,
      status: job.status,
    });

    if (
      job.status === TRANSLATION_JOB_STATUS.RUNNING ||
      job.status === TRANSLATION_JOB_STATUS.SUCCEEDED
    ) {
      return {
        skipped: true,
        jobId: job.id,
        status: job.status,
      };
    }

    throw httpError(409, `Translation job is not claimable from status ${job.status}.`);
  }

  try {
    logTrace(traceId, 'Stored translation job claimed', {
      jobId: job.id,
      clerkUserId: job.clerk_user_id,
      audioBucket: job.audio_bucket,
      audioObjectKey: job.audio_object_key,
      audioBytes: job.audio_size_bytes,
      filename: job.source_filename,
    });

    if (!job.audio_bucket || !job.audio_object_key) {
      throw httpError(422, 'Translation job is missing audio storage metadata.');
    }

    const audioBuffer = await downloadStoredObject({
      bucket: job.audio_bucket,
      objectKey: job.audio_object_key,
    });

    logTrace(traceId, 'Stored translation audio downloaded', {
      jobId: job.id,
      audioBytes: audioBuffer.length,
    });

    const pipelineResult = await runTranslationProviderPipeline({
      traceId,
      jobId: job.id,
      clerkUserId: job.clerk_user_id,
      filename: job.source_filename || `${job.id}.m4a`,
      audioBase64: audioBuffer.toString('base64'),
      audioBytes: job.audio_size_bytes || audioBuffer.length,
      audioStorageMetadata: {
        audioBucket: job.audio_bucket,
        audioObjectKey: job.audio_object_key,
        audioMimeType: job.audio_mime_type,
      },
      logTrace,
    });

    await markTranslationJobSucceeded({
      jobId: job.id,
      clerkUserId: job.clerk_user_id,
    });

    return {
      skipped: false,
      jobId: job.id,
      status: TRANSLATION_JOB_STATUS.SUCCEEDED,
      pipelineResult,
    };
  } catch (error) {
    await markTranslationJobFailed({
      jobId: job.id,
      clerkUserId: job.clerk_user_id,
      errorCode: safeErrorCode(error, 'translation_failed'),
      errorMessage: safeErrorMessage(error),
    });

    throw error;
  }
}
