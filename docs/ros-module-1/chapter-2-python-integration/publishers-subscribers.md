---
sidebar_position: 9
---

# Publishers and Subscribers with rclpy

## Introduction

In ROS 2, the publish-subscribe pattern is the primary method for asynchronous communication between nodes. Publishers send messages to topics, and subscribers receive messages from topics. This decoupled communication model is fundamental to ROS 2's architecture.

## Creating Publishers

### Basic Publisher Structure

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class PublisherNode(Node):
    def __init__(self):
        super().__init__('publisher_node')

        # Create publisher: (message_type, topic_name, queue_size)
        self.publisher = self.create_publisher(String, 'topic_name', 10)

        # Optional: Create timer for periodic publishing
        self.timer = self.create_timer(0.5, self.publish_message)
        self.counter = 0

    def publish_message(self):
        msg = String()
        msg.data = f'Message {self.counter}'
        self.publisher.publish(msg)
        self.get_logger().info(f'Published: {msg.data}')
        self.counter += 1
```

### Publisher with Custom Message Types

```python
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan
import rclpy
from rclpy.node import Node

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')

        # Publish velocity commands
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        # Publish sensor data
        self.scan_pub = self.create_publisher(LaserScan, '/scan', 10)

    def send_velocity_command(self, linear_x, angular_z):
        cmd = Twist()
        cmd.linear.x = linear_x
        cmd.angular.z = angular_z
        self.cmd_vel_pub.publish(cmd)

    def publish_scan_data(self, ranges, angle_min, angle_max):
        scan_msg = LaserScan()
        scan_msg.ranges = ranges
        scan_msg.angle_min = angle_min
        scan_msg.angle_max = angle_max
        self.scan_pub.publish(scan_msg)
```

## Creating Subscribers

### Basic Subscriber Structure

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SubscriberNode(Node):
    def __init__(self):
        super().__init__('subscriber_node')

        # Create subscription: (message_type, topic_name, callback, queue_size)
        self.subscription = self.create_subscription(
            String,
            'topic_name',
            self.listener_callback,
            10
        )
        # Important: Keep reference to prevent garbage collection
        self.subscription

    def listener_callback(self, msg):
        self.get_logger().info(f'Received: {msg.data}')
```

### Multiple Subscriptions in One Node

```python
from geometry_msgs.msg import Twist, Pose
from sensor_msgs.msg import LaserScan
import rclpy
from rclpy.node import Node

class MultiSubscriberNode(Node):
    def __init__(self):
        super().__init__('multi_subscriber')

        # Multiple subscriptions
        self.cmd_sub = self.create_subscription(
            Twist, '/cmd_vel', self.cmd_callback, 10)
        self.scan_sub = self.create_subscription(
            LaserScan, '/scan', self.scan_callback, 10)
        self.pose_sub = self.create_subscription(
            Pose, '/robot_pose', self.pose_callback, 10)

        # Store latest data
        self.latest_cmd = None
        self.latest_scan = None
        self.latest_pose = None

    def cmd_callback(self, msg):
        self.latest_cmd = msg
        self.get_logger().info('Received velocity command')

    def scan_callback(self, msg):
        self.latest_scan = msg
        self.get_logger().info(f'Received scan with {len(msg.ranges)} ranges')

    def pose_callback(self, msg):
        self.latest_pose = msg
        self.get_logger().info(f'Received pose: ({msg.position.x}, {msg.position.y})')
```

## Advanced Publisher Patterns

### Publisher with Quality of Service (QoS)

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy
from std_msgs.msg import String
import rclpy
from rclpy.node import Node

class QoSPublisher(Node):
    def __init__(self):
        super().__init__('qos_publisher')

        # Create custom QoS profile
        qos_profile = QoSProfile(
            depth=10,  # Queue size
            reliability=ReliabilityPolicy.RELIABLE,  # or BEST_EFFORT
            history=HistoryPolicy.KEEP_LAST  # or KEEP_ALL
        )

        self.publisher = self.create_publisher(String, 'qos_topic', qos_profile)

    def publish_with_qos(self, data):
        msg = String()
        msg.data = data
        self.publisher.publish(msg)
```

### Publisher with Rate Control

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64
from rclpy.time import Time
from rclpy.duration import Duration

class RateLimitedPublisher(Node):
    def __init__(self):
        super().__init__('rate_limited_publisher')
        self.publisher = self.create_publisher(Float64, 'sensor_data', 10)

        # Target frequency: 10 Hz
        self.publish_rate = 0.1  # seconds
        self.last_publish_time = self.get_clock().now()

        # Simulate sensor reading
        self.timer = self.create_timer(0.01, self.update_sensor)  # Update at 100 Hz
        self.current_value = 0.0

    def update_sensor(self):
        # Simulate sensor reading
        self.current_value += 0.1

        # Rate limit publishing
        current_time = self.get_clock().now()
        if (current_time - self.last_publish_time).nanoseconds > self.publish_rate * 1e9:
            self.publish_sensor_data()
            self.last_publish_time = current_time

    def publish_sensor_data(self):
        msg = Float64()
        msg.data = self.current_value
        self.publisher.publish(msg)
        self.get_logger().info(f'Published: {msg.data}')
```

