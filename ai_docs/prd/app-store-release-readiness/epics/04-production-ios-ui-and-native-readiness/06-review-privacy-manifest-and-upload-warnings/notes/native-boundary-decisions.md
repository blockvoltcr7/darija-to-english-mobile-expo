# Native Boundary Decisions

Record decisions here only when a static check, build, or upload warning creates a native/config question.

| Issue | Preferred fix | Owner decision | Date | Blocks Epic 05? |
| --- | --- | --- | --- | --- |
| Privacy manifest warning | Expo config or config plugin first |  |  |  |
| Required-reason API warning | Dependency update/config plugin only if needed |  |  |  |
| Permission string warning | `app.json` plugin config and new binary |  |  |  |
| Encryption/export warning | Update Epic 00 decision and App Store answer |  |  |  |
| Native dependency warning | Avoid new native dependency unless approved |  |  |  |

Default PRD stance: no `@expo/ui/swift-ui`, no local Expo module, and no generated native-file edit unless a concrete blocker is documented and approved.
