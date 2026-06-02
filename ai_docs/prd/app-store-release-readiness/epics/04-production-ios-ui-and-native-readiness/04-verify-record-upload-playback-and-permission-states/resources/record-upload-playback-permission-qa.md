# Record Upload Playback Permission QA

Use this checklist during execution. Mark blockers instead of fabricating pass evidence.

## Setup

- [ ] Confirm target build type: development build, TestFlight, or production-like build.
- [ ] Confirm API environment and whether the run is production, staging, or local.
- [ ] Confirm diagnostics are hidden for release-mode checks.
- [ ] Use a non-sensitive short audio fixture.
- [ ] For iOS simulator upload testing, load the fixture:

```bash
.agents/skills/ios-simulator-files/scripts/add_to_simulator_files.sh /absolute/path/to/audio.m4a
```

## Record Path

- [ ] Fresh install prompts for microphone permission with product-specific copy.
- [ ] Allow permission.
- [ ] Tap `Record`, speak/play short non-sensitive Darija audio, then stop.
- [ ] Confirm the job submits and reaches text result.
- [ ] Confirm English translation and consolidated Darija are visible.
- [ ] Confirm production UI does not expose diagnostics or provider internals.

## Upload Path

- [ ] Tap `Upload Audio`.
- [ ] Pick the fixture from Files.
- [ ] Confirm selected fixture submits and reaches text result.
- [ ] Confirm filename display does not expose private data in evidence.

## Playback Path

- [ ] If TTS status is `succeeded`, tap English playback and confirm audio plays.
- [ ] If TTS status is pending or failed, confirm English text remains visible and the UI does not treat TTS failure as text failure.

## Permission Denied Path

- [ ] Repeat on clean install or reset microphone permission.
- [ ] Deny microphone permission.
- [ ] Confirm blocked state is understandable.
- [ ] Confirm upload path remains available if permission denial should not block file import.
- [ ] Confirm recovery guidance is clear.

## Evidence Fields

| Field | Value |
| --- | --- |
| Branch/commit |  |
| Build type/profile |  |
| API environment |  |
| Device/simulator |  |
| Fixture filename/size |  |
| Sanitized job ID/status |  |
| Sanitized Trigger run ID/status |  |
| Record path result |  |
| Upload path result |  |
| Playback result |  |
| Permission denied result |  |
| Blockers |  |
