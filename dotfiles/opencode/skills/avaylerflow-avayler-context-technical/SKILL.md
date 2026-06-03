---
name: avaylerflow-avayler-context-technical
description: Avayler technical architecture, patterns, and best practices. Use when providing technical guidance, code reviews, or architecture recommendations.
license: MIT
compatibility: opencode
metadata:
  audience: technical-agents
  domain: engineering
  applies-to:
    [
      technical-lead,
      csharp-reviewer,
      react-reviewer,
      aws-specialist,
      pulumi-specialist,
      postgresql-reviewer,
    ]
---

## What I do

Provide Avayler-specific technical context, architectural patterns, and best practices to ensure consistent, context-aware technical guidance across all code review and architecture agents.

## When to use me

**Load this skill when:**

- Reviewing code for Avayler projects
- Providing architecture guidance
- Assessing technical decisions
- Evaluating against team standards
- Making technology recommendations

**All code reviewers and technical agents should load this skill.**

## Avayler Tech Stack

### Development & Collaboration Tools

- **Communication**: Microsoft Teams (primary communication platform)
- **Project Management**: Azure DevOps (work item tracking, boards, sprints)
- **Source Control**: Azure DevOps Repos (Git-based)
- **CI/CD**: Azure DevOps Pipelines (build and deployment automation)
- **Documentation**: Confluence (development wiki, technical documentation)
- **Cloud Platform**: AWS (Lambda, RDS, S3, API Gateway, SQS, EventBridge)

### Backend

- **C# Microservices** on AWS Lambda with .NET 6+
- **Pattern**: 4-layer architecture (Api, Core, Infrastructure, Contracts)
- **DI Lifetime**: Scoped for Lambda environments
- **Exception Hierarchy**: NotFoundException, ValidationException, BusinessRuleException
- **Data Access**: Repository pattern with Entity Framework Core
- **Async**: Async/await with CancellationToken throughout
- **Logging**: Structured logging with ILogger and correlation IDs

### Frontend

- **React 18+** with TypeScript
- **Architecture**: Feature-based folder structure
- **Components**: Presentational vs container components
- **State Management**: React Query for server state, Context API for global (auth, theme)
- **Logic**: Custom hooks for business logic
- **Error Handling**: Error boundaries at route level

### Mobile

- **React Native** for iOS/Android
- **Platform-Specific Code**: Handled via platform extensions (.ios.js, .android.js)

### Database

- **PostgreSQL** for relational data with ACID guarantees
- **ORM**: Entity Framework Core
- **Patterns**: Migrations, query optimization, structured logging

### Infrastructure

- **IaC**: Pulumi (TypeScript-based, type-safe)
- **Cloud**: AWS (Lambda, RDS, S3, API Gateway, SQS, EventBridge)
- **Tagging**: Service, Environment, ManagedBy, CostCenter
- **Security**: IAM least privilege per Lambda
- **Reliability**: Multi-AZ RDS in production
- **Observability**: X-Ray tracing enabled

## Avayler Architecture Principles

### 1. Serverless-First

- Use AWS Lambda for microservices unless strong reason otherwise
- Cost-optimised, scalable, zero server management
- Cold start optimisation critical

### 2. Domain-Driven Design

- Services organised by business domain
- Clear service boundaries
- API contracts between services

### 3. Event-Driven

- Async communication via SQS/EventBridge where possible
- Eventual consistency patterns
- Event sourcing for audit trails

### 4. Repository Pattern

- Data access abstracted through repositories
- Testability and consistency
- Separation of concerns

### 5. API-First

- Well-defined contracts between services
- OpenAPI/Swagger specifications
- Clear request/response models

### 6. Observability

- Structured logging with correlation IDs
- Metrics and monitoring
- X-Ray distributed tracing
- Datadog integration

### 7. Test-First

- High test coverage (80%+ unit, integration, E2E)
- Pyramid strategy: unit → integration → E2E
- TDD where appropriate

