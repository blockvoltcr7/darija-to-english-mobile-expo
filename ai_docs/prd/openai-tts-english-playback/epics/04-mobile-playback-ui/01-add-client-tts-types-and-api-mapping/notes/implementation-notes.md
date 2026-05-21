2026-05-21

- Added `TranslationTtsArtifact` to `lib/types.ts`.
- Attached optional `tts` metadata to `TranslationResult` and `TranslationHistoryDetail`.
- `getTranslation(...)` and polling results preserve TTS metadata and resolve playback URLs for mobile use.
- Mobile types intentionally avoid OpenAI, Supabase service-role, bucket, and object-key details.
