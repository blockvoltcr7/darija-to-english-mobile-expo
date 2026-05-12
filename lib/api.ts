import { CONFIG } from '@/lib/config';
import type {
  AsyncTranslationSubmitResponse,
  TranslationHistoryDetail,
  TranslationHistoryListResponse,
  TranslationResult,
} from '@/lib/types';

interface TranslateAudioParams {
  filename: string;
  audioBase64: string;
  accessToken: string;
  refreshAccessToken?: () => Promise<string | null>;
  traceId?: string;
  onTrace?: (message: string) => void;
  onJobStatus?: (status: string) => void;
  signal?: AbortSignal;
}

interface ApiErrorBody {
  error?: string;
  detail?: string;
  reason?: string;
  traceId?: string;
}

interface HistoryListParams {
  accessToken: string;
  limit?: number;
  cursor?: string | null;
  onTrace?: (message: string) => void;
}

interface HistoryDetailParams {
  accessToken: string;
  traceId?: string;
  id: string;
  onTrace?: (message: string) => void;
  signal?: AbortSignal;
}

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 180000;

function formatElapsedMs(startedAt?: string | null) {
  if (!startedAt) {
    return 'n/a';
  }

  const timestamp = Date.parse(startedAt);

  if (Number.isNaN(timestamp)) {
    return 'n/a';
  }

  return `${Date.now() - timestamp}ms`;
}

async function readError(res: Response) {
  try {
    const body = (await res.json()) as ApiErrorBody;
    const message = body.error || body.detail || `${res.status} ${res.statusText}`;
    const context = [
      body.reason ? `reason=${body.reason}` : null,
      body.traceId ? `trace=${body.traceId}` : null,
    ]
      .filter(Boolean)
      .join(' ');

    return context ? `${message} (${context})` : message;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

export async function translateAudioFile({
  filename,
  audioBase64,
  accessToken,
  refreshAccessToken,
  traceId,
  onTrace,
  onJobStatus,
  signal,
}: TranslateAudioParams): Promise<TranslationResult> {
  const endpoint = `${CONFIG.API_BASE_URL}/v1/translations`;
  const startedAt = Date.now();

  onTrace?.(
    `POST ${endpoint} filename=${filename} base64Chars=${audioBase64.length}`,
  );

  let res: Response;

  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(traceId ? { 'X-Trace-Id': traceId } : {}),
      },
      body: JSON.stringify({
        filename,
        audio_base64: audioBase64,
      }),
      signal,
    });
  } catch (caughtError) {
    const message =
      caughtError instanceof Error ? caughtError.message : 'Unknown fetch error';

    onTrace?.(`Network failure after ${Date.now() - startedAt}ms: ${message}`);
    throw new Error(`Network request failed for ${endpoint}: ${message}`);
  }

  onTrace?.(`Response ${res.status} after ${Date.now() - startedAt}ms`);

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  const queued = (await res.json()) as AsyncTranslationSubmitResponse;

  onTrace?.(`Queued job ${queued.jobId} triggerRun=${queued.triggerRunId || 'n/a'}`);
  onJobStatus?.('queued');

  return pollTranslationResult({
    accessToken,
    refreshAccessToken,
    id: queued.jobId,
    triggerRunId: queued.triggerRunId || null,
    traceId,
    onTrace,
    onJobStatus,
    signal,
    startedAt,
  });
}

function sleep(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      const error = new Error('Polling was canceled.');
      error.name = 'AbortError';
      reject(error);
      return;
    }

    const timeout = setTimeout(resolve, milliseconds);

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        const error = new Error('Polling was canceled.');
        error.name = 'AbortError';
        reject(error);
      },
      { once: true },
    );
  });
}

function toTranslationResult(detail: TranslationHistoryDetail): TranslationResult {
  const models =
    detail.result?.modelMetadata &&
    typeof detail.result.modelMetadata === 'object' &&
    !Array.isArray(detail.result.modelMetadata)
      ? (detail.result.modelMetadata.models as
          | {
              openaiTranscription?: string;
              darija?: string;
              darijaBase?: string;
              consolidation?: string;
              translation?: string;
            }
          | undefined)
      : undefined;
  const result = detail.result;

  if (!result) {
    throw new Error('Translation result is not available yet.');
  }

  return {
    jobId: detail.id,
    translationJobId: detail.id,
    transcript: result.consolidatedArabicText,
    openaiArabicText: result.openaiArabicText || undefined,
    darijaArabicText: result.darijaArabicText || undefined,
    consolidatedArabicText: result.consolidatedArabicText,
    englishText: result.englishText,
    transcripts: {
      modal: result.darijaArabicText || undefined,
      darija: result.darijaArabicText || undefined,
      openai: result.openaiArabicText || undefined,
    },
    translation: result.englishText,
    model: models?.translation || '',
    consolidation_model: models?.consolidation,
    asr: {
      model: models?.darija,
      base_model: models?.darijaBase,
      filename: detail.filename || undefined,
      audio_bytes: detail.sourceAudioBytes || undefined,
    },
    darija_asr: {
      model: models?.darija,
      base_model: models?.darijaBase,
      filename: detail.filename || undefined,
      audio_bytes: detail.sourceAudioBytes || undefined,
    },
    openai_asr: {
      model: models?.openaiTranscription,
      filename: detail.filename || undefined,
      audio_bytes: detail.sourceAudioBytes || undefined,
    },
  };
}

