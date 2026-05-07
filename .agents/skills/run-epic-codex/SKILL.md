---
name: run-epic-codex
description: Execute an analyzed local epic folder phase by phase in Codex using spec files, plan sidecars, status.log, and explicit Codex subagent spawning for parallel-safe work. Use when the user asks Codex to run or execute an epic pipeline with subagents.
---

# Run Epic Codex

Execute an analyzed local epic folder using task spec files (`<NN>-<slug>.md`) and execution strategy sidecars (`<NN>-<slug>.plan.md`) produced by `enrich-epic` and `analyze-epic`. The epic's append-only `status.log` is the source of truth, and the parent Codex session is the only writer.

This is the Codex-native execution entrypoint for the epic pipeline. It keeps the workflow skill-first: custom agents may help later, but this skill remains the source of truth.

## Input

Parse one argument:

- `epic_folder_path`: path to the analyzed epic folder

If it is missing, ask for it.

Refuse to run if `status.log` is not present. Tell the user to run `finalize-epic <epic_folder_path>` first.

## Codex orchestration model

Use Codex's parent-session orchestration model.

- The parent Codex session owns the phase plan, status.log writes, integration decisions, and phase gates.
- The parent may execute sequential work directly.
- The parent may spawn Codex subagents for parallel-safe work when the user has explicitly asked for Codex subagent or parallel-agent execution.
- Prefer `worker` subagents for bounded implementation slices and `explorer` subagents for read-heavy mapping or verification.
- Keep delegated write scopes disjoint. Do not assign two subagents to the same files unless the plan intentionally uses separate worktrees and explicit merge handling.
- Subagents never append `status.log`, regenerate the overview table, create checkpoint commits, or decide that a phase is complete.
- Subagents report findings or completed work back to the parent session for verification and integration.
- If a custom Codex agent is added later under `.codex/agents`, it must reference this skill instead of replacing it.

## Workflow

### 1. Read and parse the epic

Glob `<epic_folder_path>/*.md`, excluding `epic-overview.md` and `*.plan.md`. For each spec file, also read the sibling `<NN>-<slug>.plan.md` if present.

Read `status.log`. Sort entries by timestamp. For each slug, take the last entry as current status. Skip slugs whose current status is `done`.

If `*.plan.md` files are missing, warn and fall back to conservative sequential execution.

Crash recovery: detect any slug whose current status is `in_progress` with no terminal entry. For each such slug:

1. Find the last clean checkpoint commit before the `in_progress` transition with `git log --oneline -- <epic_folder_path>`.
2. Show the slug and likely checkpoint commit hash.
3. Ask the user whether to mark completed, mark abandoned for retry, or roll back the epic folder to the checkpoint.
4. Append the chosen transition before continuing.

### 2. Build the phase plan

Group tasks by phase from the plan sidecars. For each task determine:

- slug and spec path
- current status
- phase
- `worktree_mode`
- likely write scope
- Codex agent role from `references/agent-mapping.md`
- whether it is safe to delegate

Show the plan and wait for user confirmation before starting execution. If the user has not explicitly requested subagents, ask before spawning any.

### 3. Execute phase by phase

For each phase:

1. Append `open->in_progress` for every task selected in the phase.
2. Regenerate the status table in `epic-overview.md`.
3. Execute sequential tasks directly in the parent session.
4. For parallel-safe tasks, spawn one bounded Codex subagent per task when explicit subagent execution is confirmed.
5. Wait for delegated results only when the phase cannot progress without them.
6. Verify each task against its `## Acceptance Criteria` before marking it done.
7. Merge and clean up any worktrees before appending `in_progress->done`.

Follow the detailed protocol in `references/orchestration-protocol.md`.

### 4. Track status via status.log

The state machine is `nil -> open -> in_progress -> done`. Every transition is a single append:

```text
2026-04-14T14:30:00Z setup-auth open->in_progress
2026-04-14T14:52:14Z setup-auth in_progress->done
```

Append rules:

- The parent Codex session is the only writer to `status.log`.
- After every append, regenerate the `<!-- STATUS-TABLE-START -->` to `<!-- STATUS-TABLE-END -->` block in `epic-overview.md`.
- Do not mark a task `done` until the parent verifies the acceptance criteria.
- If a task is blocked, append a same-state transition with `# blocker: <reason>`.

### 5. Phase commit

After a phase completes successfully, create one checkpoint commit:

```bash
git add <epic_folder_path>
git commit -m "Run epic <epic_name>: phase <N> complete (<M> tasks done)"
```

One commit per phase, not one commit per task.

### 6. Wrap up

After all executable tasks finish:

- verify final task statuses from `status.log`
- summarize completed work, skipped work, delegated work, and blockers
- leave any unresolved worktree cleanup instructions explicit

## References

- `references/orchestration-protocol.md`
- `references/agent-mapping.md`
- `references/rollback.md`
