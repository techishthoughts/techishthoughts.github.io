---
title: 'Advanced TypeScript Patterns: Building Type-Safe Applications at Scale'
date: 2024-01-18T14:30:00Z
draft: false
authors: ['lucas-oliveira']
description: 'Master advanced TypeScript patterns including mapped types, conditional types, and template literal types to build robust, type-safe applications that scale.'
categories: ['backend', 'typescript']
tags: ['typescript', 'patterns', 'type-safety', 'advanced', 'generics']
---

TypeScript has evolved far beyond simple type annotations. Modern TypeScript offers a sophisticated type system that can catch complex bugs at compile time and provide incredible developer experience. Let's explore advanced patterns that will elevate your TypeScript skills.

## The Evolution of TypeScript's Type System

TypeScript's type system has become incredibly powerful, allowing us to express complex relationships and constraints that were previously impossible. These advanced patterns aren't just academic exercises—they're practical tools for building more reliable software.

### Why Advanced Types Matter

```typescript
// Basic typing - good start
interface User {
  id: string;
  name: string;
  email: string;
}

// Advanced typing - catches more bugs
interface User {
  readonly id: UUID;
  name: NonEmptyString;
  email: Email;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type UUID = string & { readonly brand: unique symbol };
type NonEmptyString = string & { readonly brand: unique symbol };
type Email = string & { readonly brand: unique symbol };
type Timestamp = number & { readonly brand: unique symbol };
```

## Pattern 1: Mapped Types for API Transformations

Mapped types allow you to create new types by transforming existing ones. This is incredibly useful for API responses and data transformations.

### Basic Mapped Types

```typescript
// Transform all properties to optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Transform all properties to required
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Real-world example: API response transformation
interface DatabaseUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transform for API response
type APIUser = {
  [K in keyof DatabaseUser]: DatabaseUser[K] extends Date
    ? string
    : DatabaseUser[K];
};
// Result: { id: number; firstName: string; ...; createdAt: string; updatedAt: string; }
```

### Advanced Mapped Types with Key Remapping

```typescript
// Remove specific properties
type OmitProperties<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// Prefix all property names
type PrefixProperties<T, Prefix extends string> = {
  [K in keyof T as `${Prefix}${Capitalize<string & K>}`]: T[K];
};

// Example usage
interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

type EnvironmentConfig = PrefixProperties<Config, 'env'>;
// Result: { envApiUrl: string; envTimeout: number; envRetries: number; }
```

## Pattern 2: Conditional Types for Smart Inference

Conditional types enable type-level programming, allowing types to change based on conditions.

### Basic Conditional Types

```typescript
type IsArray<T> = T extends any[] ? true : false;

type Test1 = IsArray<string[]>; // true
type Test2 = IsArray<string>; // false

// More practical example: API response handling
type APIResponse<T> = T extends { error: any }
  ? { success: false; error: T['error'] }
  : { success: true; data: T };

// Usage
type UserResponse = APIResponse<{ id: string; name: string }>;
// Result: { success: true; data: { id: string; name: string } }

type ErrorResponse = APIResponse<{ error: string }>;
// Result: { success: false; error: string }
```

### Distributed Conditional Types

```typescript
// Extract array element types
type Flatten<T> = T extends (infer U)[] ? U : T;

type StringArray = Flatten<string[]>; // string
type NumberType = Flatten<number>; // number

// Practical example: Event handler types
type EventMap = {
  click: MouseEvent;
  keydown: KeyboardEvent;
  resize: Event;
};

type EventHandler<T extends keyof EventMap> = (event: EventMap[T]) => void;

// Type-safe event handlers
const handleClick: EventHandler<'click'> = event => {
  // event is properly typed as MouseEvent
  console.log(event.clientX, event.clientY);
};
```

## Pattern 3: Template Literal Types for String Manipulation

Template literal types provide compile-time string manipulation capabilities.

### Building Dynamic Property Names

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;
type CSSProperty<T extends string> = `--${T}`;

// Create event handler types
type ButtonEvents = EventName<'click' | 'hover' | 'focus'>;
// Result: "onClick" | "onHover" | "onFocus"

