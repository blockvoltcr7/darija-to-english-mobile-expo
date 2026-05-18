# Rolling Back an Epic

Git is the rollback mechanism for the local epic store. Every meaningful checkpoint should be an auto-commit:

- `Prepare epic: <name>` from `prepare-epic`
- `Enrich epic: <name> (<N> tasks updated)` from `enrich-epic`
- `Analyze epic: <name>` from `analyze-epic`
- `Run epic <name>: phase <N> complete (<M> tasks done)` from `run-epic-codex`

## Roll Back To A Previous State

```bash
git log --oneline -- <epic_folder>
git checkout <commit> -- <epic_folder>
```

Then resume by running `run-epic-codex <epic_folder>`. It reads `status.log` and continues from the restored state.

## When To Roll Back

| Scenario | Rollback target |
|---|---|
| A phase produced bad epic metadata | Last successful phase checkpoint |
| Enrichment overwrote good manual edits | Last `Prepare epic` commit, then rerun enrichment |
| Crash mid-execution | Last clean checkpoint before the `in_progress` transition |
| Need to redo phase analysis | Last `Enrich epic` or `Prepare epic` commit, then rerun `analyze-epic` |
| Execution plan files are wrong | Last `Analyze epic` commit if it is correct; otherwise roll back to the prior enrichment/preparation checkpoint and rerun `analyze-epic` |

## Limits

Rolling back the epic folder does not automatically undo source-code changes outside the epic folder, delete worktrees, or rewrite history. Handle those separately and explicitly.
