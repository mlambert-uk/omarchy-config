---
name: avaylerflow-pulumi-patterns
description: Infrastructure as Code patterns for Pulumi with AWS, covering security, cost optimization, resilience, monitoring, and AWS best practices. Use when reviewing Pulumi/IaC code.
license: MIT
compatibility: opencode
metadata:
  audience: technical-agents
  domain: pulumi-iac-aws
  applies-to: [pulumi-specialist, aws-specialist, technical-lead]
---

## What I do

Provide comprehensive Pulumi Infrastructure as Code patterns for AWS, focusing on security, cost optimization, resilience, monitoring, compliance, and AWS Well-Architected Framework principles.

## When to use me

**Load this skill when:**
- Reviewing Pulumi infrastructure code
- Assessing AWS infrastructure security
- Optimizing infrastructure costs
- Reviewing resilience and high availability
- Checking compliance and best practices
- Validating monitoring and observability setup
- Analyzing infrastructure performance

**All Pulumi and infrastructure review agents should load this skill.**

## Pulumi Best Practices

### Project Structure

```
infrastructure/
├── Pulumi.yaml                 # Project definition
├── Pulumi.dev.yaml             # Dev stack config
├── Pulumi.staging.yaml         # Staging stack config
├── Pulumi.prod.yaml            # Prod stack config
├── index.ts                    # Main entry point
├── stacks/
│   ├── network.ts              # VPC, subnets, security groups
│   ├── database.ts             # RDS, ElastiCache
│   ├── compute.ts              # Lambda functions
│   ├── storage.ts              # S3 buckets
│   └── monitoring.ts           # CloudWatch, alarms
└── config/
    └── environments.ts         # Environment-specific config
```

### Resource Naming Convention

```typescript
// ✅ GOOD: Consistent naming pattern
const functionName = `${serviceName}-${environment}-${resourceType}`;
// Example: "order-service-prod-lambda"

const lambda = new aws.lambda.Function("orderServiceLambda", {
    name: `order-service-${pulumi.getStack()}-handler`,
    // ...
});

const bucket = new aws.s3.Bucket("orderServiceBucket", {
    bucket: `order-service-${pulumi.getStack()}-data`,
    // ...
});

// ❌ BAD: Inconsistent or unclear naming
const lambda = new aws.lambda.Function("myFunction", {
    name: "function1",  // Unclear purpose, no environment
});
```

### Resource Tagging

```typescript
// ✅ GOOD: Comprehensive tagging for all resources
const standardTags = {
    Service: "order-service",
    Environment: pulumi.getStack(),
    ManagedBy: "Pulumi",
    CostCenter: "Engineering",
    Owner: "platform-team"
};

const lambda = new aws.lambda.Function("orderServiceLambda", {
    name: `order-service-${pulumi.getStack()}-handler`,
    tags: standardTags,
    // ...
});

const bucket = new aws.s3.Bucket("orderServiceBucket", {
    bucket: `order-service-${pulumi.getStack()}-data`,
    tags: standardTags,
    // ...
});

// ❌ BAD: Missing or inconsistent tags
const lambda = new aws.lambda.Function("orderServiceLambda", {
    name: "order-lambda",
    // Missing tags - can't track costs or ownership
});
```

### Stack Configuration

```typescript
// ✅ GOOD: Use Pulumi config for environment-specific values
const config = new pulumi.Config();
const dbInstanceClass = config.require("dbInstanceClass");  // From Pulumi.{stack}.yaml
const lambdaMemory = config.getNumber("lambdaMemory") ?? 512;

// Pulumi.prod.yaml
// config:
//   dbInstanceClass: db.t3.medium
//   lambdaMemory: 1024

// Pulumi.dev.yaml
// config:
//   dbInstanceClass: db.t3.micro
//   lambdaMemory: 512

// ❌ BAD: Hardcoded environment-specific values
const dbInstanceClass = "db.t3.medium";  // No flexibility across environments
```

---

## Security Patterns

### Secrets Management

