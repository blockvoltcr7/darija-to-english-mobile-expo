# Guardrails Test Matrix

| Scenario | Expected Server Behavior | Expected UI Behavior | Paid Calls? |
| --- | --- | --- | --- |
| Empty audio payload | 400 with safe reason | User sees upload/recording error | No |
| Invalid base64 | 400 with safe reason | User sees unsupported/invalid file message | No |
| Unsupported extension/MIME | 415 with safe reason | User sees supported audio guidance | No |
| Oversized audio | 413 with safe reason | User sees size/duration guidance | No |
| Quota reached | 429 or configured status with `reason` and optional retry | User sees quota message and retry guidance | No |
| Kill switch active | Maintenance/disabled response before storage/Trigger | User sees maintenance message | No |
| Valid small audio | Queued and polled normally | User sees translation result | Yes, one controlled run |

Use fixtures that do not contain sensitive private speech. Do not paste transcript content into artifacts.
