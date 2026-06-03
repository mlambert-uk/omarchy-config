---
name: avaylerflow-postgresql-patterns
description: PostgreSQL schema design, query optimization, indexing strategies, Entity Framework Core integration, and performance tuning best practices. Use when reviewing database code or schema.
license: MIT
compatibility: opencode
metadata:
  audience: technical-agents
  domain: postgresql-database
  applies-to: [postgresql-reviewer, csharp-reviewer, technical-lead]
---

## What I do

Provide comprehensive PostgreSQL patterns, query optimization strategies, schema design best practices, indexing guidance, Entity Framework Core integration, and performance tuning techniques.

## When to use me

**Load this skill when:**
- Reviewing database schemas or migrations
- Optimizing SQL queries or analyzing EXPLAIN plans
- Designing indexing strategies
- Reviewing Entity Framework Core data access patterns
- Assessing database performance
- Checking for N+1 query problems
- Validating data integrity and constraints

**All database and data access review agents should load this skill.**

## Schema Design Patterns

### Naming Conventions

```sql
-- ✅ GOOD: snake_case for PostgreSQL
CREATE TABLE customer_orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ❌ BAD: PascalCase (not PostgreSQL convention)
CREATE TABLE CustomerOrders (
    Id SERIAL PRIMARY KEY,
    CustomerId INTEGER NOT NULL,
    OrderDate TIMESTAMP NOT NULL
);

-- ✅ GOOD: Plural table names
CREATE TABLE customers (...);
CREATE TABLE orders (...);

-- ❌ BAD: Singular table names (inconsistent with Rails/EF conventions)
CREATE TABLE customer (...);
CREATE TABLE order (...);
```

### Data Types

```sql
-- ✅ GOOD: Appropriate data types
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,  -- Fixed length for names
    description TEXT,  -- Unlimited text
    price DECIMAL(10,2) NOT NULL,  -- Precise for money
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),  -- Always use WITH TIME ZONE
    metadata JSONB  -- JSONB for queryable JSON
);

-- ❌ BAD: Inappropriate data types
CREATE TABLE products (
    id INTEGER PRIMARY KEY,  -- Should be SERIAL for auto-increment
    name TEXT,  -- Wasteful for short names
    price FLOAT,  -- Imprecise for money!
    created_at TIMESTAMP  -- Missing time zone
);

-- ✅ GOOD: ENUM for fixed sets
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status order_status NOT NULL DEFAULT 'pending'
);

-- ❌ BAD: VARCHAR for status (no constraint)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20)  -- No validation, typos possible
);
```

### Primary Keys and Foreign Keys

```sql
-- ✅ GOOD: Integer PK with foreign key constraints
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ✅ GOOD: Composite foreign key
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- ❌ BAD: No foreign key constraint (orphaned records possible)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER  -- No FK constraint, no referential integrity
);

-- ✅ GOOD: UUID for distributed systems
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Constraints

```sql
-- ✅ GOOD: Comprehensive constraints
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    age INTEGER CHECK (age >= 18),  -- Validation constraint
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ❌ BAD: Missing constraints (allows invalid data)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),  -- Nullable, not unique
    age INTEGER,  -- No validation, can be negative
    status VARCHAR(20)  -- No validation
);

-- ✅ GOOD: NOT NULL for required fields
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,  -- Required
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),  -- Required and validated
    description TEXT  -- Optional
);
```

---

## Indexing Strategies

### Basic Indexes

```sql
-- ✅ GOOD: Index on foreign keys (speeds up joins)
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ✅ GOOD: Index on frequently queried columns
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ✅ GOOD: Unique index for business constraints
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(LOWER(username));  -- Case-insensitive

-- ❌ BAD: No index on foreign key (slow joins)
-- Missing: CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

### Composite Indexes

