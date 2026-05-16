# Epic 02: Convex Data Model And Access Control

## Objective

Replace Supabase Postgres tables and RLS assumptions with Convex schema, indexes, queries, mutations, internal mutations, and explicit auth checks.

## Scope

- Define Convex tables.
- Port profile and Clerk webhook state.
- Port translation job/result/provider-run repository behavior.
- Add access-control tests and review artifacts.

## Out Of Scope

- Moving audio storage.
- Changing Trigger.dev orchestration.
- Removing Supabase dependencies.

## Tasks

| # | Task | Type | Depends On |
| --- | --- | --- | --- |
| 01 | `define-convex-schema` | Code | Epic 01 |
| 02 | `port-profile-and-webhook-functions` | Code | `define-convex-schema` |
| 03 | `port-translation-repository-functions` | Code | `define-convex-schema` |
| 04 | `add-auth-and-internal-access-tests` | Code | `port-profile-and-webhook-functions`, `port-translation-repository-functions` |

## Verification

- Convex schema covers Supabase app tables.
- Public functions derive ownership from auth.
- Worker/server functions use internal or secret-protected paths.

