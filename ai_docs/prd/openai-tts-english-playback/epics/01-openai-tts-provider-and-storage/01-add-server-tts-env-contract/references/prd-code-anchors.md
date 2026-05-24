# PRD And Code Anchors

## PRD Alignment

- `06-technical-specifications.md`: defines `ENABLE_TTS`, `TTS_PROVIDER`, `TTS_LANGUAGE`, `TTS_RESPONSE_FORMAT`, `OPENAI_TTS_MODEL`, and `OPENAI_TTS_VOICE`.
- `03-product-goals-success-metrics.md`: requires no client-side provider secrets.
- `11-definition-of-done.md`: requires server env support without exposing secrets through `EXPO_PUBLIC_*`.

## Repo Anchors

- `server/env.mjs`: current env parser, default handling, numeric validation, and public-secret guards live here.
- `AGENTS.md`: public EAS env must only contain mobile-safe values such as API base URL and Clerk publishable key.
- `.env.example`: update key names only if this repo already tracks safe placeholders there.

## Execution Notes

- Reuse `OPENAI_API_KEY`; do not create a TTS-specific mobile key.
- `ENABLE_TTS` must default false so existing translation QA keeps its current behavior.