```sql
-- ✅ GOOD: Composite index for common query patterns
-- Query: SELECT * FROM orders WHERE customer_id = X AND status = 'pending'
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

-- ✅ GOOD: Index column order matters (most selective first)
-- Good if filtering by both customer_id and created_at
CREATE INDEX idx_orders_customer_created ON orders(customer_id, created_at DESC);

-- ❌ BAD: Wrong column order (less efficient)
-- If most queries filter by customer_id first, put it first
CREATE INDEX idx_orders_created_customer ON orders(created_at, customer_id);  -- Suboptimal

-- ✅ GOOD: Partial index for subset queries
CREATE INDEX idx_orders_active ON orders(customer_id) WHERE status != 'cancelled';

-- ✅ GOOD: Expression index
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
```

### Index Types

```sql
-- ✅ GOOD: B-tree (default, for most queries)
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ✅ GOOD: Hash index for equality checks only
CREATE INDEX idx_users_email_hash ON users USING HASH (email);

-- ✅ GOOD: GIN index for JSONB, arrays, full-text search
CREATE INDEX idx_products_metadata ON products USING GIN (metadata);
CREATE INDEX idx_products_tags ON products USING GIN (tags);  -- Array

-- ✅ GOOD: GiST index for geometric data, ranges
CREATE INDEX idx_events_time_range ON events USING GIST (time_range);

-- ✅ GOOD: BRIN index for large, naturally ordered tables
CREATE INDEX idx_logs_created_at ON logs USING BRIN (created_at);  -- Time-series data
```

### When NOT to Index

```sql
-- ❌ BAD: Indexing low-cardinality columns (waste of space)
CREATE INDEX idx_users_is_active ON users(is_active);  -- Boolean, only 2 values

-- ❌ BAD: Indexing small tables (overhead > benefit)
-- Don't index tables with < 1000 rows

-- ❌ BAD: Too many indexes on write-heavy tables (slows down INSERT/UPDATE)
-- Balance read performance with write performance
```

---

## Query Optimization Patterns

### N+1 Query Problems

```csharp
// ❌ BAD: N+1 query problem in Entity Framework
var orders = await _dbContext.Orders.ToListAsync();
foreach (var order in orders)
{
    // This executes N separate queries!
    var customer = await _dbContext.Customers
        .FirstOrDefaultAsync(c => c.Id == order.CustomerId);
    Console.WriteLine($"{order.Id}: {customer.Name}");
}

// ✅ GOOD: Single query with Include (eager loading)
var orders = await _dbContext.Orders
    .Include(o => o.Customer)
    .ToListAsync();

foreach (var order in orders)
{
    Console.WriteLine($"{order.Id}: {order.Customer.Name}");
}

// SQL generated (single query with JOIN):
SELECT o.*, c.*
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id;
```

### SELECT * Anti-Pattern

```sql
-- ❌ BAD: SELECT * (fetches unnecessary columns, breaks caching)
SELECT * FROM orders WHERE customer_id = 123;

-- ✅ GOOD: Select only needed columns
SELECT id, order_date, total_amount, status
FROM orders
WHERE customer_id = 123;

-- ✅ GOOD: In Entity Framework, use projection
var orders = await _dbContext.Orders
    .Where(o => o.CustomerId == customerId)
    .Select(o => new OrderDto 
    {
        Id = o.Id,
        OrderDate = o.OrderDate,
        TotalAmount = o.TotalAmount,
        Status = o.Status
    })
    .ToListAsync();
```

### JOIN Optimization

```sql
-- ✅ GOOD: INNER JOIN for required relationships
SELECT o.id, o.order_date, c.name AS customer_name
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'pending';

-- ✅ GOOD: LEFT JOIN for optional relationships
SELECT o.id, o.order_date, n.notes
FROM orders o
LEFT JOIN order_notes n ON o.id = n.order_id;

-- ❌ BAD: Joining large tables without filtering first
SELECT o.*, c.*, p.*
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id;
-- Should filter orders first (WHERE clause)

-- ✅ GOOD: Filter before joining
SELECT o.id, c.name, p.name
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id
WHERE o.created_at >= '2024-01-01'  -- Filter first
  AND o.status = 'active';
```

