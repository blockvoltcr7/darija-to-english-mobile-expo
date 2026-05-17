# Release Checklist Review Template

Template only. Fill this after `ai_docs/deployment/release-checklist.md` exists and has been reviewed.

## Review Metadata

- Reviewer:
- Date:
- Git commit:
- Checklist path:
- Related EAS build IDs:
- Related API revision:
- Related Trigger deployment/version:

## Coverage Review

- [ ] Pre-release snapshot includes Git commit, EAS build IDs, API revision, Trigger version, and staging E2E evidence link.
- [ ] Mobile store build rollback explains what cannot be quickly rolled back.
- [ ] EAS Update rollback covers previous update, embedded update, channel/branch targeting, and runtime compatibility.
- [ ] API host rollback includes Cloud Run revision traffic command and `/health` verification.
- [ ] Trigger rollback explains deployed-version rollback and active-run cancel/replay decision.
- [ ] Environment mistake section separates mobile public env, API host env/secrets, Trigger env, and provider env.
- [ ] Provider outage section covers Modal/OpenAI failure capture without private audio, transcripts, tokens, or secrets.
- [ ] Usage-control gate warns against wider beta/public release before Epic 04 readiness.
- [ ] User-facing release notes remain separate from internal rollback instructions.

## Findings

| Severity | Finding | Owner | Follow-up |
| --- | --- | --- | --- |
|  |  |  |  |

## Sanitized Evidence Links

- Staging E2E evidence:
- API health output location:
- Store beta status:
- Trigger run/deploy reference:

## Redaction Check

- [ ] No Clerk session tokens.
- [ ] No API keys or service-role keys.
- [ ] No private audio contents.
- [ ] No full private transcripts.
- [ ] No raw `.env` output.
