# Codebase visual guide

Open [index.html](index.html) locally to browse five Archify diagrams. SVG exports are embedded in the root [README](../../../README.md) so the diagrams remain visible in GitHub.

## Scope and evidence

The core diagrams cite committed source at `8eb1b12ce8ad145ece213c2969dea051ad66a83c`. Every primary node or sequence participant has source references. A clean detached checkout was used for source validation so local changes were not attributed to that commit.

The existing working tree also adds RevenueCat integration through `app/_layout.tsx`, `app/account.tsx`, `app/translate.tsx`, `lib/api.ts`, `lib/config.ts`, `lib/types.ts`, `lib/revenuecat.ts`, `server/index.mjs`, `server/env.mjs`, `server/db.mjs`, `server/subscriptions.mjs`, `convex/schema.ts`, and `convex/subscriptions.ts`, plus dependency/generated API changes. That extension is explained from current files in the root README and is outside the pinned diagrams. Existing unrelated documentation deletions were left in place.

The diagrams describe logical behavior. They do not establish deployed state, provider availability, account isolation in a running app, or working billing products. The sequence shows one logical ordering; dispatch and worker execution can overlap with the queued HTTP response.

## Diagrams

| Diagram | Type | Primary sources |
| --- | --- | --- |
| [Architecture](architecture.html) | Architecture | `app/_layout.tsx`, `lib/api.ts`, `server/index.mjs`, worker pipeline, Convex schema/storage/auth |
| [User journey](user-flow.html) | Workflow | Login/verification/consent screens, translation screen, playback helper |
| [Async jobs](async-jobs.html) | Sequence | API submission handler, Trigger task, stored-job processor, client polling |
| [Understand](understand-pipeline.html) | Dataflow | Dual STT, consolidation, translation, result write, optional TTS |
| [Reply](reply-pipeline.html) | Dataflow | English STT, Darija reply generation, result write, optional Arabic TTS |

Archify's `finalize` receipts record validation, delivery, strict artifact checks, and real-browser checks for each diagram. Those automated gates are separate from visual inspection and application testing. Exported SVGs are communication assets; the HTML and its receipts remain the checked deliverables.

Latest successful receipts:

| Diagram | Finalize receipt |
| --- | --- |
| Architecture | [Passed](architecture.finalize-summary.json) |
| User journey | [Passed, current revision](../../../.archify/architecture-codebase-20261107-205314/user-flow-review-2/user-flow.finalize-summary.json) |
| Async jobs | [Passed, current revision](../../../.archify/architecture-codebase-20261107-205314/async-jobs-review-2/async-jobs.finalize-summary.json) |
| Understand | [Passed](understand-pipeline.finalize-summary.json) |
| Reply | [Passed](reply-pipeline.finalize-summary.json) |

Browser captures of all five diagrams were inspected separately. The guide loaded all previews without horizontal overflow at 1440px and 390px; its desktop and narrow layouts were also inspected. Local documentation links and SVG XML were checked. No app runtime, provider, deployment, or billing tests were run for this documentation change.

## Maintain the diagrams

The editable JSON candidates are in [the request folder](../../../.archify/architecture-codebase-20261107-205314/). Keep candidate and output changes together. When source behavior changes, update the cited commit and inspect the corresponding source ranges before regenerating.

With Archify installed at the path shown, run from the repository root (replace the executable path for your installation):

```bash
ARCHIFY_BIN=/absolute/path/to/archify/bin/archify.mjs
node "$ARCHIFY_BIN" finalize architecture \
  .archify/architecture-codebase-20261107-205314/architecture.json \
  ai_docs/html-visuals/codebase-guide/architecture.html \
  --repo-root . --quality showcase --json \
  --out-dir .archify/architecture-codebase-20261107-205314/architecture-review-next
```

Use `workflow` for `user-flow`, `sequence` for `async-jobs`, and `dataflow` for both pipeline candidates. Every later delivery to an HTML file with existing browser evidence needs a fresh `--out-dir` for its review receipts. Do not manually edit the generated HTML.

To refresh the README previews, open each HTML diagram and use **Export → SVG · Auto**, saving to the matching `.svg` path. The included [export helper](../../../.archify/architecture-codebase-20261107-205314/export-previews.mjs) automates those same public export buttons with an isolated headless Chrome process:

```bash
node .archify/architecture-codebase-20261107-205314/export-previews.mjs
```

The helper defaults to the macOS Google Chrome binary; set `CHROME_PATH` for another installation. It opens local documentation only, uses a temporary browser profile, saves SVGs beside the HTML, and writes review captures to a temporary directory.
