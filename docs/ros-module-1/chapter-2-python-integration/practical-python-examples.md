---
sidebar_position: 11
---

# Practical Python Code Examples

## Introduction

This section provides complete, working examples that demonstrate the integration of Python with ROS 2. Each example is designed to be educational and practical, showing how to implement common robotic patterns using rclpy.

## Example 1: Simple Sensor Publisher

This example shows how to create a publisher that simulates sensor data:

```python
#!/usr/bin/env python3
"""
Simple sensor publisher node
Publishes simulated sensor readings to a topic
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64
import random
import math

class SensorPublisher(Node):
    def __init__(self):
        super().__init__('sensor_publisher')

        # Create publisher
        self.publisher = self.create_publisher(Float64, 'sensor_data', 10)

        # Create timer for periodic publishing
        self.timer = self.create_timer(0.1, self.publish_sensor_data)  # 10 Hz

        # Initialize variables
        self.time_offset = 0.0
        self.get_logger().info('Sensor Publisher Node Started')

    def publish_sensor_data(self):
        # Simulate sensor data (e.g., temperature, distance, etc.)
        # Using a sine wave with some random noise
        sensor_value = 20.0 + 5.0 * math.sin(self.time_offset) + random.uniform(-0.5, 0.5)

        # Create and publish message
        msg = Float64()
        msg.data = sensor_value
        self.publisher.publish(msg)

        self.get_logger().info(f'Published sensor data: {sensor_value:.2f}')
        self.time_offset += 0.1

def main(args=None):
    rclpy.init(args=args)
    node = SensorPublisher()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Shutting down sensor publisher...')
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Example 2: Data Processor Subscriber

This example shows how to create a subscriber that processes incoming data:

```python
#!/usr/bin/env python3
"""
Data processor subscriber node
Receives sensor data and processes it
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64
from std_msgs.msg import String
from collections import deque
import statistics

class DataProcessor(Node):
    def __init__(self):
        super().__init__('data_processor')

        # Create subscription
        self.subscription = self.create_subscription(
            Float64,
            'sensor_data',
            self.listener_callback,
            10
        )

        # Create publisher for processed data
        self.publisher = self.create_publisher(String, 'processed_data', 10)

        # Maintain history for statistical analysis
        self.data_history = deque(maxlen=20)
        self.get_logger().info('Data Processor Node Started')

    def listener_callback(self, msg):
        # Add new data to history
        self.data_history.append(msg.data)

        # Calculate statistics
        if len(self.data_history) > 1:
            avg_value = statistics.mean(self.data_history)
            min_value = min(self.data_history)
            max_value = max(self.data_history)

            # Determine status based on data
            status = self.determine_status(avg_value)

            # Create and publish processed data message
            processed_msg = String()
            processed_msg.data = f'Status: {status}, Avg: {avg_value:.2f}, Min: {min_value:.2f}, Max: {max_value:.2f}'
            self.publisher.publish(processed_msg)

            self.get_logger().info(processed_msg.data)

    def determine_status(self, value):
        if value < 15.0:
            return 'LOW'
        elif value > 25.0:
            return 'HIGH'
        else:
            return 'NORMAL'

def main(args=None):
    rclpy.init(args=args)
    node = DataProcessor()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Shutting down data processor...')
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Example 3: Robot Controller Service

This example shows how to create a service that controls a robot:

```python
#!/usr/bin/env python3
"""
Robot controller service node
Provides service to control robot movement
"""
from example_interfaces.srv import Trigger
from geometry_msgs.msg import Twist
import rclpy
from rclpy.node import Node

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')

        # Create service
        self.srv = self.create_service(Trigger, 'robot_control', self.control_callback)

        # Create publisher for movement commands
        self.cmd_publisher = self.create_publisher(Twist, 'cmd_vel', 10)

        # Track robot state
        self.is_moving = False
        self.get_logger().info('Robot Controller Service Started')

    def control_callback(self, request, response):
        command = request.command.lower() if hasattr(request, 'command') else 'default'

        if command == 'forward':
            self.move_forward()
            response.success = True
            response.message = 'Moving forward'
        elif command == 'backward':
            self.move_backward()
            response.success = True
            response.message = 'Moving backward'
        elif command == 'left':
            self.turn_left()
            response.success = True
            response.message = 'Turning left'
        elif command == 'right':
            self.turn_right()
            response.success = True
            response.message = 'Turning right'
        elif command == 'stop':
            self.stop_robot()
            response.success = True
            response.message = 'Robot stopped'
        else:
            response.success = False
            response.message = f'Unknown command: {command}'

        self.get_logger().info(response.message)
        return response

    def move_forward(self):
        msg = Twist()
        msg.linear.x = 0.5  # Move forward at 0.5 m/s
        msg.angular.z = 0.0
        self.cmd_publisher.publish(msg)
        self.is_moving = True

    def move_backward(self):
        msg = Twist()
        msg.linear.x = -0.5  # Move backward at 0.5 m/s
        msg.angular.z = 0.0
        self.cmd_publisher.publish(msg)
        self.is_moving = True

    def turn_left(self):
        msg = Twist()
        msg.linear.x = 0.0
        msg.angular.z = 0.5  # Turn left at 0.5 rad/s
        self.cmd_publisher.publish(msg)
        self.is_moving = True

    def turn_right(self):
        msg = Twist()
        msg.linear.x = 0.0
        msg.angular.z = -0.5  # Turn right at 0.5 rad/s
        self.cmd_publisher.publish(msg)
        self.is_moving = True

    def stop_robot(self):
        msg = Twist()
        msg.linear.x = 0.0
        msg.angular.z = 0.0
        self.cmd_publisher.publish(msg)
        self.is_moving = False

def main(args=None):
    rclpy.init(args=args)
    node = RobotController()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Shutting down robot controller...')
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Example 4: Robot Controller Client

This example shows how to create a client that uses the robot controller service:

```python
#!/usr/bin/env python3
"""
Robot controller client node
Calls the robot controller service
"""
from example_interfaces.srv import Trigger
import rclpy
from rclpy.node import Node
import time

class RobotControllerClient(Node):
    def __init__(self):
        super().__init__('robot_controller_client')

        # Create client
        self.cli = self.create_client(Trigger, 'robot_control')

        # Wait for service
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Robot controller service not available, waiting...')

        # Create timer to send commands
        self.timer = self.create_timer(3.0, self.send_commands)
        self.command_sequence = ['forward', 'stop', 'left', 'stop', 'right', 'stop']
        self.command_index = 0

        self.get_logger().info('Robot Controller Client Started')

    def send_commands(self):
        if self.command_index >= len(self.command_sequence):
            self.get_logger().info('Command sequence completed')
            self.timer.cancel()
            return

        command = self.command_sequence[self.command_index]
        self.get_logger().info(f'Sending command: {command}')

        # Create request with command
        request = Trigger.Request()
        # Note: The Trigger service doesn't have a command field, this is for demonstration
        # In practice, you'd create a custom service message with a command field

        # For this example, we'll use the default Trigger service and send different requests
        future = self.cli.call_async(request)
        future.add_done_callback(self.response_callback)

    def response_callback(self, future):
        try:
            response = future.result()
            self.get_logger().info(f'Service response: {response.success}, {response.message}')
            self.command_index += 1
        except Exception as e:
            self.get_logger().error(f'Service call failed: {e}')

def main(args=None):
    rclpy.init(args=args)
    node = RobotControllerClient()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Shutting down robot controller client...')
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Example 5: Custom AI Decision Node

This example shows a more complex node that integrates AI decision-making:

```python
#!/usr/bin/env python3
"""
AI decision maker node
Makes decisions based on sensor data
"""
from std_msgs.msg import Float64, String
from geometry_msgs.msg import Twist
import rclpy
from rclpy.node import Node
import random

class AIDecisionMaker(Node):
    def __init__(self):
        super().__init__('ai_decision_maker')

        # Subscribe to sensor data
        self.sensor_subscription = self.create_subscription(
            Float64,
            'sensor_data',
            self.sensor_callback,
            10
        )

        # Publish robot commands
        self.cmd_publisher = self.create_publisher(Twist, 'cmd_vel', 10)

        # Publish decisions
        self.decision_publisher = self.create_publisher(String, 'ai_decisions', 10)

        # Store latest sensor data
        self.latest_sensor_value = 0.0
        self.get_logger().info('AI Decision Maker Started')

    def sensor_callback(self, msg):
        self.latest_sensor_value = msg.data
        self.make_decision()

    def make_decision(self):
        # Simple AI decision logic
        sensor_value = self.latest_sensor_value

        # Decision based on sensor value
        if sensor_value < 15.0:
            # Low sensor value - move toward source
            cmd = Twist()
            cmd.linear.x = 0.3
            cmd.angular.z = 0.0
            decision = 'APPROACH_SOURCE'
        elif sensor_value > 25.0:
            # High sensor value - move away
            cmd = Twist()
            cmd.linear.x = -0.2
            cmd.angular.z = 0.0
            decision = 'MOVE_AWAY'
        else:
            # Normal range - explore
            cmd = Twist()
            cmd.linear.x = 0.1
            cmd.angular.z = random.uniform(-0.3, 0.3)  # Random turn
            decision = 'EXPLORE'

        # Publish command
        self.cmd_publisher.publish(cmd)

        # Publish decision
        decision_msg = String()
        decision_msg.data = f'{decision}: Sensor={sensor_value:.2f}'
        self.decision_publisher.publish(decision_msg)

        self.get_logger().info(decision_msg.data)

def main(args=None):
    rclpy.init(args=args)
    node = AIDecisionMaker()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Shutting down AI decision maker...')
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Example 6: Parameter-Based Configuration

This example shows how to use parameters to configure node behavior:

```python
#!/usr/bin/env python3
"""
Parameter-configured node
Demonstrates parameter usage in ROS 2
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from rclpy.parameter import Parameter

