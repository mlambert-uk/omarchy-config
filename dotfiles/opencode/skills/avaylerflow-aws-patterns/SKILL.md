---
name: avaylerflow-aws-patterns
description: AWS Well-Architected Framework patterns, service selection guidance, serverless best practices, Lambda optimization, and AWS security/cost/resilience patterns. Use when reviewing AWS architecture.
license: MIT
compatibility: opencode
metadata:
  audience: technical-agents
  domain: aws-cloud
  applies-to: [aws-specialist, pulumi-specialist, technical-lead]
---

## What I do

Provide comprehensive AWS architecture patterns based on the Well-Architected Framework, covering service selection, serverless best practices, Lambda optimization, security, cost optimization, resilience, and operational excellence.

## When to use me

**Load this skill when:**
- Reviewing AWS architecture decisions
- Selecting AWS services for requirements
- Assessing Well-Architected Framework compliance
- Optimizing Lambda functions and serverless applications
- Reviewing AWS security configuration
- Analyzing AWS costs and optimization opportunities
- Validating high availability and disaster recovery

**All AWS architecture and infrastructure review agents should load this skill.**

## AWS Well-Architected Framework

### Five Pillars

1. **Operational Excellence** - Running and monitoring systems
2. **Security** - Protecting information and systems
3. **Reliability** - Recovering from failures and meeting demand
4. **Performance Efficiency** - Using resources efficiently
5. **Cost Optimization** - Avoiding unnecessary costs

---

## Service Selection Patterns

### Compute Services

```
Use case → Recommended service

// ✅ Event-driven, short-running tasks (< 15 min)
→ AWS Lambda
- API endpoints (with API Gateway)
- Event processing (S3, DynamoDB, SNS, SQS)
- Scheduled jobs (EventBridge)
- Stream processing (Kinesis)

// ✅ Long-running processes, batch jobs
→ AWS Fargate (ECS or EKS)
- Background workers > 15 minutes
- Video encoding, data processing
- ML training jobs
- Microservices that need persistent connections

// ✅ Persistent servers, specific OS requirements
→ EC2
- Legacy applications
- Licensed software requiring specific OS
- GPU workloads
- High-frequency trading (low latency)

// ❌ AVOID: EC2 for simple API (use Lambda instead)
// ❌ AVOID: Lambda for long-running tasks > 15 min (use Fargate)
```

### Database Services

```
Use case → Recommended service

// ✅ Relational data, ACID transactions, complex queries
→ RDS PostgreSQL / Aurora PostgreSQL
- Traditional OLTP applications
- Multi-table joins
- Strong consistency requirements
- Complex queries with aggregations

// ✅ Key-value, high throughput, millisecond latency
→ DynamoDB
- User sessions
- Shopping carts
- Game leaderboards
- IoT time-series data
- Simple queries (single-table design)

// ✅ Caching, session storage
→ ElastiCache (Redis)
- Application caching
- Session management
- Rate limiting
- Real-time analytics
- Pub/sub messaging

// ✅ Search and analytics
→ OpenSearch (ElasticSearch)
- Full-text search
- Log analytics
- Application monitoring

// ❌ AVOID: DynamoDB for complex relational data (use RDS)
// ❌ AVOID: RDS for simple key-value access (use DynamoDB)
```

### Storage Services

```
Use case → Recommended service

// ✅ Object storage, static files, backups
→ S3
- User uploads (images, documents)
- Static website hosting
- Data lake storage
- Backup and archival

// ✅ Block storage for EC2
→ EBS
- EC2 root volumes
- Database storage (if not using RDS)

// ✅ Shared file system
→ EFS
- Shared storage across multiple instances
- Container persistent storage

// ❌ AVOID: EBS for static files (use S3)
// ❌ AVOID: S3 for database storage (use RDS/DynamoDB)
```

---

## Lambda Best Practices

### Function Configuration

