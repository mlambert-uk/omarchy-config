---
description: Optimise agent instruction files for conciseness and clarity
model: github-copilot/claude-sonnet-4.6
agent: engineering-manager
arguments:
  - name: file_path
    description: Path to agent file to optimise (e.g., @path/to/agent.md)
    required: true
---

Optimise the following file for clarity, conciseness, and conflict-free instructions: @$1

Apply these optimisation principles:

## Structure & Hierarchy

- Organise by priority: Identity/Role → Constraints → Capabilities → Output Format → Examples
- Use clear section headers with consistent formatting
- Group related instructions together
- Use bullet points for scannability

## Conflict Resolution

- Identify and resolve conflicting instructions
- Use explicit priority markers (CRITICAL, REQUIRED, OPTIONAL)
- Use conditional logic (IF-THEN) rather than overlapping rules
- Ensure single source of truth for each behaviour
- Later instructions should not contradict earlier ones

## Conciseness

- Delete anything that doesn't change behaviour
- Replace paragraphs with structured bullets
- Remove redundant explanations
- Use templates/schemas over prose descriptions
- Keep only essential examples (2-3 max per concept)

## Clarity

- Be specific and directive, not vague
- Use concrete, actionable instructions
- Explicitly define what NOT to do (boundaries)
- Use consistent terminology throughout
- Add brief rationale comments where WHY matters

## Output Requirements

1. Show a summary of changes made:
   - Conflicts resolved
   - Redundancies removed
   - Structure improvements
   - Line count reduction

2. Present the optimised file content

3. Highlight any remaining concerns or recommendations

Do NOT change the fundamental meaning or remove critical instructions. Focus on clarity and conflict resolution.
