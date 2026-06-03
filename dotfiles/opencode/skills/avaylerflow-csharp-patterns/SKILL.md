---
name: avaylerflow-csharp-patterns
description: Deep C# and .NET patterns, best practices, and anti-patterns for async/await, LINQ, Entity Framework, dependency injection, error handling, and security. Use when reviewing C# code.
license: MIT
compatibility: opencode
metadata:
  audience: technical-agents
  domain: csharp-dotnet
  applies-to: [csharp-reviewer, technical-lead, postgresql-reviewer]
---

## What I do

Provide comprehensive C# and .NET patterns, anti-patterns, and best practices for code review, focusing on async/await, LINQ, Entity Framework Core, dependency injection, error handling, security, and performance optimization.

## When to use me

**Load this skill when:**
- Reviewing C# or .NET code
- Assessing async/await patterns
- Checking LINQ or Entity Framework usage
- Validating dependency injection configuration
- Reviewing exception handling
- Checking security vulnerabilities in C# code
- Assessing Lambda/serverless C# implementations

**All C# code review agents should load this skill.**

## C# Language & Conventions

### Naming Conventions

**Follow Microsoft C# Coding Conventions:**

```csharp
// Class names: PascalCase
public class OrderService { }

// Interface names: I + PascalCase
public interface IOrderRepository { }

// Method names: PascalCase
public async Task<Order> GetOrderAsync(int orderId) { }

// Parameter names: camelCase
public void ProcessOrder(int orderId, string customerName) { }

// Private fields: _camelCase (with underscore prefix)
private readonly ILogger<OrderService> _logger;

// Constants: PascalCase
public const int MaxRetryAttempts = 3;

// Local variables: camelCase
var orderTotal = CalculateTotal();
```

**Database naming** (PostgreSQL):
- Tables and columns: `snake_case`
- Entity properties: `PascalCase`
- EF Core handles mapping automatically

---

## Async/Await Patterns

### Core Principles

1. **Async all the way**: Once async, always async throughout the call chain
2. **Never block**: Never use `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()`
3. **Pass CancellationToken**: Accept and propagate `CancellationToken` in all async methods
4. **Return Task, not void**: Only use `async void` for event handlers

### Correct Async Patterns

```csharp
// ✅ GOOD: Proper async method signature
public async Task<Order> GetOrderAsync(int orderId, CancellationToken cancellationToken)
{
    // Propagate cancellation token
    var order = await _dbContext.Orders
        .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
    
    if (order == null)
        throw new NotFoundException($"Order {orderId} not found");
    
    return order;
}

// ✅ GOOD: Async all the way up the call chain
public async Task<OrderDto> ProcessOrderAsync(int orderId, CancellationToken cancellationToken)
{
    var order = await GetOrderAsync(orderId, cancellationToken);
    var customer = await _customerService.GetCustomerAsync(order.CustomerId, cancellationToken);
    
    return MapToDto(order, customer);
}

// ✅ GOOD: ConfigureAwait(false) in library code (not needed in Lambda/ASP.NET)
public async Task<string> LibraryMethodAsync()
{
    var result = await _httpClient.GetStringAsync(url).ConfigureAwait(false);
    return result;
}

// ✅ GOOD: Async void only for event handlers
private async void OnButtonClick(object sender, EventArgs e)
{
    try
    {
        await ProcessAsync();
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error processing button click");
    }
}
```

### Async Anti-Patterns

```csharp
// ❌ BAD: Blocking on async code
public Order GetOrder(int orderId)
{
    // NEVER DO THIS - causes deadlocks
    return GetOrderAsync(orderId, CancellationToken.None).Result;
}

// ❌ BAD: Using .Wait()
public void ProcessOrder(int orderId)
{
    // NEVER DO THIS - causes deadlocks
    ProcessOrderAsync(orderId, CancellationToken.None).Wait();
}

// ❌ BAD: Async void (except for event handlers)
public async void SaveOrderAsync(Order order)  // Returns void - bad!
{
    await _repository.SaveAsync(order);
}

// ❌ BAD: Not propagating CancellationToken
public async Task<Order> GetOrderAsync(int orderId, CancellationToken cancellationToken)
{
    // Missing cancellationToken parameter in call
    var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
    return order;
}

// ❌ BAD: Fire and forget (unhandled exceptions)
public void StartBackgroundWork()
{
    Task.Run(async () => await DoWorkAsync());  // Exception will be swallowed
}

// ✅ GOOD: Proper fire and forget with exception handling
public void StartBackgroundWork()
{
    _ = Task.Run(async () => 
    {
        try 
        {
            await DoWorkAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Background work failed");
        }
    });
}
```

