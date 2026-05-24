2026-05-21

- Cross-user denial intentionally returns 404 to avoid confirming another user's artifact existence.
- Evidence placeholders use `<Clerk session token>` and `<translation-id>` only; no tokens or private audio contents should be copied into docs.
- Runtime verification remains part of Epic 05 fresh-user QA because it needs real Clerk users and generated artifact rows.
