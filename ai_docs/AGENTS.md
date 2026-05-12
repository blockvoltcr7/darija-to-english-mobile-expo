# AGENTS.md

## Scope

Project planning, QA playbooks, visual explainers, and operational documentation.

## Structure

| Path | Purpose |
| --- | --- |
| `epics/` | Epic packages, task plans, status, and execution artifacts. |
| `html-visuals/` | Self-contained HTML slide decks and QA playbooks. |
| `production-readiness-roadmap/` | Release-readiness planning material. |
| `visuals/` | Visual documentation artifacts. |

## Documentation Rules

- Keep docs source-grounded; cite app, API, Trigger, Supabase, and Modal paths when describing workflows.
- Do not paste `.env` values, Clerk session tokens, API keys, private audio contents, or full provider transcripts into docs.
- Use `html-visuals/` for durable browser-openable QA decks and visual walkthroughs.
- Use concise runbooks/checklists for QA; move long narrative into dedicated docs rather than AGENTS.md.
- Treat QA status as evidence-based: distinguish code-complete from simulator-verified and fresh-user-verified.

## Fresh Clerk User QA Evidence

When documenting fresh-user E2E results, capture:

- Branch, commit, simulator/device, and app build type.
- Fresh Clerk test user email or a redacted user identifier.
- Audio fixture filename and size, but not private audio contents.
- API job ID and Trigger run ID.
- Final status and visible UI result sections: English translation, consolidated Darija, raw STT outputs, and model metadata.
- Any failure with the exact status/error and the subsystem that produced it.
