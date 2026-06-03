# Skill: session-logging

## What I do

Provide standardised session logging for OpenCode workflows. Session logs accumulate throughout the working day and build a complete record of what was accomplished, enabling the end-of-day routine to synthesise rather than reconstruct the day's work.

## When to use me

Use this skill when:

- Starting a new OpenCode session and you want to log your initial intent
- Ending a session and you want to capture what was accomplished
- Pivoting to a different topic mid-session
- Building context for the end-of-day reflection routine

## Core Concept

**Session logs are the breadcrumb trail of your day.** Instead of asking agents to reconstruct what happened, the log records it as you go. This enables:

- **Complete record:** Nothing is lost between sessions
- **Easy synthesis:** End-of-day reads the log, not the vault
- **Natural narrative:** The log shows the actual flow of your day
- **Reduced cognitive load:** Agents don't have to guess or remember

## Log Entry Format

All session log entries follow this pattern:

```
**HH:MM** — [Entry content]
```

**Examples:**

Session start:

```
**09:00** — Morning brief and priority planning
Goal: EP02 recording, 1:1s with Wei and Dan, timesheet authorisation
```

Session work:

```
**10:00–12:00** — Completed: Wei Chen 1:1 (30 min, key outcomes: SSO issue escalated to Crispin). Dan Bircham 1:1 (30 min, confirmed L&D time protection).
```

Session end:

```
**16:45** — ✓ Session completed: Reviewed 3 transcripts, imported to vault, escalated chair delivery to Crispin. Decision: Dan Carter needs pair programming for week 1.
```

Topic pivot:

```
**14:35** — Topic pivot: Switching from transcript review to meeting prep (Wei Chen 1:1 at 15:00 approaching).
```

## Session Logging Modes

### Mode 1: Session Start

**When:** At the beginning of a focused work session (or first message of the day)

**What to log:**

- Session intent or type (e.g., "1:1 transcript review", "EP02 recording prep", "strategic planning")
- Goal for the session (what do you want to accomplish?)
- Expected duration (optional but helpful)

**Who logs:** The agent that starts the session, or a dedicated session-logger

**Format:**

```markdown
**HH:MM** — [Session Type]
Goal: [What you want to accomplish]
```

**Example:**

```markdown
**14:00** — Reviewing 1:1 transcripts
Goal: Process Wei, Dan B, Dan C transcripts and update personal records
```

### Mode 2: Session Work Log

**When:** As work progresses within a session

**What to log:**

- What was actually accomplished (completed tasks, decisions made)
- Key outcomes or follow-ups
- Duration of focused work if significant

**Who logs:** The agent working on the task, or appended at natural breakpoints

**Format:**

```markdown
**HH:MM–HH:MM** — Completed: [What was done]. [Key outcomes or decisions].
```

**Example:**

```markdown
**14:00–14:35** — Completed: Wei Chen transcript imported to vault. Outcome: Personal record updated with AWS Academy goals and game development interest. Decision: Escalate SSO issue to Crispin (blocking development).
```

### Mode 3: Topic Pivot

**When:** The conversation or work focus shifts to something substantially different

**What to log:**

- What you're switching to
- Why the pivot is happening (approaching meeting, urgent interrupt, natural transition)

**Who logs:** The agent detecting the shift, or the user explicitly

**Format:**

```markdown
**HH:MM** — Topic pivot: Switching to [New Topic] ([Reason]).
```

**Example:**

```markdown
**14:35** — Topic pivot: Switching to meeting prep (Wei Chen 1:1 at 15:00 approaching).
```

### Mode 4: Session End

**When:** At the end of a focused session or at day-end

**What to log:**

- What was completed in this session
- Key decisions made
- Any escalations or follow-ups needed
- Status of work-in-progress (if any)

**Who logs:** Agent ending the session, or automatically triggered by `/end-of-day`

**Format:**

```markdown
**HH:MM** — ✓ Session completed: [Accomplishments]. Decision: [Key decisions]. [Escalations or follow-ups].
```

**Example:**

```markdown
**15:30–17:00** — ✓ Session completed: EP02 recording (90 min). Asset uploaded to project, transcription queued. No blockers.
```

## Appending to Daily Notes

Session logs are appended to the current day's daily note in the Journal section:

**Path:** `~/Documents/mlambert_uk/0 - Journal/Daily/{YYYY-MM-DD}.md`

**Location within note:**

```markdown
## Journal

### Session Log

[Log entries accumulate here]

### Summary

[Written at day-end, based on the log]
```

## Trigger Points for Session Logging

### Automatic Triggers

1. **First message of the day** — Log session start automatically
2. **End-of-day command** — Log session end automatically
3. **Command invocation** — Detect major command invocations and optionally log them as topic shifts

### Explicit Triggers

1. **User says "new session"** — Explicitly start a new session log
2. **User says "end session"** — Explicitly end the current session
3. **User says "switching to..."** — Explicitly log a topic pivot
4. **User says "/log-session"** — Manual session logging command

### Heuristic Triggers

1. **Context shift detected** — When conversation topic changes significantly (optional, avoid over-logging)
2. **Time gap detected** — If significant time passes between entries, may auto-log

## Log Entry Constraints

- **Be specific, not vague:** ❌ "Did work" → ✅ "Reviewed 3 transcripts and updated personal records"
- **Include outcomes:** ❌ "Attended meeting" → ✅ "Attended Wei's 1:1, escalated SSO issue to Crispin"
- **Keep timestamps accurate:** Log the actual time, not a guess
- **One entry per distinct activity:** Don't bundle unrelated work
- **Include decisions when relevant:** They're important context for end-of-day synthesis

