---
description: Run end-of-day reflection by synthesising today's session log into a Journal entry
model: github-copilot/claude-sonnet-4.6
---

Use the `end-of-day` agent to synthesise today's session log into a comprehensive Journal entry.

**Today's date:** !`date +%Y-%m-%d`

---

## Workflow

The session log has been built throughout the day with timestamped entries capturing:

- What work was done (Completed: ...)
- What was decided (Decision: ...)
- When context shifted (Topic pivot: ...)
- What carries over (incomplete items)

**Your job:** Read the session log in today's daily note and synthesise it into:

1. **Summary** — 2-4 sentence narrative of the day
2. **Achievements** — Categorised accomplishments extracted from the log
3. **Carry-Overs** — Incomplete work with context for tomorrow
4. **Insights** — Non-obvious learnings or patterns

---

## Steps

1. **Read today's daily note** — Find the `### Session Log` subsection in the Journal
2. **Extract accomplishments** — Identify all "Completed:" entries and their outcomes
3. **Write Summary** — Narrative 2-4 sentences about the day's nature and flow
4. **Categorise Achievements** — Group by People, Delivery, Strategic, Enablement, Collaboration
5. **Identify Carry-Overs** — Note incomplete items with context needed to resume
6. **Add Insights** — Capture non-obvious learnings or decisions with rationale

---

## Quality Standards

- **Summary:** Honest and concise (if day was fragmented, say so)
- **Achievements:** State impact, not just action
- **Carry-Overs:** Specific and actionable (not "continue work")
- **Grounded:** Every entry backed by something in the session log (not invented)
