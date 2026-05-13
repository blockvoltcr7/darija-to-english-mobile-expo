# Staging Environment Decision

## Decision Status

Decided during Task 02 execution.

## Options

| Option | Meaning | Tradeoff |
| --- | --- | --- |
| Use `environment: "preview"` for `staging` | Matches the PRD example exactly. | Fewer EAS environments, but preview and store-beta config may blur together. |
| Use `environment: "staging"` for `staging` | Creates a dedicated EAS environment for store-beta staging builds. | Clearer release path, but requires configuring a separate EAS environment in Epic 02. |

## Current Recommendation

Use a dedicated `staging` EAS environment if the team plans to keep owner-device preview and TestFlight/Play staging as separate QA lanes. If execution chooses this, document the PRD deviation in `notes/profile-deviations.md`.

## Executed Decision

Use a dedicated `staging` EAS environment for the `staging` build profile.

Rationale:

- `preview` remains the owner-device internal distribution lane.
- `staging` becomes the store-beta/TestFlight/Play testing lane.
- Epic 02 can configure public environment variables separately for preview and staging instead of sharing one environment.