```typescript
// ✅ GOOD: Use AWS Secrets Manager for sensitive data
const dbPassword = new aws.secretsmanager.Secret("dbPassword", {
    description: "Database master password",
    tags: standardTags
});

const dbPasswordVersion = new aws.secretsmanager.SecretVersion("dbPasswordVersion", {
    secretId: dbPassword.id,
    secretString: pulumi.secret(generatePassword()),  // Mark as secret
});

const dbInstance = new aws.rds.Instance("orderDb", {
    password: dbPasswordVersion.secretString,  // Reference secret
    // ...
});

// ❌ CRITICAL: Hardcoded secrets (exposed in state file!)
const dbInstance = new aws.rds.Instance("orderDb", {
    password: "MyP@ssw0rd123",  // NEVER DO THIS
});

// ❌ CRITICAL: Secrets in config file (version controlled!)
// Pulumi.yaml
// config:
//   dbPassword: "MyP@ssw0rd123"  // NEVER DO THIS
```

### IAM Least Privilege

```typescript
// ✅ GOOD: Minimal IAM permissions for Lambda
const lambdaRole = new aws.iam.Role("orderServiceLambdaRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: "lambda.amazonaws.com"
    }),
    tags: standardTags
});

const lambdaPolicy = new aws.iam.RolePolicy("orderServiceLambdaPolicy", {
    role: lambdaRole.id,
    policy: {
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            Resource: `arn:aws:logs:${region}:${accountId}:log-group:/aws/lambda/order-service-*`
        }, {
            Effect: "Allow",
            Action: ["secretsmanager:GetSecretValue"],
            Resource: dbPassword.arn  // Specific secret only
        }]
    }
});

// ❌ BAD: Overly permissive IAM policy
const lambdaPolicy = new aws.iam.RolePolicy("orderServiceLambdaPolicy", {
    role: lambdaRole.id,
    policy: {
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: "*",  // TOO BROAD!
            Resource: "*"  // TOO BROAD!
        }]
    }
});
```

### S3 Bucket Security

```typescript
// ✅ GOOD: Secure S3 bucket configuration
const bucket = new aws.s3.Bucket("orderServiceBucket", {
    bucket: `order-service-${pulumi.getStack()}-data`,
    acl: "private",  // Never public
    versioning: { enabled: true },  // Enable versioning
    serverSideEncryptionConfiguration: {
        rule: {
            applyServerSideEncryptionByDefault: {
                sseAlgorithm: "AES256"  // Encrypt at rest
            }
        }
    },
    publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
    },
    tags: standardTags
});

// ❌ CRITICAL: Public S3 bucket (data exposure risk!)
const bucket = new aws.s3.Bucket("orderServiceBucket", {
    acl: "public-read",  // NEVER DO THIS unless absolutely necessary
    // Missing encryption, versioning, public access block
});
```

### Security Group Configuration

```typescript
// ✅ GOOD: Restrictive security groups
const dbSecurityGroup = new aws.ec2.SecurityGroup("dbSecurityGroup", {
    vpcId: vpc.id,
    description: "Security group for RDS database",
    ingress: [{
        protocol: "tcp",
        fromPort: 5432,
        toPort: 5432,
        securityGroups: [lambdaSecurityGroup.id]  // Only Lambda can access
    }],
    egress: [],  // No outbound (database doesn't need it)
    tags: standardTags
});

// ❌ BAD: Overly permissive security group
const dbSecurityGroup = new aws.ec2.SecurityGroup("dbSecurityGroup", {
    vpcId: vpc.id,
    ingress: [{
        protocol: "tcp",
        fromPort: 0,
        toPort: 65535,
        cidrBlocks: ["0.0.0.0/0"]  // OPEN TO INTERNET!
    }]
});
```

---

## Cost Optimization Patterns

### Lambda Cost Optimization

