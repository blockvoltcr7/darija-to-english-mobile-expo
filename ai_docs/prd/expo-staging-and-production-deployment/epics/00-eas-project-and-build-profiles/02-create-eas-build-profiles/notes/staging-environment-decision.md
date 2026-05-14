# Staging Environment Decision

## Decision Status

Superseded during Epic 02 execution after EAS rejected custom environments on the current Expo plan.

## Options

| Option | Meaning | Tradeoff |
| --- | --- | --- |
| Use `environment: "preview"` for `staging` | Matches the PRD example exactly. | Fewer EAS environments, but preview and store-beta config may blur together. |
| Use `environment: "staging"` for `staging` | Creates a dedicated EAS environment for store-beta staging builds. | Clearer release path, but requires configuring a separate EAS environment in Epic 02. |

## Current Recommendation

Use `environment: "preview"` for the `staging` build profile until the Expo account supports custom environments. Keep `channel: "staging"` so store-beta builds remain distinguishable from owner-device preview builds.

## Executed Decision

Use the default `preview` EAS environment for the `staging` build profile.

Rationale:

- The current Expo account supports default EAS environments: `development`, `preview`, and `production`.
- Attempting to create a custom `staging` EAS environment returned a paid-plan gate.
- `preview` and `staging` build profiles both compile with the staging Cloud Run API URL for now.
- `staging` remains the store-beta/TestFlight/Play testing lane through its build profile and channel.
