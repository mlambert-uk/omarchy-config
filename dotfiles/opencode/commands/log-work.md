---
description: Log a work session with duration, accomplishments, and outcomes
arguments:
  - name: start_time
    description: Session start time in HH:MM format (e.g., "14:00")
    required: true
  - name: end_time
    description: Session end time in HH:MM format (e.g., "14:35")
    required: true
  - name: accomplishments
    description: What was completed (e.g., "Wei Chen transcript reviewed and imported")
    required: true
  - name: outcome
    description: Results or key outcomes (optional, e.g., "Personal record updated with AWS goals and game development interest")
    required: false
---

Log a completed work session with duration, accomplishments, and key outcomes to today's daily note.

Delegates to the `log-work` agent which invokes the session-logging helper.

**Entry format added to daily note:**

```
**HH:MM–HH:MM** — Completed: [accomplishments]. Outcome: [outcome].
```

**Example:**

```
/log-work "14:00" "14:35" "Wei Chen transcript reviewed and imported" "Personal record updated with AWS Academy goals"
```
