---
name: agent-catalog
description: Comprehensive catalogue of available agents, triggers, capabilities, and invocation patterns
tags: [reference, agents, skills]
version: 1.1
---

# Agent Catalogue

Comprehensive reference for all available OpenCode agents, their triggers, capabilities, and usage patterns.

---

## Quick Reference: Agent Triggers

| **Trigger Phrase**           | **Agent**                                | **Type** | **Purpose**                      |
| ---------------------------- | ---------------------------------------- | -------- | -------------------------------- |
| "prepare 1:1"                | engineering-manager                      | Primary  | 1:1 meeting preparation          |
| "performance review"         | engineering-manager                      | Primary  | Performance reviews              |
| "team health"                | engineering-manager                      | Primary  | Team health analysis             |
| "action items for"           | engineering-manager                      | Primary  | Action item tracking             |
| "import 1:1 transcript"      | oneonone-transcript-importer             | Subagent | Process meeting transcripts      |
| "process meeting transcript" | oneonone-transcript-importer             | Subagent | Import and structure notes       |
| "screen cv"                  | cv-screening-specialist                  | Subagent | CV assessment                    |
| "cv assessment"              | cv-screening-specialist                  | Subagent | Candidate screening              |
| "assess interview"           | interview-assessment-specialist          | Subagent | Interview feedback consolidation |
| "panel feedback"             | interview-assessment-specialist          | Subagent | Hiring recommendations           |
| "compare candidates"         | candidate-comparison-specialist          | Subagent | Finalist comparison              |
| "finalist comparison"        | candidate-comparison-specialist          | Subagent | Ranked recommendations           |
| "career development"         | career-path-planning-specialist          | Subagent | Career roadmapping               |
| "career planning"            | career-path-planning-specialist          | Subagent | Skills assessment                |
| "promotion readiness"        | career-path-planning-specialist          | Subagent | Promotion assessment             |
| "skill gaps"                 | career-path-planning-specialist          | Subagent | Skills gap analysis              |
| "feedback conversation"      | performance-coaching-feedback-specialist | Subagent | Feedback delivery                |
| "performance improvement"    | performance-coaching-feedback-specialist | Subagent | Performance coaching             |
| "coaching conversation"      | performance-coaching-feedback-specialist | Subagent | Coaching frameworks              |
| "difficult feedback"         | performance-coaching-feedback-specialist | Subagent | Difficult conversations          |
| "1:1 patterns"               | oneonone-insights-tracking               | Subagent | Pattern analysis                 |
| "action item tracking"       | oneonone-insights-tracking               | Subagent | Action tracking across team      |
| "team patterns"              | oneonone-insights-tracking               | Subagent | Team health trends               |
| "burnout signals"            | oneonone-insights-tracking               | Subagent | Early warning detection          |
| "log session start"          | log-session-start                        | Subagent | Log session intent and goal      |
| "log work"                   | log-work                                 | Subagent | Log completed work blocks        |
| "log pivot"                  | log-topic-pivot                          | Subagent | Log mid-session context shifts   |
| "log session end"            | log-session-end                          | Subagent | Log session accomplishments      |
| "review transcript"          | transcript-review                        | Subagent | Extract work from conversation   |
| "plan month"                 | plan-month                               | Subagent | Monthly planning routine         |
| "plan week"                  | plan-week                                | Subagent | Weekly planning routine          |
| "morning brief"              | morning-brief                            | Primary  | Daily action prioritisation      |
| "end of day"                 | end-of-day                               | Subagent | Daily synthesis and reflection   |

---

## Invocation Methods

- **Automatic**: Use trigger phrases in natural language (e.g., "prepare 1:1 with Sarah")
- **Manual**: `@agent-name` to invoke specific agent (e.g., `@engineering-manager`)
- **Command**: Slash commands for quick workflows (e.g., `/prepare-121 [name]`)

---

## Available Agents

### Engineering Management

#### engineering-manager (primary)

**Triggers**: "prepare 1:1", "performance review", "team health", "action items for"

**Capabilities**:

- 1:1 preparation with context gathering and agenda creation
- Performance management and assessment
- SBI feedback framework application
- Career development support
- Team health analysis and monitoring

**Skills used**: oneonone-excellence, performance-management, feedback-delivery, avayler-culture

**Delegation strategy**:

