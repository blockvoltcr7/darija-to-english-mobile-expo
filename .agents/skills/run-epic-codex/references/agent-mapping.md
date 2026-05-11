# Agent Mapping

Map epic task characteristics to Codex subagent roles. This is intentionally conservative: assign one scoped responsibility per subagent and keep final integration in the parent Codex session.

## Built-in Roles

| Task signal | Codex role | Reason |
|---|---|---|
| Read-heavy codebase mapping | `explorer` | Keeps noisy discovery out of the parent thread |
| Documentation drift review | `explorer` | Read-only verification and concise reporting |
| Test-gap or risk review | `explorer` | Independent review before implementation or phase close |
| Implementation task | `worker` | Execution-focused edits with bounded ownership |
| Bug fix | `worker` | Small targeted code change and validation |
| Mixed or unclear task | `default` | General fallback when specialization is not obvious |

## Type-Based Defaults

| Task Type Keyword | Preferred role | Notes |
|---|---|---|
| `Migration` | `worker` | Give explicit migration and schema ownership |
| `Migration (data-preserving)` | `worker` | Require preservation checks in the prompt |
| `Migration + Drizzle Schema` | `worker` | Own migration, schema file, and required exports |
| `Code` (React/Next.js context) | `worker` | Own named pages/components/actions only |
| `Code` (Drizzle context) | `worker` | Own schema file and exports; avoid parallel barrel edits |
| `RLS` / `Row Level Security` | `worker` | Require policy validation details |
| `Edge Function` | `worker` | Own the function folder and tests |
| `Database Function` | `worker` | Own SQL function migration and validation |
| `Realtime` | `worker` | Own channel/presence/broadcast code paths |
| `Schema Design` / `DBA` | `explorer` first, then `worker` | Map risks before implementation when schema impact is broad |
| *(no match)* | `default` | Use bounded task prompt with explicit write scope |

## Matching Rules

1. Primary match against the task's `## Type` section.
2. If `## Type` is broad, scan `## Context`, `## Implementation`, and `## Technical Notes`.
3. If the task is primarily investigation or verification, choose `explorer` even if the domain is code.
4. If the task requires code edits, choose `worker` and give disjoint file ownership.
5. If a future project-scoped custom agent exists under `.codex/agents`, it may replace the built-in role only when its `description` clearly matches the task. The custom agent still follows `run-epic-codex`.
