# Decide Production Resource Isolation

## Type

Infrastructure

## Context

App Store release-readiness requires the public iOS build to use a production runtime rather than the current staging/local-worker path. PRD Phase 3 requires production Cloud Run, Trigger.dev, Clerk, Supabase, Modal, and OpenAI decisions; the risk assessment calls out queued production jobs, privacy-label drift, provider cost spikes, and shared-resource ambiguity as release blockers.

## Implementation

- Create `artifacts/production-resource-isolation-matrix.md` from the matrix in `resources/resource-isolation-checklist.md`; record decisions for Cloud Run, Trigger.dev, Clerk, Supabase, OpenAI, Modal, and EAS public env without secret values.
- Use `ai_docs/deployment/production-api.md`, `ai_docs/deployment/triggerdev.md`, `.env.example`, and `server/env.mjs` as the source map for runtime/env boundaries.
- Mark each dependency as separate production, shared-with-risk, deferred, or blocked; include owner, release impact, privacy-label/legal impact, quota/spend owner, and the next task it unblocks.
- Keep unresolved human-owned portal work in `notes/provider-account-blockers.md`.

## Acceptance Criteria

- [ ] `artifacts/production-resource-isolation-matrix.md` covers Cloud Run, Trigger.dev, Clerk, Supabase, OpenAI, Modal, and EAS production public env.
- [ ] Every row has a decision, owner, release impact, privacy/legal impact, and blocker or next action.
- [ ] Decisions distinguish mobile-safe public values from server-only secret names.
- [ ] Any reuse of staging/shared resources is explicitly labeled as a risk accepted by the release owner.
- [ ] No provider dashboard screenshots, secret values, Clerk tokens, private audio, transcripts, or `.env` contents are captured.

## Dependencies

- Depends On: `00-submission-baseline-and-app-store-inventory/write-submission-baseline-evidence`
- Blocks: `deploy-production-cloud-run-api`
- Blocks: `configure-production-auth-storage-and-providers`

## Technical Notes

- `ai_docs/deployment/production-api.md` currently says no production API URL is verified and production EAS env must wait for that URL.
- `.env.example` names production-sensitive vars; `server/env.mjs` rejects public Expo env names that look like Supabase, Trigger, or provider secrets.
- The mobile app must only receive `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` style values; OpenAI, Modal, Supabase service-role/secret, Trigger, and Clerk secret keys stay server-side.
- Treat `refs/` as read-only; resource decisions must reflect this app's current Express + Supabase + Trigger architecture.

## Artifact Slots

- `artifacts/production-resource-isolation-matrix.md`: final sanitized decision matrix.
- `references/source-anchors.md`: local PRD, deployment, and code anchors.
- `resources/resource-isolation-checklist.md`: blank matrix/checklist for execution.
- `notes/provider-account-blockers.md`: human-owned account, quota, and support blockers.
