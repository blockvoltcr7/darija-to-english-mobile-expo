# Capture Production Screenshots

## Type

UI

## Context

Final App Store screenshots must show release UI, not diagnostics or QA wording. Because tablet support may be enabled, screenshot scope depends on the Epic 04 device decision.

## Implementation

- Capture screenshots from a production/release-mode build with diagnostics hidden.
- Include core workflow screens: landing/auth, translate, result, history/detail, account/legal where appropriate.
- Capture small iPhone, large iPhone, and iPad screenshots if tablet support remains enabled.
- Avoid screenshots that expose private audio, full transcripts, tokens, trace IDs, or model internals.
- Store screenshot file names and source build metadata in `artifacts/`.

## Acceptance Criteria

- Screenshot set matches App Store device requirements and PRD tablet decision.
- Screenshots show production copy and UI only.
- Diagnostics/API URL/model metadata are absent.
- Build/runtime metadata is recorded for traceability.

## Dependencies

- Depends On: create-reviewer-demo-account-path
- Depends On: `04-production-ios-ui-and-native-readiness/verify-iphone-ipad-layouts-or-tablet-decision`

## Technical Notes

- If screenshots include translation output, use non-sensitive sample text and avoid full private transcripts.
- Do not reuse old TestFlight screenshots that show QA panels or stale copy.

## Artifact Slots

- `artifacts/`: screenshot set and capture metadata
- `references/`: UI readiness evidence anchors
- `resources/`: device/simulator screenshot checklist
- `notes/`: screenshot selection and App Store Connect sizing notes

