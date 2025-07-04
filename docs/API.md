# API Documentation

## Overview

Think AI uses server actions for data mutations and API routes for external integrations. All actions include built-in authentication, error handling, and type safety.

## Server Actions

Server actions are the primary way to interact with the database and perform mutations. They run on the server and include automatic CSRF protection.

### Customer Actions

Located in `/actions/customers.ts`

#### `createCustomer`

Creates a new customer record in the database.

```typescript
async function createCustomer(input: {
  email: string
  stripeCustomerId?: string
}): Promise<ActionResponse<Customer>>
```

**Parameters:**
- `email` (required) - Customer email address
- `stripeCustomerId` (optional) - Stripe customer ID

**Returns:**
- `data` - Created customer object
- `error` - Error message if failed

**Example:**
```typescript
const result = await createCustomer({
  email: "user@example.com",
  stripeCustomerId: "cus_123"
})

if (result.error) {
  console.error(result.error)
} else {
  console.log(result.data)
}
```

#### `updateCustomer`

Updates an existing customer record.

```typescript
async function updateCustomer(input: {
  id: string
  email?: string
  role?: UserRole
  permissions?: string[]
  projectAccess?: string[]
}): Promise<ActionResponse<Customer>>
```

**Parameters:**
- `id` (required) - Customer ID (Clerk user ID)
- `email` (optional) - New email address
- `role` (optional) - User role
- `permissions` (optional) - Array of permission strings
- `projectAccess` (optional) - Array of project IDs

**Authentication:** Requires authenticated user

#### `getCustomerByEmail`

Retrieves a customer by email address.

```typescript
async function getCustomerByEmail(
  email: string
): Promise<ActionResponse<Customer>>
```

**Parameters:**
- `email` (required) - Customer email address

**Returns:**
- Customer object or null if not found

#### `getCustomerById`

Retrieves a customer by ID.

```typescript
async function getCustomerById(
  id: string
): Promise<ActionResponse<Customer>>
```

**Parameters:**
- `id` (required) - Customer ID (Clerk user ID)

### Stripe Actions

Located in `/actions/stripe.ts`

#### `createCheckoutSession`

Creates a Stripe checkout session for subscription.

```typescript
async function createCheckoutSession(input: {
  priceId: string
  customerEmail: string
  successUrl: string
  cancelUrl: string
}): Promise<ActionResponse<{ url: string }>>
```

**Parameters:**
- `priceId` (required) - Stripe price ID
- `customerEmail` (required) - Customer email
- `successUrl` (required) - Redirect URL on success
- `cancelUrl` (required) - Redirect URL on cancel

**Returns:**
- `url` - Stripe checkout URL

**Example:**
```typescript
const session = await createCheckoutSession({
  priceId: "price_123",
  customerEmail: "user@example.com",
  successUrl: "https://app.com/success",
  cancelUrl: "https://app.com/cancel"
})

if (session.data) {
  window.location.href = session.data.url
}
```

#### `createBillingPortalSession`

Creates a Stripe billing portal session for subscription management.

```typescript
async function createBillingPortalSession(
  customerId: string
): Promise<ActionResponse<{ url: string }>>
```

**Parameters:**
- `customerId` (required) - Stripe customer ID

**Returns:**
- `url` - Billing portal URL

**Authentication:** Requires authenticated user with matching customer ID

#### `updateSubscription`

Updates subscription details in the database.

```typescript
async function updateSubscription(input: {
  customerId: string
  subscriptionId: string
  priceId: string
  currentPeriodEnd: Date
}): Promise<ActionResponse<Customer>>
```

**Parameters:**
- `customerId` (required) - Customer ID
- `subscriptionId` (required) - Stripe subscription ID
- `priceId` (required) - Stripe price ID
- `currentPeriodEnd` (required) - Subscription end date

**Usage:** Called by Stripe webhook handler

## API Routes

### Stripe Webhook

**Endpoint:** `POST /api/stripe/webhooks`

Handles Stripe webhook events for subscription lifecycle.

**Headers Required:**
- `stripe-signature` - Stripe webhook signature

**Handled Events:**
- `checkout.session.completed` - New subscription created
- `invoice.payment_succeeded` - Subscription renewed
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled

**Response:**
- `200 OK` - Event processed successfully
- `400 Bad Request` - Invalid signature or payload

**Security:** Validates webhook signature using `STRIPE_WEBHOOK_SECRET`

## Role-Based Access Control

All server actions respect role-based permissions. Use the following utilities:

### Check Role

```typescript
import { checkRole } from "@/lib/roles"

// In server action
const isAdmin = await checkRole("admin")
if (!isAdmin) {
  return { error: "Unauthorized", data: null }
}
```

### Check Permission

```typescript
import { checkPermission } from "@/lib/roles"

// In server action
const canEdit = await checkPermission("projects:edit")
if (!canEdit) {
  return { error: "Insufficient permissions", data: null }
}
```

