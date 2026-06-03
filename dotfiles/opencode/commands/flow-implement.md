---
name: flow-implement
description: Implement user story tasks with progress tracking and implementation summaries
model: github-copilot/gpt-5.2-codex
template: |
  # /flow-implement

  Execute implementation tasks from `.avaylerflow/{story-id}/tasks.md`.

  For each task:
  1. Implement following existing code patterns
  2. Run tests if framework exists (never create test infrastructure)
  3. Update task checklist in tasks.md
  4. Show progress ("Task 5/12 complete")
  5. Stop on blockers

  After all tasks complete, generate `.avaylerflow/{story-id}/implementation-summary.md` with:
  - Architecture decisions and rationale
  - Code changes (files modified/created/deleted)
  - Testing approach and results
  - Acceptance criteria verification
  - Dependencies and blockers
  - Peer review focus areas
  - Time tracking (estimated vs actual)
---

# /flow-implement

Implement tasks from `.avaylerflow/{story-id}/tasks.md`. Track progress, generate summary.

Before the implementation loop begins, invoke `avaylerflow-test-strategy.agent` to detect the test framework and determine the adaptive testing approach. Carry the strategy determination forward through all implementation tasks.

If no test framework is detected, **do not add tests or test infrastructure**. Implementation proceeds without tests and the summary must note the absence and recommendation.

## Precondition Check

Before starting implementation, verify the required artefacts exist:

1. Check `.avaylerflow/{story-id}/story.md` exists. If not: stop and display: `No story found for {story-id}. Run /flow-start {story-id} first.`
2. Check `.avaylerflow/{story-id}/tasks.md` exists. If not: stop and display: `No task breakdown found for {story-id}. Run /flow-design {story-id} first.`
3. If tasks.md exists but all tasks are already checked `[x]`: confirm with user before re-running.

## ADO Work Item State Tracking

If the story file (`story.md`) contains an ADO work item ID in its source reference:

1. **Invoke** `avaylerflow-ado-integration` with the work item ID and action required
   - **On start**: request action `set-active` — agent marks the work item as Active
   - **On completion** (after all tasks done and summary generated): request action `set-resolved` — agent marks as Resolved
2. If the agent reports the CLI is unavailable: skip state updates silently (do not block implementation)

State updates are best-effort. If the agent reports any failure, log a warning and continue — never block implementation on an ADO update.

## Workflow

**For each task:**

1. Read task from `.avaylerflow/{story-id}/tasks.md`
2. Implement following existing code patterns
3. Write/update tests only if a framework exists (never create a framework here)
4. Mark complete `[x]` in `tasks.md`
5. Show progress: "Task 5/12 complete"
6. Stop on test failures or blockers

**After all tasks complete:**

Generate `.avaylerflow/{story-id}/implementation-summary.md` with:

- Source reference (ADO work item ID if applicable)
- Overview (2-3 sentences)
- Architecture decisions (context, decision, rationale, alternatives)
- Code changes (files modified/created/deleted)
- Testing approach (tests added OR "No test framework, recommend adding")
- Acceptance criteria verification
- Dependencies & blockers encountered
- Configuration changes
- Breaking changes (if any)
- Peer review focus areas
- Lessons learned
- Time tracking (estimated vs actual)

## Quality Checks

Before marking complete:

- [ ] All tasks checked off
- [ ] All tests passing (if tests exist)
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Implementation summary generated
- [ ] ADO work item marked Resolved (if applicable)

## Usage

```
/flow-implement US001
/flow-implement US001 --tdd  # Force TDD approach
```
