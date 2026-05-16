# Task 01: Verify Implementation Base

## Type

Planning

## Context

The current branch is stale relative to the richer Clerk/Supabase/Trigger implementation. Starting from it would force a reimplementation of auth, async jobs, and history before the Convex migration can even begin.

## Implementation

- Compare `git status --short --branch` with `origin/main`.
- Verify `origin/main` contains Clerk route split, history, async `/v1/translations`, Supabase persistence, and Trigger.dev scripts.
- Create a new implementation branch from the confirmed base.
- Record any untracked local-only directories that should not be copied blindly.

## Acceptance Criteria

- A single implementation base branch is selected.
- The current branch mismatch is documented.
- The new branch contains the rich app state needed for migration.
- `refs/` remains untouched.

## Dependencies

- None.

## Validation Commands

```bash
git status --short --branch
git show origin/main:package.json | rg "clerk|supabase|trigger"
git show origin/main:server/index.mjs | rg "v1/translations|requireClerkSession|translateAudioJob"
```

## Artifact Slots

- `artifacts/`: branch comparison summary.
- `notes/`: local untracked files that must be preserved or ignored.

