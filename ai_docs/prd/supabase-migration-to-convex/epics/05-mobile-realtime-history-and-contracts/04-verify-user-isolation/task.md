# Task 04: Verify User Isolation

## Type

QA

## Context

The app must preserve fresh Clerk-user behavior and prove Convex auth checks replace Supabase server-mediated filtering correctly.

## Implementation

- Sign out existing simulator user.
- Create a fresh Clerk test user.
- Confirm history is empty.
- Upload a non-sensitive audio fixture.
- Confirm realtime status reaches succeeded.
- Sign into a second user and verify the first user's job is not visible.

## Acceptance Criteria

- Fresh user can translate successfully.
- Fresh user history contains only their own job.
- Second user cannot see the first user's history or detail.
- QA evidence excludes tokens, secrets, and private audio content.

## Dependencies

- `preserve-legacy-result-aliases`

## Validation Commands

```bash
npx convex dev
npm run ios
```

## Artifact Slots

- `artifacts/`: sanitized fresh-user QA summary.
- `notes/`: simulator/account cleanup notes.