- Delegates to career-path-planning-specialist for multi-year career planning
- Delegates to oneonone-insights-tracking for cross-team pattern analysis
- Delegates to performance-coaching-feedback-specialist for complex performance issues
- Delegates to oneonone-transcript-importer for meeting transcript processing

#### oneonone-transcript-importer (subagent)

**Triggers**: "import 1:1 transcript", "process meeting transcript"

**Capabilities**:

- Separates tactical (meeting notes) from strategic (personal record) content
- Applies 3-6 month relevance test
- Structures content according to Obsidian vault patterns

**Outputs**:

- Meeting notes: `D - Meeting Notes/Line Management/[Name]/[YYMMDD] - [Name] - 1-1 Agenda.md`
- Personal record: `5 - People/Work/[Team]/[Name].md`

**Time savings**: 15-20 minutes per meeting

---

### Recruitment (3-stage workflow)

#### cv-screening-specialist (subagent)

**Triggers**: "screen cv", "cv assessment"

**Capabilities**:

- CV parsing and assessment
- Mapping to Avayler career framework (L1-L6)
- Scoring across Technical, Communication, Culture, Growth (0-100 scale)
- Identification of strengths, gaps, and red flags

**Purpose**: Initial assessment, proceed/decline decision

**Scoring**: 75+ proceed, 60-74 hold, <60 decline

#### interview-assessment-specialist (subagent)

**Triggers**: "assess interview", "panel feedback", "hiring recommendation"

**Capabilities**:

- Consolidate feedback from interview panel
- Analyse consensus and divergence
- Generate candidate feedback
- Provide Hire/Hold/No Hire recommendation

**Purpose**: Post-interview assessment and decision support

#### candidate-comparison-specialist (subagent)

**Triggers**: "compare candidates", "finalist comparison"

**Capabilities**:

- Compare multiple finalists side-by-side
- Analyse trade-offs and fit
- Provide ranked recommendations with rationale

**Purpose**: Final hiring decision support

**Workflow**: CV Screening → Interview Assessment → Candidate Comparison

**Time savings**: 2-3 hours per candidate across full recruitment lifecycle

---

### Planning & Daily Routines

#### morning-brief (primary)

**Triggers**: "morning brief", "what's on today"

**Purpose**: Action-oriented daily prioritisation (no information dump)

**Capabilities**:

- Check if yesterday's end-of-day routine was completed
- Surface missing 1:1 insights or reviews
- Scan calendar for meetings needing prep
- List active projects with next action only
- Output manager-owned tasks from Tasklist.md

**Related command**: `/morning-brief`

**Version**: 2.0 (refactored 2026-04-13 per DD-01)

#### end-of-day (subagent)

**Triggers**: "end of day", "daily synthesis", "day summary"

**Purpose**: Lightweight daily reflection and session log synthesis

**Capabilities**:

- Reads pre-built session log from daily note
- Synthesises into narrative form (Summary, Achievements, Carry-Overs, Insights)
- Generates Journal entry for the day

**Related command**: `/end-of-day`

**Dependencies**: Session logging system (logs recorded throughout the day)

**Version**: 2.0 (refactored 2026-04-13 per DD-02)

#### plan-month (subagent)

**Triggers**: "plan month", "monthly planning", "monthly review"

**Purpose**: Start-of-month planning and end-of-month retrospective

**Capabilities**:

- Review last month's accomplishments
- Analyse weekly patterns
- Set 3-5 strategic priorities for the month
- Create monthly objectives with milestones
- Generate monthly planning note

**Related command**: `/plan-month`

#### plan-week (subagent)

**Triggers**: "plan week", "weekly planning", "set weekly goals"

**Purpose**: Start-of-week planning and end-of-week review

**Capabilities**:

- Create weekly planning note
- Surface carry-overs from previous week
- Set 3-5 key priorities for the week
- Link to daily goals and review sections

**Related command**: `/plan-week`

---

### Session Logging & Transcripts

#### log-session-start (subagent)

**Triggers**: "log session start", "session starting", "log intent"

**Purpose**: Log the start of a focused work session to daily note

**Capabilities**:

- Records session type (e.g., "1:1 transcript review", "sprint planning")
- Captures session intent and goal
- Appends timestamped entry to daily note's Session Log section
- Format: `**HH:MM** — [session_type] | Goal: [goal]`

**Related command**: `/log-session-start "session type" "goal description"`

**Context**: Part of DD-02 session logging system; enables day's record to accumulate naturally

#### log-work (subagent)

