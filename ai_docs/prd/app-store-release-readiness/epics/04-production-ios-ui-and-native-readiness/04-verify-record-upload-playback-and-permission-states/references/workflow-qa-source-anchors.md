# Workflow QA Source Anchors

## Local Anchors

| Source | Why it matters |
| --- | --- |
| `app/translate.tsx` | Owns recording, document picker upload, permission state, result rendering, recoverable job resume, and diagnostic behavior. |
| `components/EnglishAudioPlayback.tsx` | Owns authenticated English TTS playback UI and failure/loading states. |
| `lib/api.ts` | Posts audio to `/v1/translations`, polls details, refreshes Clerk tokens, normalizes TTS URLs, and enforces the 420 second polling window. |
| `lib/types.ts` | Defines translation result, history detail, and TTS metadata used by the UI. |
| `.agents/skills/ios-simulator-files/scripts/add_to_simulator_files.sh` | Loads non-sensitive fixture audio into iOS Simulator Files for upload-path testing. |
| `app.json` | Microphone permission copy and native audio config. |

## PRD Anchors

| Source | Why it matters |
| --- | --- |
| `ai_docs/prd/app-store-release-readiness/08-ios-submission-evaluator-report.md` | Requires clean microphone prompt, file import, playback, privacy warning review, and standard encryption confirmation. |
| `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md` | Requires production smoke success, product-specific permission copy, hidden diagnostics, and sanitized evidence. |
| `ai_docs/prd/app-store-release-readiness/epics/03-production-runtime-and-abuse-controls/07-run-production-smoke-test/task.md` | Upstream proof that production runtime works without local `trigger dev`. |

## Evidence Boundary

Evidence may include build metadata, device/simulator, safe fixture filename/size, sanitized IDs, statuses, and screenshots without private content. It must not include Clerk tokens, API keys, `.env` values, private audio contents, full transcripts, or generated audio bytes.