async function pollTranslationResult({
  accessToken,
  refreshAccessToken,
  id,
  triggerRunId,
  traceId,
  onTrace,
  onJobStatus,
  signal,
  startedAt,
}: HistoryDetailParams & {
  refreshAccessToken?: () => Promise<string | null>;
  onJobStatus?: (status: string) => void;
  startedAt: number;
  triggerRunId?: string | null;
}): Promise<TranslationResult> {
  onJobStatus?.('polling');
  let currentAccessToken = accessToken;

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    if (refreshAccessToken) {
      const refreshedToken = await refreshAccessToken();

      if (!refreshedToken) {
        throw new Error('Clerk session token was unavailable while polling.');
      }

      currentAccessToken = refreshedToken;
      onTrace?.('Refreshed Clerk session token for polling');
    }

    const detail = await getTranslation({
      accessToken: currentAccessToken,
      traceId,
      id,
      onTrace,
      signal,
    });

    onTrace?.(
      `Job ${id} status=${detail.status} triggerRun=${
        detail.triggerRunId || triggerRunId || 'n/a'
      } queuedAge=${formatElapsedMs(detail.createdAt)} updated=${detail.updatedAt || 'n/a'}`,
    );
    onJobStatus?.(detail.status);

    if (detail.status === 'succeeded') {
      const result = toTranslationResult(detail);
      onTrace?.(`Response keys: ${Object.keys(result).sort().join(', ')}`);
      onTrace?.(
        `Transcript chars: openai=${result.openaiArabicText?.length ?? result.transcripts?.openai?.length ?? 0} darija=${result.darijaArabicText?.length ?? result.transcripts?.darija?.length ?? result.transcripts?.modal?.length ?? 0} consolidated=${result.consolidatedArabicText?.length ?? result.transcript?.length ?? 0}`,
      );
      return result;
    }

    if (
      detail.status === 'failed' ||
      detail.status === 'canceled' ||
      detail.status === 'timeout'
    ) {
      throw new Error(
        detail.errorMessage ||
          detail.errorCode ||
          `Translation job ended with status ${detail.status}.`,
      );
    }

    await sleep(POLL_INTERVAL_MS, signal);
  }

  throw new Error(
    `Translation job did not finish within ${Math.round(POLL_TIMEOUT_MS / 1000)} seconds.`,
  );
}

export async function listTranslations({
  accessToken,
  limit,
  cursor,
  onTrace,
}: HistoryListParams): Promise<TranslationHistoryListResponse> {
  const params = new URLSearchParams();

  if (limit) {
    params.set('limit', String(limit));
  }

  if (cursor) {
    params.set('cursor', cursor);
  }

  const query = params.toString();
  const endpoint = `${CONFIG.API_BASE_URL}/v1/translations${query ? `?${query}` : ''}`;
  const startedAt = Date.now();

  onTrace?.(`GET ${endpoint}`);

  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  onTrace?.(`History response ${res.status} after ${Date.now() - startedAt}ms`);

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  return (await res.json()) as TranslationHistoryListResponse;
}

export async function getTranslation({
  accessToken,
  traceId,
  id,
  onTrace,
  signal,
}: HistoryDetailParams): Promise<TranslationHistoryDetail> {
  const endpoint = `${CONFIG.API_BASE_URL}/v1/translations/${encodeURIComponent(id)}`;
  const startedAt = Date.now();

  onTrace?.(`GET ${endpoint}`);

  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(traceId ? { 'X-Trace-Id': traceId } : {}),
    },
    signal,
  });

  onTrace?.(`History detail response ${res.status} after ${Date.now() - startedAt}ms`);

  if (!res.ok) {
    const errorMessage = await readError(res);
    onTrace?.(`History detail error ${res.status}: ${errorMessage}`);
    throw new Error(
      `History detail request failed for ${id}: ${res.status} ${errorMessage}`,
    );
  }

  return (await res.json()) as TranslationHistoryDetail;
}
