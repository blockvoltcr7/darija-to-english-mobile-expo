# Production Diagnostics Source Anchors

## Local UI Anchors

| Source | Why it matters |
| --- | --- |
| `app/translate.tsx` | Owns API target details, diagnostics state, record/upload flow, result display, raw provider transcripts, and metadata row. |
| `app/history.tsx` | Shows model strings in list rows and provider operation rows in detail view. |
| `components/EnglishAudioPlayback.tsx` | User-facing playback component that must remain visible in production when TTS exists. |
| `lib/api.ts` | Normalizes translation/history responses and trace callbacks; should not lose fields just because UI hides diagnostics. |
| `lib/types.ts` | Defines raw transcript, model metadata, TTS, and provider run fields used by diagnostics/support mode. |

## PRD Anchors

| Source | Why it matters |
| --- | --- |
| `ai_docs/prd/app-store-release-readiness/04-gap-analysis.md` | Identifies API URL, diagnostics, model internals, and QA copy as production UI gaps. |
| `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md` | Lists production hiding rules and suggested `CONFIG.ENABLE_DIAGNOSTICS`. |
| `ai_docs/prd/app-store-release-readiness/07-ui-and-store-metadata-changes.md` | Defines production vs debug/support target behavior for translate and history. |
| `ai_docs/prd/app-store-release-readiness/12-app-store-privacy-data-inventory.md` | Classifies diagnostics/provider status as collected or potentially linked data. |

## Visibility Principle

Hide presentation details in production without deleting contract fields. Support diagnostics are still useful for signed-in support/QA, but screenshots and public UI should not expose implementation internals by default.