## Advanced Subscriber Patterns

### Subscriber with Message Filtering

```python
from sensor_msgs.msg import LaserScan
import rclpy
from rclpy.node import Node

class FilteredSubscriber(Node):
    def __init__(self):
        super().__init__('filtered_subscriber')
        self.subscription = self.create_subscription(
            LaserScan, '/scan', self.filtered_callback, 10)

        # Filter parameters
        self.min_range = 0.1
        self.max_range = 10.0

    def filtered_callback(self, msg):
        # Filter out invalid range readings
        valid_ranges = []
        for range_val in msg.ranges:
            if self.min_range <= range_val <= self.max_range:
                valid_ranges.append(range_val)

        if valid_ranges:
            avg_range = sum(valid_ranges) / len(valid_ranges)
            self.get_logger().info(f'Average valid range: {avg_range:.2f}m')
```

### Subscriber with Message History

```python
from std_msgs.msg import Float64
import rclpy
from rclpy.node import Node
from collections import deque

class HistorySubscriber(Node):
    def __init__(self):
        super().__init__('history_subscriber')
        self.subscription = self.create_subscription(
            Float64, '/sensor_value', self.history_callback, 10)

        # Maintain history of last 10 values
        self.history = deque(maxlen=10)

    def history_callback(self, msg):
        self.history.append(msg.data)

        # Calculate statistics from history
        if len(self.history) > 1:
            avg = sum(self.history) / len(self.history)
            variance = sum((x - avg) ** 2 for x in self.history) / len(self.history)

            self.get_logger().info(
                f'Value: {msg.data:.2f}, '
                f'Average: {avg:.2f}, '
                f'Variance: {variance:.2f}'
            )
```

## Complete Publisher-Subscriber Example

Here's a complete example showing both publisher and subscriber in separate nodes:

### Publisher Node (sensor_publisher.py)
```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64
import random

class SensorPublisher(Node):
    def __init__(self):
        super().__init__('sensor_publisher')
        self.publisher = self.create_publisher(Float64, 'sensor_data', 10)
        self.timer = self.create_timer(1.0, self.publish_sensor_reading)
        self.get_logger().info('Sensor publisher started')

    def publish_sensor_reading(self):
        msg = Float64()
        msg.data = random.uniform(0.0, 100.0)  # Simulate sensor reading
        self.publisher.publish(msg)
        self.get_logger().info(f'Published sensor reading: {msg.data:.2f}')

def main(args=None):
    rclpy.init(args=args)
    node = SensorPublisher()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

### Subscriber Node (data_processor.py)
```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64

class DataProcessor(Node):
    def __init__(self):
        super().__init__('data_processor')
        self.subscription = self.create_subscription(
            Float64, 'sensor_data', self.process_data, 10)
        self.subscription
        self.get_logger().info('Data processor started')

    def process_data(self, msg):
        # Process the incoming sensor data
        processed_value = msg.data * 2.0  # Example processing
        self.get_logger().info(f'Processed value: {processed_value:.2f}')

        # Could trigger additional actions based on data
        if msg.data > 50.0:
            self.get_logger().warn('High sensor reading detected!')

def main(args=None):
    rclpy.init(args=args)
    node = DataProcessor()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

## Best Practices

### 1. Proper Queue Sizing
```python
# For high-frequency topics, use larger queues
high_freq_pub = self.create_publisher(String, 'high_freq_topic', 100)

# For low-frequency topics, smaller queues are sufficient
low_freq_pub = self.create_publisher(String, 'low_freq_topic', 10)
```

### 2. Resource Management
```python
def destroy_node(self):
    # Clean up resources before destroying node
    if hasattr(self, 'publisher'):
        self.publisher.destroy()
    if hasattr(self, 'subscription'):
        self.subscription.destroy()
    super().destroy_node()
```

### 3. Error Handling
```python
def listener_callback(self, msg):
    try:
        # Process message
        processed_data = self.process_message(msg)
        # Publish result if needed
        if hasattr(self, 'result_publisher'):
            self.result_publisher.publish(processed_data)
    except Exception as e:
        self.get_logger().error(f'Error processing message: {e}')
```

### 4. Topic Naming Conventions
- Use descriptive names: `/sensor_data` instead of `/s`
- Use forward slashes to separate components: `/robot/arm/joint_states`
- Follow ROS 2 naming conventions (lowercase, underscores)

## Summary

Publishers and subscribers form the backbone of ROS 2 communication:

- **Publishers** send messages to topics asynchronously
- **Subscribers** receive messages from topics through callbacks
- **QoS settings** allow tuning for reliability and performance
- **Rate limiting** can be implemented using timers
- **Message filtering** enables selective processing
- **History tracking** provides context for decision making

Understanding these patterns is essential for building robust ROS 2 systems that can handle real-world scenarios with proper error handling and resource management.