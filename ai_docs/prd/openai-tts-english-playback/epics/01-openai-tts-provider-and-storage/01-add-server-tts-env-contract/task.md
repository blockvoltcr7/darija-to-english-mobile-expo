# Task 01: Add Server TTS Env Contract

## Type

Infrastructure

## Context

TTS must be feature-flagged and fully server-side. The PRD defines `ENABLE_TTS=false`, `TTS_PROVIDER=openai`, `TTS_LANGUAGE=en`, `TTS_RESPONSE_FORMAT=aac`, `OPENAI_TTS_MODEL=gpt-4o-mini-tts`, and `OPENAI_TTS_VOICE=marin`.

No TTS credential or server-only setting may be exposed as `EXPO_PUBLIC_*`.

## Implementation

- Update `server/env.mjs` with TTS env parsing and defaults.
- Validate supported MVP values: provider `openai`, language `en`, response formats `aac` and `mp3`.
- Reuse `OPENAI_API_KEY` for OpenAI TTS calls; do not introduce a mobile-visible secret.
- Ensure invalid config fails early with a clear server-side error.
- Add a guard or review note that TTS config must not be declared as `EXPO_PUBLIC_*`.

## Acceptance Criteria

- [ ] `ENABLE_TTS` defaults to false.
- [ ] OpenAI TTS model defaults to `gpt-4o-mini-tts`.
- [ ] OpenAI TTS voice defaults to `marin`.
- [ ] Response format accepts `aac` and `mp3` only for MVP.
- [ ] No TTS server secret or provider credential is exposed through public Expo env.

## Dependencies

- Depends On: 00-artifact-schema-and-repository/create-translation-artifacts-migration
- Blocks: add-openai-tts-provider

## Technical Notes

- `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` remain the only expected mobile-safe public values for this feature area.
- Production env values should wait until a production API URL exists, per root `AGENTS.md`.

## Artifact Slots

- `artifacts/`: env validation output and safe config summary with no secret values.
- `references/`: PRD env spec and `server/env.mjs` conventions.
- `resources/`: sample non-secret `.env.local` key names, not values.
- `notes/`: config default decisions and invalid-config behavior.