## C# Microservices Patterns

### Project Structure

```
Service.Api/              # Public API layer
Service.Core/             # Business logic
Service.Infrastructure/   # Data access, external services
Service.Contracts/        # DTOs and interfaces
Service.Tests/            # Unit and integration tests
```

### Key Patterns

- **Dependency Injection**: Constructor injection, scoped lifetimes for Lambda
- **Exception Handling**: Specific exceptions (not catch-all), logged with context
- **Async Patterns**: Async/await with ConfigureAwait(false), CancellationToken support
- **LINQ Usage**: Avoid N+1 queries, use Include() for eager loading
- **Entity Framework**: Projection to DTOs, shadow properties for audit
- **Validation**: Fluent validation, input sanitisation
- **Error Responses**: Consistent error response format with correlation ID

### Anti-Patterns to Avoid

- ❌ Blocking async calls (.Result, .Wait())
- ❌ Missing CancellationToken in async methods
- ❌ N+1 query problems (missing Include)
- ❌ Direct DbContext usage instead of repository
- ❌ Bare catch-all exceptions
- ❌ Missing dependency injection
- ❌ String concatenation in SQL queries
- ❌ Logging without correlation IDs

### Best Practices

- ✅ Clean separation of concerns (4-layer architecture)
- ✅ Comprehensive error handling with specific exceptions
- ✅ Structured logging with correlation IDs
- ✅ High test coverage (unit, integration, E2E)
- ✅ Async/await with CancellationToken
- ✅ Repository pattern for data access
- ✅ DTOs for API contracts
- ✅ Security-first mindset (input validation, parameterised queries)

## React Frontend Patterns

### Feature-Based Structure

```
features/
  ├── auth/
  │   ├── components/
  │   ├── hooks/
  │   ├── context/
  │   └── types/
  ├── dashboard/
  ├── products/
  └── ...
```

### Component Patterns

- **Presentational Components**: UI-focused, reusable
- **Container Components**: Logic and data fetching
- **Custom Hooks**: Encapsulate business logic
- **Error Boundaries**: Catch errors at route level

### State Management

- **Server State**: React Query (caching, invalidation, synchronisation)
- **Global State**: Context API (auth, theme, user preferences)
- **Local State**: useState for component-specific state

### Performance Optimisations

- **Memoization**: useMemo for expensive calculations
- **Callback Stability**: useCallback to prevent child re-renders
- **Lazy Loading**: React.lazy() for code splitting
- **Component Memoization**: React.memo() for presentational components

### Data Fetching

- **React Query**: Declarative data fetching with automatic caching
- **Error Handling**: Query error states, retry logic
- **Loading States**: Distinguish between initial load and refetch
- **Optimistic Updates**: Update UI before server confirmation

### Anti-Patterns to Avoid

- ❌ Prop drilling (use Context instead)
- ❌ Inline function definitions (causes re-renders)
- ❌ Missing useEffect dependencies
- ❌ Missing cleanup in useEffect
- ❌ Unnecessary re-renders
- ❌ Missing error handling
- ❌ Direct mutation of state

### Best Practices

- ✅ Component composition and reusability
- ✅ Proper hook dependency arrays
- ✅ Cleanup functions in useEffect
- ✅ React Query for server state
- ✅ Context API for global state
- ✅ Error boundaries at route level
- ✅ Accessibility (a11y) considerations
- ✅ TypeScript strict typing

## PostgreSQL & Entity Framework Patterns

### Schema Design

- **Normalisation**: 3NF for most tables
- **Foreign Keys**: Enforced constraints
- **Indexes**: Strategic indexes on foreign keys and frequently queried columns
- **Audit Columns**: created_at, updated_at, deleted_at (soft deletes)

### Entity Framework Usage

- **Projection**: Map to DTOs in queries (avoid N+1)
- **Eager Loading**: Include() for related entities
- **Shadow Properties**: For audit metadata
- **Transactions**: For multi-entity operations
- **Migrations**: Version-controlled schema changes