// CSS custom properties
type ThemeProperties = CSSProperty<'primary-color' | 'secondary-color'>;
// Result: "--primary-color" | "--secondary-color"
```

### Advanced String Manipulation

```typescript
// Convert camelCase to kebab-case
type CamelToKebab<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '-' : ''}${Lowercase<T>}${CamelToKebab<U>}`
  : S;

type KebabCase = CamelToKebab<'backgroundColor'>;
// Result: "background-color"

// URL parameter extraction
type ExtractRouteParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type RouteParams = ExtractRouteParams<'/users/:userId/posts/:postId'>;
// Result: "userId" | "postId"
```

## Pattern 4: Recursive Types for Complex Data Structures

TypeScript supports recursive types, enabling sophisticated data structure modeling.

### JSON Schema Validation

```typescript
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// Type-safe JSON parsing
function parseJSON<T extends JSONValue>(json: string): T {
  return JSON.parse(json) as T;
}

// Usage with strong typing
interface APIResponse {
  users: Array<{
    id: number;
    name: string;
    metadata: JSONValue;
  }>;
}

const response = parseJSON<APIResponse>('{"users": [...]}');
```

### Tree Structures

```typescript
interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}

// Type-safe tree traversal
function traverseTree<T>(
  node: TreeNode<T>,
  callback: (value: T) => void
): void {
  callback(node.value);
  node.children?.forEach(child => traverseTree(child, callback));
}

// Usage
const fileTree: TreeNode<string> = {
  value: 'src',
  children: [
    { value: 'components', children: [{ value: 'Button.tsx' }] },
    { value: 'utils', children: [{ value: 'helpers.ts' }] },
  ],
};

traverseTree(fileTree, filename => console.log(filename));
```

## Pattern 5: Brand Types for Enhanced Type Safety

Brand types prevent accidentally mixing similar primitive types.

### Implementing Brand Types

```typescript
declare const __brand: unique symbol;

type Brand<T, TBrand extends string> = T & {
  readonly [__brand]: TBrand;
};

// Create branded types
type UserId = Brand<string, 'UserId'>;
type ProductId = Brand<string, 'ProductId'>;
type Email = Brand<string, 'Email'>;

// Constructor functions
const createUserId = (id: string): UserId => id as UserId;
const createProductId = (id: string): ProductId => id as ProductId;
const createEmail = (email: string): Email => {
  if (!email.includes('@')) {
    throw new Error('Invalid email format');
  }
  return email as Email;
};

// Type-safe usage
function getUserById(userId: UserId): Promise<User> {
  // Implementation
  return fetch(`/api/users/${userId}`).then(r => r.json());
}

function getProductById(productId: ProductId): Promise<Product> {
  // Implementation
  return fetch(`/api/products/${productId}`).then(r => r.json());
}

// This prevents bugs!
const userId = createUserId('user-123');
const productId = createProductId('product-456');

getUserById(userId); // ✅ Correct
getUserById(productId); // ❌ Type error - prevents bug!
```

## Pattern 6: Function Overloading with Conditional Types

Create flexible APIs that adapt based on input types.

### Dynamic Return Types

```typescript
interface SearchOptions {
  includeDeleted?: boolean;
  limit?: number;
}

function search<T extends SearchOptions>(
  query: string,
  options?: T
): T extends { includeDeleted: true }
  ? Array<{ item: any; deleted: boolean }>
  : Array<any>;

function search(query: string, options: SearchOptions = {}) {
  // Implementation here
  if (options.includeDeleted) {
    return []; // Returns items with deleted flag
  }
  return []; // Returns regular items
}

// Usage with smart return type inference
const regularResults = search('test'); // Array<any>
const withDeleted = search('test', { includeDeleted: true }); // Array<{ item: any; deleted: boolean }>
```

### Form Validation with Conditional Types