### CancellationToken Guidelines

```csharp
// ✅ GOOD: Accept and propagate CancellationToken
public async Task<List<Order>> GetOrdersAsync(
    int customerId, 
    CancellationToken cancellationToken = default)
{
    // Pass to all async calls
    var orders = await _dbContext.Orders
        .Where(o => o.CustomerId == customerId)
        .ToListAsync(cancellationToken);
    
    foreach (var order in orders)
    {
        // Pass through call chain
        await EnrichOrderAsync(order, cancellationToken);
    }
    
    return orders;
}

// ✅ GOOD: Check cancellation before expensive operations
public async Task ProcessLargeDatasetAsync(CancellationToken cancellationToken)
{
    foreach (var item in largeDataset)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await ProcessItemAsync(item, cancellationToken);
    }
}
```

---

## LINQ Patterns

### Efficient LINQ

```csharp
// ✅ GOOD: Filter before materializing
var activeOrders = await _dbContext.Orders
    .Where(o => o.Status == OrderStatus.Active)
    .Where(o => o.CreatedDate >= cutoffDate)
    .ToListAsync(cancellationToken);

// ❌ BAD: Materializing before filter (loads all orders into memory!)
var activeOrders = (await _dbContext.Orders.ToListAsync(cancellationToken))
    .Where(o => o.Status == OrderStatus.Active)
    .ToList();

// ✅ GOOD: Use Any() instead of Count() > 0
if (await _dbContext.Orders.AnyAsync(o => o.CustomerId == customerId, cancellationToken))
{
    // More efficient - stops after first match
}

// ❌ BAD: Using Count() when you only need to check existence
if (await _dbContext.Orders.CountAsync(o => o.CustomerId == customerId, cancellationToken) > 0)
{
    // Inefficient - counts all matching records
}

// ✅ GOOD: Select only needed properties
var orderSummaries = await _dbContext.Orders
    .Where(o => o.Status == OrderStatus.Pending)
    .Select(o => new OrderSummary 
    { 
        Id = o.Id, 
        Total = o.Total,
        CustomerName = o.Customer.Name
    })
    .ToListAsync(cancellationToken);

// ❌ BAD: Loading full entities when only some properties needed
var orders = await _dbContext.Orders
    .Include(o => o.Customer)
    .Where(o => o.Status == OrderStatus.Pending)
    .ToListAsync(cancellationToken);
var summaries = orders.Select(o => new OrderSummary { ... }).ToList();
```

### LINQ Anti-Patterns

```csharp
// ❌ BAD: Multiple enumeration
var orders = _dbContext.Orders.Where(o => o.CustomerId == customerId);
var count = orders.Count();  // First enumeration
var list = orders.ToList();  // Second enumeration - queries DB again!

// ✅ GOOD: Single enumeration
var orders = await _dbContext.Orders
    .Where(o => o.CustomerId == customerId)
    .ToListAsync(cancellationToken);
var count = orders.Count;  // In-memory count

// ❌ BAD: Premature materialization
var orders = _dbContext.Orders.ToList()  // Loads ALL orders!
    .Where(o => o.Total > 100)
    .OrderBy(o => o.CreatedDate);

// ✅ GOOD: Compose query before materialization
var orders = await _dbContext.Orders
    .Where(o => o.Total > 100)
    .OrderBy(o => o.CreatedDate)
    .ToListAsync(cancellationToken);
```

---

## Entity Framework Core Patterns

