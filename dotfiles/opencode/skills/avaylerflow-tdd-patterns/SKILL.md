---
name: avaylerflow-tdd-patterns
description: Test-Driven Development workflow patterns, red-green-refactor cycles, testing strategies, and Avayler-specific testing best practices. Use when implementing features with tests or improving testability.
license: MIT
compatibility: opencode
metadata:
  audience: technical-agents
  domain: testing-tdd
  applies-to: [test-strategy, technical-lead]
---

## Skill: Test-Driven Development (TDD) Patterns

**Purpose**: Guide developers through test-driven development workflows with bundled best practices, reference materials, and Avayler-specific testing patterns.

**When to Use**: When implementing features with tests, refactoring with test coverage, or improving testability of existing code.

---

## TDD Workflow (Red-Green-Refactor)

### The Cycle

```
┌─────────────────────────────────────────────┐
│                                             │
│  1. RED: Write a failing test              │
│     - Test describes desired behaviour     │
│     - Test fails (implementation missing)  │
│                                             │
│  ↓                                          │
│                                             │
│  2. GREEN: Make the test pass              │
│     - Write minimal code to pass test      │
│     - Don't worry about perfect design     │
│                                             │
│  ↓                                          │
│                                             │
│  3. REFACTOR: Improve the code             │
│     - Tests still pass                     │
│     - Improve design, readability          │
│     - Extract patterns, remove duplication │
│                                             │
│  ↓                                          │
│                                             │
│  Repeat with next behaviour                │
│                                             │
└─────────────────────────────────────────────┘
```

### Key Principles

1. **Test Behaviour, Not Implementation**
   - Focus on what the code does, not how it does it
   - Tests should survive refactoring
   - Implementation details can change without breaking tests

2. **Start Simple, Add Complexity**
   - Begin with simplest test case
   - Add complexity incrementally
   - Each test adds one new behaviour

3. **Refactor Fearlessly**
   - Tests provide safety net
   - Improve design after tests pass
   - Extract patterns when you see duplication

4. **Keep Tests Fast**
   - Unit tests run in milliseconds
   - Integration tests run in seconds
   - Fast tests encourage frequent running

---

## Deep Modules vs Shallow Modules

### Philosophy (from "A Philosophy of Software Design" by John Ousterhout)

**Deep Module**: Simple interface, powerful implementation

- Small, focused public API
- Complex functionality hidden inside
- High ratio of functionality to interface complexity
- Easy to use, hard to misuse

**Shallow Module**: Complex interface, simple implementation

- Large, complicated public API
- Minimal functionality inside
- Low ratio of functionality to interface complexity
- Hard to use, easy to misuse

### Example: Deep Module

```csharp
// GOOD: Deep module - simple interface, powerful implementation
public interface IPaymentProcessor
{
    Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request);
}

// Implementation handles:
// - Payment gateway selection
// - Retry logic
// - Idempotency
// - Logging and monitoring
// - Error handling
// - Transaction management
```

### Example: Shallow Module

```csharp
// BAD: Shallow module - complex interface, simple implementation
public interface IPaymentProcessor
{
    Task<Gateway> SelectGatewayAsync(PaymentMethod method);
    Task<string> GenerateIdempotencyKeyAsync();
    Task<bool> ValidatePaymentAsync(PaymentRequest request);
    Task<PaymentResult> CallGatewayAsync(Gateway gateway, PaymentRequest request);
    Task LogPaymentAsync(PaymentResult result);
    Task<PaymentResult> HandleErrorAsync(Exception ex);
}

// Caller must orchestrate all steps - high cognitive load
```

### Designing for Testability

**Deep modules are easier to test** because:

1. Fewer methods to mock
2. Clearer boundaries
3. Tests focus on behaviour, not coordination
4. Less coupling between tests and implementation

**Shallow modules are harder to test** because:

1. Many dependencies to mock
2. Tests couple to implementation details
3. Complex setup code
4. Brittle tests that break during refactoring

