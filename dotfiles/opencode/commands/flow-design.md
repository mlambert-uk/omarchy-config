---
name: flow-design
description: Generate detailed implementation task lists for user stories with effort estimates and priorities
model: github-copilot/claude-sonnet-4.6
template: |
  # /flow-design

  Transform user stories into actionable implementation task lists.

  For each story, create `.avaylerflow/{story-id}/tasks.md` with:
  - Design/Architecture section with checklist tasks
  - Implementation section with 2–8 hour task chunks
  - Testing section (only if test framework exists)
  - Documentation section
  - Task-level effort estimates
  - Total story effort and timeline
  - Risks and dependencies

  Generate `.avaylerflow/implementation-plan.md` with overall roadmap, dependencies between stories, and timeline.
---

# /flow-design

Read user stories and generate detailed task breakdowns in `.avaylerflow/{story-id}/tasks.md` files.

**Usage**:

```
/flow-design                          # all stories from .avaylerflow/
/flow-design <user-story-id>          # specific story file (e.g. US001)
/flow-design --ado <work-item-id>     # Azure DevOps work item as input
/flow-design US001 --options          # explore design alternatives
/flow-design --ado <id> --options     # ADO input with design alternatives
```

## Input Detection

**Step 0 — Precondition check**:

Before generating tasks, verify the story source exists:

- **Local story**: Check `.avaylerflow/{story-id}/story.md` exists. If not found, stop and display: `No story found for {story-id}. Run /flow-start {story-id} first.`
- **No argument**: Check `.avaylerflow/` directory contains at least one `story.md`. If empty or missing, stop and display: `No stories found in .avaylerflow/. Run /flow-start to create one.`
- **ADO work item**: The existence check is performed during fetch (Step 2 of the ADO workflow below). A 404 from the API is a hard stop with message: `Work item {id} not found.`

**Step 1**: Determine the requirements source:

| Argument pattern                 | Source type            | Action                                     |
| -------------------------------- | ---------------------- | ------------------------------------------ |
| `--ado <id>`                     | Azure DevOps work item | Follow ADO workflow below                  |
| `<user-story-id>` (e.g. `US001`) | Story file             | Read `.avaylerflow/US001-*/story.md`       |
| No argument                      | All stories            | Read all `.avaylerflow/US*/story.md` files |

## ADO Workflow

When the source is an Azure DevOps work item:

1. **Invoke** `avaylerflow-ado-integration` to detect the CLI and fetch the work item
   - If the agent reports CLI unavailable: display the fallback message it returns and stop
2. **Fetch** the work item (via the agent):
   ```bash
   az boards work-item show --id <work-item-id> --org https://dev.azure.com/Avayler-SaaS --output json
   ```
3. **Extract**:
   - Title → `fields["System.Title"]`
   - Description → `fields["System.Description"]`
   - Acceptance Criteria → `fields["Microsoft.VSTS.Common.AcceptanceCriteria"]`
   - Story Points → `fields["Microsoft.VSTS.Scheduling.StoryPoints"]` (use as effort ceiling)
4. **Check** whether a matching `.avaylerflow/` story already exists (from a prior `/flow-start --ado <id>`):
   - If found: use it as the base, augment with any acceptance criteria not already captured
   - If not found: treat the work item fields as the story input directly
5. **Proceed** with task generation below, using the fetched content as the story context

## Task Generation

Each `tasks.md` includes:

- Design/Architecture, Implementation, Testing, Documentation sections
- Markdown task list items with checkboxes at the start (e.g. `- [ ] Task`) under each section
- No header-only tasks; keep headings for sections only
- Task-level effort estimates (2–8 hour chunks)
- Dependencies and risks
- Total story effort estimation
- If ADO story points were present: note whether the estimate aligns or diverges

## Directory Structure

```
.avaylerflow/
├── US001-feature-name/
│   ├── story.md           # Created by /flow-start
│   └── tasks.md           # Created by /flow-design ← YOU CREATE THIS
├── implementation-plan.md  # Overall plan ← YOU CREATE THIS
└── index.md
```

Generate `.avaylerflow/implementation-plan.md` with all stories, dependencies, implementation roadmap, and timeline.

## Options

- `--options` — Launch parallel sub-agents to explore 2–3 radically different design approaches (simple/pattern-based/advanced). Present trade-offs, let user choose, then generate tasks for the selected approach.