**Triggers**: "log work", "work completed", "log accomplishment"

**Purpose**: Log a completed work block with duration and outcomes

**Capabilities**:

- Records work start and end times (HH:MM format)
- Captures accomplishments and key outcomes
- Appends to daily note's Session Log section
- Format: `**HH:MM–HH:MM** — Completed: [accomplishments]. Outcome: [results].`

**Related command**: `/log-work "14:00" "14:35" "accomplishments" "outcome"`

**Example**: `/log-work "14:00" "14:35" "Wei Chen transcript reviewed and imported" "Personal record updated with AWS Academy goals"`

#### log-topic-pivot (subagent)

**Triggers**: "log pivot", "context shift", "switching topics"

**Purpose**: Log mid-session context switches and topic changes

**Capabilities**:

- Records pivot time and what was pivoted to
- Tracks reason or trigger for pivot
- Appends to daily note's Session Log
- Format: `**HH:MM** — Pivoted to [new_topic] | Reason: [trigger]`

**Related command**: `/log-topic-pivot "new topic" "reason or trigger"`

**Context**: Helps identify context-switching patterns and productivity disruptions

#### log-session-end (subagent)

**Triggers**: "log session end", "session complete", "end session"

**Purpose**: Log the end of a work session with accomplishments and decisions

**Capabilities**:

- Records session end time and duration
- Captures accomplishments and key decisions made
- Appends to daily note's Session Log section
- Format: `**HH:MM** — Session end | Duration: [time] | Accomplishments: [list] | Decisions: [list]`

**Related command**: `/log-session-end "accomplishments" "decisions"`

**Context**: Completes the session log entry started with `/log-session-start`

#### transcript-review (subagent)

**Triggers**: "review transcript", "transcript analysis", "what did we discuss", "work summary"

**Purpose**: Extract work summary from daily OpenCode conversation transcript

**Capabilities**:

- Read daily conversation transcript from `~/Documents/mlambert_uk/OpenCode/Transcripts/[DATE].md`
- Identify work that was actually completed (tasks, decisions, implementations, reviews, fixes)
- Filter out Q&A, planning discussions, and clarification requests
- Generate structured work summary with time estimates
- Produce scannable summary for end-of-day review
- Categorise work by type (Project X, People work, Tooling, etc.)

**Usage**: Invoked at end-of-day to help identify what work happened across all conversations

**Related command**: `/review-transcript`

**Output format**:

```
## Work Completed Today

1. **[Task Name]** (HH:MM–HH:MM)
   - What was done
   - Key outcomes or decisions

### Time Spent
- Total: X hours Y minutes
- By category: Project X (1h 30m), People work (45m), Tooling (30m)

### Key Decisions
- Any decisions made that should be tracked

### Carry-Overs
- Anything incomplete that carries to tomorrow
```

**Context**: Works with automatic conversation transcript logging system (every exchange logged to `OpenCode/Transcripts/[DATE].md`)

---

## Workflow Agents (Specialized)

#### check-actions (subagent)

**Triggers**: "check actions", "outstanding action items", "review action items"

**Purpose**: Review and track action items across 1:1 meetings

**Capabilities**:

- Filter action items by person or all items
- Track completion status
- Surface overdue items

#### team-check (subagent)

**Triggers**: "team check", "team health overview", "team status"

**Purpose**: Quick team health snapshot

**Capabilities**:

- Overview of team status
- Recent 1:1s summary
- Outstanding action items
- Team members needing attention

---

## Available Commands

This section documents commonly-used commands organised by workflow. For a complete list, use `ctrl+p` in OpenCode.

### Session Logging Commands (DD-02)

| Command              | Purpose                              | Usage                                                                              |
| -------------------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| `/log-session-start` | Log session intent at start          | `/log-session-start "1:1 reviews" "Process 3 transcripts"`                         |
| `/log-work`          | Log completed work block             | `/log-work "14:00" "14:35" "transcript reviewed" "personal record updated"`        |
| `/log-topic-pivot`   | Log mid-session context shift        | `/log-topic-pivot "infrastructure review" "blocking issue"`                        |
| `/log-session-end`   | Log session end with accomplishments | `/log-session-end "completed 2 transcript imports" "decided on naming convention"` |

**Purpose**: Session logging system enables daily record to accumulate throughout day; end-of-day can then synthesise without reconstruction.

### Transcript & Work Review Commands