```typescript
// ✅ GOOD: Right-sized Lambda with appropriate timeout
const lambda = new aws.lambda.Function("orderServiceLambda", {
    name: `order-service-${pulumi.getStack()}-handler`,
    runtime: "nodejs18.x",
    memorySize: 512,  // Start small, monitor, increase if needed
    timeout: 30,  // Reasonable timeout (not max 900s)
    reservedConcurrentExecutions: pulumi.getStack() === "prod" ? 10 : undefined,  // Only in prod
    // ...
});

// ❌ BAD: Over-provisioned Lambda (wastes money)
const lambda = new aws.lambda.Function("orderServiceLambda", {
    memorySize: 3008,  // Max memory (expensive!)
    timeout: 900,  // Max timeout (15 min)
    provisionedConcurrentExecutions: 100,  // Very expensive!
});

// ✅ GOOD: Use ARM64 for cost savings (up to 20% cheaper)
const lambda = new aws.lambda.Function("orderServiceLambda", {
    runtime: "nodejs18.x",
    architectures: ["arm64"],  // Graviton2, cheaper than x86
    // ...
});
```

### RDS Cost Optimization

```typescript
// ✅ GOOD: Environment-appropriate RDS sizing
const dbInstanceClass = pulumi.getStack() === "prod" 
    ? "db.t3.medium"      // Production: 2 vCPU, 4 GB RAM
    : "db.t3.micro";      // Dev/Staging: 2 vCPU, 1 GB RAM

const dbInstance = new aws.rds.Instance("orderDb", {
    instanceClass: dbInstanceClass,
    allocatedStorage: pulumi.getStack() === "prod" ? 100 : 20,
    storageType: "gp3",  // gp3 is cheaper and more performant than gp2
    backupRetentionPeriod: pulumi.getStack() === "prod" ? 7 : 1,
    multiAz: pulumi.getStack() === "prod",  // Only prod needs multi-AZ
    // ...
});

// ❌ BAD: Over-provisioned for all environments
const dbInstance = new aws.rds.Instance("orderDb", {
    instanceClass: "db.r5.4xlarge",  // Massive (16 vCPU, 128 GB) even for dev!
    allocatedStorage: 1000,
    multiAz: true,  // Paying for multi-AZ in dev
});
```

### S3 Lifecycle Policies

```typescript
// ✅ GOOD: Lifecycle policies to reduce storage costs
const bucket = new aws.s3.Bucket("orderServiceBucket", {
    bucket: `order-service-${pulumi.getStack()}-data`,
    lifecycleRules: [{
        enabled: true,
        transitions: [{
            days: 90,
            storageClass: "STANDARD_IA"  // Move to infrequent access after 90 days
        }, {
            days: 180,
            storageClass: "GLACIER"  // Archive after 180 days
        }],
        expiration: {
            days: 365  // Delete after 1 year
        }
    }],
    // ...
});
```

### CloudWatch Log Retention

```typescript
// ✅ GOOD: Reasonable log retention (saves costs)
const logGroup = new aws.cloudwatch.LogGroup("orderServiceLogs", {
    name: `/aws/lambda/order-service-${pulumi.getStack()}-handler`,
    retentionInDays: pulumi.getStack() === "prod" ? 30 : 7,  // Shorter retention for non-prod
    tags: standardTags
});

// ❌ BAD: Never-expiring logs (costs grow indefinitely)
const logGroup = new aws.cloudwatch.LogGroup("orderServiceLogs", {
    name: `/aws/lambda/order-service-handler`,
    // Missing retentionInDays - logs kept forever!
});
```

---

## Resilience & High Availability

### Multi-AZ Database

```typescript
// ✅ GOOD: Multi-AZ RDS for production
const dbInstance = new aws.rds.Instance("orderDb", {
    instanceClass: "db.t3.medium",
    multiAz: pulumi.getStack() === "prod",  // HA in production
    backupRetentionPeriod: 7,
    backupWindow: "03:00-04:00",  // Low-traffic window
    maintenanceWindow: "sun:04:00-sun:05:00",
    deletionProtection: pulumi.getStack() === "prod",  // Prevent accidental deletion
    // ...
});
```

### Lambda in Multiple Subnets