```typescript
// ✅ GOOD: Optimized Lambda configuration
{
  functionName: "order-processor",
  runtime: "nodejs18.x",
  handler: "index.handler",
  memorySize: 512,  // Start with 512 MB, monitor and adjust
  timeout: 30,  // Reasonable timeout (not max 900s)
  architecture: "arm64",  // Graviton2 - 20% cheaper, better performance
  
  environment: {
    variables: {
      NODE_OPTIONS: "--enable-source-maps",
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1"  // Reuse HTTP connections
    }
  },
  
  // ✅ Reserved concurrency to prevent runaway costs
  reservedConcurrentExecutions: 100,
  
  // ✅ VPC configuration for database access
  vpcConfig: {
    subnetIds: privateSubnetIds,  // Multiple AZs
    securityGroupIds: [lambdaSecurityGroupId]
  }
}

// ❌ BAD: Over-provisioned Lambda
{
  memorySize: 10240,  // Maximum (very expensive!)
  timeout: 900,  // 15 minutes max
  provisionedConcurrentExecutions: 1000  // Extremely expensive!
}
```

### Cold Start Optimization

**Minimize deployment package size**:
```
✅ GOOD strategies:
- Use Lambda Layers for dependencies
- Tree-shake unused code (use esbuild, webpack)
- Minimize dependencies (avoid large libraries)
- Use arm64 architecture (faster cold starts)

❌ BAD practices:
- Including entire node_modules (100+ MB packages)
- Bundling dev dependencies in production
- Not using layers for shared code
```

**Runtime optimization**:
```javascript
// ✅ GOOD: Initialize outside handler (reused across invocations)
const AWS = require('aws-sdk');
const dbClient = new AWS.SecretsManager();  // Initialized once

exports.handler = async (event) => {
  // Handler code
};

// ❌ BAD: Initialize inside handler (every invocation)
exports.handler = async (event) => {
  const AWS = require('aws-sdk');  // Reloaded every time
  const dbClient = new AWS.SecretsManager();  // Recreated every time
};
```

**Connection pooling**:
```javascript
// ✅ GOOD: Reuse database connections
let dbConnection = null;

exports.handler = async (event) => {
  if (!dbConnection) {
    dbConnection = await createConnection();  // Create once
  }
  
  // Use connection
  const result = await dbConnection.query(...);
  return result;
};

// ❌ BAD: New connection every invocation
exports.handler = async (event) => {
  const dbConnection = await createConnection();  // Slow!
  const result = await dbConnection.query(...);
  await dbConnection.close();  // Wasteful
  return result;
};
```

### Memory and CPU Relationship

```
Lambda memory allocation also determines CPU power:

128 MB → 0.08 vCPU (very slow)
512 MB → 0.33 vCPU (baseline)
1024 MB → 0.67 vCPU (good for most workloads)
1769 MB → 1 full vCPU
3008 MB → ~1.75 vCPU (compute-intensive)

✅ GOOD: Start at 512 MB, use AWS Lambda Power Tuning tool
- Monitor CloudWatch metrics (duration, memory used)
- Increase if hitting timeout or high memory usage
- Decrease if consistently using < 50% memory

❌ BAD: Always using max memory (wastes money)
❌ BAD: Using minimum memory (causes timeouts)

Note: Sometimes increasing memory reduces cost
- Example: 2x memory = 1.5x duration = lower total cost
```

### Error Handling and Retries

```javascript
// ✅ GOOD: Proper error handling for Lambda
exports.handler = async (event) => {
  try {
    // Process event
    const result = await processOrder(event);
    
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    console.error('Error processing order:', error);
    
    // Distinguish between retryable and non-retryable errors
    if (error.code === 'ThrottlingException') {
      throw error;  // Retryable - Lambda will retry
    }
    
    if (error.code === 'ValidationError') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      };  // Don't retry validation errors
    }
    
    // Log to CloudWatch and send to DLQ
    throw error;
  }
};

// Configure DLQ for failed events
{
  deadLetterConfig: {
    targetArn: dlqArn  // SQS or SNS for failed events
  }
}
```

---

## API Gateway Patterns

### REST API vs HTTP API

```
✅ Use HTTP API (cheaper, simpler):
- Simple proxying to Lambda
- JWT authorization
- CORS requirements
- 70% cheaper than REST API

✅ Use REST API (more features):
- API keys and usage plans
- Request/response transformation
- API caching
- Resource policies
- Private APIs (VPC endpoint)

❌ AVOID: REST API if you don't need advanced features (costs more)
```

### Throttling and Rate Limiting

