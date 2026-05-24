2026-05-21

- Added the shared playback row directly under the English detail text in `app/history.tsx`.
- The detail screen uses a fresh Clerk token through the existing `getTokenRef`.
- The list surface stays text-only because TTS metadata is loaded cheaply in detail, not list rows.
