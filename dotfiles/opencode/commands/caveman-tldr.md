---
description: Compress long-form content (transcripts, notes, summaries) into essential facts only
---

This command compresses any markdown file using caveman-tldr rules, reducing token usage by 50-70% while preserving technical accuracy.

## How It Works

```
/caveman-tldr path/to/file.md
```

Creates two files:

- `file.compressed.md` — Caveman-compressed version (you give to Claude/OpenCode)
- `file.original.md` — Original (you keep for reference)

## What Gets Compressed

**Drops:**

- Pleasantries, filler, hedging language ("basically", "really", "I think")
- Articles before known nouns ("the project" → "project")
- Repetition (first mention kept, rest dropped)
- Discourse markers ("anyway", "so", "you know")
- Explanatory preambles (go straight to facts)

**Keeps:**

- Technical specifics (names, numbers, versions, file paths)
- Decisions made ("decided X", "chose Y")
- Actions completed ("fixed bug", "added feature")
- Time estimates
- Context needed to understand without re-reading original

## Examples

### Transcript Compression

**Before (437 tokens):**

```
User: Should we use JWT or sessions?
OpenCode: Great question! JWTs are stateless... they're particularly useful for distributed systems...
Sessions are more traditional... The trade-offs are...
```

**After (87 tokens, 80% reduction):**

```
JWT vs sessions:
- JWT: stateless, microservices-friendly, token management, hard revocation
- Sessions: server state, monolith-friendly, immediate control
Decision: monolith vs microservices? Revocation speed needed?
```

### Project Status Compression

**Before (384 tokens):**

```
The AI Developer Education Series project is progressing quite well. We've completed five episodes
out of nine that we're planning to create. The scripts for episodes one through five are done, though
we still have work to do on diagrams for most episodes. Demo prep for episode five is underway...
```

**After (72 tokens, 81% reduction):**

```
AI Education: 5/9 scripts done. EP01-EP05 written; diagrams incomplete.
EP05 demo prep ready to record. Next: EP06 script (responsible AI use).
```

## Usage in Workflows

**For daily transcripts:**

```
/caveman-tldr ~/Documents/mlambert_uk/OpenCode/Transcripts/2026-04-15.md
```

**For meeting notes:**

```
/caveman-tldr ~/Documents/mlambert_uk/D\ -\ Meeting\ Notes/[person]\ -\ [date]/transcript.md
```

**For project summaries:**

```
/caveman-tldr ~/Documents/mlambert_uk/1\ -\ Projects/Project\ Name.md
```

## Why This Matters

1. **Faster reading** — Scan in 5 minutes instead of 20
2. **Token efficiency** — Compressed transcripts use 50-70% fewer tokens (money + speed)
3. **Better context** — Load compressed versions into context, leaving tokens for current work
4. **Same accuracy** — 100% technical information preserved

Research shows brevity constraints actually _improve_ model accuracy by 26 percentage points (March 2026: "Brevity Constraints Reverse Performance Hierarchies in Language Models").

---

**See:** `~/.config/opencode/skills/caveman-tldr/SKILL.md` for full compression rules and integration points.
