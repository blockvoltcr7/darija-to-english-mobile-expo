# Mobile History UI Contract

Target files:

- `app/history.tsx`
- `app/_layout.tsx`
- `app/index.tsx` or `app/account.tsx`
- `lib/api.ts`
- `lib/types.ts`

## Required States

- Loading initial history.
- Empty history.
- Error loading history.
- Refreshing history.
- Recent translations list.
- One translation detail view.

## Display Priority

1. English translation.
2. Consolidated Darija transcript.
3. Filename and timestamps.
4. Provider/model metadata.
5. Raw provider transcripts only in detail, if there is room.

The first app screen should remain the translation tool, not a landing page.
