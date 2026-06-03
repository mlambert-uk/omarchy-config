---
name: avaylerflow-react-patterns
description: Deep React and TypeScript patterns for hooks, state management, performance optimization, accessibility, and data fetching with React Query. Use when reviewing React code.
license: MIT
compatibility: opencode
metadata:
  audience: technical-agents
  domain: react-typescript
  applies-to: [react-reviewer, technical-lead]
---

## What I do

Provide comprehensive React and TypeScript patterns, anti-patterns, and best practices for component architecture, hooks, state management, performance optimization, accessibility, and data fetching with React Query.

## When to use me

**Load this skill when:**
- Reviewing React or TypeScript component code
- Assessing hooks usage and Rules of Hooks compliance
- Checking React Query/data fetching patterns
- Validating performance optimizations (memo, useMemo, useCallback)
- Reviewing accessibility compliance (a11y, ARIA, semantic HTML)
- Checking state management patterns
- Assessing component architecture and composition

**All React code review agents should load this skill.**

## Component Architecture

### Component displayName (Required for Debugging)

**CRITICAL**: All components MUST have `displayName` set for better debuggability in React DevTools.

```typescript
// ✅ GOOD: Component with displayName
const OrderCard = ({ order }: OrderCardProps) => {
  return (
    <div className="order-card">
      <h3>{order.title}</h3>
    </div>
  );
};
OrderCard.displayName = 'OrderCard';

// ✅ GOOD: Named function component (displayName auto-set)
export function OrderCard({ order }: OrderCardProps) {
  return <div>{order.title}</div>;
}

// ❌ BAD: Anonymous arrow function (no displayName)
export default ({ order }) => {
  return <div>{order.title}</div>;
};
```

**Why This Matters**:
- React DevTools shows component names in the tree
- Error stack traces include component names
- Debugging performance issues requires identifying components
- Essential for component hierarchy visualization

### Component Types

```typescript
// ✅ GOOD: Presentational component (UI-only) with displayName
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {label}
    </button>
  );
};
Button.displayName = 'Button';

// ✅ GOOD: Container component (logic + data)
export const OrderListContainer: React.FC = () => {
  const { data: orders, isLoading, error } = useOrders();
  const navigate = useNavigate();
  
  const handleOrderClick = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };
  
  if (isLoading) return <OrderListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <OrderList orders={orders} onOrderClick={handleOrderClick} />;
};
OrderListContainer.displayName = 'OrderListContainer';

// ❌ BAD: Mixed presentation and logic (god component)
export const OrderPage: React.FC = () => {
  // Too much responsibility: data fetching, business logic, AND presentation
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchOrders().then(setOrders).finally(() => setLoading(false));
  }, []);
  
  return (
    <div className="order-page">
      {/* Mixing logic and presentation */}
      {loading ? <Spinner /> : (
        orders.map(order => (
          <div key={order.id} onClick={() => navigate(`/orders/${order.id}`)}>
            {/* ... complex rendering logic ... */}
          </div>
        ))
      )}
    </div>
  );
};
```

### Component Composition

```typescript
// ✅ GOOD: Composition over complex components
export const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <Card>
      <CardHeader>
        <OrderStatus status={order.status} />
        <OrderId id={order.id} />
      </CardHeader>
      <CardBody>
        <OrderItems items={order.items} />
        <OrderTotal total={order.total} />
      </CardBody>
      <CardFooter>
        <OrderActions orderId={order.id} status={order.status} />
      </CardFooter>
    </Card>
  );
};
OrderCard.displayName = 'OrderCard';

// ❌ BAD: Monolithic component (hard to test, reuse, maintain)
export const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="card">
      <div className="card-header">
        <span className={`status status-${order.status.toLowerCase()}`}>
          {order.status}
        </span>
        <span className="order-id">#{order.id}</span>
      </div>
      <div className="card-body">
        {order.items.map(item => (
          <div key={item.id} className="order-item">
            {/* ... nested complexity ... */}
          </div>
        ))}
        <div className="total">${order.total}</div>
      </div>
      {/* ... more complexity ... */}
    </div>
  );
};
```

---

## JavaScript Standards (ESNext)

### Modern Array Methods (CRITICAL)

**REQUIRED**: Use ESNext functional array methods (`.map()`, `.filter()`, `.reduce()`, `.find()`, `.some()`, `.every()`) for immutable data transformations.

**FORBIDDEN**: Never use `.forEach()` - it's been superseded by functional methods and has no return value.

