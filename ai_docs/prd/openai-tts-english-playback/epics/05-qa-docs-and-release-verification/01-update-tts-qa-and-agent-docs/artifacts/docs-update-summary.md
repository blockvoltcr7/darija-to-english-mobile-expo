2026-05-21

Docs updated:

- `ai_docs/fresh-clerk-user-qa.md`: added `ENABLE_TTS=true` API startup, TTS playback checks, history playback check, TTS failure fallback check, and safe evidence rules.
- `server/AGENTS.md`: updated Trigger pipeline steps with optional TTS artifact generation, text-first completion semantics, server-side TTS boundary, TTS env defaults, and log evidence expectations.
- `AGENTS.md`: updated cross-domain workflow and fresh Clerk user QA acceptance path with optional TTS metadata/playback and privacy boundaries.

Privacy review:

- No `.env` values, API keys, Clerk session tokens, private audio contents, full transcripts, or generated audio bytes were added.