```typescript
// ✅ GOOD: Lambda in multiple AZs for resilience
const lambda = new aws.lambda.Function("orderServiceLambda", {
    vpcConfig: {
        subnetIds: privateSubnets.map(s => s.id),  // Multiple subnets across AZs
        securityGroupIds: [lambdaSecurityGroup.id]
    },
    // ...
});

// ❌ BAD: Single subnet (single point of failure)
const lambda = new aws.lambda.Function("orderServiceLambda", {
    vpcConfig: {
        subnetIds: [privateSubnet1.id],  // Only one AZ
        securityGroupIds: [lambdaSecurityGroup.id]
    },
});
```

### DynamoDB Point-in-Time Recovery

```typescript
// ✅ GOOD: Enable PITR for DynamoDB
const table = new aws.dynamodb.Table("orderTable", {
    name: `order-service-${pulumi.getStack()}-orders`,
    billingMode: "PAY_PER_REQUEST",
    pointInTimeRecovery: {
        enabled: true  // Enable backup for disaster recovery
    },
    // ...
});
```

---

## Monitoring & Observability

### CloudWatch Alarms

```typescript
// ✅ GOOD: CloudWatch alarms for Lambda errors
const lambdaErrorAlarm = new aws.cloudwatch.MetricAlarm("lambdaErrorAlarm", {
    name: `${lambda.name}-errors`,
    comparisonOperator: "GreaterThanThreshold",
    evaluationPeriods: 2,
    metricName: "Errors",
    namespace: "AWS/Lambda",
    period: 60,
    statistic: "Sum",
    threshold: 5,  // Alert if >5 errors in 2 minutes
    dimensions: {
        FunctionName: lambda.name
    },
    alarmActions: [snsTopicArn],  // Send to SNS for notification
    tags: standardTags
});

// ✅ GOOD: Database CPU alarm
const dbCpuAlarm = new aws.cloudwatch.MetricAlarm("dbCpuAlarm", {
    name: `${dbInstance.identifier}-cpu`,
    comparisonOperator: "GreaterThanThreshold",
    evaluationPeriods: 2,
    metricName: "CPUUtilization",
    namespace: "AWS/RDS",
    period: 300,
    statistic: "Average",
    threshold: 80,  // Alert if CPU >80%
    dimensions: {
        DBInstanceIdentifier: dbInstance.identifier
    },
    alarmActions: [snsTopicArn]
});
```

### X-Ray Tracing

```typescript
// ✅ GOOD: Enable X-Ray tracing for Lambda
const lambda = new aws.lambda.Function("orderServiceLambda", {
    tracingConfig: {
        mode: "Active"  // Enable X-Ray distributed tracing
    },
    // ...
});

// Add X-Ray permissions to Lambda role
const xrayPolicy = new aws.iam.RolePolicy("lambdaXrayPolicy", {
    role: lambdaRole.id,
    policy: {
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: [
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords"
            ],
            Resource: "*"
        }]
    }
});
```

### CloudWatch Dashboards

```typescript
// ✅ GOOD: Custom CloudWatch dashboard
const dashboard = new aws.cloudwatch.Dashboard("orderServiceDashboard", {
    dashboardName: `order-service-${pulumi.getStack()}`,
    dashboardBody: JSON.stringify({
        widgets: [{
            type: "metric",
            properties: {
                metrics: [
                    ["AWS/Lambda", "Invocations", { stat: "Sum", label: "Invocations" }],
                    [".", "Errors", { stat: "Sum", label: "Errors" }],
                    [".", "Duration", { stat: "Average", label: "Avg Duration" }]
                ],
                period: 300,
                stat: "Average",
                region: aws.config.region,
                title: "Lambda Metrics"
            }
        }]
    })
});
```

---

## Network Architecture

### VPC Best Practices