**ALLOWED**: `for...of` and `for...in` loops are acceptable in **mutable contexts** (e.g., within `useMemo` computations, utility functions outside React, or performance-critical sections).

```typescript
// ✅ GOOD: Functional array methods (preferred for immutable data)
const activeOrders = orders.filter(order => order.status === 'active');
const orderIds = orders.map(order => order.id);
const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
const hasActiveOrders = orders.some(order => order.status === 'active');

// ✅ ACCEPTABLE: for...of in mutable contexts (useMemo, utility functions)
const calculateOrderStats = useMemo(() => {
  const stats = { total: 0, active: 0, cancelled: 0 };
  for (const order of orders) {
    stats.total++;
    if (order.status === 'active') stats.active++;
    if (order.status === 'cancelled') stats.cancelled++;
  }
  return stats;
}, [orders]);

// ✅ ACCEPTABLE: for...of in utility functions outside React
function groupOrdersByStatus(orders: Order[]): Map<string, Order[]> {
  const grouped = new Map<string, Order[]>();
  for (const order of orders) {
    const statusOrders = grouped.get(order.status) || [];
    statusOrders.push(order);
    grouped.set(order.status, statusOrders);
  }
  return grouped;
}

// ❌ BAD: Using .forEach() (FORBIDDEN - superseded by functional methods)
const activeOrders: Order[] = [];
orders.forEach(order => {
  if (order.status === 'active') {
    activeOrders.push(order);  // Use .filter() instead
  }
});

// ❌ BAD: forEach has no return value
const orderIds: number[] = [];
orders.forEach(order => orderIds.push(order.id));  // Use .map() instead
```

**Why This Matters**:
- **Prefer functional methods** (`.map()`, `.filter()`, etc.) for immutable data transformations
- `.forEach()` is imperative, mutation-based, and has been superseded
- Functional methods are declarative, chainable, and composable
- `for...of` is acceptable when working with mutable data structures in controlled contexts
- Better performance with JIT optimization and immutable patterns

### Optional Chaining and Nullish Coalescing

```typescript
// ✅ GOOD: Optional chaining
const customerName = order?.customer?.name ?? 'Unknown';
const firstItemPrice = order?.items?.[0]?.price ?? 0;

// ❌ BAD: Manual null checks
const customerName = order && order.customer && order.customer.name 
  ? order.customer.name 
  : 'Unknown';
```

---

## Internationalization (i18n) - REQUIRED

### Translation Pattern (Mandatory for All Text)

**CRITICAL**: ALL user-facing text MUST use i18n translations. Raw text is FORBIDDEN.

```typescript
// ✅ GOOD: Using i18n translations
import { useTranslation } from 'react-i18next';

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const { t } = useTranslation();
  
  return (
    <div className="order-card">
      <h3>{t('orders.card.title')}</h3>
      <p>{t('orders.card.customer', { name: order.customerName })}</p>
      <span className="status">
        {t('orders.status.{{status}}', { status: order.status })}
      </span>
      <button onClick={handleCancel}>
        {t('orders.actions.cancel')}
      </button>
    </div>
  );
};
OrderCard.displayName = 'OrderCard';

// ❌ BAD: Raw text (NOT TRANSLATABLE - FORBIDDEN)
const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="order-card">
      <h3>Order Details</h3>  {/* FORBIDDEN */}
      <p>Customer: {order.customerName}</p>  {/* FORBIDDEN */}
      <button>Cancel Order</button>  {/* FORBIDDEN */}
    </div>
  );
};
```

**Translation File Structure**:

```json
// client/src/locales/en/translation.json
{
  "orders": {
    "card": {
      "title": "Order Details",
      "customer": "Customer: {{name}}"
    },
    "status": {
      "pending": "Pending",
      "completed": "Completed",
      "cancelled": "Cancelled"
    },
    "actions": {
      "cancel": "Cancel Order",
      "edit": "Edit Order",
      "view": "View Details"
    }
  }
}

// client/src/locales/en-GB/translation.json
{
  "orders": {
    "card": {
      "title": "Order Details",
      "customer": "Customer: {{name}}"
    },
    "status": {
      "pending": "Pending",
      "completed": "Completed",
      "cancelled": "Cancelled"
    },
    "actions": {
      "cancel": "Cancel Order",
      "edit": "Edit Order",
      "view": "View Details"
    }
  }
}
```

**Translation Key Naming Convention**:
- Use dot notation: `feature.component.element`
- Example: `orders.card.title`, `customers.list.emptyState`
- Keep keys semantic and hierarchical

