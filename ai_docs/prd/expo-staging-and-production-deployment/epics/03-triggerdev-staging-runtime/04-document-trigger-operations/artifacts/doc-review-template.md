# Trigger Operations Doc Review Template

Execution-time artifact. Fill after creating or updating `ai_docs/deployment/triggerdev.md`.

## Coverage

- [ ] Runtime shape explained.
- [ ] Development worker command included.
- [ ] Paid Staging/Preview environments marked deferred.
- [ ] Production deploy path documented as deferred or explicit.
- [ ] Required env vars listed by name only.
- [ ] Job/run correlation explained.
- [ ] Queued-job troubleshooting included.
- [ ] Provider/Supabase/auth failure modes included.

## Source Alignment

- [ ] Matches `trigger.config.mjs`.
- [ ] Matches `package.json` scripts.
- [ ] Matches `server/index.mjs` API dispatch contract.
- [ ] Matches verified development-runtime run evidence.
- [ ] Links to `ai_docs/deployment/api-hosting.md`.

## Redaction

- [ ] No secret values.
- [ ] No Clerk session tokens.
- [ ] No private audio contents.
- [ ] No full private transcripts.