---

## Integration Tests vs Unit Tests

### Unit Tests

**Purpose**: Test individual components in isolation

**Characteristics**:

- Fast (milliseconds)
- No external dependencies (databases, APIs, file systems)
- Use mocks/stubs for dependencies
- Test single class or method
- Run frequently during development

**When to Use**:

- Testing business logic
- Testing algorithms and calculations
- Testing validation rules
- Testing state transitions

**Example**:

```csharp
[Fact]
public void CalculateDiscount_AppliesStandardDiscount_ForRegularCustomers()
{
    // Arrange
    var calculator = new DiscountCalculator();
    var order = new Order { Subtotal = 100m, CustomerType = CustomerType.Regular };

    // Act
    var discount = calculator.CalculateDiscount(order);

    // Assert
    Assert.Equal(10m, discount); // 10% discount
}
```

### Integration Tests

**Purpose**: Test components working together with real dependencies

**Characteristics**:

- Slower (seconds)
- Use real dependencies (test databases, real services)
- Test multiple components together
- Verify system behaviour end-to-end
- Run before commit/merge

**When to Use**:

- Testing database operations
- Testing API endpoints
- Testing external service integration
- Testing complete workflows

**Example**:

```csharp
[Fact]
public async Task CreateOrder_SavesOrderToDatabase_AndPublishesEvent()
{
    // Arrange - using real test database
    using var context = new TestDbContext();
    var orderService = new OrderService(context, _messageBus);
    var request = new CreateOrderRequest { CustomerId = 1, Items = [...] };

    // Act
    var orderId = await orderService.CreateOrderAsync(request);

    // Assert
    var savedOrder = await context.Orders.FindAsync(orderId);
    Assert.NotNull(savedOrder);
    Assert.Equal(request.CustomerId, savedOrder.CustomerId);

    // Verify event published
    _messageBus.Verify(x => x.PublishAsync(It.IsAny<OrderCreatedEvent>()), Times.Once);
}
```

### Testing Pyramid

```
        ┌─────────────┐
        │     E2E     │  Few, slow, expensive
        │   (Manual)  │  Test critical user flows
        └─────────────┘
       ┌───────────────┐
       │  Integration  │  Some, moderate speed
       │     Tests     │  Test component interactions
       └───────────────┘
      ┌─────────────────┐
      │   Unit Tests    │  Many, fast, cheap
      │  (Test Logic)   │  Test business logic
      └─────────────────┘
```

**Avayler Recommendation**:

- 70% unit tests (fast, test business logic)
- 25% integration tests (test database, APIs)
- 5% E2E tests (critical user journeys)

---

## Mocking Patterns

### When to Mock

**Mock** external dependencies:

- Databases
- External APIs
- File systems
- Time/clock
- Random number generators
- Message queues

**Don't mock** internal domain logic:

- Business logic classes
- Value objects
- Domain entities
- Internal services (prefer real objects)

### Mocking Frameworks

**C# (.NET)**: Moq, NSubstitute
**TypeScript/JavaScript**: Jest, Vitest

### Example: Mocking with Moq (C#)

```csharp
[Fact]
public async Task CreateOrder_SendsConfirmationEmail()
{
    // Arrange
    var mockEmailService = new Mock<IEmailService>();
    var orderService = new OrderService(mockEmailService.Object);
    var order = new Order { CustomerId = 1, Email = "customer@example.com" };

    // Act
    await orderService.CreateOrderAsync(order);

    // Assert
    mockEmailService.Verify(
        x => x.SendEmailAsync(
            "customer@example.com",
            "Order Confirmation",
            It.IsAny<string>()
        ),
        Times.Once
    );
}
```

### Example: Mocking with Jest (TypeScript)

