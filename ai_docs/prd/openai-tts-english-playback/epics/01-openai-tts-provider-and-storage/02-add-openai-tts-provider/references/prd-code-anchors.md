# PRD And Code Anchors

## PRD Alignment

- `06-technical-specifications.md`: source for OpenAI speech request fields, default instruction, output format, empty-text guard, and long-text MVP behavior.
- `11-definition-of-done.md`: targets `gpt-4o-mini-tts`, voice `marin`, and server-only provider execution.
- `10-risk-assessment.md`: full English text should not be copied into logs or durable evidence.

## Repo Anchors

- `server/translation-pipeline.mjs`: existing OpenAI client initialization and safe provider-call logging pattern.
- `server/env.mjs`: TTS provider helper should read model, voice, and format from env config.
- `package.json`: OpenAI SDK dependency is already present.

## Execution Notes

- Return `Buffer` plus safe metadata; do not return the raw OpenAI SDK response.
- Provider errors should be mappable to artifact failure fields without failing text translation later.
