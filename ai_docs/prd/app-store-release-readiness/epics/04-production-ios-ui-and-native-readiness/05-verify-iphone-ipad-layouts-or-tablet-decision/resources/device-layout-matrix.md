# Device Layout Matrix

Fill this during execution. Use actual device/simulator names available at the time.

## Decision

| Question | Answer |
| --- | --- |
| Is `ios.supportsTablet=true` still enabled? |  |
| If enabled, which iPad target was tested? |  |
| If disabled, who approved disabling tablet support? |  |
| Which commit/build contains the decision? |  |

## Required Coverage

| Surface | Small iPhone | Large iPhone | iPad if enabled | Notes |
| --- | --- | --- | --- | --- |
| Landing/auth entry |  |  |  |  |
| Signup/create account |  |  |  |  |
| Translate idle |  |  |  |  |
| Translate working/queued |  |  |  |  |
| Translate result with English/Darija |  |  |  | Use non-sensitive content. |
| Permission denied |  |  |  |  |
| History list |  |  |  |  |
| History detail |  |  |  |  |
| Account/legal/privacy |  |  |  |  |

## Screenshot Rules

- [ ] Use release-mode UI with diagnostics hidden.
- [ ] Avoid full private transcripts.
- [ ] Avoid private filenames.
- [ ] Avoid Clerk tokens, API keys, `.env` values, and generated audio bytes.
- [ ] Record build metadata and device/simulator names.
