# Writer Decisions

- Keep translation persistence in `server/translations.mjs`, parallel to `server/profiles.mjs`.
- Keep API route handlers focused on orchestration, not table-specific Supabase calls.
- Treat persistence failures as server errors because history integrity is now part of the product contract.
- Do not silently ignore DB write failures unless a later task explicitly introduces best-effort audit logging.