### N+1 Query Problems

**The Problem**: Loading related entities in a loop causes N+1 database queries, OR forgetting to include navigation properties results in null references.

```csharp
// ❌ BAD: Missing .Include() - navigation property will be NULL!
var orders = await _dbContext.Orders
    .Where(o => o.Status == OrderStatus.Active)
    .ToListAsync(cancellationToken);

foreach (var order in orders)
{
    // 💥 NullReferenceException! order.Customer is NULL because we didn't Include it
    Console.WriteLine($"{order.Id}: {order.Customer.Name}");
}

// ❌ BAD: N+1 query problem (1 query for orders + N queries for customers)
var orders = await _dbContext.Orders.ToListAsync(cancellationToken);
foreach (var order in orders)
{
    // This executes a separate query for EACH order!
    // If you have 100 orders, this is 101 total queries (1 + 100)
    var customer = await _dbContext.Customers
        .FirstOrDefaultAsync(c => c.Id == order.CustomerId, cancellationToken);
    Console.WriteLine($"{order.Id}: {customer.Name}");
}

// ✅ GOOD: Eager loading with Include (single query with JOIN)
var orders = await _dbContext.Orders
    .Include(o => o.Customer)  // ✅ Loads Customer in the same query
    .ToListAsync(cancellationToken);

foreach (var order in orders)
{
    // ✅ order.Customer is populated, no null reference
    Console.WriteLine($"{order.Id}: {order.Customer.Name}");
}

// ✅ GOOD: Multiple navigation properties with multiple Include
var orders = await _dbContext.Orders
    .Include(o => o.Customer)      // Load Customer
    .Include(o => o.OrderItems)    // Load OrderItems collection
    .ToListAsync(cancellationToken);

// Now you can safely access both Customer and OrderItems
foreach (var order in orders)
{
    Console.WriteLine($"Order {order.Id} for {order.Customer.Name}");
    Console.WriteLine($"  Items: {order.OrderItems.Count}");
}

// ✅ GOOD: Multiple levels with ThenInclude (nested navigation properties)
var orders = await _dbContext.Orders
    .Include(o => o.Customer)
        .ThenInclude(c => c.Address)       // Customer.Address
    .Include(o => o.OrderItems)
        .ThenInclude(i => i.Product)       // OrderItem.Product
    .ToListAsync(cancellationToken);

// All nested properties are loaded in a single query
foreach (var order in orders)
{
    Console.WriteLine($"Customer: {order.Customer.Name}, {order.Customer.Address.City}");
    foreach (var item in order.OrderItems)
    {
        Console.WriteLine($"  - {item.Product.Name}");
    }
}

// ✅ GOOD: Projection when you don't need full entities (best performance)
var orderData = await _dbContext.Orders
    .Select(o => new
    {
        OrderId = o.Id,
        CustomerName = o.Customer.Name,      // ✅ No .Include needed with Select
        ItemCount = o.OrderItems.Count,      // ✅ EF translates to SQL COUNT
        TotalValue = o.OrderItems.Sum(i => i.Price * i.Quantity)
    })
    .ToListAsync(cancellationToken);
```

**Key Points**:
- **Without `.Include()`**: Navigation properties are `null` by default (lazy loading is disabled by default in EF Core)
- **With `.Include()`**: EF Core generates a JOIN and populates the navigation property
- **`.Select()` projection**: You can access navigation properties without `.Include()` because EF translates the entire query to SQL
- **N+1 queries**: Avoid loading related entities in loops - use `.Include()` to load them upfront

### AsNoTracking for Read-Only Queries

