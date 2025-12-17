---
sidebar_position: 5
---

# Practical Examples and Code Snippets

## Introduction

Now that we understand the theoretical concepts of nodes, topics, and services, let's look at practical examples using Python and the rclpy library. These examples will help you see how these concepts are implemented in real ROS 2 code.

## Simple Publisher Node

Here's a basic example of a publisher node that publishes messages to a topic:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    minimal_publisher = MinimalPublisher()
    rclpy.spin(minimal_publisher)
    minimal_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Simple Subscriber Node

Here's a corresponding subscriber node that listens to the topic:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalSubscriber(Node):
    def __init__(self):
        super().__init__('minimal_subscriber')
        self.subscription = self.create_subscription(
            String,
            'topic',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    minimal_subscriber = MinimalSubscriber()
    rclpy.spin(minimal_subscriber)
    minimal_subscriber.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Simple Service Server

Here's an example of a service server:

```python
from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node

class MinimalService(Node):
    def __init__(self):
        super().__init__('minimal_service')
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_two_ints_callback)

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Returning {response.sum}')
        return response

def main(args=None):
    rclpy.init(args=args)
    minimal_service = MinimalService()
    rclpy.spin(minimal_service)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Simple Service Client

Here's a client that calls the service:

```python
from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node

class MinimalClientAsync(Node):
    def __init__(self):
        super().__init__('minimal_client_async')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('service not available, waiting again...')
        self.req = AddTwoInts.Request()

    def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        self.future = self.cli.call_async(self.req)
        rclpy.spin_until_future_complete(self, self.future)
        return self.future.result()

def main(args=None):
    rclpy.init(args=args)
    minimal_client = MinimalClientAsync()
    response = minimal_client.send_request(1, 2)
    minimal_client.get_logger().info(f'Result of add_two_ints: {response.sum}')
    minimal_client.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Running the Examples

To run these examples:

1. **Terminal 1** - Start the publisher:
```bash
python3 publisher_node.py
```

2. **Terminal 2** - Start the subscriber:
```bash
python3 subscriber_node.py
```

3. **Terminal 3** - Start the service server:
```bash
python3 service_server.py
```

4. **Terminal 4** - Start the service client:
```bash
python3 service_client.py
```

## Key Concepts Demonstrated

### Node Creation
- All nodes inherit from `rclpy.node.Node`
- Nodes are initialized with a unique name
- The `rclpy.init()` function initializes the ROS 2 client library

### Publisher Setup
- `create_publisher()` creates a publisher for a specific topic
- The third parameter is the queue size for messages
- Messages are published using the `publish()` method

### Subscriber Setup
- `create_subscription()` creates a subscription to a specific topic
- The callback function is called when messages arrive
- The queue size determines how many messages to buffer

### Service Setup
- `create_service()` creates a service server
- The callback function processes requests and returns responses
- Services are synchronous - the client waits for a response

### Client Setup
- `create_client()` creates a service client
- `call_async()` sends a request to the service
- The client waits for the response using `spin_until_future_complete()`

## Best Practices

### Error Handling
Always include proper error handling in your nodes:

```python
def main(args=None):
    try:
        rclpy.init(args=args)
        node = YourNode()
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f'Error: {e}')
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

### Parameter Handling
Use parameters to make your nodes configurable:

```python
def __init__(self):
    super().__init__('parameter_node')
    self.declare_parameter('publish_frequency', 1.0)
    frequency = self.get_parameter('publish_frequency').value
    self.timer = self.create_timer(1.0 / frequency, self.timer_callback)
```

### Logging
Use appropriate logging levels:

```python
self.get_logger().debug('Debug message')
self.get_logger().info('Informational message')
self.get_logger().warn('Warning message')
self.get_logger().error('Error message')
self.get_logger().fatal('Fatal error message')
```

## Summary

These practical examples demonstrate how the theoretical concepts of nodes, topics, and services translate into actual code. Key takeaways include:

- Nodes are the basic execution units that perform specific tasks
- Topics enable asynchronous communication through publish-subscribe
- Services enable synchronous communication through request-response
- The rclpy library provides the Python interface to ROS 2 functionality
- Proper error handling and logging are essential for robust nodes

Understanding these code patterns will help you build more complex robotic systems in the upcoming chapters.