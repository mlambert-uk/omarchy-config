---
description: Capture and save today's OpenCode transcript to markdown
---

This command exports all messages from the current session to a timestamped transcript file.

## How It Works

```
/capture-transcript
```

**Output:**

- Saves to: `~/Documents/mlambert_uk/OpenCode/Transcripts/[TODAY].md`
- Format: Timestamped conversation log (HH:MM:SS + role)
- Content: All user messages + all OpenCode responses in this session

## Example Output

```markdown
# OpenCode Transcript — 2026-04-15

**Date:** 2026-04-15
**Created:** 2026-04-15 14:32:45

---

**14:23:10** 👤 User

What projects are we currently working on

---

**14:23:15** 🤖 OpenCode

You've got 4 active projects at various stages...

---
```

## Usage

Run this after a work session to capture everything:

```
/capture-transcript
```

Then use `/caveman-tldr` to compress it:

```
/caveman-tldr ~/Documents/mlambert_uk/OpenCode/Transcripts/2026-04-15.md
```

## Integration

This command is typically run:

1. **Manually** — After you've done focused work on a specific topic
2. **Before end-of-day** — Capture the day's work before final summary
3. **In workflows** — Integrated into `/log-work` or `/log-session-end`

## Notes

- **Timestamps** — Captured from message metadata if available
- **Formatting** — Messages include role (User/OpenCode) and all content parts
- **Accumulation** — Multiple captures to same day append/overwrite (use timestamps for reference)
- **Compression** — Always compress with caveman-tldr before loading into context

---

See also: `/caveman-tldr`, `/log-work`, `/end-of-day`
