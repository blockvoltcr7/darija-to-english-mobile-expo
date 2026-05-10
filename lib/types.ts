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
}

export type WorkStatus =
  | 'idle'
  | 'preparing'
  | 'recording'
  | 'transcribing'
  | 'done'
  | 'error';