**Interpolation**:
```typescript
// ✅ GOOD: Variable interpolation
{t('orders.card.total', { amount: order.total.toFixed(2) })}

// Translation file:
{
  "orders": {
    "card": {
      "total": "Total: £{{amount}}"
    }
  }
}
```

---

## Forms and Validation (react-hook-form + zod)

### Form Pattern (REQUIRED for All Forms)

**CRITICAL**: ALL forms MUST use `react-hook-form` with `zod` validation schemas.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

// ✅ GOOD: Zod schema for validation
const createOrderSchema = z.object({
  customerId: z.number().min(1, 'Customer is required'),
  items: z.array(z.object({
    productId: z.number().min(1),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0)
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  deliveryDate: z.date().min(new Date(), 'Delivery date must be in the future')
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

// ✅ GOOD: react-hook-form with zod
const CreateOrderForm: React.FC = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors }, control } = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      items: [{ productId: 0, quantity: 1, price: 0 }]
    }
  });
  
  const onSubmit = async (data: CreateOrderFormData) => {
    // Data is fully validated by zod
    await createOrder(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="customerId">{t('orders.form.customer')}</label>
        <input id="customerId" type="number" {...register('customerId', { valueAsNumber: true })} />
        {errors.customerId && <span className="error">{errors.customerId.message}</span>}
      </div>
      
      <div>
        <label htmlFor="notes">{t('orders.form.notes')}</label>
        <textarea id="notes" {...register('notes')} />
      </div>
      
      <button type="submit">{t('orders.actions.create')}</button>
    </form>
  );
};
CreateOrderForm.displayName = 'CreateOrderForm';

// ❌ BAD: Manual validation (inconsistent, error-prone)
const CreateOrderForm: React.FC = () => {
  const [customerId, setCustomerId] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Manual validation - BAD!
    if (!customerId) {
      setError('Customer is required');
      return;
    }
    
    // No type safety, no schema
  };
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};
```

**Zod Schema Best Practices**:
- Define schema at module level (reusable)
- Use `z.infer` to extract TypeScript types
- Provide clear error messages
- Validate business rules (min/max, patterns, custom validators)

---

## UI Component Library (Ant Design)

### Ant Design Components (REQUIRED)

**CRITICAL**: ALL UI components MUST use Ant Design. Custom components are FORBIDDEN unless approved.

```typescript
// ✅ GOOD: Using Ant Design components
import { Button, Form, Input, Select, DatePicker, Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const CreateOrderForm: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  const handleSubmit = async (values: CreateOrderFormData) => {
    await createOrder(values);
  };
  
  return (
    <Card>
      <Title level={2}>{t('orders.form.title')}</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="customerId"
          label={t('orders.form.customer')}
          rules={[{ required: true, message: t('orders.validation.customerRequired') }]}
        >
          <Select placeholder={t('orders.form.selectCustomer')}>
            <Select.Option value={1}>Customer A</Select.Option>
            <Select.Option value={2}>Customer B</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="deliveryDate"
          label={t('orders.form.deliveryDate')}
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item name="notes" label={t('orders.form.notes')}>
          <Input.TextArea rows={4} placeholder={t('orders.form.notesPlaceholder')} />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {t('orders.actions.create')}
            </Button>
            <Button onClick={() => form.resetFields()}>
              {t('common.actions.reset')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};
CreateOrderForm.displayName = 'CreateOrderForm';

// ❌ BAD: Custom form components (inconsistent UX - FORBIDDEN)
const CreateOrderForm: React.FC = () => {
  return (
    <div className="custom-form">
      <CustomInput label="Customer" />  {/* FORBIDDEN */}
      <CustomButton>Submit</CustomButton>  {/* FORBIDDEN */}
    </div>
  );
};
```

**Ant Design Component Usage Rules**:
- Use `<Button>` for all buttons (with `type` prop: primary, default, dashed, text, link)
- Use `<Form>` with `Form.Item` for all forms
- Use `<Input>`, `<Select>`, `<DatePicker>`, `<Checkbox>`, `<Radio>` for form fields
- Use `<Card>` for content containers
- Use `<Space>` for layout spacing
- Use `<Typography>` (`Title`, `Text`, `Paragraph`) for text
- Use `<Table>` for data tables
- Use `<Modal>` for dialogs
- Use `<Drawer>` for side panels

---

## Mutation Feedback (useNotifications)

### Success/Error Handling Pattern (REQUIRED)

**CRITICAL**: ALL mutations MUST use `useNotifications` hook for success/error feedback.

```typescript
// ✅ GOOD: Using useNotifications for mutation feedback
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/hooks/useNotifications';
import { useTranslation } from 'react-i18next';

const CreateOrderForm: React.FC = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();
  
  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderRequest) => api.orders.create(data),
    onSuccess: (newOrder) => {
      showSuccess(t('orders.notifications.createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      showError(t('orders.notifications.createError'));
      console.error('Order creation failed:', error);
    }
  });
  
  const handleSubmit = async (data: CreateOrderFormData) => {
    await createOrderMutation.mutateAsync(data);
  };
  
  return <Form onFinish={handleSubmit}>{/* ... */}</Form>;
};
CreateOrderForm.displayName = 'CreateOrderForm';

