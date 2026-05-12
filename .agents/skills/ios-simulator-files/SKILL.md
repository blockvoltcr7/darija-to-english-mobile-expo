---
name: ios-simulator-files
description: Add local test files from macOS into the booted iOS Simulator Files app for Expo/mobile QA. Use when testing upload flows, DocumentPicker, audio files such as .m4a, PDFs, fixtures, or any case where a file must appear in On My iPhone storage in the iOS Simulator.
---

# iOS Simulator Files

Use this project-scoped skill when a QA flow needs a local Mac file to be selectable from the iOS Simulator Files app. This is especially useful for this repo's `Upload Audio` flow, which uses Expo DocumentPicker and expects audio files to be visible in the simulated device file browser.

## Quick Start

From the repo root, run:

```bash
.agents/skills/ios-simulator-files/scripts/add_to_simulator_files.sh /absolute/path/to/file.m4a
```

By default the script copies into:

```text
Files > Browse > On My iPhone > Downloads
```

Use a different destination folder when needed:

```bash
.agents/skills/ios-simulator-files/scripts/add_to_simulator_files.sh \
  /absolute/path/to/file.m4a QA-Audio
```

## Workflow

1. Confirm the target file exists on macOS and is not a secret.
2. Confirm an iOS Simulator is booted:

```bash
xcrun simctl list devices booted
```

3. Prefer the bundled script to avoid hard-coding simulator UUIDs or app-group paths.
4. Open the Simulator Files app and verify the copied file:

```text
Files > Browse > On My iPhone > Downloads
```

5. In the app under test, open its picker and select the file from the same location.

## Why This Method

`xcrun simctl addmedia` is for photos, videos, Live Photos, and contacts. It is not reliable for arbitrary `.m4a` upload fixtures. For DocumentPicker-based app flows, copy files into the booted simulator's `group.com.apple.FileProvider.LocalStorage` app group instead.

The local Files app path has this shape:

```text
~/Library/Developer/CoreSimulator/Devices/<device-udid>/data/Containers/Shared/AppGroup/<group-uuid>/File Provider Storage/<folder>
```

Do not hard-code this path. It changes by simulator/device and can change after resets.

## Manual Fallback

If the script fails, recover the path manually:

```bash
xcrun simctl get_app_container booted com.apple.DocumentsApp groups
```

Find the `group.com.apple.FileProvider.LocalStorage` line, then copy the file into:

```text
<that-path>/File Provider Storage/Downloads/
```

Create `Downloads` if missing.

## Project QA Notes

For this Darija app:

1. Keep the API running before testing uploads:

```bash
npm run api
curl http://localhost:8787/health
```

2. Use the iOS Simulator API URL:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787 npm run ios
```

3. Select the file through:

```text
Darija to English > Upload Audio > Browse > On My iPhone > Downloads
```

Do not upload private or sensitive audio unless the user has explicitly approved sending it through the app backend/provider workflow.
