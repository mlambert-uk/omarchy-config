---
description: Import 1:1 meeting transcript(s) for named people and process into meeting notes and personal records
model: github-copilot/claude-sonnet-4.6
arguments:
  - name: names
    description: First name(s) of the person/people to import transcripts for (e.g. "Ian" or "Ian, Andrew")
    required: true
---

Use the oneonone-transcript-importer agent to process transcripts for: $ARGUMENTS.names

**For each person:**

1. Find their transcript: the most recently modified VTT file in `~/Downloads/` whose filename contains their name
2. Update the existing meeting notes file for today in `D - Meeting Notes/Line Management/[Person]/` — do not create a new file
3. Update personal record: `5 - People/Work/[Team]/[Person].md`
   - Only strategic information (career goals, learning interests, personality, personal context, performance patterns)

**Apply the 3-6 Month Rule**: Include in personal record ONLY if it will still matter in 3-6 months.

**Output:**

- File paths updated
- Action item count
- Strategic insights added
