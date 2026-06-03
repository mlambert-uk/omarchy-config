---
description: Log the end of a session with accomplishments and decisions
arguments:
  - name: accomplishments
    description: What was completed in this session (e.g., "Reviewed 3 transcripts and updated personal records")
    required: true
  - name: decisions
    description: Key decisions made (optional, e.g., "Dan Carter needs pair programming for week 1")
    required: false
---

Log the end of a focused work session to today's daily note.

Delegates to the `log-session-end` agent which invokes the session-logging helper.

**Entry format added to daily note:**

```
**HH:MM** — ✓ Session completed: [accomplishments]. Decision: [decisions].
```

**Example:**

```
/log-session-end "Reviewed 3 transcripts and updated personal records" "Dan Carter needs pair programming for week 1"
```
