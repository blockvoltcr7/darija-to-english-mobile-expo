export type TranslationTtsStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | string;

export interface TranslationTtsArtifact {
  status: TranslationTtsStatus;
  provider?: string | null;
  model?: string | null;
  voice?: string | null;
  language?: string | null;
  format?: 'aac' | 'mp3' | string | null;
  mimeType?: string | null;
  byteSize?: number | null;
  durationSeconds?: number | null;
  audioUrl?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TranslationResult {
  jobId?: string;
  translationJobId?: string;
  transcript: string;
  openaiArabicText?: string;
  darijaArabicText?: string;
  consolidatedArabicText?: string;
  englishText?: string;
  transcripts?: {
    modal?: string;
    darija?: string;
    openai?: string;
  };
  translation: string;
  model: string;
  consolidation_model?: string;
  asr: {
    model?: string;
    base_model?: string;
    filename?: string;
    audio_bytes?: number;
    duration_seconds?: number;
  };
  darija_asr?: {
    model?: string;
    base_model?: string;
    filename?: string;
    audio_bytes?: number;
    duration_seconds?: number;
  };
  openai_asr?: {
    model?: string;
    filename?: string;
    audio_bytes?: number;
    duration_seconds?: number;
  };
  tts?: TranslationTtsArtifact | null;
}

export interface TranslationHistoryListItem {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled' | string;
  triggerRunId?: string | null;
  filename?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  consolidatedArabicPreview?: string | null;
  englishPreview?: string | null;
  models?: {
    openaiTranscription?: string | null;
    darija?: string | null;
    consolidation?: string | null;
    translation?: string | null;
  };
}

export interface TranslationHistoryListResponse {
  items: TranslationHistoryListItem[];
  nextCursor?: string | null;
}

export interface AsyncTranslationSubmitResponse {
  jobId: string;
  translationJobId: string;
  status: 'queued';
  triggerRunId?: string | null;
  createdAt?: string | null;
  detailUrl: string;
}

export interface TranslationProviderRunSummary {
  id: string;
  provider: string;
  operation: string;
  model?: string | null;
  status: string;
  latencyMs?: number | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface TranslationHistoryDetail {
  id: string;
  status: string;
  triggerRunId?: string | null;
  filename?: string | null;
  sourceAudioBytes?: number | null;
  traceId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  result: {
    openaiArabicText?: string | null;
    darijaArabicText?: string | null;
    consolidatedArabicText: string;
    englishText: string;
    modelMetadata?: Record<string, unknown>;
    createdAt?: string | null;
    updatedAt?: string | null;
  } | null;
  tts?: TranslationTtsArtifact | null;
  providerRuns: TranslationProviderRunSummary[];
}

export type WorkStatus =
  | 'idle'
  | 'preparing'
  | 'recording'
  | 'queued'
  | 'running'
  | 'polling'
  | 'transcribing'
  | 'done'
  | 'error';
