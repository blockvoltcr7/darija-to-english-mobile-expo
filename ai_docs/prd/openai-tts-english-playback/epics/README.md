# OpenAI TTS English Playback Epics

Date: 2026-05-21

## Goal

Add server-generated OpenAI text-to-speech playback for completed English translations while preserving the existing Darija-to-English text workflow.

The implementation keeps paid provider calls and private storage server-side, exposes only authenticated playback to the owning Clerk user, and treats TTS as an enhancement: text translation success must not depend on audio generation success.

## Source PRD

- `ai_docs/prd/openai-tts-english-playback/README.md`
- `ai_docs/prd/openai-tts-english-playback/05-architecture-plan.md`
- `ai_docs/prd/openai-tts-english-playback/06-technical-specifications.md`
- `ai_docs/prd/openai-tts-english-playback/07-ui-component-changes.md`
- `ai_docs/prd/openai-tts-english-playback/09-implementation-phases.md`
- `ai_docs/prd/openai-tts-english-playback/11-definition-of-done.md`

## Architecture Rules

- The mobile app must not call OpenAI directly.
- `OPENAI_API_KEY` and Supabase service credentials stay in server and Trigger.dev runtimes.
- Generated audio is private user data and must be protected by the same Clerk ownership boundary as translation text.
- TTS runs only after the English text result has been written.
- TTS failure must not hide or downgrade the completed text translation.
- Playback must go through an authenticated API route, not public Supabase object URLs.
- No `.env` values, Clerk tokens, private audio bytes, or full provider transcripts should be copied into docs or artifacts.

## Epic Order

1. `00-artifact-schema-and-repository/`
2. `01-openai-tts-provider-and-storage/`
3. `02-pipeline-tts-integration/`
4. `03-api-response-and-playback/`
5. `04-mobile-playback-ui/`
6. `05-qa-docs-and-release-verification/`

## Structural Changes From PRD

- Split Phase 1 into migration, repository, and provider-run contract tasks so schema/security work can be reviewed separately from JavaScript helpers.
- Split Phase 2 into env, OpenAI provider, provider router/idempotency, and storage helpers because each has a different trust boundary.
- Split Phase 4 into response shape, playback route, and owner-only verification to keep metadata mapping separate from byte-serving access control.
- Split Phase 5 into client types/API mapping, playback helper, result screen UI, and history UI so the mobile behavior can be validated incrementally.
- Split Phase 6 into docs, static/API checks, fresh-user QA, and negative-path QA so release evidence is explicit.

## Task Folder Contract

Each epic uses folder-shaped tasks:

```text
<epic-folder>/
  epic-overview.md
  01-task-slug/
    task.md
    artifacts/
    references/
    resources/
    notes/
```

`task.md` is the canonical seeded task spec. These folders are not prepared for execution yet; run `prepare-epic <epic_folder>` on one epic folder when ready.

