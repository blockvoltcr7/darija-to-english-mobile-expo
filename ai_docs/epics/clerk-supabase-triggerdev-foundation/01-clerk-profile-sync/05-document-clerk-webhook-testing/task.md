# Task 05: Document Clerk Webhook Testing

## Type

Code

## Context

Profile sync is not trustworthy until a developer can test both delivery modes: Clerk webhook delivery and lazy authenticated API upsert. The webhook path depends on a reachable API URL, Clerk dashboard configuration, a server-only signing secret, and repeatable replay behavior. Epic 01 needs these instructions before final verification can be run without guessing.

This task creates the testing handoff for local, hosted, and replay scenarios. It should document how to test the webhook endpoint without leaking secrets or requiring direct mobile-to-Supabase access.

## Implementation

- Add a task-local guide such as `resources/clerk-webhook-testing.md` or a docs file chosen by the executor if a broader docs location is already established.
- Document local testing with a tunnel or Clerk-supported local delivery workflow, pointing the webhook URL to `/v1/webhooks/clerk`.
- Document hosted setup with the production API URL, event selection, and `CLERK_WEBHOOK_SIGNING_SECRET` configuration.
- Include test coverage for `user.created`, `user.updated`, `user.deleted`, invalid signatures, and duplicate event replay.
- Include Supabase MCP verification queries for project `npjsersrmvltoxmqdkzd` that confirm `profiles` and `clerk_webhook_events` changed as expected.
- Add cleanup guidance for disposable test Clerk users and test rows.

## Acceptance Criteria

- [ ] The guide explains how to test `user.created`, `user.updated`, and `user.deleted` locally.
- [ ] The guide explains hosted/prod webhook setup and where `CLERK_WEBHOOK_SIGNING_SECRET` belongs.
- [ ] The guide documents invalid-signature expectations and duplicate event replay expectations.
- [ ] Verification steps use Supabase MCP with `project_id: npjsersrmvltoxmqdkzd` for live DB checks.
- [ ] No real Clerk tokens, webhook secrets, Supabase keys, or user PII are included.
- [ ] The guide clearly separates webhook testing from mobile authenticated API testing.

## Dependencies

- Depends On: add-clerk-webhook-endpoint
- Blocks: verify-profile-sync-end-to-end

## Technical Notes

- Use `server/AGENTS.md` and `.env.example` for local API and env naming conventions.
- The docs should mention `/health` can confirm server dependencies but does not prove webhook signature verification.
- The docs should explain that a normal `curl` body without valid Clerk/Svix signature headers should fail.
- Do not ask developers to use a Supabase local stack. Live DB verification goes through Supabase MCP against `npjsersrmvltoxmqdkzd`.

## Artifact Slots

- `artifacts/`: sanitized webhook testing screenshots or command output.
- `references/`: current Clerk webhook docs link and endpoint implementation notes.
- `resources/`: testing guide, sample payloads, replay commands, and MCP verification SQL.
- `notes/`: environment setup notes, tunnel URL caveats, hosted URL decisions.
