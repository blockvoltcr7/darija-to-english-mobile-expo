# Production Apply - 2026-05-10

## Scope

- Supabase MCP migration: `add_db_local_updated_at_trigger`
- Target project ref / MCP `project_id`: `npjsersrmvltoxmqdkzd`
- Apply method: Supabase MCP `apply_migration`
- Local Supabase stack: not used

## Result

Supabase MCP `apply_migration` returned success for `add_db_local_updated_at_trigger`.

The migration created:

- `public.set_updated_at()`
- `public.profiles` trigger `profiles_set_updated_at`
- trigger timing: `BEFORE UPDATE`
- trigger level: `FOR EACH ROW`

Security advisors then flagged `public.set_updated_at()` for a mutable `search_path`. A follow-up Supabase MCP migration, `harden_set_updated_at_search_path`, replaced the function with `SET search_path TO ''`.

## Verification

Production verification through Supabase MCP confirmed:

- `public.set_updated_at()` function count: `1`
- `public.set_updated_at()` has `SET search_path TO ''`
- `public.profiles.profiles_set_updated_at` exists
- trigger definition: `CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at()`
- `auth.users` trigger count using `public.set_updated_at()`: `0`
- updating a temporary profile row changed `updated_at`
- temporary verification rows were deleted
- remaining temporary rows: `0`
- post-hardening security advisors no longer report `function_search_path_mutable` for `public.set_updated_at()`

The first verification attempt used one SQL statement, which was not a valid timestamp-increase check because `now()` is transaction-scoped. The final verification used separate MCP statements for insert, update, and cleanup.

Remaining advisor items after hardening:

- `public.profiles` has RLS enabled with no policies. This is intentional for the current server-mediated architecture.
- `public.rls_auto_enable()` has unrelated security-definer warnings. This existed outside the Epic 00 profile/trigger scope and was not changed here.