// ❌ BAD: Using console.log or alert (FORBIDDEN)
const handleSubmit = async (data: CreateOrderFormData) => {
  try {
    await createOrder(data);
    alert('Order created!');  // FORBIDDEN - poor UX
  } catch (error) {
    console.log(error);  // FORBIDDEN - user sees nothing
  }
};

// ❌ BAD: Using Ant Design notification directly (inconsistent)
const handleSubmit = async (data: CreateOrderFormData) => {
  try {
    await createOrder(data);
    notification.success({ message: 'Order created!' });  // FORBIDDEN - use useNotifications
  } catch (error) {
    notification.error({ message: 'Error' });  // FORBIDDEN
  }
};
```

**useNotifications Hook API**:
```typescript
const { showSuccess, showError, showInfo, showWarning } = useNotifications();

// Success notification
showSuccess(message: string, description?: string);

// Error notification
showError(message: string, description?: string);

// Info notification
showInfo(message: string, description?: string);

// Warning notification
showWarning(message: string, description?: string);
```

**Translation Keys for Notifications**:
```json
{
  "orders": {
    "notifications": {
      "createSuccess": "Order created successfully",
      "createError": "Failed to create order. Please try again.",
      "updateSuccess": "Order updated successfully",
      "updateError": "Failed to update order",
      "deleteSuccess": "Order deleted successfully",
      "deleteError": "Failed to delete order"
    }
  }
}
```

---

## BFF API Integration (Axios Helpers + Zod)

### Validated API Requests (REQUIRED)

**CRITICAL**: ALL BFF API calls MUST use the `axiosRequest` helper with zod validation.

```typescript
// ✅ GOOD: Using axiosRequest with zod validation
import { axiosRequest } from '@/server/src/utils/axiosHelpers';
import { z } from 'zod';

// Define request/response schemas
const createOrderRequestSchema = z.object({
  customerId: z.number(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    price: z.number()
  })),
  notes: z.string().optional()
});

const orderResponseSchema = z.object({
  id: z.number(),
  customerId: z.number(),
  items: z.array(z.object({
    id: z.number(),
    productId: z.number(),
    quantity: z.number(),
    price: z.number()
  })),
  total: z.number(),
  status: z.enum(['pending', 'completed', 'cancelled']),
  createdAt: z.string().datetime()
});

type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
type OrderResponse = z.infer<typeof orderResponseSchema>;

// ✅ API client with schema validation
export const ordersApi = {
  async create(data: CreateOrderRequest): Promise<OrderResponse> {
    return await axiosRequest({
      method: 'POST',
      url: '/api/orders',
      data,
      schema: orderResponseSchema  // Validates backend response
    });
  },
  
  async getById(orderId: number): Promise<OrderResponse> {
    return await axiosRequest({
      method: 'GET',
      url: `/api/orders/${orderId}`,
      schema: orderResponseSchema  // Validates backend response
    });
  },
  
  async update(orderId: number, data: Partial<CreateOrderRequest>): Promise<OrderResponse> {
    return await axiosRequest({
      method: 'PATCH',
      url: `/api/orders/${orderId}`,
      data,
      schema: orderResponseSchema  // Validates backend response
    });
  }
};

// ✅ ALTERNATIVE: Using template parameter for manual typing (if schema unavailable)
export const ordersApi = {
  async create(data: CreateOrderRequest): Promise<OrderResponse> {
    return await axiosRequest<OrderResponse>({
      method: 'POST',
      url: '/api/orders',
      data
      // No schema = manual type assertion (less safe, use only when necessary)
    });
  }
};

// ❌ BAD: Raw axios without validation (FORBIDDEN)
export const ordersApi = {
  async create(data: any) {  // No type safety!
    const response = await axios.post('/api/orders', data);
    return response.data;  // No validation!
  }
};

