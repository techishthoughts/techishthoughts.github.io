---
title: 'The Actor Model on the JVM: Part 2 - The Pitfalls of Shared State'
date: 2025-03-02T10:00:00Z
draft: false
author: 'arthur-costa'
tags:
  [
    'Java',
    'Concurrency',
    'Multithreading',
    'Actor Model',
    'Performance',
    'Synchronization',
  ]
categories: ['Concurrency', 'Software Architecture']
description: 'Deep dive into the specific problems that arise when dealing with shared mutable state in multithreaded environments and why traditional synchronization approaches fall short.'
image: '/images/posts/actor-model-part-2.jpg'
series: 'Actor Model on the JVM'
series_order: 2
reading_time: 10
featured: true
---

In our previous article, we explored the historical evolution of Object-Oriented Programming and touched on the challenges it faces in concurrent environments. Today, we'll dive deep into the specific headaches that emerge when multiple threads interact with shared mutable state – problems that have plagued developers for decades.

## The Fundamental Problem: Shared Mutable State

Imagine Arthur and Maria both trying to purchase the last available ticket for a concert through a web application. Both click "Buy Now" at exactly the same time. What happens next illustrates the core challenges of concurrent programming:

```java
public class TicketService {
    private int availableTickets = 1; // Only one ticket left

    public boolean purchaseTicket(String customerName) {
        if (availableTickets > 0) {
            // Danger zone: Another thread could execute here!
            simulateProcessingTime(); // Credit card processing, etc.
            availableTickets--;
            System.out.println(customerName + " successfully purchased a ticket!");
            return true;
        }
        System.out.println("Sorry " + customerName + ", no tickets available.");
        return false;
    }
}
```

Without proper synchronization, both Arthur and Maria might see `availableTickets > 0`, leading to both "successfully" purchasing the same ticket.

## The Four Horsemen of Concurrent Programming

When multiple threads interact with shared state, four primary problems can arise, each more insidious than the last.

### 1. Race Conditions

**Race conditions** occur when the outcome of a program depends on the timing and interleaving of threads. The ticket example above is a classic race condition.

```java
// Thread 1: Arthur's purchase
if (availableTickets > 0) { // Reads 1
    // Thread 2 executes here and also reads 1
    availableTickets--; // Sets to 0
}

// Thread 2: Maria's purchase
if (availableTickets > 0) { // This was 1 when checked!
    availableTickets--; // Sets to -1 (!!)
}
```

The result? The system thinks it sold two tickets when only one was available, leading to data corruption and unhappy customers.

### 2. Deadlocks

**Deadlocks** happen when two or more threads are blocked forever, waiting for each other to release resources:

```java
public class DeadlockExample {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();

    public void method1() {
        synchronized(lock1) {
            System.out.println("Thread 1: Holding lock1...");
            synchronized(lock2) {
                System.out.println("Thread 1: Holding lock1 & lock2...");
            }
        }
    }

    public void method2() {
        synchronized(lock2) {
            System.out.println("Thread 2: Holding lock2...");
            synchronized(lock1) { // Deadlock here!
                System.out.println("Thread 2: Holding lock2 & lock1...");
            }
        }
    }
}
```

If Thread 1 acquires `lock1` while Thread 2 acquires `lock2`, they'll wait forever for each other.

### 3. Livelocks

**Livelocks** are similar to deadlocks, but threads aren't blocked – they're actively trying to resolve the conflict, creating an infinite loop of politeness:

```java
// Two people in a narrow corridor, both stepping aside continuously
public void avoidCollision(Person other) {
    while (isBlocking(other)) {
        moveAside(); // Both people keep moving aside
        Thread.yield(); // Being "polite"
    }
}
```

The threads remain active but make no progress, like two people in a hallway both stepping left and right in sync.

### 4. Starvation

**Starvation** occurs when a thread is perpetually denied access to resources it needs:

```java
public class PriorityQueue {
    public synchronized void processHighPriority() {
        // High-priority tasks keep getting processed
        while (hasHighPriorityTasks()) {
            processNext();
        }
    }

    public synchronized void processLowPriority() {
        // This might never execute if high-priority tasks keep coming!
        processNext();
    }
}
```

Low-priority threads might wait indefinitely while high-priority threads continuously grab resources.

