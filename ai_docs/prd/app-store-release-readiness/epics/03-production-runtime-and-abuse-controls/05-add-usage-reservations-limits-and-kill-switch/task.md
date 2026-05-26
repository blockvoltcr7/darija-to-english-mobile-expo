# Add Usage Reservations Limits And Kill Switch

## Type

Code

## Context

Public users can create paid OpenAI, Modal, storage, and optional TTS work. PRD Phase 5 requires a global kill switch, per-user and per-IP limits, max audio guardrails, and a usage reservation before provider calls so retries or abuse cannot create uncontrolled spend.

## Implementation

- Add a Supabase migration under `supabase/migrations/` for a content-free usage ledger/reservation model keyed by `clerk_user_id`, trace/job IDs, status, counters, timestamps, and optional reason codes.
- Add server-side policy helpers, preferably in a new focused module such as `server/usage-controls.mjs`, then call them from `server/index.mjs` before `createTranslationJob`, storage upload, Trigger dispatch, or provider work.
- Add env names/defaults in `server/env.mjs` for global kill switch and conservative limits; reject unsafe public secret names as the module already does.
- Ensure final reservation states are released, charged, failed, or adjusted around `server/translation-pipeline.mjs` provider completion/failure paths.
- Return safe quota/maintenance JSON with `reason`, optional `retryAfterSeconds`, and `traceId`; update `lib/types.ts` only if the client needs typed handling.

## Acceptance Criteria

- [ ] Global kill switch rejects authenticated submits before storage, Trigger dispatch, or provider calls.
- [ ] Per-user daily/monthly and per-IP burst limits reject before repeated paid work starts.
- [ ] A durable reservation/ledger entry prevents uncontrolled retries and records terminal state without transcript/audio content.
- [ ] Quota and maintenance responses include safe `reason`, `traceId`, and retry guidance when applicable.
- [ ] Verification covers success, kill switch, user limit, IP burst, and provider-failure adjustment paths without repeatedly invoking paid providers.

## Dependencies

- Depends On: `configure-production-auth-storage-and-providers`
- Blocks: `add-audio-guardrails-and-quota-ux`
- Blocks: `run-production-smoke-test`

## Technical Notes

- The current create route in `server/index.mjs` validates payload, prepares audio, creates a job, uploads storage, and dispatches Trigger; usage checks should happen before that sequence creates paid/provider work.
- `server/translation-pipeline.mjs` records provider runs for OpenAI, Modal, translation, and TTS; use those events for final usage status rather than storing private content.
- `supabase/README.md` requires Clerk ownership keys and server-mediated access; do not use `auth.uid()` policies for this app's current mobile path.
- Exact billing can remain approximate for MVP, but conservative job/audio-byte reservations are better than leaving public launch unbounded.

## Artifact Slots

- `artifacts/usage-controls-contract.md`: implemented schema/API/limit summary and sanitized verification notes.
- `references/source-anchors.md`: server route, pipeline, env, migration, and PRD anchors.
- `resources/usage-controls-test-matrix.md`: kill-switch/quota verification matrix.
- `notes/limit-threshold-decisions.md`: threshold and cost-owner decisions.