// ❌ BAD: Manual validation (inconsistent)
export const ordersApi = {
  async create(data: CreateOrderRequest) {
    const response = await axios.post('/api/orders', data);
    // Manual validation - error-prone
    if (!response.data.id) {
      throw new Error('Invalid response');
    }
    return response.data;
  }
};
```

**Axios Helper API** (from `server/src/utils/axiosHelpers.ts`):

```typescript
// axiosRequest function signature
function axiosRequest<T>(config: {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  params?: any;
  schema?: z.ZodSchema<T>;  // Optional: validates response with zod
  // ... other standard axios config options
}): Promise<T>

// Usage patterns:
// 1. With schema validation (PREFERRED)
const order = await axiosRequest({
  method: 'GET',
  url: '/api/orders/123',
  schema: orderResponseSchema
});

// 2. With template parameter (manual typing)
const order = await axiosRequest<OrderResponse>({
  method: 'GET',
  url: '/api/orders/123'
});
```

**Why This Matters**:
- Type safety for request/response data
- Runtime validation prevents invalid data
- Consistent error handling
- API contract enforcement
- Prevents runtime errors from invalid responses

---

## React Hooks Patterns

### Rules of Hooks

**Critical rules to enforce:**

1. **Only call hooks at the top level** (not in conditionals, loops, or nested functions)
2. **Only call hooks from React functions** (components or custom hooks)
3. **Dependency arrays must be complete** (include all used values)

```typescript
// ❌ BAD: Hook inside conditional
function OrderDetails({ orderId }: Props) {
  if (orderId) {
    const { data } = useOrder(orderId);  // BREAKS RULES OF HOOKS!
  }
}

// ✅ GOOD: Hook at top level, conditional inside
function OrderDetails({ orderId }: Props) {
  const { data } = useOrder(orderId ?? 0);  // Hook at top level
  
  if (!orderId) {
    return <EmptyState />;
  }
  
  return <OrderView order={data} />;
}

// ❌ BAD: Hook in loop
function OrderList({ orderIds }: Props) {
  return orderIds.map(id => {
    const { data } = useOrder(id);  // BREAKS RULES OF HOOKS!
    return <OrderCard key={id} order={data} />;
  });
}

// ✅ GOOD: Component with hook, mapped normally
function OrderList({ orderIds }: Props) {
  return orderIds.map(id => <OrderCardContainer key={id} orderId={id} />);
}

function OrderCardContainer({ orderId }: { orderId: number }) {
  const { data } = useOrder(orderId);  // Hook at top level of component
  return <OrderCard order={data} />;
}
```

### useState Patterns

```typescript
// ✅ GOOD: Immutable state updates
const [items, setItems] = useState<Item[]>([]);

// Add item
setItems(prev => [...prev, newItem]);

// Update item
setItems(prev => prev.map(item => 
  item.id === updatedItem.id ? updatedItem : item
));

// Remove item
setItems(prev => prev.filter(item => item.id !== removedId));

// ❌ BAD: Mutating state directly
const [items, setItems] = useState<Item[]>([]);

items.push(newItem);  // MUTATION! React won't detect change
setItems(items);  // Won't trigger re-render reliably

// ✅ GOOD: Functional update for complex state
const [count, setCount] = useState(0);

setCount(prev => prev + 1);  // Safe when based on previous state

// ❌ BAD: Using current state value directly
setCount(count + 1);  // Can cause race conditions

// ✅ GOOD: Object state updates (immutable)
const [user, setUser] = useState({ name: '', email: '' });

setUser(prev => ({ ...prev, email: 'new@example.com' }));

// ❌ BAD: Mutating object state
user.email = 'new@example.com';  // MUTATION!
setUser(user);  // Won't work
```

### useEffect Patterns

```typescript
// ✅ GOOD: Complete dependency array
useEffect(() => {
  fetchOrders(customerId, filter);
}, [customerId, filter]);  // All dependencies listed

// ❌ BAD: Missing dependencies (ESLint will warn)
useEffect(() => {
  fetchOrders(customerId, filter);
}, [customerId]);  // Missing 'filter' - stale closure bug!

// ✅ GOOD: Cleanup function for subscriptions
useEffect(() => {
  const subscription = orderService.subscribe(orderId, handleUpdate);
  
  return () => {
    subscription.unsubscribe();  // Cleanup
  };
}, [orderId]);

// ❌ BAD: No cleanup (memory leak!)
useEffect(() => {
  orderService.subscribe(orderId, handleUpdate);
  // Missing cleanup - subscription never unsubscribed
}, [orderId]);