## Session Log Format within Daily Note

The Journal section should have this structure:

```markdown
## Journal

### Session Log

**09:00** — Morning brief and priority planning
Goal: 3 transcripts, 1:1s with Wei and Dan, EP02 recording

**10:00–12:00** — Completed: Wei Chen 1:1 (30 min). Outcome: SSO issue escalated to Crispin. Dan Bircham 1:1 (30 min). Outcome: L&D time confirmed protected.

**14:00–14:35** — Completed: Wei transcript review and import. Decision: Escalate SSO to Crispin.

**14:35** — Topic pivot: Switching to transcript review (Dan Bircham approaching).

**15:30–17:00** — ✓ Session completed: EP02 recording (90 min). Asset uploaded, transcription queued.

### Summary

[2-4 sentence narrative written by end-of-day agent, based on the session log above]

### Achievements

[Extracted and categorised from the session log]

### Carry-Overs

[Tasks continuing tomorrow]

### Insights

[Key learnings]
```

## Integration with End-of-Day

The end-of-day agent **reads the session log** and:

1. **Extracts achievements** from the log entries (what was actually completed)
2. **Identifies carry-overs** (incomplete work mentioned in the log)
3. **Categorises by type** (People, Delivery, Strategic, Enablement, etc.)
4. **Writes the Summary** (a narrative based on what the log shows, not starting from scratch)
5. **Notes Insights** (any non-obvious learnings mentioned in the log)

**This is dramatically simpler than reconstructing the day from memory or vault context.**

## Tips for Good Session Logging

✅ **Do:**

- Log regularly — ideally every 30–60 min or at natural breakpoints
- Include timestamps
- State what was completed and why it mattered
- Capture decisions with rationale
- Log escalations and follow-ups clearly
- Be honest about incomplete work

❌ **Don't:**

- Vague entries ("did stuff", "worked on things")
- Forget to log because you're busy (log brief notes asynchronously later)
- Over-log (every 5 min is noise)
- Omit context (tomorrow's you needs to understand today's work)
- Log activities that don't matter (don't record every Slack message)

## Examples of Good Session Logs

### Example 1: Simple, Focused Day

```markdown
**09:00** — Morning brief and priority planning
Goal: Authorise timesheets, EP02 recording

**09:15–09:45** — Completed: Timesheets authorised.

**10:00–11:00** — Completed: Wei Chen 1:1 (30 min). Discussed Q2 planning, AWS SSO proxy blocker. Decision: Escalate SSO to Crispin, send update to Wei by EOW.

**11:00–11:30** — Completed: Dan Bircham 1:1 (30 min). Confirmed L&D time protection working.

**14:00–14:40** — Completed: Admin time. Async message to Callum on sprint commitment.

**15:30–17:00** — ✓ Completed: EP02 recording (90 min). Submitted to project, transcription queued. No blockers.
```

### Example 2: Fragmented Day with Pivots

```markdown
**09:00** — Morning brief and priority planning
Goal: Review sprint health, prepare for planning session

**10:00–10:45** — Completed: Sprint planning prep. Decision: Highlight capacity constraints to Cat.

**10:45** — Topic pivot: Urgent request from Product to reassess roadmap priorities. Switching context to roadmap review.

**10:45–11:30** — Completed: Roadmap prioritisation discussion with stakeholders. Decision: Defer feature X to Q2, prioritise Y per Q1 goals.

**11:30** — Topic pivot: Returning to original sprint planning context.

**13:00–13:30** — Completed: Sprint planning facilitation (1.5-hour session, my session ended at 13:30). Outcomes: 9 stories committed, velocity on track.

**14:00–14:35** — Completed: 1:1 with new starter Daniel Carter. Onboarding check-in. Outcome: Pair programming scheduled for week 1.

**15:00–16:00** — Completed: Codebase review (architecture decision for API redesign). Decision: Recommend pattern A (rationale: scalability + team familiarity).
```

### Example 3: Transcript Processing Session

```markdown
**14:00** — Reviewing 1:1 transcripts
Goal: Process Wei, Dan B, Dan C transcripts; update personal records

**14:00–14:25** — Completed: Wei Chen transcript (from [[2026-04-10]]). Imported to vault. Strategic insights: AWS Academy training (March deadline), game development interest. Escalation: SSO proxy issue blocking development — added to Crispin's agenda.

**14:25–14:50** — Completed: Dan Bircham transcript (from [[2026-04-10]]). Imported to vault. Strategic insights: Interested in Tech Lead pathway, values L&D time protection. Outcome: Confirmed L&D blocking is working.

**14:50–15:15** — Completed: Dan Carter transcript (first 1:1, from today). Imported to vault. Strategic insights: Onboarding proceeding well, comfortable with team. Outcome: Pair programming scheduled for week 1 to accelerate ramp-up.

**15:15** — ✓ Session completed: 3 transcripts processed and imported. All personal records updated. 1 escalation (SSO) added to Crispin's agenda.
```

## When NOT to Log

Session logging is not needed for:

- Very short interactions (< 5 min)
- Reactive messages answering a quick question
- Incomplete thoughts or planning (log when you commit to action)
- Conversations that didn't lead anywhere (use Insight section instead if they were valuable)

## Questions for Implementation

1. **Who appends the log?** The agent running the command, a centralised logging function, or the session-logger agent?
2. **How is today's date determined?** Use system date (with late-night session handling)?
3. **How are topic pivots detected?** Explicit user language + command detection + heuristics?
4. **Should we validate log entries?** Check for specificity, timestamps, etc.?

---

**Version:** 1.0  
**Created:** 2026-04-13  
**Purpose:** Standardise session logging for daily record-building workflows
