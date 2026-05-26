# Epic 01: Legal, Privacy, And Consent

## Goal

Make data handling explicit, public, and visible in the app before any production submission or public user processing.

## Scope

- Publish or link privacy, terms, deletion, AI processing disclosure, and support URLs.
- Add in-app legal surfaces.
- Persist required consent versions server-side.
- Gate first audio submission until consent is accepted.
- Update privacy inventory and release copy after implementation decisions are final.

## Tasks

1. `01-publish-legal-policy-sources`
2. `02-add-in-app-legal-surfaces`
3. `03-add-consent-persistence`
4. `04-gate-first-audio-submit-on-consent`
5. `05-update-privacy-inventory-and-release-copy`

## Dependencies

- Depends On: `00-submission-baseline-and-app-store-inventory/write-submission-baseline-evidence`

## Exit Criteria

- Fresh users cannot submit audio until current consent is accepted.
- Legal URLs are public and linked from the app.
- The privacy inventory matches actual data flows and avoids overpromising third-party provider deletion.

<!-- ENRICHED-OVERVIEW-START -->
## Enriched Overview

### Scope

This epic establishes the legal, privacy, and consent foundation for public iOS App Store readiness. The work starts with public legal/support URL decisions, wires those URLs into authenticated mobile surfaces, persists versioned consent by Clerk user ID on the server, enforces consent before audio storage/Trigger/provider work, and closes by reconciling release copy with the App Store privacy data inventory.

### Task Summary

| # | Slug | Type | Summary | Key Dependencies |
|---|---|---|---|---|
| 1 | `publish-legal-policy-sources` | Infrastructure | Define public policy/support URL sources and provider-retention boundaries for Privacy, Terms, Data Deletion, AI Disclosure, and Support. | Epic 00 baseline evidence; PRD privacy inventory; Apple privacy/account guidance. |
| 2 | `add-in-app-legal-surfaces` | UI | Add configured legal URLs to `lib/config.ts`, expose Account -> Legal/Privacy UI, and surface missing URL blockers. | `publish-legal-policy-sources`; `app/account.tsx`; `app/_layout.tsx`; Expo public env/link-opening patterns. |
| 3 | `add-consent-persistence` | Migration | Add server-mediated `user_consents` persistence and consent read/accept APIs keyed only by verified Clerk user ID. | `publish-legal-policy-sources`; Supabase migration patterns; `server/index.mjs`; `server/db.mjs`. |
| 4 | `gate-first-audio-submit-on-consent` | Code | Gate record/upload submit in the client and enforce required consent server-side before job creation, storage, Trigger dispatch, or provider calls. | `add-consent-persistence`; `add-in-app-legal-surfaces`; `lib/api.ts`; `app/translate.tsx`; all submit aliases. |
| 5 | `update-privacy-inventory-and-release-copy` | Code | Update privacy inventory and release copy so App Store labels, legal copy, and implemented behavior match. | `gate-first-audio-submit-on-consent`; `12-app-store-privacy-data-inventory.md`; Epic 05 submission package tasks. |

### Execution Notes

- Shared files likely touched by multiple tasks: `lib/config.ts`, `lib/api.ts`, `app/account.tsx`, `app/_layout.tsx`, `app/signup.tsx`, `app/translate.tsx`, `server/index.mjs`, new consent server module(s), and Supabase migrations.
- Consent enforcement must be server-side. Client gating is UX only; the server must reject missing/outdated consent before creating translation rows, uploading original audio, dispatching Trigger, or running providers.
- Keep all provider/service credentials server-side. `EXPO_PUBLIC_*` values may include public legal URLs and release flags only.
- Preserve diagnostic usefulness for QA while keeping artifacts secret-safe: use trace IDs, job IDs, run IDs, statuses, counts, and filenames only when appropriate; do not include tokens, full transcripts, private audio contents, or generated audio bytes.
- Open release-owner decisions remain: final public URL host, support contact, provider retention wording, consent version authority, and whether legal pages are repo-local sources or externally managed.
<!-- ENRICHED-OVERVIEW-END -->
