2026-05-21

- Playback uses the same Clerk session middleware as history/detail routes.
- The server looks up only successful owner-owned English TTS artifacts.
- Missing, failed, incomplete, and cross-user artifacts return 404.
- Supabase Storage download happens server-side with the admin client.
- Public route responses and logs do not expose private bucket/object keys.
