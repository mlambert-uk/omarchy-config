---
name: avaylerflow-code-review-patterns
description: Common code review patterns, assessment criteria, and feedback frameworks. Use when reviewing any code to ensure consistency and comprehensiveness.
license: MIT
compatibility: opencode
metadata:
  audience: code-review-agents
  domain: quality-assurance
  applies-to:
    [
      technical-lead,
      csharp-reviewer,
      react-reviewer,
      security-reviewer,
      postgresql-reviewer,
    ]
---

## What I do

Provide standardised code review patterns, assessment frameworks, and feedback delivery guidelines to ensure consistent, high-quality code reviews across all languages and technologies.

## When to use me

**Load this skill when:**

- Conducting any code review
- Assessing code quality
- Identifying issues and anti-patterns
- Providing feedback to developers
- Prioritising issues by severity

**All code reviewers and technical agents should load this skill.**

## Code Review Philosophy

### Core Principles

1. **Constructive & Educational**
   - Explain the "why" behind feedback
   - Help developers learn and improve
   - Balance critique with recognition

2. **Comprehensive**
   - Assess correctness, security, performance, maintainability
   - Check error handling, testing, and standards
   - Consider context and code maturity

3. **Pragmatic**
   - Distinguish between critical issues and nice-to-haves
   - Balance perfectionism with delivery
   - Adapt to project stage (prototype vs production)

4. **Consistent**
   - Use same standards across all reviews
   - Reference team conventions
   - Escalate appropriately

## Review Assessment Framework

### Quality Dimensions

| Dimension           | Questions                                           | Priority |
| ------------------- | --------------------------------------------------- | -------- |
| **Correctness**     | Does the logic work? Edge cases handled?            | CRITICAL |
| **Security**        | Vulnerabilities? Input validation? Auth checks?     | CRITICAL |
| **Performance**     | N+1 queries? Memory leaks? Optimal algorithms?      | HIGH     |
| **Maintainability** | Clear naming? Appropriate abstraction? Duplication? | MEDIUM   |
| **Testing**         | Adequate coverage? Testable design?                 | MEDIUM   |
| **Error Handling**  | Specific exceptions? Logged with context?           | HIGH     |
| **Standards**       | Follows conventions? Matches team patterns?         | MEDIUM   |
| **Documentation**   | Comments explain "why", not "what"?                 | LOW      |

### Severity Classification

| Level        | Definition                                  | Examples                                              | Action                              |
| ------------ | ------------------------------------------- | ----------------------------------------------------- | ----------------------------------- |
| **CRITICAL** | Blocks deployment, data loss, security risk | SQL injection, XSS, data loss bug                     | Block merge, immediate fix required |
| **HIGH**     | Significant bug or maintainability issue    | N+1 query, memory leak, missing error handling        | Fix before merge                    |
| **MEDIUM**   | Code smell or minor issue                   | Missing test, weak typing, style inconsistency        | Discuss, can be follow-up           |
| **LOW**      | Suggestion or optimisation                  | Minor refactoring, naming opinion, micro-optimisation | Consider, not blocking              |

### Impact Assessment

**When Flagging Issues, Consider**:

- **Scope**: Single function vs system-wide?
- **Frequency**: One-time vs recurring issue?
- **Probability**: How likely to cause problems?
- **Consequence**: What's the impact if it happens?
- **Fix Cost**: How hard to fix now vs later?

## Code Review Checklist

### Security Checks (Always Required)

- [ ] Input validation on all user input
- [ ] Parameterised queries (no string concatenation in SQL)
- [ ] Output sanitisation (XSS prevention)
- [ ] Authentication checks on protected endpoints
- [ ] Authorisation validation (user permissions)
- [ ] No hardcoded secrets/credentials
- [ ] Error messages don't leak system info
- [ ] Dependencies checked for vulnerabilities
- [ ] CORS properly configured (if applicable)
- [ ] Secrets use secret management, not config files

**Red Flags**: Anything bypassing security checks, hardcoded passwords, direct SQL concatenation

### Performance Checks

- [ ] N+1 query problems (missing eager loading)
- [ ] Unbounded queries (missing LIMIT)
- [ ] Memory leaks (listeners/subscriptions not cleaned up)
- [ ] Blocking operations (async calls blocked with .Wait()/.Result)
- [ ] Inefficient algorithms (O(n²) where O(n) available)
- [ ] Unnecessary work in loops
- [ ] Cache opportunities identified

**Red Flags**: Any N+1 pattern, blocking async, unbounded queries in loops

### Maintainability Checks

- [ ] Clear variable/function naming
- [ ] Appropriate abstraction level
- [ ] Duplication identified for consolidation
- [ ] Complexity not excessive (>10 arguments, 100+ lines)
- [ ] Proper separation of concerns
- [ ] Dependencies clear and manageable
- [ ] Comments explain "why" not "what"

**Red Flags**: God objects, deeply nested code, cryptic variable names, magic numbers

### Testing Checks

- [ ] Code is testable (dependencies injectable)
- [ ] Test coverage appropriate (80%+ target)
- [ ] Edge cases tested
- [ ] Error cases tested
- [ ] Happy path + unhappy paths covered
- [ ] No brittle tests (over-mocking)

**Red Flags**: Untestable code, <50% coverage, only happy path tested

### Standards & Conventions

- [ ] Follows team patterns and conventions
- [ ] Uses approved libraries/frameworks
- [ ] Error handling matches pattern
- [ ] Logging includes correlation IDs
- [ ] Matches project structure
- [ ] Configuration externalised

**Red Flags**: Deviates from patterns without good reason, introduces new dependencies

## Feedback Delivery Structure

### Review Template