### Pagination

```sql
-- ❌ BAD: OFFSET on large tables (scans all skipped rows)
SELECT id, name, email
FROM customers
ORDER BY created_at DESC
LIMIT 100 OFFSET 10000;  -- Very slow for large offsets

-- ✅ GOOD: Keyset pagination (cursor-based)
SELECT id, name, email, created_at
FROM customers
WHERE created_at < '2024-01-15 12:00:00'  -- Last seen created_at
ORDER BY created_at DESC
LIMIT 100;

-- ✅ GOOD: In Entity Framework with cursor
var lastCreatedAt = previousPage.LastOrDefault()?.CreatedAt;

var nextPage = await _dbContext.Customers
    .Where(c => c.CreatedAt < lastCreatedAt)
    .OrderByDescending(c => c.CreatedAt)
    .Take(100)
    .ToListAsync();
```

### Aggregations

```sql
-- ✅ GOOD: Efficient aggregation with GROUP BY
SELECT customer_id, COUNT(*) AS order_count, SUM(total_amount) AS total_spent
FROM orders
WHERE created_at >= '2024-01-01'
GROUP BY customer_id
HAVING COUNT(*) > 5;

-- ❌ BAD: Aggregating in application code (fetches all rows)
-- Don't do: fetch all orders, then count in C#

-- ✅ GOOD: Use indexes for GROUP BY
CREATE INDEX idx_orders_customer_created ON orders(customer_id, created_at);

SELECT customer_id, DATE(created_at) AS order_date, COUNT(*) AS daily_orders
FROM orders
GROUP BY customer_id, DATE(created_at);
```

---

## Entity Framework Core Patterns

### DbContext Configuration

```csharp
// ✅ GOOD: DbContext with proper configuration
public class ApplicationDbContext : DbContext
{
    public DbSet<Order> Orders { get; set; }
    public DbSet<Customer> Customers { get; set; }
    
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ✅ GOOD: Configure entity mappings
        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("orders");
            
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Id)
                .HasColumnName("id");
            
            entity.Property(e => e.TotalAmount)
                .HasColumnName("total_amount")
                .HasColumnType("decimal(10,2)")
                .IsRequired();
            
            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(20)
                .IsRequired();
            
            // ✅ GOOD: Configure relationships
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(e => e.CustomerId)
                .HasConstraintName("fk_orders_customer_id")
                .OnDelete(DeleteBehavior.Restrict);
            
            // ✅ GOOD: Configure indexes
            entity.HasIndex(e => e.CustomerId)
                .HasDatabaseName("idx_orders_customer_id");
            
            entity.HasIndex(e => new { e.CustomerId, e.Status })
                .HasDatabaseName("idx_orders_customer_status");
        });
    }
}

// ❌ BAD: Relying on conventions without configuration
public class ApplicationDbContext : DbContext
{
    public DbSet<Order> Orders { get; set; }
    // Missing OnModelCreating - relies entirely on conventions
}
```

### Migrations

```csharp
// ✅ GOOD: Migration with explicit SQL and data migration
public partial class AddOrderStatusIndex : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // ✅ GOOD: Create index
        migrationBuilder.CreateIndex(
            name: "idx_orders_status",
            table: "orders",
            column: "status");
        
        // ✅ GOOD: Add CHECK constraint via SQL
        migrationBuilder.Sql(@"
            ALTER TABLE orders
            ADD CONSTRAINT chk_orders_status
            CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'));
        ");
    }
    
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("ALTER TABLE orders DROP CONSTRAINT chk_orders_status;");
        migrationBuilder.DropIndex(name: "idx_orders_status", table: "orders");
    }
}

// ❌ BAD: Data loss risk in migration
public partial class RemoveOldColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // ❌ CRITICAL: Dropping column without data migration
        migrationBuilder.DropColumn(name: "old_data", table: "orders");
    }
}

// ✅ GOOD: Safe data migration
public partial class MigrateOldDataToNewColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // 1. Add new column (nullable first)
        migrationBuilder.AddColumn<string>(
            name: "new_data",
            table: "orders",
            nullable: true);
        
        // 2. Migrate data
        migrationBuilder.Sql(@"
            UPDATE orders SET new_data = old_data WHERE old_data IS NOT NULL;
        ");
        
        // 3. Make new column NOT NULL
        migrationBuilder.AlterColumn<string>(
            name: "new_data",
            table: "orders",
            nullable: false);
        
        // 4. Drop old column (after verifying migration success)
        migrationBuilder.DropColumn(name: "old_data", table: "orders");
    }
}
```

