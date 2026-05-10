# Task 04: Add Trigger.dev Project Config

## Type

Infrastructure

## Context

Trigger.dev will execute long-running provider workflows, while Supabase remains the durable state store.

## Implementation

- Add the Trigger.dev package/config plan.
- Define task file location and required environment variables.
- Document local and hosted Trigger.dev execution expectations.

## Acceptance Criteria

- Trigger.dev config location is defined.
- Required env vars are documented.
- Secrets remain server/worker-side only.

## Dependencies

- Depends On: add-server-side-audio-storage-flow

## Technical Notes

- Reference: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/04-triggerdev-event-workflow.png`.
- Do not implement the translation task here.

## Artifact Slots

- `artifacts/`: config snippets or dashboard setup notes.
- `references/`: Trigger.dev docs and event workflow visual.
- `resources/`: local run commands.
- `notes/`: task location and environment decisions.
