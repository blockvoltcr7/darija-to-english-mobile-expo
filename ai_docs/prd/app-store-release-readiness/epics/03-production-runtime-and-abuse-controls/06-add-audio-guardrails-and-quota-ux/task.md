# Add Audio Guardrails And Quota UX

## Type

UI

## Context

The risk assessment names Cloud Run request-size limits, provider cost spikes, and unclear user-facing failures as App Review and support risks. The server already enforces `AUDIO_UPLOAD_MAX_BYTES`; this task makes production audio constraints explicit, adds client-side preflight where practical, and turns quota/maintenance responses into clear user-facing UI without exposing provider internals.

## Implementation

- Keep authoritative server validation in `server/storage.mjs` and `server/index.mjs`; add duration/type/size checks only if the chosen APIs can do so reliably before paid work.
- Add public config/type support in `lib/config.ts`, `lib/types.ts`, and `lib/api.ts` only for mobile-safe constraint and error fields.
- Update `app/translate.tsx` upload/recording error handling for `audio_too_large`, unsupported type, quota limit, maintenance/kill switch, retry-after, and network/API health failures.
- Document supported size/duration/type constraints in `artifacts/audio-guardrails-and-quota-ux.md` for reviewer notes and support copy.
- Avoid using real provider calls for negative tests; prefer server-side guardrail failures before storage/Trigger/provider work.

## Acceptance Criteria

- [ ] Oversized, empty, invalid-base64, or unsupported audio is rejected before provider work.
- [ ] Quota, kill-switch/maintenance, unsupported audio, and retry-after errors render as user-facing copy in `app/translate.tsx`.
- [ ] Client-side checks reduce avoidable uploads but server-side checks remain authoritative.
- [ ] Production UI copy does not reveal provider keys, internal routes, stack traces, or private storage object keys.
- [ ] Supported constraints are documented for App Review instructions and support notes.

## Dependencies

- Depends On: `add-usage-reservations-limits-and-kill-switch`
- Blocks: `run-production-smoke-test`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/create-reviewer-instructions-and-demo-account`

## Technical Notes

- `server/storage.mjs` currently accepts supported audio extensions/MIME types, rejects invalid base64, and enforces `env.AUDIO_UPLOAD_MAX_BYTES`.
- `lib/api.ts` currently throws plain `Error(await readError(res))`; typed error normalization may be needed so `app/translate.tsx` can present reason-specific messages.
- `app/translate.tsx` currently shows API URL and diagnostics; production visibility is handled in the UI-cleanup epic, but this task should avoid adding new debug-only copy to normal errors.
- Do not test guardrails by repeatedly submitting valid paid-provider audio.

## Artifact Slots

- `artifacts/audio-guardrails-and-quota-ux.md`: implemented constraints, user-copy summary, and sanitized screenshot/evidence slots.
- `references/source-anchors.md`: server validation, client API, UI, and PRD anchors.
- `resources/guardrails-test-matrix.md`: negative/positive test cases that avoid paid calls where possible.
- `notes/threshold-and-reviewer-copy-decisions.md`: max size/duration/type decisions.
