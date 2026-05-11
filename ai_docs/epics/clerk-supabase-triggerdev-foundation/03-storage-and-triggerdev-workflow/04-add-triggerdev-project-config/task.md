# Task 04: Add Trigger.dev Project Config

## Type

Infrastructure

## Context

Trigger.dev should run long provider work while Supabase remains the product source of truth for jobs, results, provider runs, and storage metadata. Trigger MCP is connected to account `samisabiridrissi@icloud.com` and project `proj_tehveeweadzwantwpvpr` in `Idrissi Org`. That project already has a dev worker with unrelated tasks, so this app must use explicit config, task IDs, and environment assumptions instead of relying on a blank Trigger.dev project.

## Implementation

- Add Trigger.dev packages in `package.json`, keeping `@trigger.dev/sdk`, `@trigger.dev/build`, and the CLI version aligned with the installed `trigger.dev` CLI where practical.
- Add root Trigger config for this repo, preferably `trigger.config.mjs` for the existing ESM server style, with project ref `proj_tehveeweadzwantwpvpr`, explicit task directory `trigger/`, retry defaults, and max duration.
- Add `.trigger` to `.gitignore` if generated locally.
- Extend `.env.example` and `server/env.mjs` with Trigger runtime variables: project ref, secret/API key, environment, and any deploy/runtime distinctions. Keep OpenAI, Modal, Supabase, and Clerk secrets worker-side only.
- Document local dev (`trigger dev`) and deploy (`trigger deploy`) commands plus the MCP checks to inspect workers/runs.

## Acceptance Criteria

- [ ] Trigger.dev config is present at the repo root and points at `proj_tehveeweadzwantwpvpr`.
- [ ] Trigger package and CLI/build/SDK version decisions are documented and pinned coherently.
- [ ] Required API runtime and worker runtime environment variables are listed in `.env.example` without exposing secrets to Expo.
- [ ] Local dev and hosted deploy commands are documented for future execution.
- [ ] Existing unrelated Trigger.dev tasks in the account are acknowledged; this app uses a stable task ID namespace.

## Dependencies

- Depends On: add-server-side-audio-storage-flow
- Blocks: add-triggerdev-translation-task
- Blocks: dispatch-triggerdev-from-api

## Technical Notes

- Trigger MCP live context: project ref `proj_tehveeweadzwantwpvpr`; current dev worker is unrelated and already has registered tasks.
- Trigger deployment environment names differ by tool: deploys support `staging`, `prod`, and `preview`; dev worker/run tools support `dev`.
- Do not implement the translation task here. Task 04 only establishes packages, config, env contract, and commands.
- Reference visual: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/04-triggerdev-event-workflow.png`.
- Official docs to reference in artifacts: Trigger.dev manual setup, tasks overview, triggering, environment variables, deployment, idempotency, and queues/concurrency.

## Artifact Slots

- `artifacts/`: config review, `whoami`/project evidence, and version notes.
- `references/`: Trigger.dev docs, event workflow visual, and MCP project context.
- `resources/`: local `trigger dev`, deploy, worker inspection, and run inspection commands.
- `notes/`: task location, SDK major version, environment, queue, and secret-boundary decisions.
