---
name: flow-start
description: Transform requirements into comprehensive user stories with acceptance criteria, technical specs, and effort estimates
model: github-copilot/claude-sonnet-4.6
template: |
  # /flow-start

  Read a requirements source (file or Azure DevOps work item) and transform it into detailed, independently valuable user stories.

  For each story, generate:
  - User story statement (As a... I want... So that...)
  - 3–5 Given/When/Then acceptance criteria
  - Technical specifications (API endpoints, data models, UI components)
  - Dependencies and risks
  - Effort estimate (8–40 hours)

  Create `.avaylerflow/` directory structure with story files and index.md for navigation.
---

# /flow-start

Read a requirements source and transform into detailed user stories with acceptance criteria (Given/When/Then), technical specifications, and effort estimates.

**Usage**:

```
/flow-start <requirements-file>
/flow-start --ado <work-item-id>
/flow-start --ado <work-item-id> --org <org> --project <project>
/flow-start <requirements-file> --force
/flow-start --ado <work-item-id> --force
```

## Input Detection

**Step 0 — Precondition check**:

Before doing anything else, check whether `.avaylerflow/` already exists in the current directory and contains at least one `story.md` file:

- **If active stories exist**: stop and display:
  ```
  .avaylerflow/ already contains active stories. Run /flow-archive first to complete the current work, or pass --force to overwrite.
  ```
- **If `.avaylerflow/` exists but contains only `completed/`** (i.e. all stories archived): proceed normally.
- **If `.avaylerflow/` does not exist**: proceed normally.
- **`--force` flag**: skip this check and overwrite. Use with caution — existing story files will be replaced.

**Step 1**: Determine the requirements source from the argument provided:

| Argument pattern                           | Source type            | Action                                                                          |
| ------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------- |
| `--ado <id>` or bare integer (e.g. `1234`) | Azure DevOps work item | Follow ADO workflow below                                                       |
| File path or filename                      | Requirements file      | Read file directly                                                              |
| No argument                                | Unknown                | Ask the user: "Please provide a requirements file path or an ADO work item ID." |

## ADO Workflow

When the source is an Azure DevOps work item:

1. **Invoke** `avaylerflow-ado-integration` to detect the CLI and fetch the work item
   - If the agent reports CLI unavailable: display the fallback message it returns and stop
2. **Fetch** the work item (via the agent):
   ```bash
   az boards work-item show --id <work-item-id> --org https://dev.azure.com/Avayler-SaaS --output json
   ```
   If `--org` / `--project` flags were provided, append them; otherwise rely on configured defaults.
3. **Extract** the following fields (strip any HTML tags from description and acceptance criteria):
   - Title → `fields["System.Title"]`
   - Description → `fields["System.Description"]`
   - Acceptance Criteria → `fields["Microsoft.VSTS.Common.AcceptanceCriteria"]`
   - Work Item Type → `fields["System.WorkItemType"]`
   - Story Points → `fields["Microsoft.VSTS.Scheduling.StoryPoints"]` (use as effort hint if present)
4. **Confirm** the fetched details with the user before proceeding:
   ```
   Fetched work item #<id>: <title>
   Type: <type> | Story Points: <points or "not set">
   Proceed? [Y/n]
   ```
5. **Treat** the extracted title + description + acceptance criteria as the requirements input and continue with story generation below.

## File Workflow

When the source is a requirements file:

1. Read the file contents
2. Use the full text as the requirements input and continue with story generation below.

## Story Generation

From the requirements input (regardless of source):

- Determine the next story ID by scanning `.avaylerflow/` for the highest existing `US###` across active stories and `completed/`, then continue numbering (do not reset to US001 after archive)
- Decompose into independently valuable, testable, implementable user stories
- Each story: As a... I want... So that...
- 3–5 Given/When/Then acceptance criteria per story
- Technical specs (API endpoints, data model changes, UI components)
- Dependencies and risks
- Effort estimate (8–40 hours per story); if ADO story points were present, use as a cross-check

## Directory Structure

```
.avaylerflow/
├── index.md                    # Overview and navigation
├── US001-feature-name/
│   └── story.md
├── US002-another-feature/
│   └── story.md
└── completed/
    └── archive-index.md
```

## Story File Content

Each `story.md` includes:

- Source reference (filename or ADO work item ID + title)
- User story statement
- Acceptance criteria (Given/When/Then)
- Technical specs
- Dependencies and risks
- Effort estimate

## Index File

Generate `.avaylerflow/index.md` with:

- Source reference (file or ADO work item)
- Overview of all active stories
- Quick navigation links
- Summary statistics (total stories, total estimated effort)
