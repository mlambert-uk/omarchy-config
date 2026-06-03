---
description: Start automatic conversation transcript logging for the day
---

This command initializes conversation transcript logging for today.

From this point forward, all OpenCode conversations will be recorded to a transcript file:
`~/Documents/mlambert_uk/OpenCode/Transcripts/[TODAY].md`

The transcript captures:

- Every message you send
- Every response OpenCode gives
- Timestamped entries (HH:MM:SS)

**At end-of-day**, you can run `/end-of-day` which will:

1. Read the transcript
2. Ask the transcript-review agent to identify work completed
3. Pull out items to log or summarize

**Why this works:**

- I capture _everything_ (no filtering, no AI deciding what matters)
- You decide at end-of-day what actually mattered
- Complete record for reference, reflection, or debugging

**How to use:**

Run this at the start of your day (or any time you want to start fresh):

```
/enable-transcripts
```

Then use OpenCode normally. Everything will be automatically recorded.

---

**Note:** This command is informational. Transcript logging is automatically enabled by default. Use `/disable-transcripts` to temporarily turn it off if needed.
