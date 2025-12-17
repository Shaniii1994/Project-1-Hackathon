---
sidebar_position: 8
---

# rclpy Basics: Python Client Library for ROS 2

## Introduction to rclpy

**rclpy** is the Python client library for ROS 2. It provides a Python API that allows you to create ROS 2 nodes, publish and subscribe to topics, provide and use services, and more. Understanding rclpy is essential for Python developers working with ROS 2.

## Core Concepts in rclpy

### Node Structure

In rclpy, all ROS 2 functionality is organized within **Node** objects. A node typically inherits from `rclpy.node.Node`:

```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('node_name')
        # Initialize node functionality here

def main(args=None):
    rclpy.init(args=args)  # Initialize ROS 2 client library
    node = MyNode()        # Create node instance
    rclpy.spin(node)       # Keep node running
    node.destroy_node()    # Clean up
    rclpy.shutdown()       # Shutdown ROS 2 client library

if __name__ == '__main__':
    main()
```

### Key Components

1. **rclpy.init()**: Initializes the ROS 2 client library
2. **Node**: Base class for all ROS 2 nodes
3. **rclpy.spin()**: Keeps the node running and processing callbacks
4. **rclpy.shutdown()**: Cleans up and shuts down the client library

## Creating Publishers

Publishers send messages to topics. Here's how to create one:

```python
from std_msgs.msg import String
import rclpy
from rclpy.node import Node

class Talker(Node):
    def __init__(self):
        super().__init__('talker')
        # Create publisher
        self.publisher = self.create_publisher(String, 'topic_name', 10)
        # Create timer to publish periodically
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.i}'
        self.publisher.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1
```

## Creating Subscribers

Subscribers receive messages from topics:

```python
from std_msgs.msg import String
import rclpy
from rclpy.node import Node

class Listener(Node):
    def __init__(self):
        super().__init__('listener')
        # Create subscription
        self.subscription = self.create_subscription(
            String,
            'topic_name',
            self.listener_callback,
            10)  # QoS queue size
        self.subscription  # Prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')
```

## Creating Services

Services provide request-response communication:

```python
from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node

class ServiceServer(Node):
    def __init__(self):
        super().__init__('service_server')
        # Create service server
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_two_ints_callback
        )

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Returning {response.sum}')
        return response
```

## Creating Service Clients

Service clients call services:

```python
from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node

class ServiceClient(Node):
    def __init__(self):
        super().__init__('service_client')
        # Create service client
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        # Wait for service to be available
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting...')

    def send_request(self, a, b):
        request = AddTwoInts.Request()
        request.a = a
        request.b = b
        future = self.cli.call_async(request)
        return future
```

## Working with Parameters

Parameters allow nodes to be configured:

```python
import rclpy
from rclpy.node import Node

class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')

        # Declare parameters with default values
        self.declare_parameter('frequency', 1.0)
        self.declare_parameter('topic_name', 'default_topic')

        # Get parameter values
        frequency = self.get_parameter('frequency').value
        topic_name = self.get_parameter('topic_name').value

        self.get_logger().info(f'Frequency: {frequency}, Topic: {topic_name}')
```

## Using Timers

Timers are useful for periodic tasks:

```python
import rclpy
from rclpy.node import Node
from rclpy.timer import Timer

class TimerNode(Node):
    def __init__(self):
        super().__init__('timer_node')

        # Create timer that calls callback every 0.5 seconds
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.counter = 0

    def timer_callback(self):
        self.get_logger().info(f'Timer callback #{self.counter}')
        self.counter += 1
```

## Logging

rclpy provides built-in logging:

```python
class LoggingNode(Node):
    def __init__(self):
        super().__init__('logging_node')

        # Different log levels
        self.get_logger().debug('Debug message')
        self.get_logger().info('Informational message')
        self.get_logger().warn('Warning message')
        self.get_logger().error('Error message')
        self.get_logger().fatal('Fatal error message')
```

## Message Types

ROS 2 comes with standard message types:

```python
from std_msgs.msg import String, Int32, Float64
from geometry_msgs.msg import Twist, Pose
from sensor_msgs.msg import LaserScan, Image
from nav_msgs.msg import Odometry

# Example of using geometry_msgs/Twist for robot movement
from geometry_msgs.msg import Twist

class MovementNode(Node):
    def __init__(self):
        super().__init__('movement_node')
        self.cmd_vel_publisher = self.create_publisher(Twist, '/cmd_vel', 10)

    def move_robot(self, linear_x, angular_z):
        msg = Twist()
        msg.linear.x = linear_x  # Forward/backward speed
        msg.angular.z = angular_z  # Rotation speed
        self.cmd_vel_publisher.publish(msg)
```

## Error Handling

Proper error handling is important:

```python
def main(args=None):
    try:
        rclpy.init(args=args)
        node = MyNode()
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f'Error: {e}')
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

## Best Practices

### 1. Always Call Parent Constructor
```python
def __init__(self):
    super().__init__('node_name')  # Don't forget this!
```

### 2. Use Descriptive Node Names
```python
class CameraNode(Node):
    def __init__(self):
        super().__init__('camera_driver_node')  # Clear, descriptive name
```

### 3. Handle Shutdown Properly
```python
def main(args=None):
    rclpy.init(args=args)
    node = MyNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

### 4. Use Appropriate QoS Settings
```python
# For real-time systems, consider reliability settings
from rclpy.qos import QoSProfile, ReliabilityPolicy

qos_profile = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.RELIABLE  # or BEST_EFFORT
)
```

## Summary

rclpy provides a comprehensive Python interface to ROS 2 functionality:

- **Nodes** are the basic execution units
- **Publishers** send messages to topics
- **Subscribers** receive messages from topics
- **Services** provide request-response communication
- **Parameters** allow configuration
- **Timers** enable periodic execution
- **Logging** helps with debugging

Understanding these basics is crucial for implementing Python-based ROS 2 applications. The next sections will build on these concepts to create more sophisticated systems.