// ✅ GOOD: Empty dependency array for one-time effect
useEffect(() => {
  // Runs once on mount
  initializeApp();
}, []);

// ❌ BAD: Data fetching in useEffect (use React Query instead)
useEffect(() => {
  setLoading(true);
  fetchOrders()
    .then(setOrders)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

// ✅ BETTER: Use React Query
const { data: orders, isLoading, error } = useQuery({
  queryKey: ['orders'],
  queryFn: fetchOrders
});
```

### useMemo and useCallback

```typescript
// ✅ GOOD: Memoize expensive calculations
const expensiveResult = useMemo(() => {
  return orders
    .filter(order => order.status === 'active')
    .map(order => calculateComplexMetrics(order))
    .reduce((sum, val) => sum + val, 0);
}, [orders]);

// ❌ BAD: No memoization for expensive calculation (recalculates every render)
const expensiveResult = orders
  .filter(order => order.status === 'active')
  .map(order => calculateComplexMetrics(order))
  .reduce((sum, val) => sum + val, 0);

// ✅ GOOD: useCallback for callbacks passed to children
const handleOrderClick = useCallback((orderId: number) => {
  navigate(`/orders/${orderId}`);
}, [navigate]);

return <OrderList orders={orders} onOrderClick={handleOrderClick} />;

// ❌ BAD: New function reference every render (causes unnecessary re-renders)
return <OrderList 
  orders={orders} 
  onOrderClick={(id) => navigate(`/orders/${id}`)}  // New function every render!
/>;

// ✅ GOOD: Memoize objects/arrays to prevent unnecessary re-renders
const filterConfig = useMemo(() => ({
  status: 'active',
  dateRange: dateRange
}), [dateRange]);

// ❌ BAD: New object reference every render
const filterConfig = {  // New object every render
  status: 'active',
  dateRange: dateRange
};
```

### Custom Hooks

```typescript
// ✅ GOOD: Custom hook for reusable logic
function useOrders(customerId: number) {
  return useQuery({
    queryKey: ['orders', customerId],
    queryFn: () => fetchOrders(customerId),
    enabled: customerId > 0
  });
}

// Usage
const { data: orders, isLoading } = useOrders(customerId);

// ✅ GOOD: Custom hook with local state
function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);
  
  return [value, toggle];
}

// Usage
const [isOpen, toggleOpen] = useToggle();

// ✅ GOOD: Custom hook extracting complex logic
function useOrderFilters() {
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    dateRange: null
  });
  
  const updateStatus = useCallback((status: OrderStatus) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);
  
  const updateDateRange = useCallback((dateRange: DateRange) => {
    setFilters(prev => ({ ...prev, dateRange }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({ status: 'all', dateRange: null });
  }, []);
  
  return {
    filters,
    updateStatus,
    updateDateRange,
    clearFilters
  };
}
```

---

## React Query (TanStack Query) Patterns

### Basic Query

```typescript
// ✅ GOOD: React Query for data fetching
function OrderList() {
  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.orders.getAll(),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes (formerly cacheTime)
  });
  
  if (isLoading) return <OrderListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <OrderTable orders={orders} onRefresh={refetch} />;
}

// ❌ BAD: Manual data fetching with useEffect
function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    setLoading(true);
    api.orders.getAll()
      .then(setOrders)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  // Manual loading/error handling, no caching, no refetch...
}
```

### Query with Parameters

```typescript
// ✅ GOOD: Parameterized query with proper key
function OrderDetails({ orderId }: Props) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['orders', orderId],  // Include parameter in key
    queryFn: () => api.orders.getById(orderId),
    enabled: orderId > 0,  // Don't fetch if orderId is invalid
  });
  
  if (!orderId) return <EmptyState />;
  if (isLoading) return <Skeleton />;
  
  return <OrderView order={order} />;
}

// ✅ GOOD: Multiple parameters in query key
const { data } = useQuery({
  queryKey: ['orders', customerId, { status, dateRange }],
  queryFn: () => api.orders.getByCustomer(customerId, { status, dateRange }),
  enabled: customerId > 0
});
```

### Mutations

```typescript
// ✅ GOOD: Mutation with optimistic update and invalidation
function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newOrder: CreateOrderRequest) => api.orders.create(newOrder),
    onMutate: async (newOrder) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      
      // Snapshot previous value
      const previousOrders = queryClient.getQueryData(['orders']);
      
      // Optimistically update
      queryClient.setQueryData(['orders'], (old: Order[]) => [
        ...old,
        { ...newOrder, id: -1, status: 'pending' }  // Temporary ID
      ]);
      
      return { previousOrders };
    },
    onError: (err, newOrder, context) => {
      // Rollback on error
      queryClient.setQueryData(['orders'], context?.previousOrders);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
}