class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')

        # Declare parameters with default values
        self.declare_parameter('robot_name', 'my_robot')
        self.declare_parameter('publish_frequency', 1.0)
        self.declare_parameter('sensor_threshold', 20.0)
        self.declare_parameter('debug_mode', False)

        # Get parameter values
        self.robot_name = self.get_parameter('robot_name').value
        self.frequency = self.get_parameter('publish_frequency').value
        self.threshold = self.get_parameter('sensor_threshold').value
        self.debug_mode = self.get_parameter('debug_mode').value

        # Create publisher
        self.publisher = self.create_publisher(String, 'robot_status', 10)

        # Create timer based on frequency parameter
        self.timer = self.create_timer(1.0 / self.frequency, self.publish_status)

        self.counter = 0
        self.get_logger().info(f'Parameter Node Started - Robot: {self.robot_name}')
        if self.debug_mode:
            self.get_logger().info('Debug mode enabled')

    def publish_status(self):
        # Create status message
        msg = String()
        msg.data = f'{self.robot_name}: Status update #{self.counter}, Threshold: {self.threshold}'
        self.publisher.publish(msg)

        if self.debug_mode:
            self.get_logger().info(f'Debug: Publishing status - {msg.data}')

        self.counter += 1

def main(args=None):
    rclpy.init(args=args)
    node = ParameterNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Shutting down parameter node...')
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Running the Examples