### Query Optimisation

- **Avoid N+1**: Load related data in single query
- **Use Projections**: Select only needed columns
- **Batch Operations**: Bulk insert/update when appropriate
- **Index Analysis**: Monitor query performance

### Anti-Patterns

- ❌ Lazy loading in loops (N+1 queries)
- ❌ SELECT \* (unnecessary columns)
- ❌ Multiple queries when one would work
- ❌ Unbounded queries (missing LIMIT)
- ❌ Missing indexes on foreign keys

### Best Practices

- ✅ Eager loading in queries
- ✅ Projection to DTOs
- ✅ Transactions for consistency
- ✅ Migration strategy and versioning
- ✅ Performance monitoring
- ✅ Soft deletes for audit trails

## AWS & Pulumi Patterns

### Lambda Best Practices

- **Cold Start**: Optimise for startup time (bundle size, connection pooling)
- **Timeout**: Set appropriate timeout (max 15 minutes)
- **Memory**: Adjust memory allocation (affects CPU and cost)
- **Concurrency**: Set reserved concurrency for critical functions
- **Error Handling**: Retry logic with exponential backoff
- **Logging**: CloudWatch Logs with correlation IDs

### Pulumi IaC

- **Type Safety**: Leverage TypeScript for compile-time validation
- **Stacks**: dev, staging, prod environments
- **Configuration**: Environment-specific configs
- **Secrets**: Use Pulumi secrets for sensitive data
- **Outputs**: Export important resource IDs and endpoints

### AWS Services

- **API Gateway**: REST/HTTP APIs with proper authentication
- **RDS**: PostgreSQL with Multi-AZ in production
- **S3**: Versioning and encryption enabled
- **SQS/EventBridge**: Async communication between services
- **Secrets Manager**: For sensitive data (API keys, DB passwords)
- **CloudWatch**: Structured logs and metrics
- **X-Ray**: Distributed tracing

### Anti-Patterns

- ❌ Hardcoded credentials or secrets
- ❌ Overly permissive IAM policies
- ❌ Missing error handling in Lambda handlers
- ❌ Synchronous operations that should be async
- ❌ No retry/backoff for external service calls
- ❌ Missing VPC configuration for database access

### Best Practices

- ✅ IAM least privilege per Lambda
- ✅ Secrets in Secrets Manager
- ✅ Async communication via SQS/EventBridge
- ✅ Structured logging with correlation IDs
- ✅ X-Ray tracing enabled
- ✅ Multi-AZ databases in production
- ✅ Infrastructure as Code via Pulumi
- ✅ Environment-specific configurations

## Code Quality Standards

### What to Flag

- **CRITICAL**: Security vulnerabilities (SQL injection, hardcoded secrets, insecure auth)
- **HIGH**: Performance issues (N+1 queries, memory leaks, blocking async)
- **MEDIUM**: Code smells (missing error handling, weak typing, duplication)
- **LOW**: Style issues, naming conventions, minor optimisations

### What to Encourage

- Clean architecture (separation of concerns)
- Comprehensive error handling
- High test coverage (80%+)
- Structured logging with correlation IDs
- Type safety (TypeScript strict mode, C# nullable reference types)
- Documentation and comments for complex logic

## Integration with Code Reviews

When reviewing code, consider:

1. **Adherence to Patterns**: Does code follow Avayler architectural patterns?
2. **Technology Decisions**: Are appropriate technologies being used?
3. **Best Practices**: Does code follow team best practices?
4. **Anti-Patterns**: Are known anti-patterns being avoided?
5. **Performance**: Will this perform well at scale?
6. **Security**: Are security concerns addressed?
7. **Maintainability**: Will future developers understand this?
8. **Testing**: Is code testable and tested?

---

**Last Updated**: 2026-03-23  
**Used By**: technical-lead, csharp-reviewer, react-reviewer, aws-specialist, pulumi-specialist, postgresql-reviewer agents