| Command               | Purpose                                | Usage                                                             |
| --------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `/enable-transcripts` | Enable conversation logging            | `/enable-transcripts` (informational; logging enabled by default) |
| `/review-transcript`  | Extract work summary from conversation | `/review-transcript` (shows summary of work completed)            |

**Purpose**: Complete record of all interactions; you decide what counts as "work" at end-of-day.

### Planning Commands

| Command       | Purpose                | Usage                                                            |
| ------------- | ---------------------- | ---------------------------------------------------------------- |
| `/plan-week`  | Start weekly planning  | `/plan-week` (creates weekly note, surfaces carry-overs)         |
| `/plan-month` | Start monthly planning | `/plan-month` (creates monthly note, reflects on previous month) |

**Purpose**: Removes friction from weekly/monthly routines by auto-creating notes with simplified templates.

### Management Commands

| Command                  | Purpose                | Usage                                                                               |
| ------------------------ | ---------------------- | ----------------------------------------------------------------------------------- |
| `/prepare-121`           | Prep for 1:1 meeting   | `/prepare-121 sarah-chen` (gathers context, creates agenda)                         |
| `/import-1-1-transcript` | Process 1:1 transcript | `/import-1-1-transcript [name] [transcript]` (separates notes from personal record) |
| `/check-actions`         | Review action items    | `/check-actions` or `/check-actions [person-name]`                                  |
| `/team-check`            | Team health overview   | `/team-check` (recent 1:1s, outstanding items, attention needed)                    |

**Purpose**: Manage 1:1s, recruitment, and team health without manual tracking.

### Workflow Commands

| Command           | Purpose                     | Usage                                                     |
| ----------------- | --------------------------- | --------------------------------------------------------- |
| `/morning-brief`  | Daily action prioritisation | `/morning-brief` (action-oriented, no info dump)          |
| `/end-of-day`     | Daily synthesis             | `/end-of-day` (reads session log, synthesises into entry) |
| `/task`           | Quick task capture          | `/task "add feature X"`                                   |
| `/project-status` | Quick project summary       | `/project-status [project-name]`                          |
| `/find`           | Person context lookup       | `/find [person-name]`                                     |

**Purpose**: Quick daily workflows without context switching.

### Prompt Engineering Commands

| Command           | Purpose                       | Usage                                |
| ----------------- | ----------------------------- | ------------------------------------ |
| `/build-prompt`   | Construct prompt from scratch | `/build-prompt` (guided workflow)    |
| `/improve-prompt` | Enhance existing prompt       | `/improve-prompt "[current prompt]"` |
| `/review-prompt`  | Assess prompt quality         | `/review-prompt "[prompt]"`          |
| `/test-prompt`    | Stress-test prompt            | `/test-prompt "[prompt]"`            |

**Purpose**: Iterative prompt development with quality checks.

### Technical Commands

| Command                | Purpose                            | Usage                                                     |
| ---------------------- | ---------------------------------- | --------------------------------------------------------- |
| `/review-code`         | Code review with specialist agents | `/review-code` (delegates to language-specific reviewers) |
| `/architecture-review` | Architecture assessment            | `/architecture-review`                                    |
| `/security-audit`      | OWASP security scan                | `/security-audit`                                         |
| `/optimize-query`      | Database query tuning              | `/optimize-query "[query]"`                               |

**Purpose**: Technical quality gates without manual context gathering.

### System Commands

| Command               | Purpose              | Usage                             |
| --------------------- | -------------------- | --------------------------------- |
| `/omarchy-config`     | System configuration | `/omarchy-config`                 |
| `/omarchy-theme-sync` | Visual consistency   | `/omarchy-theme-sync`             |
| `/setup-mcp-server`   | MCP configuration    | `/setup-mcp-server [server-name]` |

**Purpose**: System administration and configuration.

### Meta Commands

| Command             | Purpose                | Usage                               |
| ------------------- | ---------------------- | ----------------------------------- |
| `/create-agent`     | Create custom agent    | `/create-agent` (guided workflow)   |
| `/create-command`   | Create custom command  | `/create-command` (guided workflow) |
| `/create-skill`     | Create custom skill    | `/create-skill` (guided workflow)   |
| `/clean-agent-file` | Validate agent quality | `/clean-agent-file [file-path]`     |

**Purpose**: Maintain and extend configuration.

---

Skills are loaded on-demand by agents (not always-loaded context).

### People Management Skills

