---
title: 'The Actor Model on the JVM: Part 3 - The Final Chapter'
date: 2025-07-19T10:00:00Z
draft: false
author: 'arthur-costa'
tags:
  [
    'Actor Model',
    'Akka',
    'Apache Pekko',
    'Java',
    'Scala',
    'Concurrency',
    'WebSocket',
    'Testing',
  ]
categories: ['Concurrency', 'Software Architecture']
description: 'Complete implementation guide to the Actor Model with advanced patterns, testing strategies, and real-world lessons learned from building scalable concurrent systems.'
image: '/images/posts/actor-model-part-3.jpg'
series: 'Actor Model on the JVM'
series_order: 3
reading_time: 15
featured: true
---

Welcome to the final chapter of our Actor Model journey. We've explored the historical challenges of OOP in concurrent environments and dissected the specific pitfalls of shared mutable state. Now it's time to roll up our sleeves and build a complete Actor-based system, exploring advanced patterns, testing strategies, and the real-world lessons that only come from production experience.

## Concurrency on the JVM: The Challenge Recap

As we discussed in our previous articles, concurrency on the JVM is notoriously tricky. Threads, locks, and shared state can quickly turn even simple systems into a mess of bugs and bottlenecks. The Actor Model offers a fundamentally different approach that eliminates these problems at the architectural level.

## Core Principles of the Actor Model

Before diving into implementation, let's solidify our understanding of what makes the Actor Model special. Actors bring several key principles to concurrent programming:

### 1. Encapsulation

Each actor completely owns its internal state. No external code can directly access or modify actor data – all interaction happens through messages.

### 2. Message Passing

Actors communicate exclusively through asynchronous message passing. This eliminates the need for locks and prevents race conditions.

### 3. Isolation

Actors are isolated from each other. A failure in one actor doesn't directly crash others, providing natural fault tolerance.

### 4. Supervision

Actors are organized in hierarchies where parent actors supervise their children, providing structured error handling and recovery.

### 5. Location Transparency

Actors can communicate with each other regardless of whether they're in the same JVM, different processes, or even different machines.

## From Akka to Apache Pekko

For our implementation, we'll use **Apache Pekko**, the community-driven successor to Akka. After Lightbend changed Akka's licensing model in 2022, the Apache Software Foundation created Pekko as a fully open-source alternative.

**Why Apache Pekko?**

- **Truly open source** with Apache 2.0 license
- **Active community** development
- **API compatibility** with Akka 2.6.x
- **Regular updates** and security patches
- **Enterprise-friendly** licensing

## Setting Up Your Actor System

Let's start with the basic dependencies for a Scala project:

```scala
// build.sbt
libraryDependencies ++= Seq(
  "org.apache.pekko" %% "pekko-actor-typed" % "1.0.2",
  "org.apache.pekko" %% "pekko-stream" % "1.0.2",
  "org.apache.pekko" %% "pekko-http" % "1.0.1",
  "org.apache.pekko" %% "pekko-testkit" % "1.0.2" % Test
)
```

## Building a Real-World Example: WebSocket Chat System

Let's build something practical – a WebSocket-based chat system that demonstrates key Actor Model concepts.

### 1. Simple Actor Pattern

First, let's create a basic user actor that manages individual chat sessions:

```scala
import org.apache.pekko.actor.typed.{ActorRef, Behavior}
import org.apache.pekko.actor.typed.scaladsl.Behaviors

object UserActor {
  sealed trait Command
  case class SendMessage(content: String, replyTo: ActorRef[MessageSent]) extends Command
  case class MessageReceived(from: String, content: String) extends Command

  sealed trait Event
  case class MessageSent(success: Boolean) extends Event

  def apply(username: String): Behavior[Command] = {
    Behaviors.receive { (context, message) =>
      message match {
        case SendMessage(content, replyTo) =>
          context.log.info(s"$username sending: $content")
          // Process message (validation, persistence, etc.)
          replyTo ! MessageSent(true)
          Behaviors.same

        case MessageReceived(from, content) =>
          context.log.info(s"$username received from $from: $content")
          // Handle incoming message (display, notifications, etc.)
          Behaviors.same
      }
    }
  }
}
```

### 2. Stateful Actor Pattern

Now let's create a chat room actor that maintains state about connected users:

