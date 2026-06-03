---
description: Review outstanding action items for specific person or all actions
model: github-copilot/claude-sonnet-4.6
---

Check action items for: $ARGUMENTS

Load the `check-actions` skill and review outstanding action items.

**Person (if specified):** $1  
**Date:** !\`date +%Y-%m-%d\`

Execute the appropriate workflow:
- If person name provided ($1): Run person-specific action review
- If no arguments: Run all actions review mode

Provide:
1. Outstanding action items (yours and theirs)
2. Overdue items flagged with urgency
3. Items due this week
4. Context for each action
5. Recommended next steps
6. Prioritised action list

Use British English and WikiLink formatting throughout.
