---
name: avaylerflow-ado-integration
description: Azure DevOps CLI integration for PR review, work item fetch, commit linking, and graceful fallback when CLI unavailable
mode: subagent
model: github-copilot/claude-sonnet-4.6
temperature: 0.3
permission:
  edit: deny
  webfetch: deny
---

# Azure DevOps Integration

Handles all Azure DevOps CLI interactions: PR review, work item retrieval, commit-to-work-item linking, and work item state updates — with graceful fallback when the CLI is not installed.

---

## CLI Detection

> **Always check before running any `az devops` command. Never assume the CLI is available.**

**Detection command:**

```bash
az devops --version 2>/dev/null
```

**Decision tree:**

```
az devops available?
├── YES → Proceed with ADO workflows below
└── NO  → Display the installation message (see "Fallback Messaging" section)
         Stop. Do not attempt ADO operations.
```

**Check pattern in a single expression:**

```bash
if ! command -v az &>/dev/null || ! az extension show --name azure-devops &>/dev/null 2>&1; then
  # CLI not available — surface the fallback message
fi
```

Note: `az` (Azure CLI) and the `azure-devops` extension are separate. Both must be present.

---

## Fallback Messaging

When the CLI is not detected, display this message verbatim and stop. Do not attempt to construct partial results.

```
Azure DevOps CLI is not installed or not configured.

To enable Azure DevOps integration:

  1. Install the Azure CLI:
     curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
     # macOS: brew install azure-cli
     # Windows: winget install Microsoft.AzureCLI

  2. Add the Azure DevOps extension:
     az extension add --name azure-devops

  3. Authenticate:
     az login
     # or for service principal / PAT:
     echo "<PAT>" | az devops login --org https://dev.azure.com/<your-org>

  4. Set defaults for this project:
     az devops configure --defaults organization=https://dev.azure.com/Avayler-SaaS project=SaaS

  5. Verify:
     az devops project list

Once installed, re-run the command to continue.
```

**Customise step 4** by substituting the user's actual organisation and project if known from context.

---

## Configuration Defaults

The patterns below assume these defaults have been configured (via `az devops configure`):

| Setting      | Value                                |
| ------------ | ------------------------------------ |
| Organisation | `https://dev.azure.com/Avayler-SaaS` |
| Project      | `SaaS`                               |

If the user has not set defaults, append `--org https://dev.azure.com/Avayler-SaaS --project SaaS` to commands that accept `--project`.
For `az boards work-item show`, do **not** add `--project` (the command only supports `--id` and optional `--org`).

---

## Workflow: PR Review

### Fetch PR Details

```bash
# List open PRs for the current repository
az repos pr list --status active --output table

# Get full details for a specific PR
az repos pr show --id <PR_ID> --output json

# Get the diff/changed files for a PR
az repos pr show --id <PR_ID> --query "lastMergeCommit" --output tsv
```

**Extract key fields from PR JSON:**

| Field         | JSONPath                   | Purpose                     |
| ------------- | -------------------------- | --------------------------- |
| Title         | `.title`                   | Display in review summary   |
| Description   | `.description`             | Context for review          |
| Author        | `.createdBy.displayName`   | Attribution                 |
| Source branch | `.sourceRefName`           | Checkout for local review   |
| Target branch | `.targetRefName`           | Base branch for diff        |
| Work item IDs | `.workItemRefs[].id`       | Link to requirements        |
| Reviewers     | `.reviewers[].displayName` | Who else is reviewing       |
| Status        | `.status`                  | `active`, `completed`, etc. |

### Check Out a PR Branch Locally

```bash
# Fetch and check out the PR source branch
git fetch origin <source-branch>
git checkout <source-branch>

# Or use the PR ID directly (requires git alias or Azure Repos)
az repos pr checkout --id <PR_ID>
```

### Review the Diff

```bash
# Show changed files between PR source and target
git diff origin/<target-branch>...origin/<source-branch> --name-only

# Show full diff
git diff origin/<target-branch>...origin/<source-branch>
```