### Query Patterns

```csharp
// ✅ GOOD: AsNoTracking for read-only queries
var orders = await _dbContext.Orders
    .AsNoTracking()
    .Where(o => o.Status == OrderStatus.Active)
    .ToListAsync();

// ✅ GOOD: Projection to avoid loading full entities
var orderSummaries = await _dbContext.Orders
    .Where(o => o.CustomerId == customerId)
    .Select(o => new OrderSummary
    {
        OrderId = o.Id,
        Total = o.TotalAmount,
        Status = o.Status,
        CustomerName = o.Customer.Name  // EF handles join automatically
    })
    .ToListAsync();

// ✅ GOOD: Split queries for multiple collections
var customer = await _dbContext.Customers
    .Include(c => c.Orders)
    .Include(c => c.Addresses)
    .AsSplitQuery()  // Separate queries for each collection
    .FirstOrDefaultAsync(c => c.Id == customerId);

// ❌ BAD: Cartesian explosion with multiple collections
var customer = await _dbContext.Customers
    .Include(c => c.Orders)
    .Include(c => c.Addresses)
    .FirstOrDefaultAsync(c => c.Id == customerId);
// Generates JOIN that creates cartesian product
```

---

## Performance Analysis

### EXPLAIN ANALYZE

```sql
-- ✅ GOOD: Use EXPLAIN ANALYZE to understand query performance
EXPLAIN ANALYZE
SELECT o.id, o.order_date, c.name
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'pending'
  AND o.created_at >= '2024-01-01';

-- Look for:
-- ✅ GOOD: Index Scan (uses index)
-- ✅ GOOD: Nested Loop (small datasets)
-- ❌ BAD: Seq Scan (table scan, slow on large tables)
-- ❌ BAD: High cost numbers
-- ❌ BAD: Large differences between estimated and actual rows
```

### Index Usage

```sql
-- ✅ GOOD: Check if indexes are being used
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;  -- Indexes with 0 scans are unused

-- ✅ GOOD: Check missing indexes on foreign keys
SELECT
    c.conrelid::regclass AS table_name,
    a.attname AS column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.contype = 'f'  -- Foreign key
  AND NOT EXISTS (
      SELECT 1 FROM pg_index i
      WHERE i.indrelid = c.conrelid
        AND a.attnum = ANY(i.indkey)
  );
```

### Table Bloat

```sql
-- ✅ GOOD: Monitor table bloat
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_dead_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- ✅ GOOD: Vacuum regularly (auto-vacuum should handle this)
VACUUM ANALYZE orders;

-- ✅ GOOD: Reindex if needed
REINDEX INDEX idx_orders_customer_id;
```

---

## PostgreSQL-Specific Features

### JSONB

```sql
-- ✅ GOOD: JSONB for semi-structured data
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    attributes JSONB  -- Flexible attributes
);

-- ✅ GOOD: Query JSONB
SELECT * FROM products
WHERE attributes->>'color' = 'red';

SELECT * FROM products
WHERE attributes @> '{"brand": "Acme"}';  -- Contains

-- ✅ GOOD: Index JSONB with GIN
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);

-- ❌ BAD: JSON instead of JSONB (slower, no indexing)
CREATE TABLE products (
    attributes JSON  -- Use JSONB instead
);
```

### Arrays

