---
sidebar_position: 3
---

# Nodes, Topics, and Services

## Introduction

In ROS 2, there are three fundamental concepts that form the backbone of robotic communication: **nodes**, **topics**, and **services**. Understanding these concepts is crucial for developing robotic applications.

## Nodes

A **node** is the basic unit of execution in ROS 2. Think of it as a single process that performs computation. Nodes are where your code runs and where specific robot functions are implemented.

### Key Characteristics of Nodes:
- Each node runs a specific task or function
- Nodes can communicate with other nodes
- Multiple nodes can run simultaneously
- Nodes can be written in different programming languages

### Example Node Structure:
```
Node: Temperature Sensor
├── Publishes temperature readings to "temperature_data" topic
├── Subscribes to "calibration_commands" topic
└── Provides "get_temperature" service
```

## Topics

**Topics** enable asynchronous, many-to-many communication between nodes through a publish-subscribe model.

### How Topics Work:
1. A node publishes messages to a topic
2. Other nodes subscribe to that topic to receive messages
3. The communication is decoupled - publisher and subscriber don't need to know about each other
4. Multiple nodes can publish to or subscribe from the same topic

### Topic Characteristics:
- **Unidirectional**: Data flows from publisher to subscriber
- **Asynchronous**: Publisher and subscriber don't need to run simultaneously
- **Many-to-many**: Multiple publishers and subscribers can use the same topic
- **Data-driven**: Used for streaming data like sensor readings, robot states

### Topic Example:
```
Publisher Node: Camera Driver
    ↓ (publishes)
Topic: "/camera/image_raw"
    ↓ (messages flow)
Subscriber Node: Image Processor
```

## Services

**Services** enable synchronous, request-response communication between nodes.

### How Services Work:
1. A node provides a service (acts as a server)
2. Another node calls the service (acts as a client)
3. The client sends a request and waits for a response
4. The service processes the request and returns a response

### Service Characteristics:
- **Bidirectional**: Request and response messages
- **Synchronous**: Client waits for the response
- **One-to-one**: One client talks to one server at a time
- **Action-oriented**: Used for tasks that require a specific response

### Service Example:
```
Client Node: Navigation System
    ↓ (request: "calculate_path")
Service Node: Path Planner
    ↓ (processes request)
Service Node: Path Planner
    ↓ (response: "path_coordinates")
Client Node: Navigation System
```

## Comparison Table

| Aspect | Topics | Services |
|--------|--------|----------|
| Communication Style | Publish-Subscribe | Request-Response |
| Synchronization | Asynchronous | Synchronous |
| Relationship | Many-to-many | One-to-one |
| Use Case | Streaming data | Specific tasks |
| Response Required | No | Yes |

## Practical Example: Robot Control System

Let's look at how these concepts work together in a simple robot control system:

```
Node: Sensor Controller
├── Publishes sensor data to "/sensors/data" topic
├── Subscribes to "/motor/commands" topic
└── Provides "get_sensor_status" service

Node: Motor Controller
├── Subscribes to "/motor/commands" topic
├── Publishes motor status to "/motor/status" topic
└── Provides "set_motor_speed" service

Node: Main Controller
├── Subscribes to "/sensors/data" topic
├── Publishes to "/motor/commands" topic
└── Calls "get_sensor_status" and "set_motor_speed" services
```

## Summary

- **Nodes** are the basic execution units that perform specific functions
- **Topics** enable asynchronous data streaming between nodes
- **Services** enable synchronous request-response communication
- These three concepts work together to create complex robotic systems

Understanding these fundamentals is essential before moving on to how to implement them in Python using rclpy.