// Usage
const createOrder = useCreateOrder();

const handleSubmit = async (order: CreateOrderRequest) => {
  try {
    await createOrder.mutateAsync(order);
    toast.success('Order created');
  } catch (error) {
    toast.error('Failed to create order');
  }
};

// ❌ BAD: Manual mutation without cache invalidation
const handleSubmit = async (order: CreateOrderRequest) => {
  await api.orders.create(order);
  // Cache now stale! User won't see new order without manual refetch
};
```

### Dependent Queries

```typescript
// ✅ GOOD: Dependent queries with enabled
function OrderWithCustomer({ orderId }: Props) {
  const { data: order } = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => api.orders.getById(orderId)
  });
  
  const { data: customer } = useQuery({
    queryKey: ['customers', order?.customerId],
    queryFn: () => api.customers.getById(order!.customerId),
    enabled: !!order?.customerId  // Only fetch when order is loaded
  });
  
  return <OrderCustomerView order={order} customer={customer} />;
}
```

---

## Performance Optimization

### React.memo

```typescript
// ✅ GOOD: Memoize component to prevent unnecessary re-renders
export const OrderCard = React.memo<{ order: Order; onClick: (id: number) => void }>(
  ({ order, onClick }) => {
    return (
      <Card onClick={() => onClick(order.id)}>
        <h3>{order.title}</h3>
        <p>{order.description}</p>
      </Card>
    );
  }
);

// ❌ BAD: No memoization - re-renders every time parent renders
export const OrderCard: React.FC<{ order: Order; onClick: (id: number) => void }> = 
  ({ order, onClick }) => {
    // Re-renders even if order and onClick haven't changed
    return <Card onClick={() => onClick(order.id)}>...</Card>;
  };

// ✅ GOOD: Custom comparison function
export const OrderCard = React.memo(
  ({ order, onClick }: Props) => {
    return <Card>...</Card>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.order.id === nextProps.order.id &&
           prevProps.order.updatedAt === nextProps.order.updatedAt;
  }
);
```

### Key Prop in Lists

```typescript
// ✅ GOOD: Stable key using ID
<ul>
  {orders.map(order => (
    <OrderCard key={order.id} order={order} />
  ))}
</ul>

// ❌ BAD: Index as key (causes bugs with reordering/filtering)
<ul>
  {orders.map((order, index) => (
    <OrderCard key={index} order={order} />  // BAD!
  ))}
</ul>

// ❌ BAD: Random key (defeats React's reconciliation)
<ul>
  {orders.map(order => (
    <OrderCard key={Math.random()} order={order} />  // TERRIBLE!
  ))}
</ul>
```

### Code Splitting

```typescript
// ✅ GOOD: Route-level code splitting
import { lazy, Suspense } from 'react';

const OrderListPage = lazy(() => import('./pages/OrderListPage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
      </Routes>
    </Suspense>
  );
}