```csharp
// ✅ GOOD: Use AsNoTracking for read-only queries (better performance)
public async Task<List<OrderDto>> GetOrdersForDisplayAsync(CancellationToken cancellationToken)
{
    var orders = await _dbContext.Orders
        .AsNoTracking()  // Don't track changes - faster
        .Include(o => o.Customer)
        .Where(o => o.Status == OrderStatus.Active)
        .ToListAsync(cancellationToken);
    
    return _mapper.Map<List<OrderDto>>(orders);
}

// ❌ BAD: Tracking entities you never update (wastes memory)
public async Task<List<OrderDto>> GetOrdersForDisplayAsync(CancellationToken cancellationToken)
{
    var orders = await _dbContext.Orders  // Tracking enabled by default
        .Include(o => o.Customer)
        .Where(o => o.Status == OrderStatus.Active)
        .ToListAsync(cancellationToken);
    
    return _mapper.Map<List<OrderDto>>(orders);
}

// ✅ GOOD: Tracking when you need to update
public async Task UpdateOrderStatusAsync(int orderId, OrderStatus newStatus, CancellationToken cancellationToken)
{
    var order = await _dbContext.Orders  // Tracking enabled - we'll update this
        .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
    
    if (order == null)
        throw new NotFoundException($"Order {orderId} not found");
    
    order.Status = newStatus;
    order.UpdatedDate = DateTime.UtcNow;
    
    await _dbContext.SaveChangesAsync(cancellationToken);
}
```

### DbContext Best Practices

```csharp
// ✅ GOOD: Scoped DbContext lifetime (in Lambda)
services.AddDbContext<ApplicationDbContext>(options => 
    options.UseNpgsql(connectionString),
    ServiceLifetime.Scoped);  // Scoped in Lambda, one per request

// ✅ GOOD: Batch updates with single SaveChanges
public async Task UpdateOrdersAsync(List<int> orderIds, CancellationToken cancellationToken)
{
    var orders = await _dbContext.Orders
        .Where(o => orderIds.Contains(o.Id))
        .ToListAsync(cancellationToken);
    
    foreach (var order in orders)
    {
        order.Status = OrderStatus.Processed;
        order.ProcessedDate = DateTime.UtcNow;
    }
    
    await _dbContext.SaveChangesAsync(cancellationToken);  // One transaction
}

// ❌ BAD: SaveChanges in loop (N database round-trips)
public async Task UpdateOrdersAsync(List<int> orderIds, CancellationToken cancellationToken)
{
    foreach (var orderId in orderIds)
    {
        var order = await _dbContext.Orders.FindAsync(orderId);
        order.Status = OrderStatus.Processed;
        await _dbContext.SaveChangesAsync(cancellationToken);  // DON'T DO THIS
    }
}
```

---

## Dependency Injection Patterns

