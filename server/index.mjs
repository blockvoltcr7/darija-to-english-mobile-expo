import { clerkMiddleware, getAuth } from '@clerk/express';
import cors from 'cors';
import express from 'express';
import OpenAI, { toFile } from 'openai';
import { env } from './env.mjs';

const {
  PORT,
  HOST,
  MAX_JSON_BODY_SIZE: BODY_LIMIT,
  CLERK_CONFIGURED,
  DARIJA_ASR_BASE_URL: ASR_BASE_URL,
  DARIJA_ASR_TRANSCRIBE_URL: ASR_TRANSCRIBE_URL,
  DARIJA_ASR_API_KEY: ASR_API_KEY,
  DARIJA_ASR_TIMEOUT_MS: ASR_TIMEOUT_MS,
  OPENAI_API_KEY,
  OPENAI_CONSOLIDATION_MODEL: CONSOLIDATION_MODEL,
  OPENAI_TRANSLATION_MODEL: TRANSLATION_MODEL,
  OPENAI_TRANSCRIPTION_MODEL,
  SUPABASE_CONFIGURED,
} = env;

const app = express();

app.use(CLERK_CONFIGURED ? clerkMiddleware() : (_req, _res, next) => next());
app.use(cors());
app.use(express.json({ limit: BODY_LIMIT }));

function nowIso() {
  return new Date().toISOString();
}

function traceFromRequest(req) {
  return req.get('X-Trace-Id') || `server-${Date.now().toString(36)}`;
}

function logTrace(traceId, message, details = undefined) {
  const suffix = details ? ` ${JSON.stringify(details)}` : '';

  console.log(`[${nowIso()}] [${traceId}] ${message}${suffix}`);
}

function transcriptLengths(payload) {
  return {
    openaiArabicText: payload.openaiArabicText?.length || 0,
    darijaArabicText: payload.darijaArabicText?.length || 0,
    consolidatedArabicText: payload.consolidatedArabicText?.length || 0,
    englishText: payload.englishText?.length || 0,
  };
}

let openaiClient;

