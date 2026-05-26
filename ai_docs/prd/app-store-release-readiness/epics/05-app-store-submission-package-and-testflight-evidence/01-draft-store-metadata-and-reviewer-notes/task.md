# Draft Store Metadata And Reviewer Notes

## Type

Infrastructure

## Context

App Store Connect needs metadata that matches the final app behavior: privacy URL, support URL, description, keywords, reviewer notes, and test path. The PRD includes a recommended reviewer note shape.

## Implementation

- Draft App Store name, subtitle, description, keywords, support URL, and privacy policy URL.
- Draft reviewer notes with demo account placeholder, expected test path, and expected processing time.
- Include AI processing disclosure and translation accuracy limitation in reviewer language.
- Ensure metadata does not mention staging/local worker dependencies or QA-only behavior.
- Store drafts in `artifacts/` or `ai_docs/deployment/app-store-submission.md` as appropriate.

## Acceptance Criteria

- Metadata draft includes privacy policy URL, support URL, description, keywords, reviewer notes, and test path.
- Reviewer notes are consistent with production runtime, legal disclosure, and UI copy.
- Draft contains placeholders rather than real passwords or private credentials.
- Release owner can review and edit the copy before App Store Connect entry.

## Dependencies

- Depends On: `01-legal-privacy-and-consent/update-privacy-inventory-and-release-copy`
- Depends On: `04-production-ios-ui-and-native-readiness/review-privacy-manifest-and-upload-warnings`

## Technical Notes

- Keep reviewer instructions short and operational: sign in, upload/record short Moroccan Darija audio, wait for English translation and optional playback.
- Do not include private audio samples, tokens, or real credentials in committed docs.

## Artifact Slots

- `artifacts/`: metadata and reviewer-note draft
- `references/`: PRD UI/store metadata anchors
- `resources/`: App Store Connect field checklist
- `notes/`: release-owner copy feedback