> **Note**: The examples below use `IOrderRepository` for illustration purposes only. In practice, you can inject `ApplicationDbContext` directly into your services - DbContext already implements the Repository and Unit of Work patterns. Adding a repository abstraction layer is optional and only needed when you have specific requirements (multiple data sources, complex domain isolation, etc.). See [Database Access Patterns](#database-access-patterns) section.

### Service Lifetimes (AWS Lambda Context)

```csharp
// ✅ GOOD: Scoped for services and repositories in Lambda
public void ConfigureServices(IServiceCollection services)
{
    // Scoped - one instance per Lambda invocation
    services.AddScoped<IOrderService, OrderService>();
    services.AddScoped<IOrderRepository, OrderRepository>();
    services.AddDbContext<ApplicationDbContext>(ServiceLifetime.Scoped);
    
    // Singleton - shared across all invocations (stateless only!)
    services.AddSingleton<IConfiguration>(configuration);
    services.AddSingleton<IMapper>(mapper);
    
    // Transient - new instance every time (rarely needed)
    services.AddTransient<IEmailGenerator, EmailGenerator>();
}

// ❌ BAD: Singleton for stateful services
services.AddSingleton<IOrderService, OrderService>();  // Will cause issues!
services.AddSingleton<ApplicationDbContext>();  // NEVER do this!

// ❌ BAD: Transient for DbContext or repositories
services.AddTransient<ApplicationDbContext>();  // Wasteful, can cause issues
services.AddTransient<IOrderRepository, OrderRepository>();  // Too many instances
```

### Constructor Injection

```csharp
// ✅ GOOD: Constructor injection with readonly fields
public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICustomerService _customerService;
    private readonly ILogger<OrderService> _logger;
    
    public OrderService(
        IOrderRepository orderRepository,
        ICustomerService customerService,
        ILogger<OrderService> logger)
    {
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _customerService = customerService ?? throw new ArgumentNullException(nameof(customerService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
}

// ❌ BAD: Property injection (makes dependencies non-obvious)
public class OrderService : IOrderService
{
    public IOrderRepository OrderRepository { get; set; }  // Avoid
    public ILogger<OrderService> Logger { get; set; }  // Avoid
}

// ❌ BAD: Service locator anti-pattern
public class OrderService : IOrderService
{
    public void ProcessOrder(int orderId)
    {
        var repository = ServiceLocator.GetService<IOrderRepository>();  // AVOID
    }
}
```

### Avoiding Circular Dependencies

```csharp
// ❌ BAD: Circular dependency
public class OrderService
{
    private readonly ICustomerService _customerService;
    public OrderService(ICustomerService customerService) { ... }
}

public class CustomerService
{
    private readonly IOrderService _orderService;  // Circular!
    public CustomerService(IOrderService orderService) { ... }
}

// ✅ GOOD: Extract common dependency or use events
public interface IOrderEventPublisher
{
    Task PublishOrderCreatedAsync(Order order);
}

public class OrderService
{
    private readonly IOrderEventPublisher _eventPublisher;
    public OrderService(IOrderEventPublisher eventPublisher) { ... }
}

public class CustomerService
{
    // Subscribe to events instead of direct dependency
    public async Task HandleOrderCreatedAsync(Order order) { ... }
}
```

---

## Exception Handling Patterns

### Exception Hierarchy (Avayler-Specific)

```csharp
// ✅ GOOD: Use Avayler exception hierarchy
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

public class ValidationException : Exception
{
    public Dictionary<string, string[]> Errors { get; }
    public ValidationException(Dictionary<string, string[]> errors) 
        : base("One or more validation errors occurred")
    {
        Errors = errors;
    }
}

public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message) { }
}

// Map to HTTP status codes
// NotFoundException → 404
// ValidationException → 400
// BusinessRuleException → 422
// Other exceptions → 500
```

### Exception Handling Best Practices

```csharp
// ✅ GOOD: Catch specific exceptions
public async Task<Order> GetOrderAsync(int orderId, CancellationToken cancellationToken)
{
    try
    {
        var order = await _repository.GetByIdAsync(orderId, cancellationToken);
        
        if (order == null)
            throw new NotFoundException($"Order {orderId} not found");
        
        return order;
    }
    catch (DbUpdateException ex)
    {
        _logger.LogError(ex, "Database error retrieving order {OrderId}", orderId);
        throw new ApplicationException("Error retrieving order from database", ex);
    }
}

// ❌ BAD: Catch-all with no action
try
{
    await ProcessOrderAsync(orderId);
}
catch (Exception)
{
    // Swallowed exception - bad!
}

// ❌ BAD: Bare catch-all
try
{
    await ProcessOrderAsync(orderId);
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error processing order");
    throw;  // Why catch if just rethrowing?
}

// ✅ GOOD: Catch specific, add context, rethrow
try
{
    await _paymentGateway.ChargeAsync(amount);
}
catch (PaymentException ex)
{
    _logger.LogWarning(ex, "Payment failed for order {OrderId}", orderId);
    throw new BusinessRuleException($"Payment failed: {ex.Message}", ex);
}
```

### Structured Logging with Correlation

```csharp
// ✅ GOOD: Structured logging with correlation ID
public async Task<Order> ProcessOrderAsync(int orderId, CancellationToken cancellationToken)
{
    using (_logger.BeginScope(new Dictionary<string, object>
    {
        ["OrderId"] = orderId,
        ["CorrelationId"] = Guid.NewGuid()
    }))
    {
        _logger.LogInformation("Processing order {OrderId}", orderId);
        
        try
        {
            var order = await _repository.GetByIdAsync(orderId, cancellationToken);
            
            _logger.LogInformation("Order {OrderId} retrieved successfully", orderId);
            
            // Process order...
            
            return order;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing order {OrderId}", orderId);
            throw;
        }
    }
}

// ❌ BAD: String interpolation in logs (not structured)
_logger.LogInformation($"Processing order {orderId}");  // Don't do this

// ✅ GOOD: Structured parameters
_logger.LogInformation("Processing order {OrderId}", orderId);
```

---

## Security Patterns

### SQL Injection Prevention

```csharp
// ✅ GOOD: Parameterized queries (EF Core does this automatically)
var orders = await _dbContext.Orders
    .Where(o => o.CustomerId == customerId)  // Safe - parameterized
    .ToListAsync(cancellationToken);

// ✅ GOOD: Explicit parameters in raw SQL
var orders = await _dbContext.Orders
    .FromSqlRaw("SELECT * FROM orders WHERE customer_id = {0}", customerId)
    .ToListAsync(cancellationToken);

// ❌ CRITICAL: SQL injection vulnerability!
var orders = await _dbContext.Orders
    .FromSqlRaw($"SELECT * FROM orders WHERE customer_id = {customerId}")  // VULNERABLE!
    .ToListAsync(cancellationToken);
```

### Input Validation

```csharp
// ✅ GOOD: Validate all inputs
public async Task<Order> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken)
{
    if (request == null)
        throw new ArgumentNullException(nameof(request));
    
    if (request.CustomerId <= 0)
        throw new ValidationException(new Dictionary<string, string[]>
        {
            [nameof(request.CustomerId)] = new[] { "Customer ID must be greater than 0" }
        });
    
    if (string.IsNullOrWhiteSpace(request.Notes))
        request.Notes = string.Empty;  // Sanitize
    
    // Process...
}

// ❌ BAD: No validation
public async Task<Order> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken)
{
    // Directly using request without validation
    var order = new Order { CustomerId = request.CustomerId };
}
```

### Sensitive Data Protection

```csharp
// ✅ GOOD: Don't log sensitive data
_logger.LogInformation("User {UserId} logged in", userId);

// ❌ BAD: Logging sensitive information
_logger.LogInformation("User logged in with password {Password}", password);  // NEVER!

// ✅ GOOD: Mask sensitive data in responses
public class CustomerDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    
    [JsonIgnore]  // Don't serialize sensitive fields
    public string PasswordHash { get; set; }
}
```

---

## Resource Management & Disposal

### IDisposable Pattern

```csharp
// ✅ GOOD: Implement IDisposable correctly
public class OrderProcessor : IDisposable
{
    private readonly HttpClient _httpClient;
    private bool _disposed;
    
    public OrderProcessor(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
    
    protected virtual void Dispose(bool disposing)
    {
        if (_disposed)
            return;
        
        if (disposing)
        {
            // Dispose managed resources
            _httpClient?.Dispose();
        }
        
        _disposed = true;
    }
}

// ✅ GOOD: Use using statements
public async Task ProcessOrderAsync(int orderId)
{
    using var stream = new FileStream("orders.dat", FileMode.Open);
    // Stream automatically disposed
}

// ❌ BAD: Forgetting to dispose
public async Task ProcessOrderAsync(int orderId)
{
    var stream = new FileStream("orders.dat", FileMode.Open);
    // Stream never disposed - resource leak!
}
```

### HttpClient Usage

```csharp
// ✅ GOOD: Reuse HttpClient (singleton or IHttpClientFactory)
public class OrderService
{
    private static readonly HttpClient _httpClient = new HttpClient();
    
    public async Task<string> FetchDataAsync()
    {
        return await _httpClient.GetStringAsync("https://api.example.com/data");
    }
}

// ❌ BAD: Creating new HttpClient instances (socket exhaustion!)
public async Task<string> FetchDataAsync()
{
    using var client = new HttpClient();  // DON'T DO THIS
    return await client.GetStringAsync("https://api.example.com/data");
}

// ✅ BEST: Use IHttpClientFactory
public class OrderService
{
    private readonly IHttpClientFactory _httpClientFactory;
    
    public OrderService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }
    
    public async Task<string> FetchDataAsync()
    {
        var client = _httpClientFactory.CreateClient();
        return await client.GetStringAsync("https://api.example.com/data");
    }
}
```

---

## Testing Patterns

> **Note**: The examples below mock `IOrderRepository` for illustration. When injecting `DbContext` directly into services, use an in-memory database (EF Core InMemory provider) for integration tests, or mock `DbContext` using `DbSet<T>` mocks for unit tests.

### Unit Testing Best Practices

```csharp
// ✅ GOOD: Arrange-Act-Assert pattern with Moq
[Fact]
public async Task GetOrderAsync_WhenOrderExists_ReturnsOrder()
{
    // Arrange
    var orderId = 123;
    var expectedOrder = new Order { Id = orderId, Total = 100 };
    
    var mockRepository = new Mock<IOrderRepository>();
    mockRepository
        .Setup(r => r.GetByIdAsync(orderId, It.IsAny<CancellationToken>()))
        .ReturnsAsync(expectedOrder);
    
    var service = new OrderService(mockRepository.Object);
    
    // Act
    var result = await service.GetOrderAsync(orderId, CancellationToken.None);
    
    // Assert
    Assert.NotNull(result);
    Assert.Equal(orderId, result.Id);
    Assert.Equal(100, result.Total);
    
    mockRepository.Verify(r => r.GetByIdAsync(orderId, It.IsAny<CancellationToken>()), Times.Once);
}

// ✅ GOOD: Test exception scenarios
[Fact]
public async Task GetOrderAsync_WhenOrderNotFound_ThrowsNotFoundException()
{
    // Arrange
    var orderId = 999;
    var mockRepository = new Mock<IOrderRepository>();
    mockRepository
        .Setup(r => r.GetByIdAsync(orderId, It.IsAny<CancellationToken>()))
        .ReturnsAsync((Order)null);
    
    var service = new OrderService(mockRepository.Object);
    
    // Act & Assert
    await Assert.ThrowsAsync<NotFoundException>(() => 
        service.GetOrderAsync(orderId, CancellationToken.None));
}
```

---

## Integration for AI Agents

### For C# Reviewers

Load this skill to:
- Identify async/await anti-patterns
- Detect N+1 query problems
- Validate dependency injection configuration
- Check exception handling
- Review security vulnerabilities
- Assess resource management

Use alongside: **avayler-context-technical**, **code-review-patterns**

### For Technical Leads

Load this skill to:
- Guide architecture decisions for C# services
- Review C# patterns in PRs
- Establish C# coding standards
- Mentor developers on C# best practices

Use alongside: **avayler-context-technical**, **code-review-patterns**

### For Database Agents

Load this skill to:
- Review Entity Framework patterns
- Identify N+1 queries
- Validate query performance
- Check DbContext usage

Use alongside: **postgresql-patterns** (when available)

---

## Quick Reference Checklist

Before approving C# code:

- [ ] **Async**: No `.Result`, `.Wait()`, or `async void` (except event handlers)
- [ ] **CancellationToken**: Accepted and propagated throughout call chain
- [ ] **LINQ**: No N+1 queries, proper `Include`/`ThenInclude`, `AsNoTracking` for reads
- [ ] **DI**: Scoped lifetime for services/repositories, constructor injection
- [ ] **Exceptions**: Catch specific types, use Avayler hierarchy, structured logging
- [ ] **Security**: Parameterized queries, input validation, no sensitive data in logs
- [ ] **Resources**: IDisposable implemented, using statements, HttpClient reused
- [ ] **Testing**: Testable design, proper mocking, AAA pattern

---

## Summary

This skill provides comprehensive C# and .NET patterns for:
- Async/await correctness and performance
- LINQ efficiency and readability
- Entity Framework query optimization and N+1 prevention
- Dependency injection best practices
- Exception handling and structured logging
- Security vulnerability prevention
- Resource management and disposal
- Testing patterns and practices

**Remember**: These patterns are grounded in real-world Avayler microservices architecture and AWS Lambda context.