```scala
object ChatRoomActor {
  sealed trait Command
  case class Join(username: String, userActor: ActorRef[UserActor.Command], replyTo: ActorRef[JoinResult]) extends Command
  case class Leave(username: String) extends Command
  case class BroadcastMessage(from: String, content: String) extends Command

  sealed trait Event
  case class JoinResult(success: Boolean, message: String) extends Event

  def apply(): Behavior[Command] = chatRoom(Map.empty)

  private def chatRoom(users: Map[String, ActorRef[UserActor.Command]]): Behavior[Command] = {
    Behaviors.receive { (context, message) =>
      message match {
        case Join(username, userActor, replyTo) =>
          if (users.contains(username)) {
            replyTo ! JoinResult(false, s"Username $username already taken")
            Behaviors.same
          } else {
            context.log.info(s"$username joined the chat")
            replyTo ! JoinResult(true, s"Welcome $username!")

            // Notify existing users
            users.values.foreach(_ ! UserActor.MessageReceived("System", s"$username joined"))

            chatRoom(users + (username -> userActor))
          }

        case Leave(username) =>
          context.log.info(s"$username left the chat")
          users.values.foreach(_ ! UserActor.MessageReceived("System", s"$username left"))
          chatRoom(users - username)

        case BroadcastMessage(from, content) =>
          context.log.info(s"Broadcasting message from $from: $content")
          users.foreach { case (username, userActor) =>
            if (username != from) {
              userActor ! UserActor.MessageReceived(from, content)
            }
          }
          Behaviors.same
      }
    }
  }
}
```

### 3. Supervision Strategies

One of the Actor Model's most powerful features is its supervision hierarchy. Let's implement a supervisor that manages our chat system:

```scala
import org.apache.pekko.actor.typed.{SupervisorStrategy, DeathPactException}
import scala.concurrent.duration._

object ChatSystemSupervisor {
  sealed trait Command
  case class StartChatRoom(name: String, replyTo: ActorRef[ChatRoomStarted]) extends Command

  case class ChatRoomStarted(roomActor: ActorRef[ChatRoomActor.Command])

  def apply(): Behavior[Command] = {
    Behaviors.receive { (context, message) =>
      message match {
        case StartChatRoom(name, replyTo) =>
          val chatRoom = context.spawn(
            Behaviors.supervise(ChatRoomActor())
              .onFailure[Exception](
                SupervisorStrategy.restart.withLimit(3, 1.minute)
              ),
            s"chatroom-$name"
          )

          replyTo ! ChatRoomStarted(chatRoom)
          Behaviors.same
      }
    }
  }
}
```

This supervisor will:

- **Restart** failed chat rooms up to 3 times within 1 minute
- **Escalate** to parent if restart limit is exceeded
- **Preserve** the actor hierarchy structure

## System Monitoring and Observability

Production Actor systems need comprehensive monitoring. Here's how to add observability:

### Custom Metrics Actor

```scala
import org.apache.pekko.actor.typed.scaladsl.TimerScheduler

object MetricsActor {
  sealed trait Command
  case class RecordMessage(roomName: String, username: String) extends Command
  case object PrintStats extends Command

  def apply(): Behavior[Command] = {
    Behaviors.withTimers { timers =>
      timers.startTimerWithFixedDelay(PrintStats, 30.seconds)
      metricsCollector(Map.empty, 0)
    }
  }

  private def metricsCollector(roomStats: Map[String, Int], totalMessages: Int): Behavior[Command] = {
    Behaviors.receive { (context, message) =>
      message match {
        case RecordMessage(roomName, username) =>
          val currentCount = roomStats.getOrElse(roomName, 0)
          metricsCollector(
            roomStats + (roomName -> (currentCount + 1)),
            totalMessages + 1
          )

        case PrintStats =>
          context.log.info(s"Total messages: $totalMessages")
          roomStats.foreach { case (room, count) =>
            context.log.info(s"Room $room: $count messages")
          }
          Behaviors.same
      }
    }
  }
}
```

## WebSocket Integration

Let's connect our Actor system to the real world through WebSockets:

```scala
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.http.scaladsl.model.ws.{Message, TextMessage}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.stream.scaladsl.{Flow, Sink, Source}

class WebSocketChatServer(chatRoom: ActorRef[ChatRoomActor.Command])(implicit system: ActorSystem[_]) {

  def createWebSocketFlow(username: String): Flow[Message, Message, Any] = {
    // Create a user actor for this WebSocket connection
    val userActor = system.systemActorOf(UserActor(username), s"user-$username")

    // Join the chat room
    chatRoom ! ChatRoomActor.Join(username, userActor, system.ignoreRef)

    val incomingMessages: Sink[Message, Any] =
      Flow[Message]
        .collect {
          case TextMessage.Strict(text) => text
        }
        .to(Sink.foreach { text =>
          chatRoom ! ChatRoomActor.BroadcastMessage(username, text)
        })

    val outgoingMessages: Source[Message, Any] =
      Source.actorRef[String](bufferSize = 10, OverflowStrategy.dropHead)
        .map(TextMessage(_))

    Flow.fromSinkAndSource(incomingMessages, outgoingMessages)
  }

  def routes = path("chat" / Segment) { username =>
    get {
      handleWebSocketMessages(createWebSocketFlow(username))
    }
  }
}
```

## Advanced Logging Techniques

Effective logging is crucial for debugging Actor systems:

```scala
import org.apache.pekko.actor.typed.scaladsl.ActorContext
import org.slf4j.MDC

object LoggingUtils {
  def withMDC[T](context: ActorContext[_], kvPairs: (String, String)*)(block: => T): T = {
    // Set up Mapped Diagnostic Context
    kvPairs.foreach { case (k, v) => MDC.put(k, v) }
    MDC.put("actorPath", context.self.path.toString)
    MDC.put("actorClass", context.self.path.name)

    try {
      block
    } finally {
      // Clean up MDC
      kvPairs.foreach { case (k, _) => MDC.remove(k) }
      MDC.remove("actorPath")
      MDC.remove("actorClass")
    }
  }
}

// Usage in actors:
LoggingUtils.withMDC(context, "operation" -> "join", "username" -> username) {
  context.log.info("User joining chat room")
}
```

## Testing Strategies

Testing Actor systems requires special techniques. Here's a comprehensive testing approach:

### Unit Testing Individual Actors

```scala
import org.apache.pekko.actor.testkit.typed.scaladsl.ScalaTestWithActorTestKit
import org.scalatest.wordspec.AnyWordSpecLike

class UserActorSpec extends ScalaTestWithActorTestKit with AnyWordSpecLike {

  "UserActor" must {
    "handle send message command" in {
      val userActor = spawn(UserActor("testUser"))
      val probe = createTestProbe[UserActor.MessageSent]()

      userActor ! UserActor.SendMessage("Hello World", probe.ref)

      probe.expectMessage(UserActor.MessageSent(true))
    }

    "log received messages" in {
      val userActor = spawn(UserActor("testUser"))

      userActor ! UserActor.MessageReceived("otherUser", "Hello!")

      // Verify through log inspection or behavior observation
    }
  }
}
```

### Integration Testing with Test Probes

```scala
class ChatRoomIntegrationSpec extends ScalaTestWithActorTestKit with AnyWordSpecLike {

  "ChatRoom integration" must {
    "handle user join and message broadcast" in {
      val chatRoom = spawn(ChatRoomActor())
      val user1Probe = createTestProbe[UserActor.Command]()
      val user2Probe = createTestProbe[UserActor.Command]()
      val joinProbe = createTestProbe[ChatRoomActor.JoinResult]()

      // User 1 joins
      chatRoom ! ChatRoomActor.Join("user1", user1Probe.ref, joinProbe.ref)
      joinProbe.expectMessage(ChatRoomActor.JoinResult(true, "Welcome user1!"))

      // User 2 joins
      chatRoom ! ChatRoomActor.Join("user2", user2Probe.ref, joinProbe.ref)
      joinProbe.expectMessage(ChatRoomActor.JoinResult(true, "Welcome user2!"))

      // User 1 receives join notification for user 2
      user1Probe.expectMessage(UserActor.MessageReceived("System", "user2 joined"))

      // Broadcast message
      chatRoom ! ChatRoomActor.BroadcastMessage("user1", "Hello everyone!")

      // User 2 should receive the message
      user2Probe.expectMessage(UserActor.MessageReceived("user1", "Hello everyone!"))

      // User 1 should not receive their own message
      user1Probe.expectNoMessage(100.millis)
    }
  }
}
```

### Load Testing

For production readiness, include load testing:

