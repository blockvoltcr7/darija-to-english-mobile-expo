# EAS Environment Decision

Use Expo's default environments for this account:

- `development` for EAS development-client builds
- `preview` for EAS preview builds and the staging store-beta build profile
- `production` later, after a production API URL exists

## Reason

The Expo account does not support custom EAS environments. Attempting to create values in a custom `staging` environment returned a plan-gated error.

## Impact

- Local development still uses `.env.local`; it does not require remote EAS env values.
- Cloud-built development clients use the default `development` EAS environment.
- Preview and staging builds both compile with the same staging API URL.
- The `staging` build profile still keeps its own `channel: "staging"` and store distribution behavior.
- A future paid Expo plan can split preview and staging into separate EAS environments without changing the API host.