To run these examples:

1. **Save each example** to a separate Python file (e.g., `sensor_publisher.py`)

2. **Make them executable**:
```bash
chmod +x sensor_publisher.py
```

3. **Run the nodes in separate terminals**:
```bash
# Terminal 1: Run the sensor publisher
python3 sensor_publisher.py

# Terminal 2: Run the data processor
python3 data_processor.py

# Terminal 3: Run the AI decision maker
python3 ai_decision_maker.py
```

4. **Use ROS 2 command line tools** to monitor:
```bash
# List active topics
ros2 topic list

# Echo messages from a topic
ros2 topic echo /sensor_data std_msgs/msg/Float64

# List active services
ros2 service list
```

## Key Concepts Demonstrated

### 1. Node Structure
- Proper initialization and cleanup
- Use of super() to call parent constructor
- Resource management

### 2. Publisher Pattern
- Creating publishers with appropriate message types
- Publishing messages at regular intervals
- Proper message formatting

### 3. Subscriber Pattern
- Creating subscriptions with callbacks
- Processing incoming messages
- Maintaining state between messages

### 4. Service Pattern
- Creating service servers and clients
- Handling requests and responses
- Asynchronous service calls

### 5. AI Integration
- Decision-making based on sensor data
- Continuous processing loops
- Action selection algorithms

### 6. Parameter Usage
- Declaring and using parameters
- Runtime configuration
- Dynamic behavior adjustment

## Best Practices Demonstrated

1. **Error Handling**: Try-catch blocks and proper cleanup
2. **Logging**: Appropriate use of different log levels
3. **Resource Management**: Proper node destruction
4. **Code Organization**: Clear class structure and method separation
5. **Documentation**: Clear comments and docstrings
6. **Parameterization**: Configurable behavior through parameters

These examples provide a solid foundation for building more complex ROS 2 applications with Python and AI integration.