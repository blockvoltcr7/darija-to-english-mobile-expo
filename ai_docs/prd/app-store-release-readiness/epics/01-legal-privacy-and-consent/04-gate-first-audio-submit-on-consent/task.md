# Gate First Audio Submit On Consent

## Type

Code

## Context

Fresh users must accept current AI/audio processing consent before any audio is stored, queued, or sent to OpenAI or Modal-hosted Darija ASR. Client gating improves UX, but server gating is the trust boundary. The current submit path calls `lib/api.ts` `translateAudioFile()`, which posts to `/v1/translations`; `server/index.mjs` verifies Clerk, creates a job, uploads audio, and dispatches Trigger. This task gates both mobile submit and server execution before that storage/provider boundary.

## Implementation

Add client consent status/acceptance calls in `lib/api.ts` and use them from `app/translate.tsx` before record/upload submit calls `translateAudioFile()`. Present a blocking modal or screen with copy grounded in `references/consent-submit-boundary-anchors.md`. In `server/index.mjs`, insert required-consent middleware after `ensureProfileForRequest` and before `handleCreateTranslation` for `/v1/translations`, `/v1/translate-audio`, and `/translate-audio`. Return a safe `403`/`409` style JSON error with `reason: consent_required` or `consent_outdated` and `traceId`.

## Acceptance Criteria

- [ ] A fresh signed-in user cannot submit recorded or uploaded audio until all required current consent types are accepted.
- [ ] Accepted consent is persisted and reused for subsequent submissions by the same Clerk user and consent version.
- [ ] Server rejects missing/outdated consent even if the client bypasses the consent UI.
- [ ] Consent copy names audio, transcripts, translations, model metadata, generated English audio when enabled, backend services, and third-party AI providers.
- [ ] Static checks pass, and fresh-user QA evidence records only safe IDs/statuses and no private audio/transcript contents.

## Dependencies

- Depends On: `add-consent-persistence`
- Depends On: `add-in-app-legal-surfaces`
- Blocks: `update-privacy-inventory-and-release-copy`
- Blocks: `02-account-deletion-and-data-lifecycle/map-account-deletion-policy-to-data`
- Blocks: `04-production-ios-ui-and-native-readiness/replace-qa-and-permission-copy`

## Technical Notes

- `app/translate.tsx` already obtains a Clerk token before submit; add consent calls around that flow without logging tokens.
- Server enforcement must happen before `createTranslationJob()`, `uploadOriginalAudioForJob()`, Trigger dispatch, and `runTranslationProviderPipeline()`.
- Keep legacy submit aliases protected, not only `/v1/translations`.
- Use AI limitation copy from the PRD: generated transcripts/translations may be incomplete or imperfect.

## Artifact Slots

- `artifacts/consent-gate-validation.md`: execution-time screenshots, API responses, and sanitized fresh-user result.
- `references/consent-submit-boundary-anchors.md`: client/server submit boundary anchors.
- `resources/fresh-user-consent-qa-checklist.md`: fresh-user consent and bypass QA checklist.
- `notes/consent-ux-copy-decisions.md`: final modal/screen wording and unresolved blockers.