```sql
-- ✅ GOOD: Array for multi-valued attributes
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tags VARCHAR(50)[]  -- Array of tags
);

-- ✅ GOOD: Query arrays
SELECT * FROM products WHERE 'electronics' = ANY(tags);
SELECT * FROM products WHERE tags @> ARRAY['electronics', 'gadgets'];  -- Contains

-- ✅ GOOD: Index arrays with GIN
CREATE INDEX idx_products_tags ON products USING GIN (tags);
```

### Full-Text Search

```sql
-- ✅ GOOD: Full-text search with tsvector
ALTER TABLE products ADD COLUMN search_vector tsvector;

UPDATE products
SET search_vector = to_tsvector('english', name || ' ' || description);

CREATE INDEX idx_products_search ON products USING GIN (search_vector);

-- ✅ GOOD: Full-text query
SELECT * FROM products
WHERE search_vector @@ to_tsquery('english', 'laptop & gaming');
```

---

## Security Patterns

### SQL Injection Prevention

```csharp
// ✅ GOOD: Parameterized query (EF Core does this automatically)
var orders = await _dbContext.Orders
    .Where(o => o.CustomerId == customerId)  // Safe, parameterized
    .ToListAsync();

// ✅ GOOD: FromSqlRaw with parameters
var orders = await _dbContext.Orders
    .FromSqlRaw("SELECT * FROM orders WHERE customer_id = {0}", customerId)
    .ToListAsync();

// ❌ CRITICAL: SQL injection vulnerability!
var orders = await _dbContext.Orders
    .FromSqlRaw($"SELECT * FROM orders WHERE customer_id = {customerId}")
    .ToListAsync();
```

### Row-Level Security

```sql
-- ✅ GOOD: PostgreSQL row-level security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY customer_orders ON orders
    FOR SELECT
    USING (customer_id = current_setting('app.current_user_id')::INTEGER);
```

---

## Integration for AI Agents

### For Database Reviewers

Load this skill to:
- Review schema design and normalization
- Optimize SQL queries and identify N+1 problems
- Design indexing strategies
- Analyze EXPLAIN plans
- Check Entity Framework patterns

Use alongside: **csharp-patterns** (for EF Core), **avayler-context-technical**

### For C# Reviewers

Load this skill to:
- Review Entity Framework query patterns
- Identify N+1 queries in LINQ
- Check AsNoTracking usage
- Validate migration safety

Use alongside: **csharp-patterns**, **code-review-patterns**

### For Technical Leads

Load this skill to:
- Guide data access architecture decisions
- Review database schema changes
- Establish query optimization standards

Use alongside: **csharp-patterns**, **avayler-context-technical**

---

## Quick Reference Checklist

Before approving database code:

- [ ] **Schema**: snake_case naming, appropriate data types, WITH TIME ZONE for timestamps
- [ ] **Constraints**: NOT NULL, CHECK, UNIQUE, foreign keys with proper ON DELETE
- [ ] **Indexes**: Foreign keys indexed, composite indexes for common queries
- [ ] **Queries**: No SELECT *, no N+1 problems, filtered before joins
- [ ] **EF Core**: AsNoTracking for reads, Include for eager loading, projections when possible
- [ ] **Migrations**: Safe data migrations, no data loss, rollback plan
- [ ] **Security**: Parameterized queries, no SQL injection vulnerabilities
- [ ] **Performance**: EXPLAIN ANALYZE reviewed, reasonable query costs

---

## Summary

This skill provides comprehensive PostgreSQL patterns for:
- Schema design with proper naming, data types, and constraints
- Indexing strategies (B-tree, GIN, BRIN, composite, partial)
- Query optimization and N+1 prevention
- Entity Framework Core integration and configuration
- Migration best practices and data safety
- Performance analysis with EXPLAIN ANALYZE
- PostgreSQL-specific features (JSONB, arrays, full-text search)
- Security patterns and SQL injection prevention

**Remember**: These patterns are grounded in PostgreSQL 13+ and Entity Framework Core best practices for Avayler's microservices architecture.
