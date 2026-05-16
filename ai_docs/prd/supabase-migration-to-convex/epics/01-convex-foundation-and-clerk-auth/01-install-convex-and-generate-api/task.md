# Task 01: Install Convex And Generate API

## Type

Code

## Context

Convex codegen must exist before mobile or server code can import generated API references.

## Implementation

- Add the Convex package using the repo package manager.
- Initialize a `convex/` folder.
- Generate `_generated` API files through `npx convex dev`.
- Add `EXPO_PUBLIC_CONVEX_URL` to example env docs.
- Keep OpenAI, Modal, Clerk secret, and Trigger secrets out of public env.

## Acceptance Criteria

- `convex/` exists with generated API files.
- `package.json` has Convex dependencies.
- `npx convex dev` runs without schema errors.
- Public env additions are limited to public mobile config.

## Dependencies

- Epic 00 complete.

## Validation Commands

```bash
npx convex dev
npm run typecheck
npm run lint
```

## Artifact Slots

- `notes/`: Convex project/deployment IDs without secrets.
- `resources/`: setup commands used.