```typescript
describe("OrderService", () => {
  it("sends confirmation email when order created", async () => {
    // Arrange
    const mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue(true),
    };
    const orderService = new OrderService(mockEmailService);
    const order = { customerId: 1, email: "customer@example.com" };

    // Act
    await orderService.createOrder(order);

    // Assert
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      "customer@example.com",
      "Order Confirmation",
      expect.any(String),
    );
  });
});
```

---

## Test Organisation Patterns

### Arrange-Act-Assert (AAA)

**Structure**: Every test has three sections

```csharp
[Fact]
public void TestMethod()
{
    // Arrange - Set up test data and dependencies
    var sut = new SystemUnderTest();
    var input = new Input { Value = 42 };

    // Act - Execute the behaviour being tested
    var result = sut.DoSomething(input);

    // Assert - Verify the expected outcome
    Assert.Equal(expected, result);
}
```

### Given-When-Then (BDD Style)

**Structure**: Behaviour-focused test naming

```csharp
[Fact]
public void Given_NewCustomer_When_FirstPurchase_Then_AppliesWelcomeDiscount()
{
    // Given
    var customer = new Customer { IsNew = true };
    var calculator = new DiscountCalculator();

    // When
    var discount = calculator.CalculateDiscount(customer);

    // Then
    Assert.Equal(0.15m, discount); // 15% welcome discount
}
```

### Test Class Organisation

**Pattern**: One test class per production class

```
src/
  Domain/
    OrderService.cs
    PaymentProcessor.cs
tests/
  Domain/
    OrderServiceTests.cs
    PaymentProcessorTests.cs
```

**Naming**: `{ClassUnderTest}Tests`

---

## Avayler-Specific Testing Patterns

### Database Testing (Entity Framework Core)

**Use in-memory database for fast tests**:

```csharp
public class TestDbContext : ApplicationDbContext
{
    public TestDbContext() : base(CreateInMemoryOptions())
    {
    }

    private static DbContextOptions<ApplicationDbContext> CreateInMemoryOptions()
    {
        return new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }
}
```

**Use real database for integration tests**:

```csharp
public class IntegrationTestFixture : IAsyncLifetime
{
    public ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(_connectionString)
            .Options;

        return new ApplicationDbContext(options);
    }

    public async Task InitializeAsync()
    {
        // Run migrations, seed test data
        await using var context = CreateDbContext();
        await context.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        // Clean up test database
    }
}
```

### API Testing (ASP.NET Core)

**Use WebApplicationFactory for integration tests**:

```csharp
public class OrdersApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public OrdersApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateOrder_ReturnsCreated()
    {
        // Arrange
        var request = new CreateOrderRequest { CustomerId = 1, Items = [...] };

        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var order = await response.Content.ReadFromJsonAsync<Order>();
        Assert.NotNull(order);
    }
}
```

### React Component Testing (Vitest + Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrderForm } from './OrderForm';

