# Provider Failure Matrix

Use this matrix when implementing and verifying persistence around `/v1/translate-audio`.

| Failure Point | Expected Job State | Expected Provider Run | API Behavior |
|---|---|---|---|
| Invalid Clerk token | No job | No provider run | `401` |
| Invalid payload | No job | No provider run | `400` |
| Modal Darija ASR failure | `failed` | Failed `modal_darija_asr` when observable | Existing error response |
| OpenAI STT failure | `failed` | Failed `openai_transcription` when observable | Existing error response |
| Empty STT text | `failed` | Completed STT run plus safe failure | Existing `502` behavior |
| Consolidation failure | `failed` | Failed `openai_consolidation` | Existing error response |
| Translation failure | `failed` | Failed `openai_translation` | Existing error response |
| Result write failure | Server error | Completed provider runs may exist | `500` |

Artifacts should redact bearer tokens and transcript bodies unless using explicit non-sensitive sample text.
