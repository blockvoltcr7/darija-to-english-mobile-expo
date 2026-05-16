# Trigger Operations Doc Review Template

Execution-time artifact. Fill after creating or updating `ai_docs/deployment/triggerdev.md`.

## Coverage

- [x] Runtime shape explained.
- [x] Development worker command included.
- [x] Paid Staging/Preview environments marked deferred.
- [x] Production deploy path documented as deferred or explicit.
- [x] Required env vars listed by name only.
- [x] Job/run correlation explained.
- [x] Queued-job troubleshooting included.
- [x] Provider/Supabase/auth failure modes included.

## Source Alignment

- [x] Matches `trigger.config.mjs`.
- [x] Matches `package.json` scripts.
- [x] Matches `server/index.mjs` API dispatch contract.
- [x] Matches verified development-runtime run evidence.
- [x] Links to `ai_docs/deployment/api-hosting.md`.

## Redaction

- [x] No secret values.
- [x] No Clerk session tokens.
- [x] No private audio contents.
- [x] No full private transcripts.
