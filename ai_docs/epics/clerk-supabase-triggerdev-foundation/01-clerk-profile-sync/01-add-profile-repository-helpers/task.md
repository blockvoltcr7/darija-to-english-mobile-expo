# Task 01: Add Profile Repository Helpers

## Type

Code

## Context

Epic 01 guarantees that every Clerk-authenticated user resolves to an app-owned Supabase `profiles` row. The epic package README and `05-clerk-supabase-auth-solidification-plan.md` define Clerk as the identity source and `profiles.clerk_user_id` as the durable ownership key. Epic 00 already created the Clerk-native `public.profiles` table and server-only Supabase client for project `npjsersrmvltoxmqdkzd`.

This task creates the reusable server repository boundary used by the lazy authenticated-request path and the Clerk webhook path. It must not reintroduce `auth.users`, `auth.uid()`, direct mobile Supabase access, or webhook signature handling.

## Implementation

- Add a focused server-only module such as `server/profiles.mjs`; keep `server/db.mjs` as the Supabase client factory.
- Import `getSupabaseAdminClient()` from `server/db.mjs` and write helpers against `public.profiles`.
- Define helper signatures around Clerk IDs and Clerk user payloads:
  - `getOrCreateProfile({ clerkUserId, primaryEmail, displayName, imageUrl })`
  - `upsertProfileFromClerkUser(clerkUser)`
  - `softDeleteProfile(clerkUserId)`
- Normalize Clerk user data into `clerk_user_id`, `primary_email`, `display_name`, and `image_url`; reset `deleted_at` to `null` on create/update.
- Return the resolved profile row or a minimal profile object containing at least `id` and `clerk_user_id`.
- Wrap Supabase errors in server-safe errors that do not include secrets or full payloads.

## Acceptance Criteria

- [ ] `server/profiles.mjs` or equivalent exports idempotent profile helpers keyed only by `clerk_user_id`.
- [ ] `getOrCreateProfile` can be called repeatedly for the same Clerk user ID without creating duplicate rows.
- [ ] `upsertProfileFromClerkUser` maps Clerk user lifecycle payloads to `primary_email`, `display_name`, and `image_url`.
- [ ] `softDeleteProfile` sets `deleted_at` for the matching Clerk user ID and does not hard-delete rows.
- [ ] No helper queries or task artifacts reference `auth.users`, `profiles.user_id`, or `auth.uid()`.
- [ ] Helpers use the server-only Supabase admin client and are not importable from `app/` or `lib/`.

## Dependencies

- Depends On: 00-clerk-native-db-foundation/add-server-supabase-db-client
- Blocks: call-profile-upsert-after-clerk-verification
- Blocks: add-clerk-webhook-endpoint

## Technical Notes

- Existing Supabase entry point: `server/db.mjs` exports `SUPABASE_PROJECT_REF = 'npjsersrmvltoxmqdkzd'`, `getSupabaseAdminClient()`, and `checkSupabaseConnection()`.
- Existing profile schema is documented in `ai_docs/epics/clerk-supabase-triggerdev-foundation/00-clerk-native-db-foundation/foundation-verification.md`.
- Existing authenticated request context is `req.clerkAuth.userId` in `server/index.mjs`.
- Use the sequence visual for placement: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/03-authenticated-translation-sequence.png`.
- Live DB verification, if performed during this task, must use Supabase MCP with `project_id: npjsersrmvltoxmqdkzd`; do not use a local Supabase stack.
- Keep webhook event storage and signature verification out of this task.

## Artifact Slots

- `artifacts/`: helper smoke output, sanitized Supabase query results, or implementation review notes.
- `references/`: profile schema reference, authenticated sequence diagram path, and server DB client notes.
- `resources/`: sample Clerk user payload shapes with secrets removed.
- `notes/`: normalization decisions for email, display name, image URL, and soft-delete behavior.