```typescript
// ✅ GOOD: Configure throttling
const api = new aws.apigateway.RestApi("orderApi", {
  // Account-level limits (protect backend)
  throttleSettings: {
    rateLimit: 1000,   // Requests per second
    burstLimit: 2000   // Burst capacity
  }
});

// Method-level throttling
const method = new aws.apigateway.Method("getOrders", {
  throttleSettings: {
    rateLimit: 100,
    burstLimit: 200
  }
});
```

---

## S3 Best Practices

### S3 Storage Classes

```
Use case → Storage class

// ✅ Frequently accessed (> 1x per month)
→ S3 Standard
- Active user uploads
- Application assets
- Frequently accessed data

// ✅ Infrequently accessed (monthly)
→ S3 Standard-IA
- Backups accessed occasionally
- Older documents

// ✅ Archive (rarely accessed)
→ S3 Glacier Flexible Retrieval
- Long-term backups
- Compliance archives
- Retrieval: minutes to hours

// ✅ Deep archive (almost never accessed)
→ S3 Glacier Deep Archive
- 7-10 year retention
- Retrieval: 12-48 hours
- Cheapest storage

// ✅ Unknown access patterns
→ S3 Intelligent-Tiering
- Automatically moves data between tiers
- Small monitoring fee
```

### S3 Performance Optimization

```typescript
// ✅ GOOD: Enable Transfer Acceleration for global uploads
const bucket = new aws.s3.Bucket("uploads", {
  accelerationStatus: "Enabled"  // CloudFront edge locations
});

// ✅ GOOD: Use multipart upload for large files (> 100 MB)
// Automatically handled by AWS SDK
const upload = s3.upload({
  Bucket: bucket,
  Key: key,
  Body: stream
});

// ✅ GOOD: Request parallelization (S3 scales automatically)
// Prefix with hash to distribute across partitions
const key = `${md5Hash.substring(0, 4)}/${userId}/${filename}`;
// Avoids hot partitions
```

---

## DynamoDB Patterns

### Table Design

```
✅ GOOD: Single-table design with composite keys

Table: orders
PK: CUSTOMER#{customerId}     SK: ORDER#{orderId}
PK: CUSTOMER#{customerId}     SK: METADATA
PK: ORDER#{orderId}            SK: ORDER#{orderId}

// One table, multiple access patterns
- Get customer orders: Query PK=CUSTOMER#{id}
- Get order details: Get PK=ORDER#{id}, SK=ORDER#{id}

❌ BAD: One table per entity (like relational DB)
- customers table
- orders table
- order_items table
// Expensive, slow joins across tables
```

### Capacity Planning

```typescript
// ✅ GOOD: On-demand billing for unpredictable workloads
const table = new aws.dynamodb.Table("orders", {
  billingMode: "PAY_PER_REQUEST"  // No capacity planning needed
});

// ✅ GOOD: Provisioned capacity for predictable workloads
const table = new aws.dynamodb.Table("orders", {
  billingMode: "PROVISIONED",
  readCapacityUnits: 5,   // Baseline
  writeCapacityUnits: 5,
  
  // Auto-scaling for traffic spikes
  autoScaling: {
    read: {
      minCapacity: 5,
      maxCapacity: 100,
      targetUtilization: 70
    },
    write: {
      minCapacity: 5,
      maxCapacity: 100,
      targetUtilization: 70
    }
  }
});

// Use provisioned if you can predict traffic (cheaper at scale)
// Use on-demand for spiky or new workloads
```

### Global Secondary Indexes

```typescript
// ✅ GOOD: GSI for additional access patterns
const table = new aws.dynamodb.Table("orders", {
  hashKey: "customerId",
  rangeKey: "orderId",
  
  globalSecondaryIndexes: [{
    name: "StatusIndex",
    hashKey: "status",       // Query by status
    rangeKey: "createdAt",   // Sort by date
    projectionType: "ALL"    // Include all attributes
  }]
});

// Query orders by status
dynamodb.query({
  TableName: "orders",
  IndexName: "StatusIndex",
  KeyConditionExpression: "status = :status",
  ExpressionAttributeValues: { ":status": "pending" }
});
```

---

## Security Best Practices

### IAM Policy Patterns

```json
// ✅ GOOD: Least privilege policy
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "dynamodb:GetItem",
      "dynamodb:Query"
    ],
    "Resource": "arn:aws:dynamodb:us-east-1:123456789:table/orders"
  }]
}

// ❌ BAD: Overly permissive
{
  "Statement": [{
    "Effect": "Allow",
    "Action": "*",        // All actions
    "Resource": "*"       // All resources
  }]
}
```