```markdown
## Code Review: [Component/File Name]

### Summary

[1-2 sentence overview of changes and overall assessment]

### Positive Observations ✅

- [What's done well - always include positives]
- [Good practices observed]

### Issues Identified

#### [Issue Title] - [SEVERITY: CRITICAL/HIGH/MEDIUM/LOW]

**Problem**: [What's wrong, be specific]
**Impact**: [Why it matters, potential consequences]
**Recommended Fix**: [How to fix with code example]
**Priority**: [Must fix / Should fix / Nice to have]

#### [Next Issue]...

### Suggestions & Questions

- [Optional improvements or clarifications needed]
- [Questions about intent or requirements]

### Security & Performance Notes

[Any security or performance concerns - escalate if critical]

### Summary

[Overall assessment and confidence level]
```

### Writing Effective Feedback

**DO**:

- ✅ Be specific (reference line numbers, function names)
- ✅ Explain reasoning (help them understand "why")
- ✅ Provide examples (show what good looks like)
- ✅ Acknowledge good practices (provide positive feedback)
- ✅ Ask clarifying questions (maybe you're missing context)
- ✅ Suggest, don't demand (for non-critical items)
- ✅ Use professional, respectful tone
- ✅ Consider context (prototype vs production)

**DON'T**:

- ❌ Be vague ("this is bad" without explanation)
- ❌ Assume intent (ask if unclear)
- ❌ Demand changes without explanation
- ❌ Provide only criticism
- ❌ Nitpick style without purpose
- ❌ Use condescending tone
- ❌ Bikeshed on preferences
- ❌ Ignore context

### Code Example Format

When suggesting code changes:

**Current (problematic):**

```language
// Current code with issue
// Line X: This is the problem
```

**Recommended:**

```language
// Improved code
// Explanation of why this is better
```

**Why**: [Benefits: correctness, security, performance, readability]

## Escalation Framework

### When to Flag as CRITICAL

**Security Issues**:

- SQL injection vulnerability
- Cross-site scripting (XSS) vulnerability
- Authentication/authorisation bypass
- Data exposure or leakage
- Hardcoded secrets/credentials
- Insecure cryptography

**Data Issues**:

- Data loss or corruption
- ACID compliance violation
- Integrity constraint violation
- Migration that loses data

**Performance Issues**:

- N+1 query in high-traffic endpoint
- Memory leak in long-running service
- Blocking async operations
- Unbounded data loading

### Escalation Format

```
🚨 CRITICAL [SECURITY/PERFORMANCE/DATA] ISSUE - IMMEDIATE ACTION REQUIRED

⚠️ ESCALATION REQUIRED

**Severity**: CRITICAL

**Issue**: [Clear, specific description]

**Why It Matters**: [Potential impact and consequences]

**Example of Problem**:
[Show the problematic code]

**Required Fix**:
[Show the corrected code]

**How to Test Fix**:
[Steps to verify the fix works]

**Timeline**: Must be fixed before merge/deployment

DO NOT MERGE OR DEPLOY this code until fixed.
```

### When to Escalate to Leadership

- Major architectural changes with business impact
- Conflicts with established patterns
- Trade-offs between technical excellence and deadline
- Technical debt that blocks other work
- Security concerns requiring business decision

## Language-Specific Quick Reference

### C# / .NET

**Red Flags**:

- Blocking async (.Result, .Wait())
- String concatenation in SQL
- Catch without logging
- God objects (>300 lines)
- Missing CancellationToken
- Direct DbContext usage
- N+1 queries
- Bare catch-all exceptions

**Check For**:

- Async/await patterns correct
- DI lifetimes appropriate (Scoped for Lambda)
- Repository pattern used
- Specific exceptions thrown
- Structured logging
- Entity Framework projections

### React / TypeScript

**Red Flags**:

- Prop drilling (should use Context)
- Missing useEffect dependencies
- Inline function definitions
- Missing cleanup functions
- Unnecessary re-renders
- Missing error boundaries
- No error handling
- Accessibility not considered

**Check For**:

- Hook dependencies complete
- Cleanup functions present
- React Query for server state
- Context API for global state
- Error boundaries at routes
- Accessibility (a11y)
- TypeScript strict mode

### Angular / RxJS

**Red Flags**: Unsubscribed observables, missing OnDestroy, synchronous subscriptions, business logic in templates

**Check For**: Subscriptions cleaned up (takeUntil), OnPush change detection where appropriate, smart/dumb component split

## Common Anti-Patterns by Category

### Error Handling

- ❌ Empty catch blocks
- ❌ Catch-all exceptions (Exception)
- ❌ Logging without context
- ❌ Swallowing exceptions silently
- ❌ Generic error messages

### Performance

- ❌ N+1 queries
- ❌ Blocking async operations
- ❌ Unbounded data loading
- ❌ Memory leaks (listeners not removed)
- ❌ Inline expensive operations

### Security

- ❌ String concatenation in SQL
- ❌ User input not validated
- ❌ Output not sanitised
- ❌ Hardcoded secrets
- ❌ Missing auth checks

### Architecture

- ❌ Tight coupling to frameworks
- ❌ God objects
- ❌ Circular dependencies
- ❌ Violations of separation of concerns
- ❌ Mixing business logic with UI

### Testing

- ❌ Untestable code (hard dependencies)
- ❌ Over-mocking (testing test doubles, not code)
- ❌ Only happy path tested
- ❌ Brittle tests (implementation details)
- ❌ No edge case tests

## Positive Recognition

Always include positive observations in every review — good practices observed, well-structured code, thoughtful error handling, comprehensive testing, clear naming, correct use of patterns.

---

**Last Updated**: 22 January 2026  
**Used By**: technical-lead, csharp-reviewer, react-reviewer, security-reviewer, postgresql-reviewer agents