### Available Permissions

```typescript
type Permission = 
  | "projects:create"
  | "projects:edit"
  | "projects:delete"
  | "projects:view"
  | "scripts:create"
  | "scripts:edit"
  | "scripts:delete"
  | "scripts:view"
  | "storyboards:create"
  | "storyboards:edit"
  | "storyboards:view"
  | "team:manage"
  | "team:view"
  | "analytics:view"
  | "users:manage"
```

## Error Handling

All server actions follow a consistent error handling pattern:

```typescript
type ActionResponse<T> = {
  data: T | null
  error: string | null
}
```

### Common Error Responses

```typescript
// Unauthenticated
{ data: null, error: "Unauthorized" }

// Insufficient permissions
{ data: null, error: "Insufficient permissions" }

// Validation error
{ data: null, error: "Invalid email address" }

// Database error
{ data: null, error: "Failed to create customer" }

// Not found
{ data: null, error: "Customer not found" }
```

### Error Handling Example

```typescript
// Client component
async function handleSubmit() {
  const result = await createCustomer({ email })
  
  if (result.error) {
    toast.error(result.error)
    return
  }
  
  toast.success("Customer created!")
  router.push("/dashboard")
}
```

## Type Safety

All server actions are fully typed with TypeScript:

```typescript
// Import types
import type { Customer, UserRole } from "@/db/schema"
import type { ActionResponse } from "@/types"

// Use in components
const [customer, setCustomer] = useState<Customer | null>(null)

// Type-safe responses
const result: ActionResponse<Customer> = await getCustomerById(id)
```

## Rate Limiting

Server actions include built-in protection:

- Authentication required for most actions
- CSRF protection via Next.js
- Input validation before database operations
- Error messages don't expose sensitive data

## Best Practices

### 1. Always Handle Errors

```typescript
const result = await serverAction()
if (result.error) {
  // Handle error appropriately
  return
}
// Continue with success case
```

### 2. Use Loading States

```typescript
const [isLoading, setIsLoading] = useState(false)

async function handleAction() {
  setIsLoading(true)
  try {
    const result = await serverAction()
    // Handle result
  } finally {
    setIsLoading(false)
  }
}
```

### 3. Validate Inputs Client-Side

```typescript
// Use zod or similar for validation
const schema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "writer", "producer"])
})

const validated = schema.safeParse(input)
if (!validated.success) {
  // Show validation errors
  return
}
```

### 4. Use Optimistic Updates

```typescript
// Optimistically update UI
setCustomers([...customers, newCustomer])

// Then sync with server
const result = await createCustomer(newCustomer)
if (result.error) {
  // Revert optimistic update
  setCustomers(customers)
}
```

## Testing Server Actions

### Unit Testing

```typescript
// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(() => ({
    id: "user_123",
    emailAddresses: [{ emailAddress: "test@example.com" }]
  }))
}))

// Test action
describe("createCustomer", () => {
  it("creates customer with valid input", async () => {
    const result = await createCustomer({
      email: "test@example.com"
    })
    
    expect(result.error).toBeNull()
    expect(result.data?.email).toBe("test@example.com")
  })
})
```

### Integration Testing

```typescript
// Test with real database
beforeEach(async () => {
  await db.delete(customers)
})

it("creates and retrieves customer", async () => {
  const created = await createCustomer({
    email: "test@example.com"
  })
  
  const retrieved = await getCustomerByEmail("test@example.com")
  
  expect(retrieved.data?.id).toBe(created.data?.id)
})
```

## Extending the API

### Adding New Server Actions

1. Create action file in `/actions/[module].ts`
2. Implement with consistent error handling
3. Add authentication checks
4. Export with proper types
5. Document in this file

### Example Template

```typescript
"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/db"
import { checkPermission } from "@/lib/roles"

export async function createProject(input: {
  name: string
  description?: string
}): Promise<ActionResponse<Project>> {
  try {
    // 1. Authenticate
    const user = await currentUser()
    if (!user) {
      return { data: null, error: "Unauthorized" }
    }
    
    // 2. Check permissions
    const canCreate = await checkPermission("projects:create")
    if (!canCreate) {
      return { data: null, error: "Insufficient permissions" }
    }
    
    // 3. Validate input
    if (!input.name || input.name.trim().length === 0) {
      return { data: null, error: "Project name is required" }
    }
    
    // 4. Perform operation
    const [project] = await db.insert(projects).values({
      id: generateId(),
      name: input.name,
      description: input.description,
      ownerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()
    
    // 5. Return success
    return { data: project, error: null }
    
  } catch (error) {
    console.error("Failed to create project:", error)
    return { data: null, error: "Failed to create project" }
  }
}
```

This completes the API documentation for Think AI's server actions and endpoints.