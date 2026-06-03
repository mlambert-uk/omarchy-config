---
description: Get quick status overview of a specific project
model: github-copilot/claude-sonnet-4.6
---

Get status overview for project: $1

**Project:** $1
**Date:** !\`date +%Y-%m-%d\`

Load the `obsidian-formatting` skill and provide a comprehensive project status check:

1. Find and read the project file in `~/Documents/mlambert_uk/1 - Projects/`
   - Search for files matching "$1" (flexible matching)
   - If multiple matches, list them and ask which one

2. Extract and summarise:
   - **Current Status**: Active/On-Hold/Blocked/Complete (from frontmatter or content)
   - **Priority Level**: Critical/High/Medium/Low
   - **Owner**: Who's responsible
   - **Last Updated**: When was this last touched
   - **Key Milestones**: What's been achieved recently
   - **Next Actions**: What needs to happen next
   - **Blockers**: What's preventing progress
   - **Dependencies**: What this project is waiting on

3. Check related tasks in `~/Documents/mlambert_uk/Tasklist.md`:
   - Find tasks linked to this project
   - Show their status (Backlog/Commitments/ToDo/On-Hold/Complete)
   - Highlight overdue or upcoming deadlines

4. Search for recent mentions in daily notes (last 2 weeks):
   - Check `~/Documents/mlambert_uk/0 - Journal/Daily/` for references
   - Summarise recent activity or discussions

5. Provide actionable summary:
   - Overall health: 🟢 On Track / 🟡 Needs Attention / 🔴 Blocked/At Risk
   - Top 3 next actions
   - Recommended timeline
   - Who needs to be involved

Format the output as a concise status dashboard using British English and WikiLinks.

If no project file is found, search the vault more broadly and suggest similar project names.
