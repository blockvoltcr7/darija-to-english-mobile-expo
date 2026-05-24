# 10 Risk Assessment

## High Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Duplicate TTS generation on Trigger retry | Extra OpenAI cost and multiple artifacts for one translation. | Use idempotency hash over English text + provider/model/voice/format; check for existing successful artifact before provider call. |
| Private audio exposure | Generated English audio may contain sensitive translated content. | Store in private Supabase Storage; serve through authenticated API route; require Clerk ownership check. |
| TTS failure blocks translation | User loses primary text result due to optional audio failure. | Treat TTS as add-on; persist text result first; record TTS failure separately. |

## Medium Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| OpenAI audio-token cost uncertainty | Unit economics may be higher than expected. | Log safe usage metadata and run a small representative cost benchmark before enabling broadly. |
| Expo playback with authenticated URLs | Audio playback APIs may not support Authorization headers. | Fetch bytes with auth into local file, or use short-lived signed URLs if needed. |
| Format compatibility | `aac` may behave differently across simulator/device; `mp3` may be safer. | Implement configurable format and test both on iOS/Android before release. |
| Schema overreach | Artifact table could slow implementation. | Keep table narrow and MVP-specific: `english_tts_audio`, `openai`, `aac/mp3`, `en`. |
| Provider errors create noisy UI | Users may see confusing failure states. | Hide failed TTS from primary UI and surface concise diagnostics only. |

## Low Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Voice choice sounds unnatural | Lower perceived quality. | Start with `marin`, test `cedar`, and keep voice configurable server-side. |
| Long translations exceed provider input limits | TTS missing for long jobs. | MVP can mark TTS failed with `tts_input_too_long`; later add chunking. |
| Storage growth | More bytes per translation. | Track byte size and align with artifact retention policy. |
| Documentation drift | AGENTS/docs omit TTS behavior. | Update `server/AGENTS.md` and QA docs in final implementation phase. |
| AI voice disclosure omitted | Policy/user trust issue. | Add visible disclosure near Play control and include in Definition of Done. |
