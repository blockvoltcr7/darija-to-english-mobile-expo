2026-05-21

- Added `supabase/migrations/20260521204700_create_translation_artifacts.sql`.
- The table stores metadata only; generated audio bytes stay in private Supabase Storage.
- RLS is enabled with `anon` and `authenticated` revoked. Server and Trigger.dev workflows use `service_role` through the existing admin client.
- Artifact rows cascade with `translation_jobs` through `job_id references public.translation_jobs(id) on delete cascade`.
