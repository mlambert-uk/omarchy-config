---
description: Database query optimization with EXPLAIN ANALYZE analysis, index recommendations, and N+1 detection
model: github-copilot/gpt-5.2-codex
---

# Optimize Database Query

Analyze database queries for performance issues, provide index recommendations, detect N+1 patterns, and optimize query structure.

## Usage

```
/optimize-query [query-or-file]
```

**Examples:**
- `/optimize-query src/repositories/UserRepository.cs` - Analyze all queries in file
- `/optimize-query "SELECT * FROM Users WHERE Email = 'test@example.com'"` - Optimize specific query
- `/optimize-query src/migrations/20260122_AddIndex.sql` - Review migration
- `/optimize-query .` - Scan codebase for query anti-patterns

## What This Command Does

This command launches the **postgresql-reviewer** agent to:

1. **Analyze query structure**:
   - EXPLAIN ANALYZE plans (if execution available)
   - Join patterns and complexity
   - WHERE clause filters
   - SELECT column usage

2. **Detect performance issues**:
   - N+1 query patterns
   - Missing indexes
   - Full table scans
   - SELECT * anti-pattern
   - Missing AsNoTracking (Entity Framework)

3. **Recommend optimizations**:
   - Index strategies (B-tree, GIN, composite)
   - Query rewriting
   - Entity Framework improvements
   - Caching opportunities

4. **Estimate impact**:
   - Expected performance improvement
   - Index overhead considerations
   - Migration safety

## Output

```markdown
## Query Optimization: [Query/File]

### Summary
[Brief assessment and key findings]

### Performance Issues Identified

#### [Issue Title] [CRITICAL/HIGH/MEDIUM/LOW]
**Location**: [table/query/file:line]
**Problem**: [What's wrong]
**Impact**: [Current performance, scale issues]
**Solution**: [SQL fix with example]
**Expected Improvement**: [Performance estimate]

### Index Recommendations
- ADD INDEX idx_[name] ON [table]([columns])
  - Reason: [Query pattern this optimizes]
  - Impact: [Queries improved]
  - Overhead: [Write impact]

### Query Rewrites
[Optimized query versions]

### N+1 Detection
[Patterns loading data in loops]
```

## Common Query Issues

**N+1 Queries** (CRITICAL):
- Loading data in loops instead of joins
- Missing Include/ThenInclude in Entity Framework
- Impact: 100+ queries instead of 1

**Missing Indexes** (HIGH):
- WHERE clause columns without indexes
- Foreign keys without indexes
- JOIN columns without indexes
- Impact: Full table scans, slow queries

**SELECT * Anti-Pattern** (MEDIUM):
- Loading all columns when only few needed
- Impact: Memory overhead, network traffic

**Missing AsNoTracking** (MEDIUM):
- Entity Framework read-only queries tracking changes
- Impact: Memory overhead, slower queries

## Frequency

- **Ad-hoc**: When query performance issues arise
- **Before production**: Review queries in new features
- **Monthly**: Scan for emerging N+1 patterns
- **During migrations**: Validate index strategies

## Value

**Time saved**: 15-30 minutes per query optimization
**Quality improvement**: Systematic performance tuning, prevent production issues
**Frequency**: As-needed for performance problems

## Prompt

You are optimizing database queries for performance, identifying anti-patterns, and recommending index strategies.

### Instructions

1. **Analyze query or codebase**:
   - Extract SQL queries or Entity Framework LINQ
   - Identify tables, joins, filters involved
   - Check for N+1 patterns

2. **Detect performance issues** using **postgresql-patterns** and **csharp-patterns** skills

3. **Recommend optimizations**:
   - Index strategies with specific SQL
   - Query rewrites for efficiency
   - Entity Framework patterns (Include, AsNoTracking)

4. **Estimate performance impact** where possible

Use the **database** agent with access to:
- **postgresql-patterns**: Query optimization, indexing strategies
- **csharp-patterns**: Entity Framework optimization

Deliver specific, actionable query optimizations that improve performance and scale.