### Secrets Management

```
✅ GOOD: AWS Secrets Manager for sensitive data
- Database credentials
- API keys
- OAuth tokens
- Encryption keys

✅ GOOD: SSM Parameter Store for non-sensitive config
- Feature flags
- Environment variables
- Public configuration

❌ BAD: Environment variables for secrets
❌ BAD: Hardcoded secrets in code
❌ BAD: Secrets in version control
```

### Encryption

```
✅ REQUIRED: Encryption at rest
- S3: SSE-S3 or SSE-KMS
- RDS: Enable storage encryption
- DynamoDB: Enable encryption
- EBS: Enable volume encryption

✅ REQUIRED: Encryption in transit
- HTTPS/TLS for all APIs
- RDS: Require SSL connections
- ElastiCache: Enable transit encryption

❌ CRITICAL: Unencrypted data storage
❌ CRITICAL: HTTP without TLS
```

---

## Cost Optimization Patterns

### Compute Cost Optimization

```
✅ Lambda:
- Use arm64 architecture (20% cheaper)
- Right-size memory (use Power Tuning tool)
- Use layers to reduce deployment size
- Avoid provisioned concurrency unless necessary

✅ EC2:
- Use Spot Instances for fault-tolerant workloads (90% discount)
- Use Savings Plans for baseline capacity (72% discount)
- Right-size instances (CloudWatch metrics)
- Turn off dev/test instances at night

✅ Fargate:
- Use Spot for non-critical workloads (70% discount)
- Right-size CPU and memory
- Use Graviton2 (arm64) for 20% savings

❌ AVOID: Always running large instances
❌ AVOID: On-demand pricing for predictable workloads
```

### Data Transfer Cost Optimization

```
✅ GOOD: Minimize data transfer costs
- Use VPC endpoints for S3/DynamoDB (no NAT charges)
- Keep data transfer within same region
- Use CloudFront for global distribution
- Compress data before transfer

❌ BAD: Transferring data cross-region unnecessarily
❌ BAD: Not using VPC endpoints (NAT Gateway $$$)
❌ BAD: Downloading large files from S3 via NAT
```

### Database Cost Optimization

```
✅ RDS:
- Use Reserved Instances for production (60% discount)
- Right-size instance class
- Use Aurora Serverless v2 for variable workloads
- Use read replicas instead of scaling up primary

✅ DynamoDB:
- Use on-demand for unpredictable traffic
- Use provisioned + auto-scaling for steady traffic
- Use DynamoDB Accelerator (DAX) for read-heavy workloads
- Enable TTL to auto-delete old data

❌ AVOID: Over-provisioned RDS instances
❌ AVOID: Provisioned DynamoDB for spiky traffic
```

---

## Resilience and High Availability

### Multi-AZ Deployment

```
✅ GOOD: Multi-AZ for production
- RDS: Enable Multi-AZ (synchronous replication)
- Lambda: Deployed to multiple AZs by default
- ELB: Configure across multiple AZs
- ElastiCache: Enable Multi-AZ with auto-failover

// Single AZ failure → Automatic failover
// RTO: < 2 minutes
// RPO: 0 (synchronous replication)

❌ BAD: Single AZ for critical workloads
```

### Backup and Disaster Recovery

```
✅ GOOD: Automated backups
- RDS: 7-day automated backups + manual snapshots
- DynamoDB: Point-in-time recovery (PITR)
- S3: Versioning + cross-region replication
- EBS: Automated snapshot lifecycle

Disaster Recovery tiers:
1. Backup & Restore (RPO: hours, RTO: hours) - Cheapest
2. Pilot Light (RPO: minutes, RTO: 10s of minutes)
3. Warm Standby (RPO: seconds, RTO: minutes)
4. Multi-Region Active-Active (RPO: 0, RTO: 0) - Most expensive

Choose based on criticality and budget
```

### Health Checks and Auto-Recovery

```typescript
// ✅ GOOD: ELB health checks
const targetGroup = new aws.lb.TargetGroup("app", {
  healthCheck: {
    path: "/health",
    interval: 30,
    timeout: 5,
    healthyThreshold: 2,
    unhealthyThreshold: 3
  }
});

// ✅ GOOD: Auto Scaling Group for self-healing
const asg = new aws.autoscaling.Group("app", {
  minSize: 2,
  maxSize: 10,
  desiredCapacity: 2,
  healthCheckType: "ELB",
  healthCheckGracePeriod: 300
});
```

