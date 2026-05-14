# Trigger Environment Checklist Template

Execution-time artifact. Fill this only while configuring Trigger.dev.

## Trigger Project

- Project ref:
- Environment checked:
- CLI/user account:
- Date/time:

## Secret Presence

Do not paste values.

- [ ] `TRIGGER_SECRET_KEY`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SECRET_KEY` or accepted fallback
- [ ] `OPENAI_API_KEY`
- [ ] `DARIJA_ASR_BASE_URL` or `DARIJA_ASR_URL`
- [ ] `DARIJA_ASR_API_KEY`
- [ ] model override variables reviewed

## Compatibility

- [ ] Worker targets same staging Supabase resources as Cloud Run API.
- [ ] Worker can access private storage buckets used by queued jobs.
- [ ] Environment label matches deploy command target.

## Blockers

- Command:
- Sanitized error:
- Owner:
- Next action:
