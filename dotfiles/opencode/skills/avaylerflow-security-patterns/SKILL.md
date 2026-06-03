---
name: avaylerflow-security-patterns
description: Security vulnerability detection patterns covering OWASP Top 10, authentication, authorization, injection attacks, XSS, CSRF, and secure coding practices. Use when conducting security-focused code reviews.
license: MIT
compatibility: opencode
metadata:
  audience: security-reviewer, technical-lead
  domain: application-security
  applies-to: [security-reviewer, technical-lead, csharp-reviewer, react-reviewer, postgresql-reviewer]
---

# Security Patterns Skill

This skill provides expertise in identifying and preventing common security vulnerabilities based on OWASP Top 10 and industry best practices for web application security.

## Table of Contents

1. [OWASP Top 10 Overview](#owasp-top-10-overview)
2. [Injection Attacks](#injection-attacks)
3. [Broken Authentication](#broken-authentication)
4. [Sensitive Data Exposure](#sensitive-data-exposure)
5. [XML External Entities (XXE)](#xml-external-entities-xxe)
6. [Broken Access Control](#broken-access-control)
7. [Security Misconfiguration](#security-misconfiguration)
8. [Cross-Site Scripting (XSS)](#cross-site-scripting-xss)
9. [Insecure Deserialization](#insecure-deserialization)
10. [Using Components with Known Vulnerabilities](#using-components-with-known-vulnerabilities)
11. [Insufficient Logging and Monitoring](#insufficient-logging-and-monitoring)
12. [Cross-Site Request Forgery (CSRF)](#cross-site-request-forgery-csrf)
13. [Secure Coding Practices](#secure-coding-practices)

---

## OWASP Top 10 Overview

### A01: Broken Access Control
- Missing authorization checks
- Insecure direct object references (IDOR)
- Path traversal
- Elevation of privilege

### A02: Cryptographic Failures
- Storing sensitive data unencrypted
- Weak cryptographic algorithms
- Hardcoded secrets
- Insecure key management

### A03: Injection
- SQL injection
- Command injection
- NoSQL injection
- LDAP injection
- XPath injection

### A04: Insecure Design
- Missing security requirements
- Inadequate threat modeling
- Insecure design patterns

### A05: Security Misconfiguration
- Default credentials
- Unnecessary features enabled
- Error messages revealing sensitive info
- Missing security headers

### A06: Vulnerable and Outdated Components
- Using components with known vulnerabilities
- Not updating dependencies
- Using end-of-life software

### A07: Identification and Authentication Failures
- Weak password policies
- Missing MFA
- Session fixation
- Credential stuffing vulnerabilities

### A08: Software and Data Integrity Failures
- Insecure deserialization
- Missing integrity checks
- Unsigned/unverified updates

### A09: Security Logging and Monitoring Failures
- Missing security event logging
- Inadequate log protection
- No alerting on suspicious activity

### A10: Server-Side Request Forgery (SSRF)
- Unvalidated URLs in server-side requests
- Missing allow-lists

---

## Injection Attacks

### SQL Injection

**Vulnerable Code (C#):**
```csharp
// ❌ CRITICAL: SQL Injection vulnerability
public User GetUser(string username)
{
    var query = $"SELECT * FROM Users WHERE Username = '{username}'";
    return _db.Query<User>(query).FirstOrDefault();
}

// Attack: username = "admin' OR '1'='1"
```

**Secure Code (C#):**
```csharp
// ✅ GOOD: Parameterized query
public User GetUser(string username)
{
    var query = "SELECT * FROM Users WHERE Username = @Username";
    return _db.Query<User>(query, new { Username = username }).FirstOrDefault();
}

// ✅ GOOD: Entity Framework (parameterized automatically)
public User GetUser(string username)
{
    return _context.Users
        .Where(u => u.Username == username)
        .FirstOrDefault();
}
```

**Vulnerable Code (TypeScript/Node):**
```typescript
// ❌ CRITICAL: SQL Injection
async function getUser(username: string): Promise<User> {
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const result = await db.query(query);
  return result.rows[0];
}
```

**Secure Code (TypeScript/Node):**
```typescript
// ✅ GOOD: Parameterized query
async function getUser(username: string): Promise<User> {
  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await db.query(query, [username]);
  return result.rows[0];
}

// ✅ GOOD: ORM (TypeORM example)
async function getUser(username: string): Promise<User> {
  return userRepository.findOne({ where: { username } });
}
```

### Command Injection

**Vulnerable Code:**
```csharp
// ❌ CRITICAL: Command injection
public string ConvertImage(string filename)
{
    var command = $"convert {filename} output.png";
    Process.Start("cmd.exe", $"/c {command}");
    return "output.png";
}

// Attack: filename = "input.jpg; rm -rf /"
```

**Secure Code:**
```csharp
// ✅ GOOD: Validate and sanitize input
public string ConvertImage(string filename)
{
    // Validate filename
    if (!Regex.IsMatch(filename, @"^[a-zA-Z0-9_\-\.]+$"))
    {
        throw new ArgumentException("Invalid filename");
    }
    
    // Use process arguments (not shell)
    var process = new Process
    {
        StartInfo = new ProcessStartInfo
        {
            FileName = "convert",
            Arguments = $"{filename} output.png",
            UseShellExecute = false
        }
    };
    process.Start();
    process.WaitForExit();
    
    return "output.png";
}
```

### NoSQL Injection

**Vulnerable Code (MongoDB):**
```typescript
// ❌ CRITICAL: NoSQL injection
async function findUser(username: string) {
  // Attack: username = {"$gt": ""}
  return db.collection('users').findOne({ username });
}
```

**Secure Code:**
```typescript
// ✅ GOOD: Type validation
async function findUser(username: string) {
  // Ensure username is a string
  if (typeof username !== 'string') {
    throw new Error('Invalid username type');
  }
  
  return db.collection('users').findOne({ username: username });
}

// ✅ GOOD: Schema validation
const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
});
```

---

## Broken Authentication

### Password Storage

**Vulnerable Code:**
```csharp
// ❌ CRITICAL: Plain text password storage
public void CreateUser(string username, string password)
{
    _db.Execute("INSERT INTO Users (Username, Password) VALUES (@Username, @Password)",
        new { Username = username, Password = password });
}

// ❌ CRITICAL: Weak hashing (MD5)
public void CreateUser(string username, string password)
{
    var hash = MD5.Create().ComputeHash(Encoding.UTF8.GetBytes(password));
    // ... store hash
}
```

**Secure Code:**
```csharp
// ✅ GOOD: Use bcrypt or Argon2
using BC = BCrypt.Net.BCrypt;

public void CreateUser(string username, string password)
{
    var hashedPassword = BC.HashPassword(password, workFactor: 12);
    _db.Execute("INSERT INTO Users (Username, PasswordHash) VALUES (@Username, @PasswordHash)",
        new { Username = username, PasswordHash = hashedPassword });
}

public bool VerifyPassword(string password, string hashedPassword)
{
    return BC.Verify(password, hashedPassword);
}
```

### Session Management

**Vulnerable Code:**
```csharp
// ❌ HIGH: Predictable session IDs
public string CreateSession(int userId)
{
    var sessionId = $"session_{userId}_{DateTime.Now.Ticks}";
    _cache.Set(sessionId, userId, TimeSpan.FromHours(24));
    return sessionId;
}
```

**Secure Code:**
```csharp
// ✅ GOOD: Cryptographically secure session IDs
public string CreateSession(int userId)
{
    var sessionId = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
    _cache.Set(sessionId, userId, TimeSpan.FromHours(1)); // Shorter expiry
    return sessionId;
}

// ✅ GOOD: Session rotation on privilege change
public void PromoteUserToAdmin(int userId, string oldSessionId)
{
    // Invalidate old session
    _cache.Remove(oldSessionId);
    
    // Create new session
    var newSessionId = CreateSession(userId);
    
    // Update user privileges
    UpdateUserRole(userId, "Admin");
    
    return newSessionId;
}
```

### Multi-Factor Authentication

**Vulnerable Code:**
```csharp
// ❌ HIGH: No MFA for sensitive operations
public void TransferMoney(int fromAccount, int toAccount, decimal amount)
{
    // Only checks if user is authenticated
    if (!User.Identity.IsAuthenticated)
    {
        throw new UnauthorizedException();
    }
    
    // Performs sensitive operation
    _bankService.Transfer(fromAccount, toAccount, amount);
}
```

**Secure Code:**
```csharp
// ✅ GOOD: Require MFA for sensitive operations
public void TransferMoney(int fromAccount, int toAccount, decimal amount, string mfaCode)
{
    if (!User.Identity.IsAuthenticated)
    {
        throw new UnauthorizedException();
    }
    
    // Verify MFA
    if (!_mfaService.VerifyCode(User.Id, mfaCode))
    {
        _auditLog.LogFailedMfaAttempt(User.Id);
        throw new InvalidMfaCodeException();
    }
    
    _bankService.Transfer(fromAccount, toAccount, amount);
    _auditLog.LogSensitiveOperation("MoneyTransfer", User.Id, amount);
}
```

---

## Sensitive Data Exposure

### Encryption at Rest

**Vulnerable Code:**
```csharp
// ❌ CRITICAL: Storing sensitive data unencrypted
public void SaveCreditCard(int userId, string cardNumber, string cvv)
{
    _db.Execute(
        "INSERT INTO CreditCards (UserId, CardNumber, CVV) VALUES (@UserId, @CardNumber, @CVV)",
        new { UserId = userId, CardNumber = cardNumber, CVV = cvv }
    );
}
```

**Secure Code:**
```csharp
// ✅ GOOD: Encrypt sensitive data
public void SaveCreditCard(int userId, string cardNumber, string cvv)
{
    var encryptedCard = _encryptionService.Encrypt(cardNumber);
    var encryptedCvv = _encryptionService.Encrypt(cvv);
    
    _db.Execute(
        "INSERT INTO CreditCards (UserId, CardNumberEncrypted, CVVEncrypted) VALUES (@UserId, @CardNumber, @CVV)",
        new { UserId = userId, CardNumber = encryptedCard, CVV = encryptedCvv }
    );
}

// Using AES-256-GCM
public class EncryptionService
{
    private readonly byte[] _key;
    
    public string Encrypt(string plaintext)
    {
        using var aes = new AesGcm(_key);
        var nonce = new byte[AesGcm.NonceBytesSize];
        var tag = new byte[AesGcm.TagBytesSize];
        var ciphertext = new byte[plaintext.Length];
        
        RandomNumberGenerator.Fill(nonce);
        aes.Encrypt(nonce, Encoding.UTF8.GetBytes(plaintext), ciphertext, tag);
        
        // Return nonce + tag + ciphertext (all base64 encoded)
        return Convert.ToBase64String(nonce.Concat(tag).Concat(ciphertext).ToArray());
    }
}
```

### Secrets Management

**Vulnerable Code:**
```csharp
// ❌ CRITICAL: Hardcoded secrets
public class DatabaseConfig
{
    public string ConnectionString = "Server=prod;Database=mydb;User=admin;Password=P@ssw0rd123";
    public string ApiKey = "sk_live_1234567890abcdef";
}

// ❌ CRITICAL: Secrets in source control
// appsettings.json committed to git
{
  "ConnectionStrings": {
    "Default": "Server=prod;Password=secret"
  }
}
```

**Secure Code:**
```csharp
// ✅ GOOD: Use environment variables
public class DatabaseConfig
{
    public string ConnectionString => Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
    public string ApiKey => Environment.GetEnvironmentVariable("API_KEY");
}

// ✅ GOOD: Use secrets manager (AWS Secrets Manager)
public class SecretsService
{
    private readonly IAmazonSecretsManager _secretsManager;
    
    public async Task<string> GetDatabasePassword()
    {
        var request = new GetSecretValueRequest
        {
            SecretId = "prod/database/password"
        };
        
        var response = await _secretsManager.GetSecretValueAsync(request);
        return response.SecretString;
    }
}

// ✅ GOOD: User Secrets in development (not committed)
// dotnet user-secrets set "ConnectionStrings:Default" "..."
```

### Logging Sensitive Data

**Vulnerable Code:**
```csharp
// ❌ CRITICAL: Logging sensitive data
_logger.LogInformation($"User {userId} logged in with password {password}");
_logger.LogInformation($"Processing payment for card {cardNumber}");
_logger.LogError($"API call failed: {apiKey}");
```

**Secure Code:**
```csharp
// ✅ GOOD: Redact sensitive data
_logger.LogInformation($"User {userId} logged in successfully");
_logger.LogInformation($"Processing payment for card ending in {cardNumber.Substring(cardNumber.Length - 4)}");
_logger.LogError($"API call failed for service {serviceName}");

// ✅ GOOD: Use structured logging with redaction
public class SensitiveDataRedactor
{
    public static string RedactCreditCard(string cardNumber)
    {
        if (string.IsNullOrEmpty(cardNumber) || cardNumber.Length < 4)
            return "****";
        
        return $"****-****-****-{cardNumber.Substring(cardNumber.Length - 4)}";
    }
    
    public static string RedactEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return "***@***";
        
        var localPart = parts[0].Length > 2 
            ? parts[0].Substring(0, 2) + "***" 
            : "***";
        return $"{localPart}@{parts[1]}";
    }
}
```

---

## Cross-Site Scripting (XSS)

### Reflected XSS

**Vulnerable Code (C# MVC):**
```csharp
// ❌ CRITICAL: Reflected XSS
public IActionResult Search(string query)
{
    ViewBag.Query = query; // Unescaped
    var results = _searchService.Search(query);
    return View(results);
}

// View:
<h1>Results for: @Html.Raw(ViewBag.Query)</h1>
// Attack: ?query=<script>alert('XSS')</script>
```

**Secure Code:**
```csharp
// ✅ GOOD: Automatic HTML encoding
public IActionResult Search(string query)
{
    ViewBag.Query = query;
    var results = _searchService.Search(query);
    return View(results);
}

// View (Razor auto-escapes by default):
<h1>Results for: @ViewBag.Query</h1>

// ✅ GOOD: Explicit encoding when needed
<div data-search="@Html.AttributeEncode(ViewBag.Query)">
```

### Stored XSS

**Vulnerable Code (React):**
```tsx
// ❌ CRITICAL: Stored XSS via dangerouslySetInnerHTML
function Comment({ comment }: { comment: Comment }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: comment.text }} />
  );
}
```

**Secure Code (React):**
```tsx
// ✅ GOOD: Let React escape content
function Comment({ comment }: { comment: Comment }) {
  return <div>{comment.text}</div>;
}

// ✅ GOOD: Sanitize if HTML is required
import DOMPurify from 'dompurify';

function Comment({ comment }: { comment: Comment }) {
  const sanitizedHtml = DOMPurify.sanitize(comment.text, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
```

### DOM-Based XSS

**Vulnerable Code (JavaScript):**
```javascript
// ❌ CRITICAL: DOM-based XSS
const params = new URLSearchParams(window.location.search);
const name = params.get('name');
document.getElementById('welcome').innerHTML = `Welcome ${name}!`;

// Attack: ?name=<img src=x onerror=alert('XSS')>
```

**Secure Code:**
```javascript
// ✅ GOOD: Use textContent instead of innerHTML
const params = new URLSearchParams(window.location.search);
const name = params.get('name');
document.getElementById('welcome').textContent = `Welcome ${name}!`;

// ✅ GOOD: Create elements safely
const welcomeEl = document.createElement('div');
welcomeEl.textContent = `Welcome ${name}!`;
document.getElementById('container').appendChild(welcomeEl);
```

---

## Broken Access Control

### Insecure Direct Object Reference (IDOR)

**Vulnerable Code:**
```csharp
// ❌ CRITICAL: IDOR - no authorization check
[HttpGet("{id}")]
public IActionResult GetUserProfile(int id)
{
    var user = _userService.GetUser(id);
    return Ok(user);
}

// Attack: Any authenticated user can access /api/users/123
```

**Secure Code:**
```csharp
// ✅ GOOD: Verify ownership
[HttpGet("{id}")]
[Authorize]
public IActionResult GetUserProfile(int id)
{
    var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
    
    // Check if user is accessing their own profile or is admin
    if (currentUserId != id && !User.IsInRole("Admin"))
    {
        _auditLog.LogUnauthorizedAccess(currentUserId, "UserProfile", id);
        return Forbid();
    }
    
    var user = _userService.GetUser(id);
    return Ok(user);
}
```

### Path Traversal

**Vulnerable Code:**
```csharp
// ❌ CRITICAL: Path traversal
[HttpGet]
public IActionResult DownloadFile(string filename)
{
    var filePath = Path.Combine(_uploadPath, filename);
    return PhysicalFile(filePath, "application/octet-stream");
}

// Attack: ?filename=../../etc/passwd
```

**Secure Code:**
```csharp
// ✅ GOOD: Validate and sanitize filename
[HttpGet]
public IActionResult DownloadFile(string filename)
{
    // Remove any path characters
    filename = Path.GetFileName(filename);
    
    // Validate filename
    if (!Regex.IsMatch(filename, @"^[a-zA-Z0-9_\-\.]+$"))
    {
        return BadRequest("Invalid filename");
    }
    
    var filePath = Path.Combine(_uploadPath, filename);
    
    // Ensure file is within allowed directory
    var fullPath = Path.GetFullPath(filePath);
    if (!fullPath.StartsWith(_uploadPath))
    {
        _auditLog.LogPathTraversalAttempt(User.Id, filename);
        return Forbid();
    }
    
    if (!System.IO.File.Exists(fullPath))
    {
        return NotFound();
    }
    
    return PhysicalFile(fullPath, "application/octet-stream");
}
```

---

## Cross-Site Request Forgery (CSRF)

**Vulnerable Code:**
```csharp
// ❌ HIGH: No CSRF protection
[HttpPost]
public IActionResult DeleteAccount()
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
    _userService.DeleteAccount(userId);
    return Ok();
}

// Attack: Victim visits malicious site with:
// <form action="https://yoursite.com/account/delete" method="POST">
//   <input type="submit" value="Click for free gift!">
// </form>
```

**Secure Code (ASP.NET Core):**
```csharp
// ✅ GOOD: CSRF token validation
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult DeleteAccount()
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
    _userService.DeleteAccount(userId);
    return Ok();
}

// In Startup.cs
services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
});
```

**Secure Code (React with API):**
```typescript
// ✅ GOOD: Include CSRF token in requests
async function deleteAccount() {
  const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
  
  await fetch('/api/account/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrfToken || ''
    }
  });
}
```

---

## Secure Coding Practices

### Input Validation

**Server-Side Validation:**
```csharp
// ✅ GOOD: Comprehensive input validation
public class CreateUserRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    [RegularExpression(@"^[a-zA-Z0-9_]+$")]
    public string Username { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]")]
    public string Password { get; set; }
    
    [Range(18, 120)]
    public int Age { get; set; }
}

[HttpPost]
public IActionResult CreateUser([FromBody] CreateUserRequest request)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }
    
    // Additional business logic validation
    if (_userService.UsernameExists(request.Username))
    {
        return BadRequest("Username already exists");
    }
    
    _userService.CreateUser(request);
    return Ok();
}
```

### Error Handling

**Vulnerable Code:**
```csharp
// ❌ HIGH: Exposing stack traces
try
{
    var user = _userService.GetUser(id);
}
catch (Exception ex)
{
    return BadRequest(ex.ToString()); // Exposes internal details
}
```

**Secure Code:**
```csharp
// ✅ GOOD: Generic error messages, detailed logging
try
{
    var user = _userService.GetUser(id);
    return Ok(user);
}
catch (NotFoundException)
{
    return NotFound();
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error retrieving user {UserId}", id);
    return StatusCode(500, "An error occurred processing your request");
}
```

### Security Headers

**Secure Configuration:**
```csharp
// ✅ GOOD: Security headers middleware
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Add("Content-Security-Policy", 
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
    context.Response.Headers.Add("Strict-Transport-Security", 
        "max-age=31536000; includeSubDomains; preload");
    
    await next();
});
```

---

**End of Security Patterns Skill**
