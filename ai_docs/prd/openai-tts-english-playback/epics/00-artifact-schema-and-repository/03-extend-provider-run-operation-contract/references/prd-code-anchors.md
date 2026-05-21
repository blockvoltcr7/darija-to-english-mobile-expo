# PRD And Code Anchors

## PRD Alignment

- `02-problem-statement.md`: notes that existing provider operations do not include `openai_tts`.
- `04-gap-analysis.md`: explains that provider runs are diagnostics while `translation_artifacts` should own artifact lifecycle.
- `11-definition-of-done.md`: requires safe server logs and diagnostics without leaking text, secrets, or audio bytes.

## Repo Anchors

- `server/translations.mjs`: `PROVIDER_OPERATIONS`, `PROVIDERS`, `recordProviderRun`, and metadata sanitization live here.
- `server/translation-pipeline.mjs`: `recordProviderOperation` wraps existing provider calls and is the likely TTS diagnostic integration point.
- `supabase/migrations/20260510202655_create_translation_persistence_tables.sql`: current SQL check constraint allows only OpenAI transcription, Modal ASR, consolidation, and translation operations.

## Execution Notes

- Add `openai_tts` only if implementation records TTS in `provider_runs`.
- Do not make provider runs the source of truth for playable audio state.
