2026-05-21

Validation run:

```bash
node --check server/env.mjs
node --input-type=module - <<'NODE'
import { loadEnv } from './server/env.mjs';
const env = loadEnv({
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_SECRET_KEY: 'test-secret',
});
console.log(JSON.stringify({
  enableTts: env.ENABLE_TTS,
  provider: env.TTS_PROVIDER,
  language: env.TTS_LANGUAGE,
  format: env.TTS_RESPONSE_FORMAT,
  model: env.OPENAI_TTS_MODEL,
  voice: env.OPENAI_TTS_VOICE,
}));
NODE
```

Safe observed defaults:

```json
{"enableTts":false,"provider":"openai","language":"en","format":"aac","model":"gpt-4o-mini-tts","voice":"marin"}
```

Invalid `TTS_RESPONSE_FORMAT=wav` produced the expected server config error path.
