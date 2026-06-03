---
description: Log the start of a new session with intent and goal
arguments:
  - name: session_type
    description: Type of session (e.g., "1:1 transcript review", "EP02 recording", "sprint planning")
    required: true
  - name: goal
    description: What you want to accomplish in this session (e.g., "Process 3 transcripts and update personal records")
    required: true
---

Log the start of a focused work session to today's daily note.

Delegates to the `log-session-start` agent which invokes the session-logging helper.

**Entry format added to daily note:**

```
**HH:MM** — [session_type]
Goal: [goal]
```

**Example:**

```
/log-session-start "1:1 transcript review" "Process Wei Chen, Dan Bircham, Dan Carter transcripts and update personal records"
```