```typescript
type ValidationRule<T> = {
  required?: boolean;
  validator?: (value: T) => boolean;
  message?: string;
};

type FormSchema<T> = {
  [K in keyof T]: ValidationRule<T[K]>;
};

type ValidationResult<T> = {
  [K in keyof T]: T[K] extends { required: true }
    ? string | null
    : string | null | undefined;
};

function validateForm<T extends Record<string, any>>(
  data: T,
  schema: FormSchema<T>
): ValidationResult<T> {
  // Implementation
  const result = {} as ValidationResult<T>;

  for (const key in schema) {
    const rule = schema[key];
    const value = data[key];

    if (rule.required && !value) {
      result[key] = rule.message || (`${key} is required` as any);
    } else if (rule.validator && !rule.validator(value)) {
      result[key] = rule.message || (`${key} is invalid` as any);
    } else {
      result[key] = null as any;
    }
  }

  return result;
}
```

## Real-World Application: Type-Safe API Client

Let's combine these patterns to build a sophisticated, type-safe API client:

```typescript
// Base types
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type APIEndpoint = `/${string}`;

// Route configuration
interface RouteConfig<
  TMethod extends HTTPMethod,
  TPath extends APIEndpoint,
  TParams = unknown,
  TResponse = unknown,
> {
  method: TMethod;
  path: TPath;
  params?: TParams;
  response: TResponse;
}

// Extract parameters from path
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};

// API client
class TypeSafeAPIClient<
  TRoutes extends Record<string, RouteConfig<any, any, any, any>>,
> {
  constructor(private routes: TRoutes) {}

  async call<TRouteName extends keyof TRoutes>(
    routeName: TRouteName,
    ...[params]: TRoutes[TRouteName]['params'] extends undefined
      ? []
      : [TRoutes[TRouteName]['params']]
  ): Promise<TRoutes[TRouteName]['response']> {
    const route = this.routes[routeName];

    // Build URL with parameters
    let url = route.path;
    if (params) {
      Object.entries(params as Record<string, any>).forEach(([key, value]) => {
        url = url.replace(`:${key}`, String(value)) as APIEndpoint;
      });
    }

    // Make request
    const response = await fetch(url, {
      method: route.method,
      body: route.method !== 'GET' ? JSON.stringify(params) : undefined,
    });

    return response.json();
  }
}

// Usage
const apiRoutes = {
  getUser: {
    method: 'GET' as const,
    path: '/users/:userId' as const,
    params: {} as { userId: string },
    response: {} as { id: string; name: string; email: string },
  },
  createPost: {
    method: 'POST' as const,
    path: '/posts' as const,
    params: {} as { title: string; content: string },
    response: {} as { id: string; title: string },
  },
} satisfies Record<string, RouteConfig<any, any, any, any>>;

const apiClient = new TypeSafeAPIClient(apiRoutes);

// Type-safe API calls
const user = await apiClient.call('getUser', { userId: '123' });
// user is typed as { id: string; name: string; email: string }

const post = await apiClient.call('createPost', {
  title: 'Hello',
  content: 'World',
});
// post is typed as { id: string; title: string }
```

## Performance Considerations

Advanced TypeScript patterns can impact compilation performance:

### Best Practices for Performance

1. **Limit recursion depth**: TypeScript has limits on recursive type instantiation
2. **Use type aliases**: Cache complex types to avoid recomputation
3. **Prefer interfaces over types**: For object shapes, interfaces are more performant
4. **Use conditional types sparingly**: Complex conditional types can slow compilation

```typescript
// Good: Simple and cached
type CachedUserType = User & { permissions: Permission[] };

// Avoid: Complex nested conditionals
type ComplexType<T> = T extends A
  ? T extends B
    ? T extends C
      ? D
      : E
    : F
  : G;
```

## Conclusion

Advanced TypeScript patterns unlock incredible power for building robust, maintainable applications. These patterns help you:

- **Catch bugs at compile time** instead of runtime
- **Improve developer experience** with better autocomplete and refactoring
- **Express complex business logic** in the type system
- **Build more maintainable codebases** with self-documenting types

Start incorporating these patterns gradually. Begin with branded types and mapped types, then progress to conditional and template literal types as you become more comfortable.

> 🎯 **Next Steps**: Try implementing a type-safe state machine using these patterns. Combine conditional types with template literals to create a fully typed workflow system.

The investment in learning advanced TypeScript patterns pays dividends in code quality, developer productivity, and bug prevention. Your future self (and your teammates) will thank you!

What advanced TypeScript patterns have you found most useful in your projects? Share your experiences and examples in the comments!
