---
description: Log a topic pivot when switching focus mid-session
arguments:
  - name: new_topic
    description: What you're switching to (e.g., "1:1 meeting prep", "transcript processing", "bug triage")
    required: true
  - name: reason
    description: Why you're pivoting (optional, e.g., "Wei Chen 1:1 approaching at 15:00")
    required: false
---

Log a context or topic shift during a work session to today's daily note.

Delegates to the `log-topic-pivot` agent which invokes the session-logging helper.

**Entry format added to daily note:**

```
**HH:MM** — Topic pivot: Switching to [new_topic] ([reason]).
```

**Example:**

```
/log-topic-pivot "1:1 meeting prep" "Wei Chen 1:1 approaching at 15:00"
```
