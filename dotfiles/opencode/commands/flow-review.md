---
name: flow-review
description: Comprehensive multi-language code review with automatic specialist agent selection
model: github-copilot/gpt-5.2-codex
template: |
  # /flow-review

  Detect languages/frameworks from changed files (C#, React, PostgreSQL, Pulumi/AWS) and automatically delegate to specialist agents.

  Check:
  - Correctness and logic
  - Security (OWASP Top 10)
  - Performance (N+1 queries, memory leaks)
  - Best practices and maintainability
  - Testability and documentation

  Specialists run in parallel:
  - avaylerflow-csharp-reviewer (C#, .csproj)
  - avaylerflow-react-reviewer (TSX, JSX, React)
  - avaylerflow-postgresql-reviewer (SQL, EF Core)
  - avaylerflow-pulumi-specialist (Pulumi.yaml, infrastructure)
  - avaylerflow-security-reviewer (always runs)

  Generate combined report with CRITICAL/HIGH/MEDIUM/LOW issues and actionable fixes.
---

# /flow-review

Detect languages/frameworks from changed files (C#, React, PostgreSQL, Pulumi/AWS) and automatically delegate to appropriate specialist agents for deep review.

Check correctness, security (OWASP Top 10), performance (N+1 queries, memory leaks), best practices, maintainability, testability, and documentation.

**Usage**:

```
/flow-review                        # uncommitted local changes (git diff)
/flow-review <path>                 # specific file or directory
/flow-review --ado <pr-id>          # Azure DevOps pull request
/flow-review --ado <pr-id> --org <org> --project <project>
```

## Input Detection

**Step 1**: Determine the review scope from the argument provided:

| Argument pattern                         | Source type         | Action                       |
| ---------------------------------------- | ------------------- | ---------------------------- |
| `--ado <id>` or bare integer (e.g. `42`) | Azure DevOps PR     | Follow ADO PR workflow below |
| File path or directory                   | Local files         | Read path directly           |
| No argument                              | Uncommitted changes | `git diff HEAD`              |

## ADO PR Workflow

When the source is an Azure DevOps pull request:

1. **Invoke** `avaylerflow-ado-integration` to detect the CLI and fetch the PR metadata
   - If the agent reports CLI unavailable: display the fallback message it returns and stop
2. **Fetch PR metadata** (via the agent):
   ```bash
   az repos pr show --id <pr-id> --output json
   ```
   Append `--org` / `--project` if provided; otherwise rely on configured defaults.
3. **Confirm** the PR with the user before proceeding:
   ```
   Fetched PR #<id>: <title>
   Author: <author> | <source-branch> → <target-branch>
   Changed files: <count> | Linked work items: <ids or "none">
   Proceed with review? [Y/n]
   ```
4. **Fetch linked work items** (if any) for requirements context:
   ```bash
   az boards work-item show --id <work-item-id> --org https://dev.azure.com/Avayler-SaaS --output json
   ```
   Extract title and acceptance criteria to use as review context (does the code satisfy the ticket?).
5. **Get the diff**:
   ```bash
   git fetch origin
   git diff origin/<target-branch>...origin/<source-branch>
   ```
6. **Proceed** with language detection and specialist delegation below, using the PR diff as the review scope.
7. **After review**: post findings as comment threads on the PR:
   ```bash
   az repos pr thread create --id <pr-id> --comment "<finding>"
   ```
8. **Submit verdict**:
   ```bash
   # Approve
   az repos pr reviewer add --id <pr-id> --reviewers "<email>" --vote approve
   # Request changes
   az repos pr reviewer add --id <pr-id> --reviewers "<email>" --vote wait-for-author
   ```

## Local Workflow

When the source is a path or uncommitted changes:

- `git diff HEAD` for uncommitted changes, or read the specified path
- Proceed with language detection and specialist delegation below

## Language Detection and Specialist Delegation

From the set of changed files, detect languages and frameworks then delegate in parallel:

| Files present                                          | Specialist agent                             |
| ------------------------------------------------------ | -------------------------------------------- |
| `*.cs`, `*.csproj`                                     | `avaylerflow-csharp-reviewer`                |
| `*.tsx`, `*.ts`, `*.jsx` (not in Pulumi stack)         | `avaylerflow-react-reviewer`                 |
| `*.sql`, EF Core migrations                            | `avaylerflow-postgresql-reviewer`            |
| `Pulumi.yaml` present, OR `*.ts` in a Pulumi stack dir | `avaylerflow-pulumi-specialist`              |
| Any security-sensitive changes                         | `avaylerflow-security-reviewer` (always run) |

**Pulumi disambiguation**: If `Pulumi.yaml` is present in the repository root or a subdirectory, treat all `*.ts` files co-located with it as infrastructure code and route to `avaylerflow-pulumi-specialist`, not `avaylerflow-react-reviewer`.

Launch all applicable specialists in parallel. Combine results into a single report.

## Review Criteria

Each specialist checks:

- Correctness and logic errors
- Security (OWASP Top 10)
- Performance (N+1 queries, memory leaks, unnecessary allocations)
- Best practices and maintainability
- Testability and documentation

If linked work items were fetched, also check: **does the implementation satisfy the acceptance criteria?**

## Output Format

```
# Code Review: <source description>

## Summary
<1-2 sentence verdict> | Recommendation: APPROVE / REQUEST CHANGES / NEEDS DISCUSSION

## Positive Observations
- ...

## Issues

### CRITICAL
### HIGH
### MEDIUM
### LOW

Each issue:
- Location: file:line
- Problem: what is wrong
- Fix: code example

## Acceptance Criteria Coverage (ADO PR only)
- [ ] Criterion 1 — met / not met / partially met
- [ ] Criterion 2 — ...

## Recommendations
Prioritised list with estimated fix time
```
