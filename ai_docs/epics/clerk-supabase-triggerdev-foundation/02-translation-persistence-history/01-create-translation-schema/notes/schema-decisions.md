# Schema Decisions

- The schema is optimized for the current synchronous route and the future async Trigger.dev route.
- `translation_jobs` is the durable envelope and status owner.
- `translation_results` is the user-visible final output.
- `provider_runs` is the provider audit trail.
- RLS stays enabled, but mobile-facing policies are not added in this epic because the Express API owns Supabase access through the service-role key.
- Cost fields are optional for now. Epic 04 will add usage controls and cost accounting.
