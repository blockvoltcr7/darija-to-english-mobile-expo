# Task 07: Add Foundation Verification Docs

## Type

Code

## Context

The foundation needs explicit checks before profile sync and translation persistence build on it. The verification should prove the schema is Clerk-native, `updated_at` is database-owned, server secrets remain server-side, and the API can reach Supabase through the server-only client.

This task closes Epic 00 readiness for Epic 01. It should produce executable docs and repeatable commands, not just a prose summary.

All live Supabase verification must target project ref / MCP `project_id` `npjsersrmvltoxmqdkzd`.

## Implementation

- Add a foundation verification doc under `ai_docs/epics/clerk-supabase-triggerdev-foundation/00-clerk-native-db-foundation/` or the task's `resources/` folder, and link any reusable task-local SQL.
- Include static code checks:
  - `node --check server/env.mjs`
  - `node --check server/db.mjs`
  - `node --check server/index.mjs`
  - `npm run typecheck`
  - `npm run lint`
- Include API checks:
  - `npm run api`
  - `curl http://localhost:8787/health`
  - expected `/health` includes model names and a Supabase configured boolean, but no secret values.
- Include DB shape checks:
  - `profiles.clerk_user_id text not null unique`
  - `profiles.id uuid primary key`
  - no `profiles.user_id` unless a non-empty-table migration explicitly justified it
  - no FK from `profiles` to `auth.users`
  - RLS enabled
  - no `profiles` policy using `auth.uid()`
- Include trigger checks:
  - `public.set_updated_at()` exists
  - `public.profiles` has the `before update` trigger
  - updating a profile changes `updated_at`
  - no new trigger exists on `auth.users`
- Include secret-boundary checks:
  - `.env.example` has server-only Supabase variables without `EXPO_PUBLIC_`
  - `app/` and `lib/` do not import `server/env.mjs` or `server/db.mjs`
  - logs and `/health` do not print secret values
- Include Supabase migration checks:
  - migration files exist under `supabase/migrations/`
  - CLI link, if used, points at `npjsersrmvltoxmqdkzd`
  - Supabase MCP checks, if used, pass `project_id: npjsersrmvltoxmqdkzd`
  - `supabase migration list --local` or the documented fallback was run
  - live migration status is not claimed unless actually applied and verified
- Include notes for physical-device API URL checks where relevant, but do not require mobile UI testing for this DB-only foundation.

## Acceptance Criteria

- [ ] Foundation verification doc exists and is linked from the task or epic overview if appropriate.
- [ ] Checklist includes static code checks, API health checks, DB shape checks, trigger checks, migration checks, and secret-boundary checks.
- [ ] Checklist includes exact commands and expected pass/fail signals.
- [ ] Checklist states that live DB migration completion requires actual apply plus verification output.
- [ ] Checklist requires project ref `npjsersrmvltoxmqdkzd` in live CLI/MCP evidence.
- [ ] Checklist is clear enough for another agent to execute without prior context.
- [ ] No verification step prints secrets.

## Dependencies

- Depends On: add-db-local-updated-at-trigger
- Depends On: add-server-supabase-db-client

## Technical Notes

- Do not mark live DB migration complete unless it has actually been applied and verified.
- This task closes Epic 00 readiness for Epic 01.
- This is a documentation/checklist task; it should not mutate schema unless the executor is intentionally running the documented verification after earlier tasks.
- Use existing AGENTS verification commands from the repo root and subfolders.
- Include `npx expo-doctor` only if mobile config/package changes occurred during the implementation run.
- Keep DB verification results in `artifacts/` when captured.

## Artifact Slots

- `artifacts/`: command outputs from verification and redacted screenshots if useful.
- `references/`: foundation plan, ERD links, and AGENTS verification references.
- `resources/`: repeatable SQL/curl commands and the final verification checklist.
- `notes/`: QA notes, blockers, and live-vs-local verification status.
