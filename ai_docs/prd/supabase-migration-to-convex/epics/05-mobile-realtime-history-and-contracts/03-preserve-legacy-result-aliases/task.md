# Task 03: Preserve Legacy Result Aliases

## Type

Code

## Context

The UI and older contracts still use aliases such as `transcript`, `translation`, `transcripts.openai`, `transcripts.darija`, and `transcripts.modal`. Removing them during infrastructure migration risks silent UI regressions.

## Implementation

- Add a mapper from Convex translation detail to the existing `TranslationResult` shape.
- Preserve `jobId` and `translationJobId`.
- Preserve `transcript = consolidatedArabicText`.
- Preserve `translation = englishText`.
- Preserve `asr`, `darija_asr`, and `openai_asr` metadata shapes.

## Acceptance Criteria

- Existing result sections render without UI rewrites.
- Raw OpenAI, raw Darija, consolidated Darija, English translation, and metadata remain visible.
- TypeScript catches missing alias fields.
- A later cleanup can remove aliases intentionally, not accidentally.

## Dependencies

- `port-history-to-convex`

## Validation Commands

```bash
npm run typecheck
npm run lint
```

## Artifact Slots

- `artifacts/`: result shape parity sample.
- `references/`: old `TranslationResult` contract.

