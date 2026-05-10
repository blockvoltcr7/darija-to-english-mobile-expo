# Task 01: Create Private Storage Buckets

## Type

Infrastructure

## Context

Epic 03 moves original audio and generated artifacts out of request memory and into private Supabase Storage while Supabase Postgres remains the source of truth for ownership and job state. The epic package README defines the milestone as private audio storage plus Trigger.dev job processing, with Clerk identity enforced only through the server. Live Supabase project `npjsersrmvltoxmqdkzd` currently has `storage.buckets` and `storage.objects` available but no bucket rows, so this task establishes the storage boundary before job metadata and upload code exist.

## Implementation

- Use Supabase MCP against project `npjsersrmvltoxmqdkzd` to create or verify two private buckets: `audio-originals` and `translation-artifacts`.
- Set `public = false` for both buckets. Use bucket-level file size and MIME limits as defense in depth, not as the only validation layer.
- Start with server-mediated access only: no mobile-facing Storage policies, no direct `anon`/`authenticated` bucket access, and no public objects.
- Document bucket settings and verification queries in the task artifact. The implementation may use MCP SQL or Storage API helpers, but must not rely on Supabase Auth ownership for access control.
- Capture the chosen MIME allowlist and max file size so Task 03 can mirror the same rules in `server/env.mjs` and `server/storage.mjs`.

## Acceptance Criteria

- [ ] Supabase project `npjsersrmvltoxmqdkzd` has private `audio-originals` and `translation-artifacts` buckets.
- [ ] Bucket settings include explicit `public = false` and documented file-size/MIME decisions.
- [ ] No broad mobile/client Storage policy is created for either bucket.
- [ ] The artifact records the exact MCP/SQL/API verification used to confirm bucket existence and privacy.
- [ ] `.env.example` and downstream task notes continue to keep Supabase secret/service credentials server-side only.

## Dependencies

- Depends On: 02-translation-persistence-history/verify-history-access-controls
- Blocks: add-storage-metadata-to-jobs
- Blocks: add-server-side-audio-storage-flow

## Technical Notes

- Live state checked through Supabase MCP: `storage.buckets` has zero rows before this task.
- Supabase Storage private buckets still use `storage.objects` RLS for normal clients, but server secret/service keys bypass RLS. Product authorization must remain in Express after Clerk verification.
- Prefer `SUPABASE_SECRET_KEY` in `server/env.mjs`; `SUPABASE_SERVICE_ROLE_KEY` is already treated as a legacy fallback.
- Reference visual: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/05-supabase-storage-retention.png`.
- Official docs to reference in artifacts: Supabase Storage bucket fundamentals, bucket creation, Storage access control, file limits, and API keys.

## Artifact Slots

- `artifacts/`: bucket creation evidence, privacy verification output, and live bucket settings.
- `references/`: storage diagram plus links/notes from current Supabase Storage docs.
- `resources/`: MCP SQL/API snippets for bucket creation and inspection.
- `notes/`: server-only access policy decisions, MIME allowlist, max file size, and rollback notes.
