2026-05-21

- Added `getLatestEnglishTtsArtifactForUser(...)` for owner-filtered latest artifact metadata.
- Added `tts` to translation detail mapping.
- Succeeded artifacts include a relative authenticated playback URL.
- Failed/running artifacts expose safe status and error metadata while preserving text translation fields.
- The response does not include Supabase service credentials, bucket names, object keys, or signed/public Storage URLs.