```typescript
// ✅ GOOD: VPC with public and private subnets
const vpc = new aws.ec2.Vpc("orderServiceVpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: { ...standardTags, Name: `order-service-${pulumi.getStack()}-vpc` }
});

// Public subnets for NAT gateways, load balancers
const publicSubnet1 = new aws.ec2.Subnet("publicSubnet1", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "us-east-1a",
    mapPublicIpOnLaunch: true,
    tags: { ...standardTags, Name: "public-subnet-1a" }
});

// Private subnets for Lambda, RDS
const privateSubnet1 = new aws.ec2.Subnet("privateSubnet1", {
    vpcId: vpc.id,
    cidrBlock: "10.0.10.0/24",
    availabilityZone: "us-east-1a",
    tags: { ...standardTags, Name: "private-subnet-1a" }
});

const privateSubnet2 = new aws.ec2.Subnet("privateSubnet2", {
    vpcId: vpc.id,
    cidrBlock: "10.0.11.0/24",
    availabilityZone: "us-east-1b",
    tags: { ...standardTags, Name: "private-subnet-1b" }
});

// NAT Gateway for private subnet internet access
const eip = new aws.ec2.Eip("natEip", { vpc: true });
const natGateway = new aws.ec2.NatGateway("natGateway", {
    allocationId: eip.id,
    subnetId: publicSubnet1.id,
    tags: standardTags
});
```

### VPC Endpoints (Cost Savings)

```typescript
// ✅ GOOD: VPC endpoints to avoid NAT Gateway data transfer costs
const s3Endpoint = new aws.ec2.VpcEndpoint("s3Endpoint", {
    vpcId: vpc.id,
    serviceName: `com.amazonaws.${aws.config.region}.s3`,
    routeTableIds: [privateRouteTable.id],  // Associate with private route tables
    tags: standardTags
});

const dynamoEndpoint = new aws.ec2.VpcEndpoint("dynamoEndpoint", {
    vpcId: vpc.id,
    serviceName: `com.amazonaws.${aws.config.region}.dynamodb`,
    routeTableIds: [privateRouteTable.id],
    tags: standardTags
});

// Saves NAT Gateway data transfer costs for S3/DynamoDB access
```

---

## Lambda Configuration Patterns

### Environment Variables

```typescript
// ✅ GOOD: Environment variables for Lambda configuration
const lambda = new aws.lambda.Function("orderServiceLambda", {
    environment: {
        variables: {
            DB_SECRET_ARN: dbPassword.arn,
            LOG_LEVEL: pulumi.getStack() === "prod" ? "INFO" : "DEBUG",
            ENVIRONMENT: pulumi.getStack(),
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1"  // Reuse HTTP connections
        }
    },
    // ...
});

// ❌ BAD: Sensitive data in environment variables
const lambda = new aws.lambda.Function("orderServiceLambda", {
    environment: {
        variables: {
            DB_PASSWORD: "MyP@ssw0rd123"  // NEVER DO THIS
        }
    },
});
```

### Cold Start Optimization

```typescript
// ✅ GOOD: Provisioned concurrency for production (if needed)
const provisionedConcurrency = new aws.lambda.ProvisionedConcurrencyConfig("orderServiceProvisionedConcurrency", {
    functionName: lambda.name,
    qualifier: lambdaAlias.name,
    provisionedConcurrentExecutions: 5  // Keep 5 warm instances
});

// Only use if cold starts are problematic - adds cost!
// Better: Optimize code size, use layers, minimize dependencies
```

### Lambda Layers

```typescript
// ✅ GOOD: Use layers for shared dependencies
const nodeModulesLayer = new aws.lambda.LayerVersion("nodeModulesLayer", {
    layerName: `order-service-${pulumi.getStack()}-node-modules`,
    code: new pulumi.asset.FileArchive("./layers/node_modules"),
    compatibleRuntimes: ["nodejs18.x"],
    description: "Shared Node.js dependencies"
});

const lambda = new aws.lambda.Function("orderServiceLambda", {
    layers: [nodeModulesLayer.arn],
    // Reduces deployment package size, improves cold start
    // ...
});
```

---

## Database Patterns

### RDS PostgreSQL Configuration

