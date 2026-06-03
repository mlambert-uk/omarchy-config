---
description: Prepare for 1-1 meeting with team member
model: github-copilot/claude-sonnet-4.6
agent: oneonone-preparation
arguments:
  - name: team_member_name
    description: First name of team member (e.g., "Emma", "Michael")
    required: true
---

Prepare for 1-1 meeting with $ARGUMENTS.

Use the engineering-manager agent to:

1. Check recent 1-1 notes from @~/Documents/mlambert_uk/D - Meeting Notes/Line Management/$ARGUMENTS/
2. Read their personal record from @~/Documents/mlambert_uk/5 - People/Work/
3. Review outstanding action items
4. Select appropriate template from @~/Documents/mlambert_uk/C - Resources/2 - People Management/Line Management/Meeting Agendas/
5. Create file named `YYMMDD - {Firstname} {Lastname} 1-1.md` (NO "Agenda" suffix)
6. Copy template structure exactly and fill in context

CRITICAL:

- File naming: `YYMMDD - {Firstname} {Lastname} 1-1.md`
- Use agenda templates from C - Resources directory
- Do NOT create custom formats
- Same file will be edited after meeting for notes

Use oneonone-excellence and oneonone-preparation skills for guidance.
