# Clean Install Permission Copy QA

Use this after the native permission string is changed and a new iOS binary/development build is available.

## Setup

- Use an iOS simulator or physical iPhone with a clean install.
- Use a production-like or release-mode build, not Expo Go.
- Confirm the build includes the updated `app.json` `expo-audio.microphonePermission` value.

## Steps

1. Delete the app from the simulator/device.
2. Install the fresh build.
3. Sign in or create a fresh test user as needed.
4. Open the translate screen.
5. Tap `Record`.
6. Capture the microphone permission prompt text.
7. Allow permission and confirm recording can start.
8. Repeat on a second clean install or reset permission state to verify denial behavior if needed.

## Expected Prompt Direction

The prompt should explain that Darija to English records audio so it can transcribe Moroccan Darija and translate it to English.

## Evidence Rules

- Capture the prompt text and build metadata.
- Do not include private audio, full transcripts, Clerk tokens, `.env` values, or API keys.
- If screenshots are captured, use a non-sensitive account and avoid private output content.
