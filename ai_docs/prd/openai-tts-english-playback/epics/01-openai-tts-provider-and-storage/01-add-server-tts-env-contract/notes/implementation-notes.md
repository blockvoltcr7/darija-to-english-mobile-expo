2026-05-21

- `ENABLE_TTS` defaults to `false`; TTS provider calls stay off unless explicitly enabled server-side.
- MVP validation accepts only `TTS_PROVIDER=openai`, `TTS_LANGUAGE=en`, and `TTS_RESPONSE_FORMAT=aac|mp3`.
- `OPENAI_TTS_MODEL` defaults to `gpt-4o-mini-tts`; `OPENAI_TTS_VOICE` defaults to `marin`.
- `OPENAI_API_KEY` is reused for TTS and is required early only when `ENABLE_TTS=true`.
- Public provider secret guards reject `EXPO_PUBLIC_OPENAI_*` and `EXPO_PUBLIC_TTS_*` names when they look like secrets, tokens, private credentials, or API keys.
