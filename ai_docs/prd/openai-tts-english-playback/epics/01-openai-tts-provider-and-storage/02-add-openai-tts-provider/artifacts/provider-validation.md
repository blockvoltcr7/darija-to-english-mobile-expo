2026-05-21

Validation run:

```bash
node --check server/tts/openai-tts.mjs
node --input-type=module - <<'NODE'
import { generateOpenAiTtsAudio } from './server/tts/openai-tts.mjs';
try {
  await generateOpenAiTtsAudio({ englishText: '   ' });
  console.log('empty-check-failed');
} catch (error) {
  console.log(error.code === 'tts_input_empty' ? 'empty-check-ok' : `unexpected:${error.code}`);
}
NODE
```

Observed result:

```text
empty-check-ok
```

No paid OpenAI TTS call was made during this validation.