```scala
class ChatSystemLoadSpec extends ScalaTestWithActorTestKit with AnyWordSpecLike {

  "ChatRoom under load" must {
    "handle 1000 concurrent users" in {
      val chatRoom = spawn(ChatRoomActor())
      val users = (1 to 1000).map { i =>
        val probe = createTestProbe[UserActor.Command]()
        val joinProbe = createTestProbe[ChatRoomActor.JoinResult]()

        chatRoom ! ChatRoomActor.Join(s"user$i", probe.ref, joinProbe.ref)
        joinProbe.expectMessage(5.seconds, ChatRoomActor.JoinResult(true, s"Welcome user$i!"))

        (s"user$i", probe)
      }

      // Send 100 messages from random users
      (1 to 100).foreach { _ =>
        val randomUser = users(scala.util.Random.nextInt(1000))._1
        chatRoom ! ChatRoomActor.BroadcastMessage(randomUser, s"Message ${System.currentTimeMillis()}")
      }

      // Verify system remains responsive
      val testUser = users.head
      chatRoom ! ChatRoomActor.BroadcastMessage("testLoad", "System still responsive")

      // All other users should receive this message
      users.tail.foreach { case (_, probe) =>
        probe.expectMessageType[UserActor.MessageReceived](3.seconds)
      }
    }
  }
}
```

## Real-World Lessons Learned

After implementing Actor systems in production, here are the key insights:

### 1. Design for Message Flow

Think about your system in terms of message flows rather than object interactions. Draw message sequence diagrams before writing code.

### 2. Embrace Asynchrony

Don't fight the asynchronous nature of actors. Use `ask` patterns sparingly and prefer `tell` with callbacks or message correlation IDs.

### 3. Monitor Mailbox Sizes

Actors with growing mailboxes indicate backpressure problems. Implement circuit breakers and load shedding.

### 4. Plan for Failure

Design your supervision hierarchy carefully. Not every failure should restart an actor – sometimes graceful degradation is better.

### 5. Test Message Protocols

Your message protocols are your API contracts. Test them thoroughly, including error conditions and edge cases.

## Performance Considerations

Actor systems can achieve impressive performance when designed correctly:

- **Message throughput**: Well-designed Actor systems can handle millions of messages per second
- **Memory efficiency**: Actors have lower overhead than traditional threads
- **Scalability**: Linear scaling across cores with proper design
- **Latency**: Message passing can achieve sub-microsecond latencies

### Optimization Tips

1. **Batch related operations** within actors
2. **Use immutable messages** to prevent accidental sharing
3. **Implement backpressure** mechanisms
4. **Profile mailbox sizes** and processing times
5. **Consider Actor pooling** for CPU-intensive work

## The Path Forward

The Actor Model represents a fundamental shift in how we approach concurrent programming. By eliminating shared mutable state and embracing message-passing, we can build systems that are:

- **More resilient** to failures
- **Easier to reason about**
- **Naturally scalable**
- **Maintainable** over time

## Conclusion

We've journeyed from the historical challenges of OOP in concurrent environments, through the specific pitfalls of shared state, to a complete implementation of an Actor-based chat system. The Actor Model isn't just another concurrent programming pattern – it's a different way of thinking about how systems should be structured.

Key takeaways from our three-part series:

1. **Traditional OOP struggles** with concurrent programming due to shared mutable state
2. **Race conditions, deadlocks, and other concurrency bugs** are eliminated by design in Actor systems
3. **Message-passing architectures** provide natural fault tolerance and scalability
4. **Apache Pekko** offers a production-ready, open-source implementation for the JVM
5. **Testing and monitoring** require specialized techniques but provide excellent observability

The transition to Actor-based thinking isn't always easy – it requires unlearning some deeply ingrained OOP habits. But for systems that need to handle concurrency at scale, the Actor Model provides a path to building robust, maintainable, and performant applications.

Whether you're building real-time chat systems, IoT platforms, financial trading systems, or distributed microservices, the principles we've explored in this series will serve you well.

---

_Thank you for joining us on this journey through the Actor Model on the JVM. The future of concurrent programming is message-passing, and with Apache Pekko, that future is available today._

## Resources and Further Reading

- [Apache Pekko Documentation](https://pekko.apache.org/docs/pekko/current/)
- [Reactive Manifesto](https://www.reactivemanifesto.org/)
- [Let It Crash: Best Practices for Erlang Programming](https://pragprog.com/titles/jaerlang2/programming-erlang/)
- [Akka in Action](https://www.manning.com/books/akka-in-action) (concepts apply to Pekko)
