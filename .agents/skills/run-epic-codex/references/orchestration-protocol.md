# Orchestration Protocol

Step-by-step algorithm for phase-based local epic execution in Codex.

The parent Codex session is the orchestrator. It may execute work directly or spawn bounded Codex subagents for parallel-safe work. The parent is the single writer to the epic's `status.log`; subagents report textually and never update shared status artifacts.

## Phase Execution Protocol

### 1. Receive Phase Plan

Parse the local epic folder to extract:

- phase number and mode from each `<NN>-<slug>.plan.md`
- task slug, task name, spec path, and plan path
- `worktree_mode`, branch/worktree suggestion, and likely write scope
- full task body and `## Acceptance Criteria`
- current status per slug from `status.log`

### 2. Filter Completed

Skip any task whose latest `status.log` entry is `done`. If an entire phase is already `done`, skip to the next phase.

### 3. Choose Execution Mode

For each phase:

- If all remaining tasks are sequential, execute them directly in the parent session.
- If the phase has parallel-safe tasks and the user explicitly requested Codex subagents, spawn one subagent per parallel-safe task.
- If the phase has parallel-safe tasks but the user did not explicitly request subagents, show the parallel window and ask before spawning.
- If a task has `worktree_mode: parallel`, use a separate worktree/branch or otherwise keep its write scope isolated.
- If write scopes overlap, collapse those tasks back to sequential execution.

Codex subagent workflows use bounded delegation. Each subagent receives one scoped task and reports back to the parent session for verification, merge decisions, status updates, and phase completion.

### 4. Start The Phase

Before implementation starts:

1. Append `open->in_progress` for each selected task.
2. Regenerate the status table in `epic-overview.md`.
3. Record which tasks are handled directly and which are delegated.
4. Keep each delegated prompt bounded to one task, one write scope, and one expected report.

### 5. Spawn Subagents

Use these role defaults:

| Need | Codex agent role |
|---|---|
| Implementation or fix | `worker` |
| Fallback mixed task | `default` |

When delegating implementation:

- state the task slug, spec path, plan path, worktree path if any, and exact write ownership
- tell the subagent it is not alone in the codebase and must not revert unrelated edits
- tell the subagent not to edit `status.log` or `epic-overview.md`
- require a concise completion/blocker report with changed file paths and validation performed

### 6. Monitor And Integrate

- Continue non-overlapping parent-session work while subagents run.
- Wait for delegated results when the phase gate depends on them.
- If a subagent blocks, provide guidance or pull the task back into the parent session.
- If a subagent edited outside its ownership scope, inspect carefully before integration and resolve conflicts in the parent session.

### 7. Verify Completion

For each task in the phase:

1. Inspect the implementation against `## Acceptance Criteria`.
2. Run or review the narrow validation appropriate for the task.
3. Merge any worktree branch back to the parent branch.
4. Clean up the worktree when merge succeeds.
5. Append `in_progress->done` only after verification and cleanup.
6. Regenerate the overview status table.

After every remaining task in the phase is done, create the phase checkpoint commit.

## Status Log Transitions

| Event | Log append |
|---|---|
| Task initialized by finalize-epic | `<ts> <slug> nil->open` |
| Task execution starts | `<ts> <slug> open->in_progress` |
| Task completion verified | `<ts> <slug> in_progress->done` |
| Task has a blocker | `<ts> <slug> in_progress->in_progress # blocker: <reason>` |
| Task abandoned for retry | `<ts> <slug> in_progress->open` |

The log is source of truth. The overview status table is derived from the log.

## Worktree Lifecycle

For each delegated parallel task that uses a worktree:

1. Spawn:
   ```bash
   git worktree add ../<epic-name>-<slug> <branch>
   ```
2. Spawn a Codex `worker` subagent with the worktree path, spec, plan, and ownership rules.
3. Wait for its completion or blocker report.
4. Verify acceptance criteria in the worktree.
5. Merge the branch back into the parent branch.
6. Remove the worktree and delete the branch if safe:
   ```bash
   git worktree remove ../<epic-name>-<slug>
   git branch -d <branch>
   ```
7. Append `in_progress->done` and regenerate the overview status table.

If cleanup fails after a successful merge, warn with the worktree path but do not mark the task blocked solely because cleanup needs manual follow-up.

## Delegation Prompt Template

```text
You are a Codex subagent working on Task {task_number}: {task_name}.
Slug: {slug}
Spec file: {spec_path}
Plan file: {plan_path}
Worktree: {worktree_path}
Owned write scope: {owned_paths}

You are not alone in this codebase. Do not revert unrelated edits, and do not modify files outside your owned scope unless you first explain why in your final report.

Read the spec and plan, then implement the task exactly against its acceptance criteria.

Do not write to status.log.
Do not regenerate epic-overview.md.
Do not create the phase checkpoint commit.

When finished, report:
- status: done, blocked, or failed
- changed files
- acceptance criteria satisfied
- validation run
- integration notes or blockers
```

## Error Recovery

| Scenario | Action |
|---|---|
| Delegated work reports blocker | Inspect dependency state, append same-state blocker entry, and stop downstream work if needed |
| Parallel work starts conflicting | Stop further parallel dispatch and collapse remaining tasks to sequential execution |
| Status log append fails | Stop and surface the file error; do not blindly retry appends |
| Worktree merge conflict | Resolve in the parent session or escalate to the user |
| Worktree cleanup fails after merge | Warn with the worktree path and continue |
| Plan files missing | Warn and fall back to sequential execution |
| Status log has unparseable lines | Warn, skip bad lines, and use last good entry per slug |
| Crash mid-task | Use the completed, abandoned, or rollback recovery flow from `SKILL.md` |