## Traditional Solutions and Their Limitations

Java provides several mechanisms to handle these issues, but each comes with trade-offs:

### Synchronized Keywords

```java
public synchronized boolean purchaseTicket(String customerName) {
    // Thread-safe, but creates a bottleneck
    // Only one thread can execute this method at a time
}
```

**Pros**: Simple, prevents race conditions
**Cons**: Poor scalability, potential for deadlocks

### Volatile Fields

```java
private volatile boolean isAvailable = true;
```

**Pros**: Ensures visibility of changes across threads
**Cons**: Only works for single operations, doesn't prevent race conditions in complex operations

### Atomic Classes

```java
private AtomicInteger availableTickets = new AtomicInteger(1);

public boolean purchaseTicket(String customerName) {
    if (availableTickets.getAndDecrement() > 0) {
        return true;
    }
    availableTickets.incrementAndGet(); // Rollback
    return false;
}
```

**Pros**: Better performance than synchronized
**Cons**: Limited to simple operations, doesn't solve complex coordination

## The Caching Conundrum

Modern applications often add caching layers for performance, which introduces additional complexity:

```java
public class CachedTicketService {
    private final Map<String, Integer> cache = new ConcurrentHashMap<>();
    private final Database database;

    public boolean purchaseTicket(String event) {
        Integer cached = cache.get(event);
        if (cached != null && cached > 0) {
            // Cache hit, but is this data still valid?
            // Another instance might have sold tickets!
            return processPurchase(event);
        }
        // Cache miss, check database
        return checkDatabaseAndPurchase(event);
    }
}
```

Now we have to worry about:

- **Cache invalidation** across multiple instances
- **Consistency** between cache and database
- **Distributed locking** in clustered environments

## Why OOP Struggles with Concurrency

Object-Oriented Programming's core principle of encapsulation assumes that objects can protect their internal state. But when multiple threads access the same object, this protection breaks down:

1. **Encapsulation isn't enough**: Private fields don't protect against concurrent access
2. **Method-level synchronization is too coarse**: It creates unnecessary bottlenecks
3. **Complex object graphs require complex locking**: Leading to deadlock risks
4. **Inheritance complicates thread safety**: Subclasses might break parent class assumptions

## The Mental Model Problem

Perhaps the biggest challenge is that shared mutable state requires developers to think about **all possible interleavings** of thread execution. This quickly becomes mentally overwhelming:

- With 2 threads and 3 operations each, there are 20 possible execution orders
- With 3 threads and 4 operations each, there are 369,600 possible execution orders
- With realistic applications having hundreds of threads... the complexity explodes

## A Different Path Forward

The Actor Model addresses these problems by eliminating shared mutable state entirely. Instead of multiple threads accessing the same data:

- **Each actor owns its state completely**
- **Communication happens only through messages**
- **No locks, no race conditions, no deadlocks**
- **Natural fault isolation and supervision**

Consider how our ticket service might look with actors:

```java
// Conceptual Actor-based approach
public class TicketActor extends AbstractActor {
    private int availableTickets = 1;

    @Override
    public Receive createReceive() {
        return receiveBuilder()
            .match(PurchaseRequest.class, this::handlePurchase)
            .build();
    }

    private void handlePurchase(PurchaseRequest request) {
        if (availableTickets > 0) {
            availableTickets--;
            getSender().tell(new PurchaseSuccess(), getSelf());
        } else {
            getSender().tell(new PurchaseFailure("No tickets available"), getSelf());
        }
    }
}
```

No synchronization keywords, no locks, no race conditions – just simple, sequential processing of messages.

## Looking Ahead

The problems we've explored today – race conditions, deadlocks, livelocks, and starvation – have plagued concurrent programming for decades. Traditional OOP solutions, while functional, often create more complexity than they solve.

In our next article, we'll explore how the Actor Model provides elegant solutions to these challenges and dive into practical implementation patterns using Akka and Apache Pekko on the JVM.

The journey from shared mutable state to message-passing architectures isn't just about avoiding bugs – it's about building systems that are inherently more scalable, maintainable, and resilient to failure.

---

_Next up in Part 3: We'll implement a complete Actor-based system, explore supervision strategies, and see how message-passing eliminates the concurrency pitfalls we've discussed today._
