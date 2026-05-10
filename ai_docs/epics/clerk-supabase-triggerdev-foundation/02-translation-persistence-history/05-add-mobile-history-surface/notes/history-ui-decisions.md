# History UI Decisions

- Add a dedicated `app/history.tsx` route instead of burying history inside the account screen.
- Keep the current translation screen as the first usable screen.
- Fetch with Clerk session tokens through `lib/api.ts`.
- Avoid direct Supabase client access in mobile code.
- Keep this UI minimal; richer search/filter/export belongs in a later epic.
