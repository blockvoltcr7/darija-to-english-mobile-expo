# Source Anchors

- `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md`: release env contract, public env names, server-only names, and usage-control response shape.
- `.env.example`: current env-name inventory for Clerk, Supabase, Trigger, OpenAI, Modal/Darija ASR, TTS, upload, and retention.
- `server/env.mjs`: env validation, forbidden public secret checks, model defaults, upload limit, retention, TTS config.
- `server/index.mjs`: Clerk session auth, Clerk webhook route, health routes, translation create/polling routes.
- `server/db.mjs`: Supabase admin client requirements and smoke check.
- `server/storage.mjs`: private audio/artifact buckets, upload constraints, retention behavior.
- `server/translation-pipeline.mjs`: OpenAI, Modal, provider-run recording, and optional TTS flow.
- `supabase/README.md`: Clerk ownership key and server-mediated Supabase policy guidance.