function getOpenAIClient() {
  if (!OPENAI_API_KEY) {
    throw httpError(500, 'OPENAI_API_KEY is not configured.');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  return openaiClient;
}

function httpError(status, message, cause) {
  const error = new Error(message);
  error.status = status;
  error.cause = cause;
  return error;
}

function requireAsrConfig() {
  if (!ASR_BASE_URL) {
    throw httpError(500, 'DARIJA_ASR_BASE_URL is not configured.');
  }

  if (!ASR_API_KEY) {
    throw httpError(500, 'DARIJA_ASR_API_KEY is not configured.');
  }
}

function validatePayload(body) {
  const filename = typeof body?.filename === 'string' ? body.filename.trim() : '';
  const audioBase64 =
    typeof body?.audio_base64 === 'string' ? body.audio_base64.trim() : '';

  if (!filename) {
    throw httpError(400, 'filename is required.');
  }

  if (!audioBase64) {
    throw httpError(400, 'audio_base64 is required.');
  }

  return { filename, audioBase64 };
}

function requireClerkSession(req, res, next) {
  if (!CLERK_CONFIGURED) {
    return next(
      httpError(
        500,
        'Clerk auth is not configured. Set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.',
      ),
    );
  }

  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.clerkAuth = {
    userId: auth.userId,
    sessionId: auth.sessionId,
  };

  next();
}

function decodeAudioBase64(audioBase64) {
  const value = audioBase64.includes(',')
    ? audioBase64.split(',', 2)[1]
    : audioBase64;

  return Buffer.from(value, 'base64');
}

async function transcribeAudio({ filename, audioBase64 }, traceId) {
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

async function transcribeAudioWithOpenAI({ filename, audioBase64 }, traceId) {
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

async function translateConsolidatedTranscript(consolidatedTranscript, traceId) {
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

app.get('/health', (req, res) => {
  const traceId = traceFromRequest(req);
  const payload = {
    ok: true,
    service: 'darija-to-english-api',
    dependencies: {
      clerk: CLERK_CONFIGURED,
      darija_asr: Boolean(ASR_BASE_URL && ASR_API_KEY),
      openai: Boolean(OPENAI_API_KEY),
      supabase: SUPABASE_CONFIGURED,
    },
    models: {
      openai_transcription: OPENAI_TRANSCRIPTION_MODEL,
      consolidation: CONSOLIDATION_MODEL,
      translation: TRANSLATION_MODEL,
    },
  };

  logTrace(traceId, 'Health check', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    responseShape: Object.keys(payload),
    models: payload.models,
    clerkConfigured: CLERK_CONFIGURED,
    supabaseConfigured: SUPABASE_CONFIGURED,
  });

  res.json(payload);
});

async function handleTranslateAudio(req, res, next) {
  const traceId = traceFromRequest(req);
  const startedAt = Date.now();

  try {
    const payload = validatePayload(req.body);

    logTrace(traceId, 'Translate audio request received', {
      ip: req.ip,
      userId: req.clerkAuth?.userId,
      filename: payload.filename,
      base64Chars: payload.audioBase64.length,
      approxAudioBytes: Math.round((payload.audioBase64.length * 3) / 4),
      contentLength: req.get('Content-Length'),
    });

    logTrace(traceId, 'STT parallel start', {
      requirement: 'openai_and_darija_required_before_consolidation',
    });

    const [darijaAsr, openaiAsr] = await Promise.all([
      transcribeAudio(payload, traceId),
      transcribeAudioWithOpenAI(payload, traceId),
    ]);

    if (!darijaAsr.text?.trim()) {
      throw httpError(502, 'Darija transcription returned empty text.');
    }

    if (!openaiAsr.text?.trim()) {
      throw httpError(502, 'OpenAI transcription returned empty text.');
    }

    const consolidatedArabicText = await consolidateArabicTranscript(
      {
        openaiTranscript: openaiAsr.text,
        darijaTranscript: darijaAsr.text,
      },
      traceId,
    );
    const englishText = await translateConsolidatedTranscript(
      consolidatedArabicText,
      traceId,
    );

    const responsePayload = {
      openaiArabicText: openaiAsr.text,
      darijaArabicText: darijaAsr.text,
      consolidatedArabicText,
      englishText,
      transcript: consolidatedArabicText,
      transcripts: {
        modal: darijaAsr.text,
        darija: darijaAsr.text,
        openai: openaiAsr.text,
      },
      translation: englishText,
      model: TRANSLATION_MODEL,
      consolidation_model: CONSOLIDATION_MODEL,
      asr: {
        model: darijaAsr.model,
        base_model: darijaAsr.base_model,
        filename: darijaAsr.filename,
        audio_bytes: darijaAsr.audio_bytes,
        duration_seconds: darijaAsr.duration_seconds,
      },
      darija_asr: {
        model: darijaAsr.model,
        base_model: darijaAsr.base_model,
        filename: darijaAsr.filename,
        audio_bytes: darijaAsr.audio_bytes,
        duration_seconds: darijaAsr.duration_seconds,
      },
      openai_asr: {
        model: openaiAsr.model,
        filename: openaiAsr.filename,
        audio_bytes: openaiAsr.audio_bytes,
        duration_seconds: openaiAsr.duration_seconds,
      },
    };

    logTrace(traceId, 'Translate audio response payload ready', {
      responseKeys: Object.keys(responsePayload).sort(),
      transcriptLengths: transcriptLengths(responsePayload),
      models: {
        openai_transcription: responsePayload.openai_asr.model,
        darija: responsePayload.darija_asr.model,
        consolidation: responsePayload.consolidation_model,
        translation: responsePayload.model,
      },
    });

    res.json(responsePayload);

    logTrace(traceId, 'Translate audio response sent', {
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

app.post('/v1/translate-audio', requireClerkSession, handleTranslateAudio);
app.post('/translate-audio', requireClerkSession, handleTranslateAudio);

app.use((error, _req, res, _next) => {
  const status = Number(error.status || 500);
  const message =
    status >= 500 ? error.message || 'Server error.' : error.message || 'Bad request.';

  logTrace(error.traceId || 'unknown', 'Request failed', {
    status,
    message,
    stack: error.stack,
  });

  res.status(status).json({ error: message });
});

app.listen(PORT, HOST, () => {
  logTrace('startup', 'Darija to English API listening', {
    url: `http://${HOST}:${PORT}`,
    bodyLimit: BODY_LIMIT,
    darijaConfigured: Boolean(ASR_BASE_URL && ASR_API_KEY),
    darijaEndpoint: ASR_TRANSCRIBE_URL || null,
    openaiConfigured: Boolean(OPENAI_API_KEY),
    supabaseConfigured: SUPABASE_CONFIGURED,
    models: {
      openai_transcription: OPENAI_TRANSCRIPTION_MODEL,
      consolidation: CONSOLIDATION_MODEL,
      translation: TRANSLATION_MODEL,
    },
  });
});
