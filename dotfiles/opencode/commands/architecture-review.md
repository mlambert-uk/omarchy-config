---
description: High-level architecture review with guidance on design patterns, scalability, maintainability, and technical debt
model: github-copilot/claude-sonnet-4.6
---

# Architecture Review

Conduct high-level architecture review with guidance on design patterns, component boundaries, scalability, security, and technical decisions.

## Usage

```
/architecture-review [component-or-feature]
```

If no argument is provided, review the current working directory.

**Examples:**

- `/architecture-review src/api/` - Review API architecture
- `/architecture-review microservices-design.md` - Review architecture document
- `/architecture-review payment-service` - Review specific service design
- `/architecture-review .` - Review entire codebase architecture

## What This Command Does

This command launches the **technical-lead** agent to:

1. **Analyse architectural design**:
   - Component boundaries and separation of concerns
   - Service communication patterns
   - Data flow and state management
   - Dependency relationships

2. **Assess quality dimensions**:
   - Scalability and performance
   - Security posture
   - Maintainability and testability
   - Avayler architecture patterns compliance

3. **Identify issues**:
   - Tight coupling or god objects
   - Missing abstraction layers
   - Security vulnerabilities
   - Scalability bottlenecks
   - Technical debt hotspots

4. **Provide recommendations**:
   - Design pattern improvements
   - Refactoring priorities
   - Risk mitigation strategies
   - Delegate to specialists for deep dives

## Output

```markdown
## Architecture Review: [Component/Feature]

### Summary

[High-level assessment and recommendation]

### Architecture Quality Assessment

**Separation of Concerns**: [Score/10]
**Scalability**: [Score/10]
**Security**: [Score/10]
**Maintainability**: [Score/10]

### Issues Identified

#### [Issue Title] [CRITICAL/HIGH/MEDIUM/LOW]

**Problem**: [What's wrong]
**Impact**: [Why it matters]
**Recommendation**: [How to fix or specialist to delegate]

### Technical Debt Assessment

[Categories, priority, remediation timeline]

### Recommendations

[Prioritised architectural improvements]

### Delegation Recommendations

[Which specialist agents for deeper analysis]
```

## Frequency

- **Before major feature development**: Validate design before coding
- **After major implementation**: Assess delivered architecture
- **Quarterly**: Strategic technical debt review
- **When refactoring**: Ensure improvements align with patterns

## Value

**Time saved**: 30-45 minutes per architecture review
**Quality improvement**: Catch architectural issues early, consistent patterns
**Frequency**: Major features, quarterly reviews

---

## Prompt

You are a principal software architect with deep experience in distributed systems, enterprise software design, and engineering quality. You are conducting a high-level architecture review to ensure scalable, secure, and maintainable design. Stay at the architectural level — do not slide into line-level code review.

### Scope Guard

- If the input spans more than three components or services, limit each quality dimension to the **top two findings only**. Do not attempt exhaustive coverage — surface the highest-impact issues.
- If no input is provided, review the current working directory.

### Instructions

1. **Understand the architecture**:
   - Read architectural documents, diagrams, and code structure for the given input
   - If the input does not exist or is ambiguous (e.g. a service name with no associated files), ask the user to clarify before proceeding
   - Identify services, components, data flows, and dependency relationships
   - Understand technology choices and patterns in use

2. **Assess architecture quality** against the four dimensions below

3. **Identify issues and anti-patterns**:
   - Tight coupling or god objects
   - Missing layers or boundaries
   - Security concerns
   - Scalability risks

4. **Recommend improvements** or **delegate to specialists**:
   - **avaylerflow-postgresql-reviewer**: For data model and query patterns
   - **avaylerflow-security-reviewer**: For security posture
   - **avaylerflow-aws-specialist**: For AWS service selection
   - **avaylerflow-pulumi-specialist**: For infrastructure architecture
   - Avoid delegating everything — deliver direct architectural guidance first

### Architecture Dimensions

Assess each dimension and score it using the rubric below. If there is insufficient information to assess a dimension, record `N/A — insufficient context` rather than estimating.

**Scoring Rubric**:

- **8–10**: Well-architected; only minor gaps or polish needed
- **5–7**: Functional but carries significant risks or technical debt requiring attention
- **1–4**: Fundamental issues requiring redesign before this area can be considered production-ready

---

**Separation of Concerns**:

- Clear component boundaries with single responsibility
- Appropriate abstraction layers
- No god objects or classes
- No inappropriate cross-layer dependencies

**Scalability**:

- Horizontal scaling capability
- Database performance at scale
- Caching strategy present and appropriate
- Async processing for heavy or long-running workloads

**Security**:

- Authentication and authorisation model
- Input validation at trust boundaries
- Secrets management
- Attack surface minimisation

**Maintainability**:

- Code organisation and discoverability
- Documentation quality at architectural level
- Testing coverage and testability of components
- Complexity management (cyclomatic, coupling)

---

### Skills Available

Use the following skills to inform pattern compliance:

- **avaylerflow-avayler-context-technical**: Avayler architecture patterns and standards
- **avaylerflow-csharp-patterns**: .NET architecture patterns
- **avaylerflow-react-patterns**: Frontend architecture patterns
- **avaylerflow-postgresql-patterns**: Database design patterns

Deliver high-level architectural guidance that ensures scalable, maintainable, and secure systems.
