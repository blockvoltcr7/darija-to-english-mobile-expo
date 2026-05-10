import { CONFIG } from '@/lib/config';
import type {
  TranslationHistoryDetail,
  TranslationHistoryListResponse,
  TranslationResult,
} from '@/lib/types';

interface TranslateAudioParams {
  filename: string;
  audioBase64: string;
  accessToken: string;
  traceId?: string;
  onTrace?: (message: string) => void;
}

interface ApiErrorBody {
  error?: string;
  detail?: string;
}

interface HistoryListParams {
  accessToken: string;
  limit?: number;
  cursor?: string | null;
  onTrace?: (message: string) => void;
}

interface HistoryDetailParams {
  accessToken: string;
  id: string;
  onTrace?: (message: string) => void;
}

async function readError(res: Response) {
  try {
    const body = (await res.json()) as ApiErrorBody;
    return body.error || body.detail || `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

export async function translateAudioFile({
  filename,
  audioBase64,
  accessToken,
  traceId,
  onTrace,
}: TranslateAudioParams): Promise<TranslationResult> {
  const endpoint = `${CONFIG.API_BASE_URL}/v1/translate-audio`;
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

  const result = (await res.json()) as TranslationResult;
  onTrace?.(`Response keys: ${Object.keys(result).sort().join(', ')}`);
  onTrace?.(
    `Transcript chars: openai=${result.openaiArabicText?.length ?? result.transcripts?.openai?.length ?? 0} darija=${result.darijaArabicText?.length ?? result.transcripts?.darija?.length ?? result.transcripts?.modal?.length ?? 0} consolidated=${result.consolidatedArabicText?.length ?? result.transcript?.length ?? 0}`,
  );

  return result;
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
  id,
  onTrace,
}: HistoryDetailParams): Promise<TranslationHistoryDetail> {
  const endpoint = `${CONFIG.API_BASE_URL}/v1/translations/${encodeURIComponent(id)}`;
  const startedAt = Date.now();

  onTrace?.(`GET ${endpoint}`);

  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  onTrace?.(`History detail response ${res.status} after ${Date.now() - startedAt}ms`);

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  return (await res.json()) as TranslationHistoryDetail;
}
