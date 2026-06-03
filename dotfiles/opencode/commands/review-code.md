---
description: Comprehensive code review with automatic specialist selection based on language and framework
model: github-copilot/gpt-5.2-codex
---

# Review Code

Automatically review code with the appropriate specialist reviewer agent based on the language and framework detected.

## Usage

```
/review-code [file-path-or-directory]
```

**Examples:**
- `/review-code src/services/UserService.cs`
- `/review-code src/components/Dashboard.tsx`
- `/review-code src/app/user-profile/`
- `/review-code .` (review all changed files)

## What This Command Does

This command automatically:

1. **Detects language/framework** from file extensions and content
2. **Selects appropriate reviewer**:
   - `.cs` files → **csharp-reviewer**
   - `.tsx`, `.jsx` files → **react-reviewer**
   - Database migrations/queries → **postgresql-reviewer**
   - Pulumi infrastructure code → **pulumi-specialist**
   - Mixed or unclear → **technical-lead** (delegates to specialists)

3. **Performs comprehensive review** checking:
   - Code quality and correctness
   - Security vulnerabilities
   - Performance issues
   - Best practices adherence
   - Maintainability and testability

## Output

You'll receive a structured code review report:

```markdown
## Code Review: [Component Name]

### Summary
[Overall assessment and recommendation]

### Positive Observations ✅
[What's done well]

### Issues Identified

#### [Issue Title] [CRITICAL/HIGH/MEDIUM/LOW]
**Location**: file.cs:123
**Problem**: [Description]
**Impact**: [Why it matters]
**Fix**: [Specific solution with code example]

### Security Concerns
[Any security issues - CRITICAL escalated immediately]

### Recommendations
[Prioritized improvements]
```

## Severity Levels

- **CRITICAL** 🔴 - Security vulnerabilities, data loss risks, production-breaking issues
- **HIGH** 🟡 - Performance issues, N+1 queries, memory leaks, missing error handling
- **MEDIUM** 🟢 - Code quality, maintainability, minor performance optimizations
- **LOW** ⚪ - Style suggestions, refactoring opportunities

## Value

**Time saved:** 20-30 minutes per review
**Quality improvement:** Consistent, comprehensive reviews with specific fixes
**Frequency:** Use before every PR merge, after significant changes

## Prompt

You are performing an automated code review.

### Instructions

1. **Analyse the code provided**:
   - Identify primary language/framework from file extensions
   - Understand the purpose and context of the code
   - Check for multiple languages/frameworks in scope

2. **Select appropriate specialist reviewer**:
   
   **C# / .NET** (`.cs` files):
   - Use **csharp-reviewer** agent
   - Focus: async/await, Entity Framework, LINQ, DI, security
   
   **React** (`.tsx`, `.jsx` files):
   - Use **react-reviewer** agent
   - Focus: hooks, performance, accessibility, state management
   
   **Database** (`.sql`, migrations, repositories with queries):
   - Use **postgresql-reviewer** agent
   - Focus: schema design, N+1 queries, indexing, performance
   
   **Infrastructure** (Pulumi `.ts`, AWS configs):
   - Use **pulumi-specialist** or **aws-specialist**
   - Focus: security, cost optimization, resilience
   
   **Security-focused review** (any language):
   - Use **security-reviewer** agent
   - Focus: OWASP Top 10, injection, XSS, auth issues
   
   **Mixed or uncertain**:
   - Use **technical-lead** agent
   - Will delegate to appropriate specialists as needed

3. **Launch the selected agent** with the code to review

4. **Return the structured review report** in the format shown above

### Detection Rules

**C# Detection:**
- File extension: `.cs`
- Keywords: `namespace`, `using`, `class`, `async Task`

**React Detection:**
- File extension: `.tsx`, `.jsx`
- Keywords: `import React`, `useState`, `useEffect`, `export default`

**Database Detection:**
- File extensions: `.sql`
- Files in `migrations/`, `repositories/` directories
- Keywords: `SELECT`, `CREATE TABLE`, `DbContext`, `LINQ`

**Infrastructure Detection:**
- Files: `index.ts`, `stack.ts` in Pulumi projects
- Keywords: `pulumi`, `aws.`, `new aws.`, `Output<`

### Important Notes

- **Always provide specific line references** (`file.cs:123`)
- **Include code examples** for fixes from the specialist's skill patterns
- **Categorize severity** consistently (CRITICAL/HIGH/MEDIUM/LOW)
- **Escalate CRITICAL issues** immediately (security, data loss)
- **Provide actionable feedback** - specific solutions, not vague suggestions

### If Multiple Languages Detected

If reviewing a directory with multiple languages:
1. Group files by language/framework
2. Launch multiple specialist agents in parallel
3. Combine results into a single comprehensive report

### Output Template

Use this structure for all reviews:

```markdown
## Code Review: [Component/Feature Name]

**Files Reviewed**: [Count] files
**Primary Language**: [C# / React / etc.]
**Reviewer**: [Agent name]

### Summary
[2-3 sentences: overall quality, main concerns, recommendation]

### Positive Observations ✅
- [Specific pattern used correctly - reference skill]
- [Good practice observed]

### Issues Identified

#### [Issue Title] [SEVERITY]
**Location**: `file.cs:123`
**Problem**: [What's wrong - specific and clear]
**Impact**: [Why this matters - performance/security/maintainability]
**Fix**: [Exact solution with code example from loaded skills]

[Repeat for each issue, ordered by severity]

### Security Findings
[Any security issues - if CRITICAL, flag for immediate escalation]

### Performance Concerns
[N+1 queries, memory leaks, inefficient algorithms]

### Recommendations [Priority Order]
1. [HIGH] [Action to take]
2. [MEDIUM] [Action to take]
3. [LOW] [Action to take]

### Next Steps
[What should happen next - merge safe? needs fixes? requires discussion?]
```

Deliver a comprehensive, actionable code review that maintains Avayler's quality standards.