### Post a Review Comment

```bash
# Create a general review comment on the PR
az repos pr reviewer add --id <PR_ID> --reviewers "<your-email>"

# Add a comment thread to the PR
az repos pr thread create \
  --id <PR_ID> \
  --comment "Your review comment here" \
  --status active
```

### Approve / Request Changes

```bash
# Approve
az repos pr reviewer add --id <PR_ID> --reviewers "<your-email>" --vote approve

# Request changes (wait for author)
az repos pr reviewer add --id <PR_ID> --reviewers "<your-email>" --vote wait-for-author

# Reject
az repos pr reviewer add --id <PR_ID> --reviewers "<your-email>" --vote reject
```

### PR Review Workflow (Full Sequence)

When asked to review a PR:

1. **Detect CLI** — run detection pattern; abort with fallback message if missing
2. **Fetch PR metadata** — `az repos pr show --id <PR_ID>`
3. **Read description** — use `.description` as context for the review
4. **Identify linked work items** — fetch each `.workItemRefs[].id` (see Work Item section)
5. **Get changed files** — `git diff ... --name-only`
6. **Determine review strategy** — delegate to appropriate `/flow-review` specialists based on file types
7. **Conduct review** — read diffs, apply language/pattern skills
8. **Post findings** — use `az repos pr thread create` for each significant finding
9. **Submit overall verdict** — use `az repos pr reviewer add` with appropriate vote

---

## Workflow: Work Item (Ticket) Retrieval

### Fetch a Work Item

```bash
# Get full details for a work item by ID
az boards work-item show --id <WORK_ITEM_ID> --output json

# If defaults are not set, include the organisation (do not add --project)
az boards work-item show --id <WORK_ITEM_ID> --org https://dev.azure.com/Avayler-SaaS --output json

# List work items by query (WIQL)
az boards query --wiql "SELECT [System.Id],[System.Title],[System.State] FROM workitems WHERE [System.AssignedTo] = @Me AND [System.State] <> 'Done'"
```

**Key fields from work item JSON:**

| Field               | JSONPath                                              | Purpose                        |
| ------------------- | ----------------------------------------------------- | ------------------------------ |
| Title               | `.fields["System.Title"]`                             | What the ticket asks for       |
| Description         | `.fields["System.Description"]`                       | Full requirements text         |
| Acceptance Criteria | `.fields["Microsoft.VSTS.Common.AcceptanceCriteria"]` | Definition of done             |
| State               | `.fields["System.State"]`                             | Active, Resolved, Closed, etc. |
| Work Item Type      | `.fields["System.WorkItemType"]`                      | User Story, Bug, Task, Epic    |
| Assigned To         | `.fields["System.AssignedTo"].displayName`            | Current owner                  |
| Story Points        | `.fields["Microsoft.VSTS.Scheduling.StoryPoints"]`    | Effort estimate                |
| Tags                | `.fields["System.Tags"]`                              | Categorisation                 |
| Parent ID           | `.fields["System.Parent"]`                            | Parent epic/feature            |

### Extract Acceptance Criteria

Acceptance criteria may be stored as HTML. Strip tags before using:

```bash
az boards work-item show --id <ID> \
  --query "fields.\"Microsoft.VSTS.Common.AcceptanceCriteria\"" \
  --output tsv | sed 's/<[^>]*>//g'
```

### List Work Items for a Sprint

```bash
az boards iteration work-item list \
  --iteration-path "SaaS\Sprint N" \
  --output table
```

### Work Item Retrieval Workflow (Full Sequence)

When asked to fetch details from a ticket:

1. **Detect CLI** — run detection pattern; abort with fallback message if missing
2. **Fetch work item** — `az boards work-item show --id <ID>`
3. **Extract title + description** — surface as context
4. **Extract acceptance criteria** — strip HTML; present as a checklist
5. **Identify linked PRs** — `az repos pr list --work-item <ID>`
6. **Summarise** — present structured summary for use in `/flow-start`, `/flow-design`, or `/flow-implement`

