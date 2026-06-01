# Supabase Live Inventory Gate - 2026-06-01

## Purpose

The migration plan requires a live inventory before deciding whether to backfill historical Supabase data into Convex.

## Current Result

- Branch: `codex/convex-migration-off-supabase`
- Inventory attempt: local read-only Supabase table/storage count probe
- Result: probe did not return before timeout and was stopped
- Sensitive data copied: none

## Required Follow-Up Before Final Decommission

- Re-run inventory through a reliable Supabase SQL/MCP path.
- Capture only counts for `profiles`, `clerk_webhook_events`, `translation_jobs`, `translation_results`, `provider_runs`, `translation_artifacts`, and private storage buckets.
- If all counts are zero, proceed with fresh Convex cutover.
- If rows or objects exist, create a backfill plan before deleting Supabase project resources.
