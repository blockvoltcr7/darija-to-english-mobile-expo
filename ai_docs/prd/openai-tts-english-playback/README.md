# OpenAI TTS English Playback PRD

Generated: 2026-05-21

## Purpose

Define an implementation-ready plan for adding OpenAI text-to-speech after the
Moroccan Darija-to-English translation result is complete.

## Source Context

- Research package: `ai_docs/text-to-speech-research/`
- Current API entrypoint: `server/index.mjs`
- Current provider pipeline: `server/translation-pipeline.mjs`
- Current Trigger task: `trigger/translate-audio-job.mjs`
- Current persistence helpers: `server/translations.mjs`
- Current storage helpers: `server/storage.mjs`
- Current mobile API client: `lib/api.ts`
- Current mobile result UI: `app/translate.tsx`
- Current history UI: `app/history.tsx`
- Current result types: `lib/types.ts`

## Pages

| Page | Purpose |
| --- | --- |
| `01-executive-summary.md` | What we are building, why, and scope boundaries. |
| `02-problem-statement.md` | Current vs target behavior and missing pieces. |
| `03-product-goals-success-metrics.md` | Product goals and verifiable success metrics. |
| `04-gap-analysis.md` | Concrete gaps between current implementation and target implementation. |
| `05-architecture-plan.md` | End-to-end backend, storage, API, and mobile architecture. |
| `06-technical-specifications.md` | Exact contracts, schema, env, API, and error shapes. |
| `07-ui-component-changes.md` | Mobile result/history UI changes and TypeScript shape changes. |
| `09-implementation-phases.md` | Ordered implementation phases and dependency graph. |
| `10-risk-assessment.md` | High/medium/low implementation and product risks. |
| `11-definition-of-done.md` | Completion criteria and key decisions. |

## Handoff

Next workflow step:

```bash
seed-epics ai_docs/prd/openai-tts-english-playback
```
