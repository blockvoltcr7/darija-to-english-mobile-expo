# 11 Definition Of Done

## Completion Criteria

- [ ] Supabase migration creates `translation_artifacts` with RLS enabled, service-role-only access, constraints, and indexes.
- [ ] Server env supports TTS feature flag and OpenAI TTS config without exposing secrets through `EXPO_PUBLIC_*`.
- [ ] Server has an OpenAI TTS provider helper using `gpt-4o-mini-tts`.
- [ ] Generated English audio is uploaded to private `translation-artifacts` storage.
- [ ] TTS generation is idempotent for a given job, English text hash, model, voice, and format.
- [ ] TTS failure does not remove or hide the English text translation.
- [ ] `GET /v1/translations/:id` returns `tts` metadata when available.
- [ ] Authenticated playback route returns audio bytes only to the owning Clerk user.
- [ ] `lib/types.ts` and `lib/api.ts` include TTS metadata mapping.
- [ ] `app/translate.tsx` shows a Play/Pause control only when TTS succeeded.
- [ ] `app/history.tsx` supports playback from translation detail.
- [ ] UI includes a clear AI-generated voice disclosure.
- [ ] Server logs include safe TTS metadata but not full translation text, provider secrets, or audio bytes.
- [ ] Static verification commands pass:

```bash
node --check server/index.mjs
node --check server/translation-pipeline.mjs
node --check trigger/translate-audio-job.mjs
npm run typecheck
npm run lint
npx expo-doctor
curl http://localhost:8787/health
```

- [ ] Fresh Clerk user QA confirms English translation, consolidated Darija, raw STT outputs, model metadata, diagnostics, and English audio playback.
- [ ] Cross-user access test confirms another signed-in user cannot access the generated audio.
- [ ] QA docs are updated with TTS-specific evidence requirements.

## Key Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| First TTS provider | OpenAI | Existing backend OpenAI dependency and fastest implementation path. |
| First TTS model | `gpt-4o-mini-tts` | Current OpenAI TTS target with voice/style controls. |
| Default voice | `marin` | Recommended OpenAI voice candidate for high quality English playback. |
| Default output format | `aac`, with `mp3` fallback | `aac` is mobile-friendly; `mp3` is broad fallback if playback tests fail. |
| Generation timing | After English text translation succeeds | TTS requires final English text and should not run before translation. |
| Completion semantics | Text success is independent from TTS success | Translation value should remain available even if audio generation fails. |
| Storage | Private Supabase Storage | Generated audio is user data and must stay behind app auth. |
| Playback access | Authenticated API route | Avoid public storage URLs and enforce Clerk ownership. |
| Persistence | New `translation_artifacts` table | Artifacts need lifecycle, status, idempotency, and deletion metadata. |
| MVP language | English only | Product request is to speak the English translation, not synthesize Darija. |
| Custom voices | Out of scope | Adds consent, eligibility, and policy complexity unrelated to MVP. |
| LiveKit | Deferred | Realtime voice-agent infrastructure is unnecessary for completed translation playback. |
