2026-05-21

- TTS provider/storage failures call `markTtsArtifactFailed(...)` when an artifact row exists.
- Public error messages are intentionally generic: `Speech generation failed.`, `Speech audio storage failed.`, or text-length failure.
- If artifact failure recording itself fails, the optional TTS error is logged safely and swallowed so the text translation can remain usable.
- API detail work in Epic 03 will expose failed artifact status without stack traces or secrets.
