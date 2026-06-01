# App Store Release Readiness PRD

This PRD captures the work required to move Darija to English from TestFlight validation toward a public iOS App Store submission.

It is grounded in:

- The current Expo app and backend code under `app/`, `lib/`, `server/`, `trigger/`, and `supabase/`.
- Current deployment docs under `ai_docs/deployment/`.
- Apple App Review and App Privacy guidance:
  - https://developer.apple.com/app-store/review/guidelines/
  - https://developer.apple.com/support/offering-account-deletion-in-your-app/
  - https://developer.apple.com/app-store/app-privacy-details/
  - https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy

## Pages

1. [Executive Summary](./01-executive-summary.md)
2. [Problem Statement](./02-problem-statement.md)
3. [Product Goals And Success Metrics](./03-product-goals-success-metrics.md)
4. [Gap Analysis](./04-gap-analysis.md)
5. [Architecture Plan](./05-architecture-plan.md)
6. [Technical Specifications](./06-technical-specifications.md)
7. [UI And Store Metadata Changes](./07-ui-and-store-metadata-changes.md)
8. [iOS Submission Evaluator Report](./08-ios-submission-evaluator-report.md)
9. [Implementation Phases](./09-implementation-phases.md)
10. [Risk Assessment](./10-risk-assessment.md)
11. [Definition Of Done](./11-definition-of-done.md)
12. [App Store Privacy Data Inventory](./12-app-store-privacy-data-inventory.md)
13. [Epic Enrichment Plan](./13-epic-enrichment-plan.md)

## Current State

The PRD has already been expanded into epic/task folders under:

```bash
ai_docs/prd/app-store-release-readiness/epics/
```

The epic package currently contains six epics and 36 task specs. The next execution step is to analyze Epic 00 so task plans are generated before running implementation:

```bash
analyze-epic ai_docs/prd/app-store-release-readiness/epics/00-submission-baseline-and-app-store-inventory
```
