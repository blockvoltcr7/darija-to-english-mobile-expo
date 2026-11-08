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
  mode?: string;
  jobId?: string;
  translationJobId?: string;
  saveToHistory?: boolean;
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
  responseAudio?: TranslationTtsArtifact | null;
}

export interface TranslationHistoryListItem {
  id: string;
  mode?: string | null;
  saveToHistory?: boolean | null;
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
  saveToHistory?: boolean;
}

export interface QueuedTranslationJob {
  jobId: string;
  translationJobId: string;
  status?: string;
  saveToHistory?: boolean;
  triggerRunId?: string | null;
  traceId?: string;
  createdAt?: string | null;
  detailUrl?: string;
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
  saveToHistory?: boolean | null;
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
  responseAudio?: TranslationTtsArtifact | null;
  providerRuns: TranslationProviderRunSummary[];
}

export interface RequiredConsentVersions {
  terms_version: string;
  privacy_policy_version: string;
  ai_processing_consent_version: string;
  providers_version: string;
  retention_policy_version: string;
}

export interface UserConsentRecord {
  id: string;
  clerk_user_id: string;
  clerk_user_id_hash?: string | null;
  profile_id?: string | null;
  primary_email?: string | null;
  display_name?: string | null;
  terms_version: string;
  privacy_policy_version: string;
  ai_processing_consent_version: string;
  providers_version: string;
  retention_policy_version: string;
  accepted_at: string;
  revoked_at?: string | null;
  account_deleted_at?: string | null;
  deletion_request_id?: string | null;
  source: string;
  platform?: string | null;
  app_version?: string | null;
}

export interface PrivacyPreferences {
  clerk_user_id: string;
  save_history_by_default: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PrivacyState {
  consent_required: boolean;
  current_consent?: UserConsentRecord | null;
  preferences: PrivacyPreferences;
  required_versions: RequiredConsentVersions;
}

export interface AccountDeletionSummary {
  profilesDeleted?: number;
  consentsAnonymized?: number;
  preferencesDeleted?: number;
  webhookEventsSanitized?: number;
  jobsDeleted?: number;
  resultsDeleted?: number;
  providerRunsDeleted?: number;
  artifactsDeleted?: number;
  storageObjectsDeleted?: number;
  storageDeleteFailures?: number;
}

export interface AccountDeletionResponse {
  status: 'completed' | 'scheduled' | string;
  deletion_request_id?: string;
  app_data?: AccountDeletionSummary;
}

export type SubscriptionPlan = 'free' | 'pro' | string;
export type UsageFeature = 'translation' | 'response_audio' | 'history_save' | string;

export interface SubscriptionEntitlementState {
  active: boolean;
  entitlement_id: string;
  plan: SubscriptionPlan;
  product_id?: string | null;
  expires_at?: string | null;
  environment?: string | null;
  source?: string | null;
  last_synced_at?: string | null;
}

export interface UsageAllowance {
  feature: UsageFeature;
  period_key: string;
  limit: number | null;
  used: number;
  remaining: number | null;
}

export interface SubscriptionState {
  app_user_id: string;
  entitlement: SubscriptionEntitlementState;
  usage: UsageAllowance[];
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
