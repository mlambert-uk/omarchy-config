---
name: flow-archive
description: Archive completed user stories to keep workspace clean and organised
model: github-copilot/claude-sonnet-4.6
template: |
  # /flow-archive

  Move completed user stories to `.avaylerflow/completed/` after validating completion.

  Pre-archive validation:
  - All tasks checked off in tasks.md
  - Acceptance criteria met
  - implementation-summary.md present
  - Tests passing (if test framework exists)
  - PR merged (verified via ADO or user confirmation)

  Actions:
  1. Move story directory to `.avaylerflow/completed/`
  2. Update `.avaylerflow/index.md` (remove from active)
  3. Add to `.avaylerflow/completed/archive-index.md` with metadata:
     - Archive date
     - Effort (estimated vs actual)
     - PR URL and merge date
     - ADO work item ID (if applicable)
  4. Mark ADO work item as Resolved
  5. Reset implementation-plan.md if all stories archived
---

# /flow-archive

Move completed user stories to `.avaylerflow/completed/` after validating completion status.

**Usage**:

```
/flow-archive <user-story-id> [user-story-id...]
/flow-archive --all
```

## Validation Checks

Before archiving, verify all of the following. Stop and report any failures.

- [ ] All tasks checked off in `tasks.md`
- [ ] Acceptance criteria met (from `story.md`)
- [ ] `implementation-summary.md` present
- [ ] Tests passing (if test framework exists)
- [ ] PR merged — see PR verification below

## PR Verification

**Step 1**: Check whether the story references an ADO work item ID (look in `story.md` source reference field).

**If an ADO work item ID is present:**

1. **Invoke** `avaylerflow-ado-integration` to detect the CLI and find the linked PR
   - If the agent reports CLI unavailable: display the fallback message it returns, then fall back to asking the user to confirm manually: "Can you confirm the PR has been merged? [Y/n]"
2. **Find the linked PR** (via the agent):
   ```bash
   az repos pr list --work-item <work-item-id> --status completed --output json
   ```
3. **Verify** at least one PR has `status: completed` (i.e. merged). If none found, stop and report: "No merged PR found for work item #<id>. Archive blocked."
4. **Record** the PR URL and merge date in the archive metadata
5. **Mark the work item as Resolved**:
   ```bash
   az boards work-item update --id <work-item-id> --state Resolved
   ```

**If no ADO work item ID is present:**

- Ask the user to confirm: "Has the PR been merged? [Y/n]"
- Record their confirmation in the archive metadata

## Archive Action

Move story directory using `git mv` to preserve history:

```
.avaylerflow/US001-feature-name/  →  .avaylerflow/completed/US001-feature-name/
├── story.md                          ├── story.md
├── tasks.md                          ├── tasks.md
└── implementation-summary.md         └── implementation-summary.md
```

## Index Updates

- Remove from `.avaylerflow/index.md` (active section)
- Add to `.avaylerflow/completed/archive-index.md` with metadata:
  - Archive date
  - Effort (estimated vs actual)
  - PR URL (from ADO or user-provided)
  - ADO work item ID and final state (if applicable)
  - Test coverage
  - Completion stats
- Reset `.avaylerflow/implementation-plan.md` to an empty template when all stories are archived
- If any active stories remain, keep the plan scoped only to active stories

**Options**: `--all` — archive all stories that pass validation checks
