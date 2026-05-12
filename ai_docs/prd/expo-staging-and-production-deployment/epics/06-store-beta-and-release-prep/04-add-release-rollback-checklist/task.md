# Task 04: Add Release Rollback Checklist

## Type

Code

## Context

Release readiness needs rollback guidance across mobile builds, EAS Update channels, API host deployment, and Trigger worker deployment. A store beta or production release should not rely on memory.

## Implementation

- Create or update `ai_docs/deployment/release-checklist.md`.
- Include rollback sections for:
  - mobile build/channel.
  - EAS Update if used.
  - API host deploy.
  - Trigger.dev worker deploy.
  - environment variable mistakes.
  - provider outage or Modal/OpenAI failure.
- Include a pre-release checklist referencing staging E2E evidence and usage-control readiness.

## Acceptance Criteria

- Release checklist exists.
- Rollback steps cover mobile, API, Trigger, and config.
- Checklist references staging E2E QA evidence.
- Checklist warns that wider beta/public release should wait for usage controls.

## Dependencies

- Depends On: create-store-beta-builds
- Depends On: document-production-api-path

## Technical Notes

- Be direct about what can and cannot be rolled back quickly.
- Keep user-facing release notes separate from internal rollback docs.

## Artifact Slots

- `artifacts/`: checklist review notes.
- `references/`: EAS, API host, Trigger, and PRD docs.
- `resources/`: release command checklist.
- `notes/`: rollback assumptions and gaps.