describe('OrderForm', () => {
  it('submits order when form is valid', async () => {
    // Arrange
    const onSubmit = vi.fn();
    render(<OrderForm onSubmit={onSubmit} />);

    // Act
    fireEvent.change(screen.getByLabelText('Customer Name'), {
      target: { value: 'John Doe' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    // Assert
    expect(onSubmit).toHaveBeenCalledWith({
      customerName: 'John Doe'
    });
  });
});
```

---

## Test Data Builders

**Pattern**: Fluent builders for test data creation

```csharp
public class OrderBuilder
{
    private int _customerId = 1;
    private List<OrderItem> _items = new();
    private OrderStatus _status = OrderStatus.Pending;

    public OrderBuilder WithCustomerId(int customerId)
    {
        _customerId = customerId;
        return this;
    }

    public OrderBuilder WithItem(string productId, int quantity)
    {
        _items.Add(new OrderItem { ProductId = productId, Quantity = quantity });
        return this;
    }

    public OrderBuilder WithStatus(OrderStatus status)
    {
        _status = status;
        return this;
    }

    public Order Build()
    {
        return new Order
        {
            CustomerId = _customerId,
            Items = _items,
            Status = _status
        };
    }
}

// Usage in tests
[Fact]
public void Test()
{
    var order = new OrderBuilder()
        .WithCustomerId(42)
        .WithItem("PROD-001", 2)
        .WithStatus(OrderStatus.Confirmed)
        .Build();

    // Test with order
}
```

---

## Common Testing Pitfalls

### ❌ Testing Implementation Details

```csharp
// BAD: Test couples to private method names
[Fact]
public void Test()
{
    var service = new OrderService();

    // Testing private method via reflection - brittle!
    var method = typeof(OrderService).GetMethod("CalculateTotal", BindingFlags.NonPublic);
    var result = method.Invoke(service, new object[] { order });

    Assert.Equal(100m, result);
}
```

```csharp
// GOOD: Test public behaviour
[Fact]
public void CreateOrder_CalculatesTotalCorrectly()
{
    var service = new OrderService();
    var order = new OrderBuilder()
        .WithItem("PROD-001", 2) // £10 each
        .Build();

    var result = service.CreateOrder(order);

    Assert.Equal(20m, result.Total);
}
```

### ❌ Fragile Assertions

```csharp
// BAD: Test breaks if order of properties changes
Assert.Equal("Order{Id=1, CustomerId=42, Total=100}", order.ToString());
```

```csharp
// GOOD: Assert on specific properties
Assert.Equal(1, order.Id);
Assert.Equal(42, order.CustomerId);
Assert.Equal(100m, order.Total);
```

### ❌ Test Interdependence

```csharp
// BAD: Tests depend on execution order
private static Order _sharedOrder;

[Fact]
public void Test1_CreateOrder()
{
    _sharedOrder = service.CreateOrder(...);
}

[Fact]
public void Test2_UpdateOrder()
{
    service.UpdateOrder(_sharedOrder); // Depends on Test1 running first!
}
```

```csharp
// GOOD: Each test is independent
[Fact]
public void Test1_CreateOrder()
{
    var order = service.CreateOrder(...);
    Assert.NotNull(order);
}

[Fact]
public void Test2_UpdateOrder()
{
    var order = service.CreateOrder(...); // Create own test data
    service.UpdateOrder(order);
    Assert.Equal(OrderStatus.Updated, order.Status);
}
```

---

## Resources

### Books

- **"Test Driven Development: By Example"** - Kent Beck
- **"A Philosophy of Software Design"** - John Ousterhout (deep modules)
- **"Growing Object-Oriented Software, Guided by Tests"** - Freeman & Pryce

### Avayler Standards

- See `skills/csharp-patterns/` for C# testing patterns
- See `skills/react-patterns/` for React testing patterns
- See `skills/postgresql-patterns/` for database testing

### Testing Frameworks

- **C#**: xUnit, NUnit, MSTest, Moq, NSubstitute
- **JavaScript/TypeScript**: Jest, Vitest, Testing Library
- **Integration**: WebApplicationFactory, Testcontainers

---

## Quick Reference: TDD Checklist

When implementing with TDD, follow this checklist:

- [ ] **Start with test** - Write failing test first (RED)
- [ ] **Test behaviour** - Focus on what, not how
- [ ] **Minimal implementation** - Make test pass quickly (GREEN)
- [ ] **Refactor** - Improve design whilst tests pass
- [ ] **Independent tests** - Each test runs in isolation
- [ ] **Fast tests** - Unit tests run in milliseconds
- [ ] **Clear names** - Test names describe behaviour
- [ ] **AAA structure** - Arrange, Act, Assert
- [ ] **No implementation coupling** - Tests survive refactoring
- [ ] **Test data builders** - Use builders for complex setup

---

## Integration with AvaylerFlow

This skill is automatically referenced by `/flow-implement` when:

- User requests test implementation
- Story includes testing requirements
- Code changes require test coverage

**Usage**: "Please implement US001 with TDD approach"

The agent will follow red-green-refactor cycle and apply patterns from this skill.