```typescript
// ✅ GOOD: Production-ready RDS PostgreSQL
const dbSubnetGroup = new aws.rds.SubnetGroup("dbSubnetGroup", {
    subnetIds: privateSubnets.map(s => s.id),
    tags: standardTags
});

const dbInstance = new aws.rds.Instance("orderDb", {
    identifier: `order-service-${pulumi.getStack()}-db`,
    engine: "postgres",
    engineVersion: "15.3",
    instanceClass: pulumi.getStack() === "prod" ? "db.t3.medium" : "db.t3.micro",
    allocatedStorage: 100,
    storageType: "gp3",
    storageEncrypted: true,  // Encrypt at rest
    dbSubnetGroupName: dbSubnetGroup.name,
    vpcSecurityGroupIds: [dbSecurityGroup.id],
    username: "postgres",
    password: dbPasswordVersion.secretString,
    multiAz: pulumi.getStack() === "prod",
    backupRetentionPeriod: 7,
    backupWindow: "03:00-04:00",
    maintenanceWindow: "sun:04:00-sun:05:00",
    deletionProtection: pulumi.getStack() === "prod",
    skipFinalSnapshot: pulumi.getStack() !== "prod",
    finalSnapshotIdentifier: pulumi.getStack() === "prod" 
        ? `order-service-final-snapshot-${Date.now()}` 
        : undefined,
    enabledCloudwatchLogsExports: ["postgresql"],  // Send logs to CloudWatch
    performanceInsightsEnabled: pulumi.getStack() === "prod",
    tags: standardTags
});
```

### Connection Pooling

```typescript
// ✅ GOOD: RDS Proxy for connection pooling (Lambda)
const dbProxy = new aws.rds.Proxy("orderDbProxy", {
    name: `order-service-${pulumi.getStack()}-proxy`,
    engineFamily: "POSTGRESQL",
    auth: [{
        authScheme: "SECRETS",
        secretArn: dbPassword.arn
    }],
    roleArn: proxyRole.arn,
    vpcSubnetIds: privateSubnets.map(s => s.id),
    requireTls: true,
    tags: standardTags
});

// Lambda connects to proxy instead of database directly
// Proxy manages connection pooling, reduces connection overhead
```

---

## Integration for AI Agents

### For Pulumi Specialists

Load this skill to:
- Review Pulumi infrastructure code for security vulnerabilities
- Identify cost optimization opportunities
- Validate AWS best practices and Well-Architected Framework
- Check resilience and monitoring configuration
- Review compliance and tagging standards

Use alongside: **aws-patterns**, **code-review-patterns**, **avayler-context-technical**

### For AWS Specialists

Load this skill to:
- Understand how infrastructure is defined in Pulumi
- Review IaC security patterns
- Guide AWS service selection in IaC context

Use alongside: **aws-patterns**, **avayler-context-technical**

### For Technical Leads

Load this skill to:
- Review infrastructure architecture decisions
- Validate infrastructure standards
- Guide IaC best practices

Use alongside: **aws-patterns**, **code-review-patterns**

---

## Quick Reference Checklist

Before approving Pulumi infrastructure code:

- [ ] **Security**: No hardcoded secrets, S3 buckets private, IAM least privilege
- [ ] **Tagging**: All resources tagged (Service, Environment, ManagedBy, CostCenter)
- [ ] **Naming**: Consistent naming with environment suffix
- [ ] **Cost**: Right-sized resources, lifecycle policies, log retention
- [ ] **Resilience**: Multi-AZ for prod, backups enabled, deletion protection
- [ ] **Monitoring**: CloudWatch alarms, X-Ray tracing, logs exported
- [ ] **Network**: Resources in private subnets, security groups restrictive
- [ ] **Encryption**: Data encrypted at rest and in transit
- [ ] **Configuration**: Stack-specific config, no hardcoded values

---

## Summary

This skill provides comprehensive Pulumi Infrastructure as Code patterns for:
- Secure infrastructure (secrets management, IAM, encryption)
- Cost optimization (right-sizing, lifecycle policies, VPC endpoints)
- Resilience and high availability (multi-AZ, backups, disaster recovery)
- Monitoring and observability (CloudWatch, X-Ray, alarms, dashboards)
- Network architecture (VPC, subnets, security groups)
- Lambda optimization (cold starts, layers, environment variables)
- Database configuration (RDS, connection pooling, backups)
- Compliance and tagging standards

**Remember**: These patterns follow AWS Well-Architected Framework and are grounded in Avayler's serverless microservices architecture on AWS.
