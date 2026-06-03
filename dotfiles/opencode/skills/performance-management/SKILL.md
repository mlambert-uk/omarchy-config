---
name: performance-management
description: Performance review frameworks, PIP structure, documentation best practices, difficult conversation templates, and performance coaching patterns. Use when managing performance reviews, PIPs, or performance conversations.
license: MIT
compatibility: opencode
metadata:
  audience: engineering-manager, performance-coaching-feedback-specialist, head-of-engineering
  domain: performance-management
  applies-to: [engineering-manager, performance-coaching-feedback-specialist, head-of-engineering]
---

# Performance Management Skill

This skill provides expertise in managing employee performance, conducting reviews, executing Performance Improvement Plans (PIPs), and handling difficult performance conversations.

## Table of Contents

1. [Performance Review Frameworks](#performance-review-frameworks)
2. [Continuous Performance Management](#continuous-performance-management)
3. [Performance Improvement Plans (PIPs)](#performance-improvement-plans-pips)
4. [Documentation Best Practices](#documentation-best-practices)
5. [Difficult Conversations](#difficult-conversations)
6. [Performance Calibration](#performance-calibration)
7. [Promotion Readiness](#promotion-readiness)
8. [Managing Out](#managing-out)

---

## Performance Review Frameworks

### Annual Review Structure

**Review Cycle**:
- Q4: Goal setting for next year
- Q1: Check-in #1, adjust goals
- Q2: Mid-year review, calibration
- Q3: Check-in #2, prep for annual
- Q4: Annual review, ratings, compensation

**Review Components** (weights):
- Goal Achievement (40%): Rate each goal Exceeded/Met/Partially Met/Not Met with evidence
- Core Competencies (30%): Technical, communication, collaboration, initiative
- Leadership Behaviours (20%): Mentorship, influence, decision-making
- Growth & Development (10%): Learning, skill development, career progression

**Rating Scale** (distribution target):
- 5: Exceptional (5%)
- 4: Exceeds Expectations (15%)
- 3: Meets Expectations (70%)
- 2: Needs Improvement (8%)
- 1: Unsatisfactory (2%)

### Quarterly Check-Ins

**Agenda** (30-45 minutes):
1. **Progress Review** (15 min): Review goals (on track/at risk/off track), celebrate wins, identify obstacles
2. **Feedback Exchange** (15 min): Manager feedback (strengths + growth areas), employee feedback (support needed, challenges)
3. **Development Focus** (10 min): Skills to develop, learning opportunities, stretch assignments
4. **Adjust Goals If Needed** (5 min): Business priorities changed? Goals still relevant?

---

## Continuous Performance Management

### Real-Time Feedback

**Feedback Cadence**:
- **Immediate** (within 24h): Safety issues, conduct violations, critical bugs, exceptional contributions
- **Weekly**: Code review quality, communication patterns, collaboration effectiveness
- **Monthly**: Goal progress, skill development, career conversations

**SBI Feedback Model**:
- **Situation**: "In yesterday's sprint planning meeting..."
- **Behavior**: "...you interrupted Sarah three times while explaining architecture"
- **Impact**: "This prevented team understanding and made Sarah hesitant to contribute"
- **Request**: "Let speakers finish before jumping in. Use hand-raise feature for urgent input"

---

## Performance Improvement Plans (PIPs)

### When to Use a PIP

✅ **Use PIP when**:
- Consistent underperformance despite coaching (3+ months)
- Specific, measurable performance gaps
- Role expectations are clear
- Employee given feedback and support
- Improvement is believable possible

❌ **Don't use PIP for**:
- First-time performance issue (coach first)
- Cultural fit / values misalignment
- Layoffs or restructuring
- Retaliation or discrimination

### PIP Structure

**30-60-90 Day PIP Template**:

```
Employee: [Name]  Manager: [Name]  Start Date: [Date]

1. PERFORMANCE CONCERNS
Specific issues with dates/data: "Sprint 12-14: Completed 3/8, 4/10, 2/7 stories 
(35% vs 85% team average). Code reviews required 5+ rounds of feedback. Missed 
3 deadline communications."

2. EXPECTED STANDARDS
"By end of PIP, must: Complete 80%+ sprint stories, pass code review in <2 rounds, 
proactively communicate blockers, attend all ceremonies prepared."

3. SUCCESS CRITERIA (SMART)
30-Day: 6/8 stories, <3 code comments, zero silent misses, 2 pairing sessions
60-Day: 7/8 stories, <2 code rounds, lead 1 design, demonstrate testing mastery
90-Day: 80%+ sprint completion consistently, meet quality standards independently

4. SUPPORT PROVIDED
- Weekly 1:1s (instead of bi-weekly)
- 2x/week pairing with senior engineer
- [Specific course/resources]
- 4 hours/week learning time

5. CHECK-IN SCHEDULE
Week 2: Progress check | Week 4: 30-day review | Week 8: 60-day review | 
Week 12: 90-day assessment

6. CONSEQUENCES
"Failure to meet standards may result in termination."

Signatures: Employee ________ Manager ________ HR ________ Date ________
```

### PIP Execution

**Manager Responsibilities**:
- **Weekly**: Document specific examples, provide real-time feedback, ensure resources available
- **Formal Check-Ins** (30/60/90 days): Review against success criteria, provide written update, adjust support if needed
- **Throughout**: Be fair but firm, document everything, loop in HR, don't make promises you can't keep

**Common PIP Mistakes**:

| Mistake | Bad Example | Good Example |
|---|---|---|
| **Vague Goals** | "Improve code quality" | "Reduce production bugs from 5/month to <1/month" |
| **Moving Goalposts** | Add new requirements mid-PIP | Stick to original success criteria |
| **Insufficient Support** | Set someone up to fail | Provide real resources and coaching |
| **Surprise PIP** | First time hearing about issues | PIP follows months of coaching |

---

## Documentation Best Practices

### What to Document

**Document These**:
- ✅ Goals & expectations: Written agreements, role responsibilities, success criteria
- ✅ Feedback given: Date, topic, outcome (both positive and constructive)
- ✅ Performance issues: Specific examples with dates, impact, coaching provided
- ✅ 1:1 notes: Discussion points, commitments, follow-up items
- ✅ Recognition: Wins, achievements, peer feedback, growth demonstrated

**Don't Document**:
- ❌ Personal opinions ("I don't like...")
- ❌ Hearsay without verification
- ❌ Protected characteristics
- ❌ Information unrelated to work

**Documentation Format** (Example):

```
Date: 2024-03-15
Employee: John Smith
Topic: Sprint Commitment Issue

Situation: Sprint 14 planning (March 4): Committed to 8 points. By sprint end: Only 3 completed.

Discussion: Met to understand blockers
- Unclear requirements on 2 stories
- 6 hours debugging legacy code (unplanned)
- Underestimated API complexity

Actions Agreed:
- Flag unclear requirements before committing
- Manager allocates 20% buffer for legacy support
- Pair with Sarah on API integrations

Follow-Up: Check Sprint 15 velocity (March 29) + review estimation (March 22)

Outcome: If improved → continue support | If no improvement → consider PIP
```

---

## Difficult Conversations

### Underperformance Conversation

**Framework**:
1. **State the Issue** (Be direct): "I want to discuss your performance over the last quarter. You've consistently missed deadlines and code quality hasn't met our standards."

2. **Provide Specific Examples**: "Sprint 12: Missed 3/4 deliverables. Feature X had 12 bugs found in QA, requiring 3 days rework."

3. **Explain Impact**: "This affects team commitments and created additional work for other engineers."

4. **Listen** (Ask open questions): "Help me understand what's happening. What challenges are you facing?"

5. **Collaborate on Solution**: "What support do you need? Here's what I'm thinking..."

6. **Set Clear Expectations**: "Going forward, I need to see [specific behaviours]. We'll check in weekly to track progress."

7. **Document**: "I'll send you a summary of our conversation and the plan we agreed on."

### Behavioral Issue Conversation

**Example: Disrespectful Code Review Comments**

1. **Opening**: "I need to discuss your code review comments on Sarah's PR yesterday. Several comments were dismissive and disrespectful."

2. **Specific Behavior**: "You wrote 'This code is garbage' and 'Did you even test this?' These attacked Sarah personally rather than addressing technical issues."

3. **Impact**: "Sarah came to me upset and is now hesitant to submit PRs. This damages team psychological safety."

4. **Expectation**: "Code reviews must be professional and constructive. Focus on the code, not the person, and explain issues clearly."

5. **Example of Good Feedback**: "Instead of 'This is garbage,' say: 'This function has a bug on line 42 that will cause X issue. Suggest refactoring to Y pattern.'"

6. **Consequence**: "If I see dismissive or disrespectful behaviour again, we'll move to formal written warning. Am I clear?"

7. **Action**: "Please apologise to Sarah and re-submit your review with constructive comments."

---

## Performance Calibration

### Calibration Sessions

**Purpose**: Ensure consistency across teams, reduce bias, fair rating distribution, identify high performers for promotion/low performers for support

**Process**:

**Pre-Work** (Managers):
- Draft ratings for each team member
- Prepare evidence (examples, metrics)
- Identify borderline cases

**Meeting Agenda** (2-3 hours):
1. Review rating distribution (15 min): Target 5% exceptional, 15% exceeds, 70% meets, 8% needs improvement, 2% unsatisfactory
2. Discuss outliers (60 min): Justify all "exceptional" and "unsatisfactory" ratings with evidence
3. Calibrate borderline cases (45 min): Compare 3.5 vs 4 ratings across teams
4. Finalise ratings (30 min): Adjust based on discussion, ensure fairness

**Output**: Finalised ratings, promotion recommendations, development focus areas

---

## Promotion Readiness

### Assessment Framework

**Promotion Criteria**:

**IC2 → IC3** (Mid → Senior):
- ✅ Consistently delivers complex features independently
- ✅ Mentors junior engineers
- ✅ Makes sound technical decisions
- ✅ Influences team standards and practices
- ✅ Proactively identifies and solves problems
- ✅ Operating at next level for 6+ months

**IC3 → IC4** (Senior → Staff):
- ✅ Leads architectural decisions across multiple services
- ✅ Mentors senior engineers
- ✅ Influences engineering org practices
- ✅ Drives cross-team initiatives
- ✅ Recognised technical authority
- ✅ Operating at next level for 12+ months

**Red Flags** (Not Ready):
- ❌ Just started performing consistently at current level
- ❌ Needs significant support/oversight
- ❌ Inconsistent performance
- ❌ Missing key competencies for next level
- ❌ Behavioural concerns

**Promotion Packet**:

```
Candidate: [Name]
Current Level: IC3 (Senior Engineer)
Proposed Level: IC4 (Staff Engineer)
Tenure at Current Level: 18 months

Summary: [2-3 sentences on why ready]

Evidence of Impact:
1. Technical Leadership
   - Led authentication service redesign (60% latency reduction)
   - Established testing standards adopted by 4 teams
2. Mentorship
   - Mentored 3 engineers (2 promoted to senior)
   - Runs weekly architecture office hours
3. Cross-Team Influence
   - Drove API standards across platform
   - Founded frontend guild (20 members)

Peer Feedback: [summarised quotes]
- "Go-to person for distributed systems"
- "Always makes time to help others grow"
- "Raises the bar for technical excellence"

Manager Assessment: [Your view on readiness, growth areas, recommendation]

Requested Effective Date: [Date]
```

---

## Managing Out

### When to Let Someone Go

**Termination Indicators**:
- **After PIP Failure**: Completed 90-day PIP, did not meet success criteria, provided adequate support, documented throughout
- **Immediate Termination** (serious misconduct): Code of conduct violation, harassment/discrimination, theft/fraud, gross negligence, violence/threats
- **Layoff/Restructuring**: Role no longer needed, budget cuts, company pivot (NOT performance-related)

### Termination Conversation

**Script** (15-20 minutes, with HR present):

1. **Opening** (Be direct): "This is your last day at [Company]. Your employment is being terminated."

2. **Reason** (Brief): "Despite the 90-day PIP and support provided, you did not meet performance standards. [Specific example]."

3. **Logistics** (HR leads): Last paycheck, benefits end date, COBRA info, equipment return, exit paperwork

4. **Access Revoked**: "Your system access has been disabled as of this meeting."

5. **Close**: "We'll escort you to collect personal belongings. I wish you well in your future."

**Don'ts**:
- ❌ Argue or negotiate
- ❌ Provide vague reasons
- ❌ Make promises ("I'll be a reference")
- ❌ Let it drag on
- ❌ Do it alone (HR must be present)

**Post-Termination** (Same Day):
- [ ] Revoke all system access
- [ ] Collect equipment
- [ ] Send team announcement (brief, professional)
- [ ] Document the meeting

**Team Announcement**:
"[Name] is no longer with [Company] as of today. [HR] and I are available if you have questions. [Manager] will cover [Name]'s responsibilities until we determine next steps."

---

**End of Performance Management Skill**
