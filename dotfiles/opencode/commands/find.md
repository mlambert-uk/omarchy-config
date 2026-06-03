---
description: Quick lookup of person context including recent 1:1s and action items
model: github-copilot/gpt-5-mini
---

Find person context for: $1

**Person:** $1
**Date:** !\`date +%Y-%m-%d\`

Load the `obsidian-formatting` skill and provide comprehensive person lookup:

1. **Find person record:**
   - Search `~/Documents/mlambert_uk/5 - People/Work/` for person's file
   - Read their personal record (role, team, key context)

2. **Recent 1:1 meetings:**
   - Find their directory in `~/Documents/mlambert_uk/D - Meeting Notes/Line Management/`
   - Show last 3 1:1 meeting dates and topics
   - Calculate days since last meeting

3. **Outstanding action items:**
   - Extract action items from recent 1:1s (yours and theirs)
   - Flag overdue items
   - Show upcoming commitments

4. **Current context:**
   - Projects they're involved in
   - Recent mentions in daily notes
   - Any concerns or focus areas from last meeting

5. **Quick summary:**
   - Role and team
   - Last interaction date
   - Current status (probation, career development stage, etc.)
   - Next scheduled 1:1 (if known)
   - Key points to remember

Format as a concise "person card" suitable for quick reference before conversations.

Use British English and WikiLink formatting throughout.

If person not found, search more broadly and suggest similar names.
