---
description: Review today's OpenCode transcript and extract work summary
---

This command invokes the transcript-review agent to analyze your OpenCode conversations for the day and extract what work was actually completed.

**What it does:**

1. Reads your complete OpenCode transcript from today
2. Identifies all work that was accomplished (tasks, decisions, implementations, reviews, fixes)
3. Presents a structured summary with time estimates
4. Highlights key decisions and carry-overs

**How to use:**

```
/review-transcript
```

This will show you a clean summary like:

```
## Work Completed Today

1. **Fixed session logging system** (11:45–12:35)
   - Rewrote helper script logic
   - Created 4 agent wrappers
   - Tested with real work

2. **Removed Mnemonio from config** (10:30–11:45)
   - Archived memory files
   - Updated opencode.json
   - DD-05 decision executed

---

Total: 2 hours
Key decision: Mnemonio retired; Obsidian vault is now single source of truth
```

You can then use this summary to:

- Log specific work blocks to your session log manually
- Populate your end-of-day entry
- Identify what should go in your daily note

**Integration:** This is typically run as part of your `/end-of-day` routine, but you can use it anytime to review what you've worked on.
