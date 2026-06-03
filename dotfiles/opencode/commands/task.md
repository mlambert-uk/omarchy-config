---
description: Quickly add a task to your Tasklist with proper formatting
model: github-copilot/gpt-5-mini
---

Add task to Tasklist: $ARGUMENTS

**Task description:** $ARGUMENTS
**Date:** !\`date +%Y-%m-%d\`

Load the `obsidian-formatting` skill and add the task to `~/Documents/mlambert_uk/Tasklist.md`.

**Parse the task:**
- Extract description (main text)
- Extract due date if mentioned (look for @[[YYYY-MM-DD]] or "due [date]" or "by [date]")
- Extract priority if mentioned (look for #High, #Critical, #Medium, #Low, #Urgent)
- Extract project link if mentioned (look for [[Project Name]])

**Determine section:**
- If priority is #High or #Critical → Add to **Commitments** section
- If priority is #Medium, #Low, or not specified → Add to **ToDo** section

**Format task:**
```markdown
- [ ] [Task description] @[[YYYY-MM-DD]] #Priority [[Project Link]]
```

**Add to appropriate section** in Tasklist.md preserving existing structure.

**Confirm addition** with:
- Task description
- Section added to (Commitments or ToDo)
- Due date (if specified)
- Priority level
- Linked project (if specified)

**Examples of task parsing:**
- "Complete review by next Friday #High" → Extract due date, High priority
- "Email Crispin about equipment proposal @[[2026-03-15]]" → Extract due date
- "Research AI training options for [[AI Enablement]]" → Extract project link
- "Authorise timesheets" → No date, default priority Medium, add to ToDo

Use British English and WikiLink formatting throughout.

If task already exists (similar description), ask before adding duplicate.