// ✅ GOOD: Component-level code splitting for large components
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart data={data} />
      </Suspense>
    </div>
  );
}
```

---

## Accessibility (a11y) Patterns

### Semantic HTML

```typescript
// ✅ GOOD: Semantic HTML elements
function OrderList() {
  return (
    <main>
      <header>
        <h1>Orders</h1>
      </header>
      <nav aria-label="Order filters">
        <button type="button">Active</button>
        <button type="button">Completed</button>
      </nav>
      <section>
        <ul>
          {orders.map(order => (
            <li key={order.id}>
              <article>
                <h2>{order.title}</h2>
                <p>{order.description}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

// ❌ BAD: Div soup (no semantic meaning)
function OrderList() {
  return (
    <div className="main">
      <div className="header">
        <div className="title">Orders</div>
      </div>
      <div className="nav">
        <div onClick={handleClick}>Active</div>
        <div onClick={handleClick}>Completed</div>
      </div>
      <div className="content">
        {orders.map(order => (
          <div key={order.id} className="order">
            <div className="order-title">{order.title}</div>
            <div>{order.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### ARIA Attributes

```typescript
// ✅ GOOD: Proper ARIA labels
<button
  type="button"
  aria-label="Close dialog"
  onClick={onClose}
>
  <CloseIcon aria-hidden="true" />
</button>

<input
  type="search"
  aria-label="Search orders"
  aria-describedby="search-help"
  placeholder="Search..."
/>
<p id="search-help">Enter order ID or customer name</p>

// ✅ GOOD: ARIA live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {isLoading ? 'Loading...' : `${orders.length} orders found`}
</div>

// ✅ GOOD: ARIA expanded for collapsible content
<button
  type="button"
  aria-expanded={isOpen}
  aria-controls="order-details"
  onClick={toggleOpen}
>
  {isOpen ? 'Hide' : 'Show'} Details
</button>
<div id="order-details" hidden={!isOpen}>
  {/* Details */}
</div>
```

### Keyboard Navigation

```typescript
// ✅ GOOD: Keyboard accessible interactive elements
function OrderCard({ order, onSelect }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(order.id);
    }
  };
  
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(order.id)}
      onKeyDown={handleKeyDown}
      aria-label={`Select order ${order.id}`}
    >
      {order.title}
    </div>
  );
}

// ❌ BAD: Click-only, not keyboard accessible
function OrderCard({ order, onSelect }: Props) {
  return (
    <div onClick={() => onSelect(order.id)}>  // No keyboard support!
      {order.title}
    </div>
  );
}
```

---

## TypeScript Type Safety

### Component Props

```typescript
// ✅ GOOD: Explicit prop types with interfaces
interface OrderCardProps {
  order: Order;
  onClick: (orderId: number) => void;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onClick,
  variant = 'compact',
  className
}) => {
  // TypeScript ensures type safety
};

// ❌ BAD: Using 'any' type
export const OrderCard: React.FC<any> = ({ order, onClick }) => {
  // No type safety!
};

// ✅ GOOD: Event handler types
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // Typed event
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  console.log(event.target.value);
};
```

### Generic Components

```typescript
// ✅ GOOD: Generic component for reusability
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// Usage with type inference
<List
  items={orders}
  renderItem={(order) => <OrderCard order={order} />}  // 'order' is typed as Order
  keyExtractor={(order) => order.id}
/>
```

---

## Error Handling

### Error Boundaries

```typescript
// ✅ GOOD: Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<OrderPageError />}>
  <OrderDetailsPage />
</ErrorBoundary>
```

---

## Integration for AI Agents

### For React Reviewers

Load this skill to:
- Validate Rules of Hooks compliance
- Identify performance issues and optimization opportunities
- Check accessibility compliance
- Review React Query patterns
- Assess component architecture
- Check TypeScript type safety

Use alongside: **avayler-context-technical**, **code-review-patterns**

### For Technical Leads

Load this skill to:
- Guide React architecture decisions
- Establish React coding standards
- Review frontend patterns in PRs
- Mentor developers on React best practices

Use alongside: **avayler-context-technical**, **code-review-patterns**

---

## Quick Reference Checklist

Before approving React code:

### **CRITICAL (Must-Have)**
- [ ] **displayName**: ALL components have displayName set
- [ ] **i18n**: ALL text uses `useTranslation()` (no raw text)
- [ ] **Forms**: react-hook-form + zod validation (no manual validation)
- [ ] **API Calls**: Axios helpers with zod validation (no raw axios)
- [ ] **UI Components**: Ant Design components (no custom UI)
- [ ] **Notifications**: useNotifications for mutations (no console.log/alert)
- [ ] **ESNext**: Modern array methods (no .forEach())

### **React Best Practices**
- [ ] **Hooks**: Rules of Hooks followed, complete dependency arrays
- [ ] **Performance**: React.memo/useMemo/useCallback used appropriately
- [ ] **Keys**: Stable keys in lists (not index)
- [ ] **Data Fetching**: React Query instead of useEffect
- [ ] **State**: Immutable updates, state as local as possible
- [ ] **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- [ ] **TypeScript**: No 'any', proper prop types, typed events
- [ ] **Error Handling**: Error boundaries at route level
- [ ] **Component Size**: Components < 300 lines, split if larger
- [ ] **Composition**: Presentational vs container separation

---

## Summary

This skill provides comprehensive React and TypeScript patterns for:
- Component architecture and composition
- React Hooks (useState, useEffect, useMemo, useCallback, custom hooks)
- React Query for data fetching and caching
- Performance optimization (memo, code splitting)
- Accessibility (semantic HTML, ARIA, keyboard navigation)
- TypeScript type safety
- Error handling with Error Boundaries

**Remember**: These patterns are grounded in React 18+ best practices and Avayler's frontend architecture.