---

## Monitoring and Observability

### CloudWatch Metrics

```
✅ CRITICAL metrics to monitor:

Lambda:
- Invocations
- Errors
- Duration
- Throttles
- ConcurrentExecutions

RDS:
- CPUUtilization (alert > 80%)
- FreeableMemory (alert < 1 GB)
- DatabaseConnections (alert near max)
- ReadLatency / WriteLatency

API Gateway:
- Count (requests)
- 4XXError
- 5XXError
- Latency

DynamoDB:
- ConsumedReadCapacityUnits
- ConsumedWriteCapacityUnits
- UserErrors
- SystemErrors
```

### CloudWatch Alarms

```typescript
// ✅ GOOD: Actionable alarms
const lambdaErrorAlarm = new aws.cloudwatch.MetricAlarm("lambdaErrors", {
  metricName: "Errors",
  namespace: "AWS/Lambda",
  statistic: "Sum",
  period: 60,
  evaluationPeriods: 2,
  threshold: 10,  // Alert if > 10 errors in 2 minutes
  comparisonOperator: "GreaterThanThreshold",
  alarmActions: [snsTopicArn]  // SNS → PagerDuty/Email
});

// Set alarms for:
// - High error rates
// - High latency (> SLA)
// - Resource exhaustion (CPU, memory, connections)
// - Cost anomalies
```

### X-Ray Distributed Tracing

```typescript
// ✅ GOOD: Enable X-Ray for Lambda
const lambda = new aws.lambda.Function("handler", {
  tracingConfig: { mode: "Active" }
});

// Benefits:
// - End-to-end request tracing
// - Identify bottlenecks across services
// - Visualize service map
// - Debug Lambda cold starts
```

---

## Integration for AI Agents

### For AWS Specialists

Load this skill to:
- Guide service selection based on requirements
- Review Well-Architected Framework compliance
- Optimize costs and performance
- Validate security and resilience
- Recommend AWS best practices

Use alongside: **pulumi-patterns**, **code-review-patterns**, **avayler-context-technical**

### For Pulumi Specialists

Load this skill to:
- Understand AWS service patterns in IaC context
- Validate service configuration
- Review AWS-specific security and cost patterns

Use alongside: **pulumi-patterns**, **avayler-context-technical**

### For Technical Leads

Load this skill to:
- Make architecture decisions
- Review AWS infrastructure proposals
- Guide team on AWS best practices

Use alongside: **pulumi-patterns**, **code-review-patterns**

---

## Quick Reference Checklist

Before approving AWS architecture:

- [ ] **Service Selection**: Right service for the job (Lambda vs Fargate vs EC2)
- [ ] **Security**: IAM least privilege, encryption at rest/transit, Secrets Manager
- [ ] **Cost**: Right-sized resources, lifecycle policies, reserved capacity where applicable
- [ ] **Resilience**: Multi-AZ for prod, automated backups, disaster recovery plan
- [ ] **Monitoring**: CloudWatch alarms, X-Ray tracing, logging enabled
- [ ] **Performance**: Auto-scaling configured, caching where appropriate
- [ ] **Lambda**: arm64 architecture, right-sized memory, connection reuse
- [ ] **Databases**: Appropriate service (RDS vs DynamoDB), backups enabled
- [ ] **Well-Architected**: Compliance with 5 pillars

---

## Summary

This skill provides comprehensive AWS architecture patterns for:
- Well-Architected Framework (5 pillars: operational excellence, security, reliability, performance, cost)
- Service selection (compute, database, storage)
- Lambda optimization (cold starts, memory tuning, error handling)
- API Gateway patterns (REST vs HTTP API, throttling)
- S3 best practices (storage classes, performance)
- DynamoDB patterns (single-table design, capacity planning)
- Security (IAM, secrets, encryption)
- Cost optimization (compute, data transfer, databases)
- Resilience (multi-AZ, backups, disaster recovery)
- Monitoring (CloudWatch, X-Ray, alarms)

**Remember**: These patterns follow AWS Well-Architected Framework and are grounded in Avayler's serverless microservices architecture.
