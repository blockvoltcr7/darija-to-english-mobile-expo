2026-05-21

- Added `server/artifacts.mjs` as the server-owned repository for `translation_artifacts`.
- All user-owned lookups and updates require both `job_id` or artifact ID and `clerk_user_id`.
- The repository normalizes rows into safe JavaScript objects and never returns audio bytes, provider secrets, Clerk tokens, or Supabase credentials.
- Duplicate idempotency races are handled by looking up the existing row and either reusing a successful artifact or marking a non-success row running again.
