---
name: flow-security
description: Comprehensive OWASP Top 10 security vulnerability scan with automated severity assessment and remediation guidance
model: github-copilot/gpt-5.2-codex
template: |
  # /flow-security

  Scan code for OWASP Top 10 vulnerabilities:
  - A01: Broken Access Control
  - A02: Cryptographic Failures
  - A03: Injection (SQL, command, path traversal)
  - A04: Insecure Design
  - A05: Security Misconfiguration
  - A06: Vulnerable Components
  - A07: Authentication/Session Failures
  - A08: Data Integrity Failures
  - A09: Logging/Monitoring Gaps
  - A10: SSRF Vulnerabilities

  For each finding:
  - Location (file:line)
  - Severity (CRITICAL/HIGH/MEDIUM/LOW)
  - CWE reference
  - Impact assessment
  - Remediation code example

  CRITICAL findings block deployment — notify Security Team, Manager, CTO.
---

# /flow-security

Scan code for OWASP Top 10 vulnerabilities (A01-A10: access control, crypto failures, injection, auth issues, etc.).

Delegate to `avaylerflow-security-scanning` to perform the full scan. Pass the scope (git diff for uncommitted changes, or the specified path if provided). The agent carries all OWASP patterns, severity frameworks, escalation protocols, and report templates.

**Scope**: Defaults to uncommitted changes (git diff). Use `/flow-security .` for a full repo scan or pass a specific path.

**CRITICAL findings**: Block deployment, notify Security Team + Manager + CTO, fix within 24h.
