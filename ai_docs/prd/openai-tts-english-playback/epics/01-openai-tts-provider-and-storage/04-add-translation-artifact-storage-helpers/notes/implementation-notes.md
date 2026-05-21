2026-05-21

- Added `TRANSLATION_ARTIFACT_OUTPUT_FORMATS` for `aac` and `mp3`.
- Added `buildTranslationArtifactObjectKey` with owner, job, and artifact ID segments.
- Added `uploadTranslationArtifact` for private `translation-artifacts` uploads through the Supabase admin client.
- Object keys intentionally omit English text, provider secrets, Clerk tokens, and generated audio bytes.
- Existing original-audio storage helpers were left unchanged.