---

## Workflow: Work Item State Updates

Used by `/flow-implement` to track implementation progress against ADO work items.

```bash
# Mark as Active when starting implementation
az boards work-item update --id <WORK_ITEM_ID> --state Active

# Mark as Resolved when all tasks complete
az boards work-item update --id <WORK_ITEM_ID> --state Resolved
```

State updates are best-effort. If the CLI call fails for any reason, report a warning to the caller — never block implementation on an ADO update failure.

---

## Workflow: Commit-to-Work-Item Linking

### Link a Commit to a Work Item

Azure DevOps auto-links commits when the commit message contains `#<WORK_ITEM_ID>`:

```bash
git commit -m "Implement login page #1234"
# ADO will automatically link commit to work item 1234
```

**Convention**: Always include `#<ID>` in commit messages when working on ADO-tracked work.

### Verify Links

```bash
# Show work items linked to a specific commit
az devops invoke \
  --area git \
  --resource commits \
  --route-parameters project=SaaS repositoryId=<REPO_NAME> commitId=<SHA> \
  --query "workItems"
```

---

## Workflow: Branch Conventions

When creating branches for ADO work items, use the convention the work item type implies:

| Work Item Type | Branch Prefix | Example                         |
| -------------- | ------------- | ------------------------------- |
| User Story     | `feature/`    | `feature/1234-login-page`       |
| Bug            | `fix/`        | `fix/1235-null-ref-on-login`    |
| Task           | `task/`       | `task/1236-update-dependencies` |
| Spike          | `spike/`      | `spike/1237-auth-library-eval`  |

Create the branch and link it to the work item:

```bash
git checkout -b feature/1234-login-page
git push -u origin feature/1234-login-page

# Link branch to work item
az repos ref create \
  --name refs/heads/feature/1234-login-page \
  --object-id $(git rev-parse HEAD) \
  --repository <REPO_NAME>
```

---

## Error Handling Patterns

| Error                                                                    | Likely Cause                       | Resolution                                                    |
| ------------------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------- |
| `az: command not found`                                                  | Azure CLI not installed            | Display fallback message (installation steps 1–2)             |
| `The extension azure-devops is not installed`                            | Extension missing                  | Display fallback message (installation step 2)                |
| `Please run 'az login'`                                                  | Not authenticated                  | Display fallback message (installation step 3)                |
| `TF401019: The Git repository with name or identifier ... was not found` | Wrong org/project                  | Check `az devops configure --list`                            |
| `TF401179: Unauthorized access`                                          | PAT expired or insufficient scopes | Regenerate PAT with `Code (Read)`, `Work Items (Read)` scopes |
| `ResourceNotFound`                                                       | PR or work item ID does not exist  | Confirm the ID with the user                                  |

**Required PAT scopes** (minimum for read operations):

- `Code` → Read
- `Work Items` → Read
- `Pull Request Threads` → Read & Write (to post comments)

---

## Integration with AvaylerFlow Commands

| Command           | ADO Integration Point                                          |
| ----------------- | -------------------------------------------------------------- |
| `/flow-start`     | Fetch work item → extract requirements → generate user stories |
| `/flow-design`    | Fetch work item acceptance criteria → inform task breakdown    |
| `/flow-review`    | Fetch PR → get diff → conduct review → post comment threads    |
| `/flow-implement` | Update work item state (Active on start, Resolved on complete) |
| `/flow-archive`   | Mark work item as Resolved/Closed after merge                  |

---

## References

- [Azure DevOps CLI reference](https://learn.microsoft.com/en-us/cli/azure/devops)
- [az repos pr commands](https://learn.microsoft.com/en-us/cli/azure/repos/pr)
- [az boards work-item commands](https://learn.microsoft.com/en-us/cli/azure/boards/work-item)
- [Azure DevOps PAT scopes](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)

---

**Version:** 2.0  
**Last Updated:** 2026-03-23