- **avayler-culture**: Engineering values, L1-L6 framework, progression criteria
- **feedback-delivery**: SBI, Coaching Sandwich, Radical Candour, DESC frameworks
- **performance-management**: Review frameworks, PIPs (30-60-90), difficult conversations
- **oneonone-excellence**: Meeting fundamentals, preparation frameworks, action tracking
- **oneonone-preparation**: Quick prep workflow (5-10 min), context gathering

### Vault Management Skills

- **obsidian-formatting**: British English, WikiLinks, frontmatter, Mermaid diagrams

### Session & Workflow Skills

- **session-logging**: Timestamped session log entry formats, integration patterns (DD-02)

### Reference Skills

- **agent-catalog**: This skill - comprehensive agent and skill reference

---

## Creating Skills vs Commands

**Skills (loaded on-demand, complex workflows):**

- **Use when**: Multi-step workflows, domain-specific guidance, reusable patterns
- **Location**: `~/.config/opencode/skills/<name>/SKILL.md` (global) or `.opencode/skills/<name>/SKILL.md` (project)
- **Format**: `SKILL.md` with YAML frontmatter
- **Naming**: Lowercase alphanumeric with single hyphens (1-64 chars); regex: `^[a-z0-9]+(-[a-z0-9]+)*$`
- **Examples**: `/setup-mcp-server`, `/create-agent`

**Commands (always available, simple prompts):**

- **Use when**: Repeated prompts, quick shortcuts
- **Location**: `~/.config/opencode/commands/` (global) or `.opencode/commands/` (project)
- **Format**: Markdown with frontmatter; filename becomes command (`my-command.md` → `/my-command`)
- **Examples**: `/clean-agent-file`, `/prepare-121`

**Templates**: See `~/Documents/mlambert_uk/OpenCode/Templates/` for detailed guidance

---

## Changes Since v1.0

**2026-04-14 Update (v1.1 → v2.0):**

**Agents added:**

- `log-session-start` — Log session intent and goal (DD-02)
- `log-session-end` — Log session end with accomplishments (DD-02)
- `log-topic-pivot` — Log mid-session context shifts (DD-02)
- `log-work` — Log completed work blocks (DD-02)
- `transcript-review` — Extract work summary from daily transcript
- `plan-month` — Monthly planning routine
- `plan-week` — Weekly planning routine (auto-creates weekly notes)

**Agents improved:**

- `morning-brief` — Rewritten per DD-01 (action-oriented, no calendar dump)
- `end-of-day` — Refactored per DD-02 (reads pre-built session log)
- `oneonone-insights-tracking` — Updated for DD-03 (manager-owned actions only)

**Agents retired:**

- `product-owner` — Deleted 2026-04-13 (not actively used)
- `obsidian-integration` — Deleted 2026-04-13 (vault integration now built-in)
- `new-121` — Deleted 2026-04-13 (redundant with `prepare-121`)

**Commands added:**

- `/log-session-start` — Log session intent
- `/log-session-end` — Log session end
- `/log-topic-pivot` — Log context shifts
- `/log-work` — Log work blocks
- `/plan-week` — Start weekly planning
- `/enable-transcripts` — Enable/manage transcript logging
- `/review-transcript` — Extract work summary from transcript

**Commands retired:**

- `ng-*` series (6 commands) — Angular-specific; no longer maintained
- `aws-cost-check` — Replaced by Azure-focused tooling
- `new-121` — Redundant with `prepare-121`

**Trigger table updated:**

- Added triggers for all session logging agents
- Added triggers for transcript-review agent
- Added triggers for planning agents (plan-month, plan-week)
- 28 total trigger phrases (was 16)

**Skills additions:**

- `session-logging` — Session log formatting and integration (DD-02)

**Documentation:**

- Added comprehensive "Commands by workflow" section with usage examples
- Expanded agent descriptions with DD-01/DD-02 context
- Clarified session logging system integration
- Added delegation strategy examples
- Updated version history

**Version history:**

- v1.0 (2026-03-12) — Initial catalogue
- v1.1 (2026-04-14) — Added session logging, planning agents, transcript review; removed product-owner
- v2.0 (2026-04-14) — Complete redesign; added commands reference, expanded agent descriptions, documented design decisions

---

**Version**: 2.0  
**Updated**: 2026-04-14  
**Purpose**: Comprehensive reference for agent capabilities, command usage, and integration patterns; supports DD-01/DD-02/DD-03 design decisions
