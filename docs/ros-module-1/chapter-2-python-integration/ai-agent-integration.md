---
sidebar_position: 10
---

# AI Agent Integration with ROS Services

## Introduction

One of the most powerful aspects of ROS 2 is its ability to integrate AI algorithms and agents with robotic hardware. This chapter focuses on how to connect AI logic with ROS 2 services, enabling intelligent decision-making and control of robotic systems.

## AI-ROS Integration Patterns

### Pattern 1: AI as a Service Provider

In this pattern, an AI agent provides intelligent services that other nodes can call:

```python
from example_interfaces.srv import Trigger
from std_msgs.msg import String
import rclpy
from rclpy.node import Node
import random

class AIDecisionMaker(Node):
    def __init__(self):
        super().__init__('ai_decision_maker')

        # Provide a service for making decisions
        self.decision_service = self.create_service(
            Trigger,
            'make_decision',
            self.decision_callback
        )

        # Subscribe to sensor data
        self.sensor_subscription = self.create_subscription(
            String,
            'sensor_input',
            self.sensor_callback,
            10
        )

        self.latest_sensor_data = None
        self.get_logger().info('AI Decision Maker started')

    def sensor_callback(self, msg):
        self.latest_sensor_data = msg.data
        self.get_logger().info(f'Received sensor data: {msg.data}')

    def decision_callback(self, request, response):
        # AI logic here - this is a simple example
        if self.latest_sensor_data:
            # Simple decision logic based on sensor data
            if 'obstacle' in self.latest_sensor_data.lower():
                decision = 'stop'
            elif 'clear' in self.latest_sensor_data.lower():
                decision = 'proceed'
            else:
                decision = 'wait'
        else:
            decision = 'wait'  # Default decision

        response.success = True
        response.message = f'Decision: {decision}'

        self.get_logger().info(f'Made decision: {decision}')
        return response

def main(args=None):
    rclpy.init(args=args)
    node = AIDecisionMaker()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

### Pattern 2: AI as a Service Client

In this pattern, an AI agent calls services provided by other nodes:

```python
from example_interfaces.srv import Trigger
from std_msgs.msg import String
import rclpy
from rclpy.node import Node
import time

class AIAgent(Node):
    def __init__(self):
        super().__init__('ai_agent')

        # Create client for decision service
        self.decision_client = self.create_client(Trigger, 'make_decision')

        # Create publisher for commands
        self.command_publisher = self.create_publisher(String, 'robot_commands', 10)

        # Wait for service to be available
        while not self.decision_client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Decision service not available, waiting...')

        # Timer to periodically make decisions
        self.timer = self.create_timer(2.0, self.ai_loop)
        self.get_logger().info('AI Agent started')

    def ai_loop(self):
        # Call the decision service
        future = self.decision_client.call_async(Trigger.Request())
        future.add_done_callback(self.decision_response_callback)

    def decision_response_callback(self, future):
        try:
            response = future.result()
            if response.success:
                # Process the decision
                decision = response.message.split(': ')[1] if ': ' in response.message else 'wait'

                # Publish command based on decision
                cmd_msg = String()
                cmd_msg.data = decision
                self.command_publisher.publish(cmd_msg)

                self.get_logger().info(f'Published command: {decision}')
            else:
                self.get_logger().error('Decision service returned failure')
        except Exception as e:
            self.get_logger().error(f'Service call failed: {e}')

def main(args=None):
    rclpy.init(args=args)
    node = AIAgent()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

## Integrating with Popular AI Libraries

### Using TensorFlow/Keras

```python
from std_msgs.msg import Float32MultiArray
from sensor_msgs.msg import Image
import rclpy
from rclpy.node import Node
import tensorflow as tf
import numpy as np

class TFAIAgent(Node):
    def __init__(self):
        super().__init__('tf_ai_agent')

        # Load pre-trained model
        self.model = tf.keras.models.load_model('path/to/model.h5')

        # Subscribe to image data
        self.image_subscription = self.create_subscription(
            Image,
            'camera/image_raw',
            self.image_callback,
            10
        )

        # Publish predictions
        self.prediction_publisher = self.create_publisher(
            Float32MultiArray,
            'ai_predictions',
            10
        )

        self.get_logger().info('TensorFlow AI Agent started')

    def image_callback(self, msg):
        # Convert ROS Image message to numpy array
        # (simplified - real conversion depends on encoding)
        image_data = np.frombuffer(msg.data, dtype=np.uint8)
        image_data = image_data.reshape((msg.height, msg.width, -1))

        # Preprocess image
        image_data = image_data.astype(np.float32) / 255.0
        image_data = np.expand_dims(image_data, axis=0)  # Add batch dimension

        # Run inference
        predictions = self.model.predict(image_data)

        # Publish results
        result_msg = Float32MultiArray()
        result_msg.data = predictions.flatten().tolist()
        self.prediction_publisher.publish(result_msg)

        self.get_logger().info(f'AI prediction published: {predictions[0]}')

def main(args=None):
    rclpy.init(args=args)
    node = TFAIAgent()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

### Using PyTorch

```python
from std_msgs.msg import Float32MultiArray
import rclpy
from rclpy.node import Node
import torch
import torch.nn as nn

class PyTorchAIAgent(Node):
    def __init__(self):
        super().__init__('pytorch_ai_agent')

        # Define and load model
        self.model = self.load_model()

        # Subscribe to sensor data
        self.sensor_subscription = self.create_subscription(
            Float32MultiArray,
            'sensor_data',
            self.sensor_callback,
            10
        )

        # Publish actions
        self.action_publisher = self.create_publisher(
            Float32MultiArray,
            'ai_actions',
            10
        )

        self.get_logger().info('PyTorch AI Agent started')

    def load_model(self):
        # Example model - replace with your actual model
        model = nn.Sequential(
            nn.Linear(4, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 2)
        )

        # Load trained weights
        # model.load_state_dict(torch.load('path/to/model.pth'))

        model.eval()  # Set to evaluation mode
        return model

    def sensor_callback(self, msg):
        # Convert to PyTorch tensor
        sensor_data = torch.tensor([msg.data], dtype=torch.float32)

        # Run inference
        with torch.no_grad():  # Disable gradient computation for inference
            action = self.model(sensor_data)

        # Publish action
        action_msg = Float32MultiArray()
        action_msg.data = action.squeeze().tolist()
        self.action_publisher.publish(action_msg)

        self.get_logger().info(f'AI action published: {action_msg.data}')

def main(args=None):
    rclpy.init(args=args)
    node = PyTorchAIAgent()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

## Real-World AI Integration Examples

### Path Planning with AI

```python
from nav_msgs.srv import GetPlan
from geometry_msgs.msg import PoseStamped
from std_msgs.msg import String
import rclpy
from rclpy.node import Node
import numpy as np

class AINavigationAgent(Node):
    def __init__(self):
        super().__init__('ai_navigation_agent')

        # Service client for path planning
        self.planner_client = self.create_client(GetPlan, 'plan_path')

        # Publisher for navigation commands
        self.nav_publisher = self.create_publisher(String, 'navigation_commands', 10)

        # Subscribe to map updates
        self.map_subscription = self.create_subscription(
            String,  # Simplified - would use OccupancyGrid in practice
            'map_updates',
            self.map_callback,
            10
        )

        self.current_map = None
        self.get_logger().info('AI Navigation Agent started')

    def map_callback(self, msg):
        # Process map update
        self.current_map = msg.data
        self.get_logger().info('Map updated')

    def request_path(self, start, goal):
        # Wait for planner service
        while not self.planner_client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Path planner service not available, waiting...')

        # Create request
        request = GetPlan.Request()
        request.start = start
        request.goal = goal
        # Set tolerance if needed
        request.tolerance = 0.5

        # Call service asynchronously
        future = self.planner_client.call_async(request)
        future.add_done_callback(self.path_response_callback)

    def path_response_callback(self, future):
        try:
            response = future.result()
            if response.plan.poses:
                # Process the planned path
                path_length = len(response.plan.poses)
                self.get_logger().info(f'Received path with {path_length} waypoints')

                # Send navigation command
                cmd_msg = String()
                cmd_msg.data = f'follow_path_{path_length}_waypoints'
                self.nav_publisher.publish(cmd_msg)
            else:
                self.get_logger().warn('No path found')
        except Exception as e:
            self.get_logger().error(f'Path planning failed: {e}')

def main(args=None):
    rclpy.init(args=args)
    node = AINavigationAgent()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

### Object Recognition and Action Selection

```python
from std_msgs.msg import String
from sensor_msgs.msg import Image
from example_interfaces.srv import Trigger
import rclpy
from rclpy.node import Node
import cv2
import numpy as np

class ObjectRecognitionAgent(Node):
    def __init__(self):
        super().__init__('object_recognition_agent')

        # Subscribe to camera feed
        self.image_subscription = self.create_subscription(
            Image,
            'camera/image_raw',
            self.image_callback,
            10
        )

        # Publisher for recognized objects
        self.object_publisher = self.create_publisher(String, 'recognized_objects', 10)

        # Publisher for robot actions
        self.action_publisher = self.create_publisher(String, 'robot_actions', 10)

        # Service for manual trigger
        self.recognition_service = self.create_service(
            Trigger,
            'run_recognition',
            self.recognition_service_callback
        )

        self.get_logger().info('Object Recognition Agent started')

    def image_callback(self, msg):
        # Process image for object recognition
        # (This is a simplified example)
        self.run_object_recognition()

    def run_object_recognition(self):
        # Simulated object recognition
        # In practice, you would use actual AI models here
        detected_objects = ['person', 'chair', 'table']  # Simulated detection

        if detected_objects:
            # Publish detected objects
            obj_msg = String()
            obj_msg.data = ','.join(detected_objects)
            self.object_publisher.publish(obj_msg)

            # Select appropriate action based on objects
            action = self.select_action(detected_objects)
            action_msg = String()
            action_msg.data = action
            self.action_publisher.publish(action_msg)

            self.get_logger().info(f'Detected: {obj_msg.data}, Action: {action}')

    def select_action(self, objects):
        # AI decision logic based on detected objects
        if 'person' in objects:
            return 'approach_person'
        elif 'chair' in objects and 'table' in objects:
            return 'navigate_to_workspace'
        else:
            return 'explore_area'

    def recognition_service_callback(self, request, response):
        # Manual trigger for object recognition
        self.run_object_recognition()
        response.success = True
        response.message = 'Object recognition completed'
        return response

def main(args=None):
    rclpy.init(args=args)
    node = ObjectRecognitionAgent()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

## Best Practices for AI Integration

### 1. Error Handling and Fallbacks

```python
def ai_processing_with_fallback(self, input_data):
    try:
        # Main AI processing
        result = self.ai_model.predict(input_data)
        return result
    except Exception as e:
        self.get_logger().error(f'AI processing failed: {e}')

        # Fallback to safe behavior
        fallback_action = 'safe_stop'
        self.get_logger().info(f'Using fallback action: {fallback_action}')
        return fallback_action
```

### 2. Performance Monitoring

```python
from rclpy.time import Time
import time

class MonitoredAIAgent(Node):
    def __init__(self):
        super().__init__('monitored_ai_agent')
        self.processing_times = []

    def ai_process_with_monitoring(self, input_data):
        start_time = time.time()

        # AI processing
        result = self.ai_model.predict(input_data)

        end_time = time.time()
        processing_time = end_time - start_time

        # Store for statistics
        self.processing_times.append(processing_time)

        # Log if processing is too slow
        if processing_time > 0.1:  # 100ms threshold
            self.get_logger().warn(f'AI processing took {processing_time:.3f}s')

        return result
```

### 3. Resource Management

```python
def __init__(self):
    super().__init__('resource_efficient_ai_agent')

    # Load models efficiently
    self.load_models()

    # Set up garbage collection if needed
    import gc
    self.gc_enabled = True

def load_models(self):
    # Load models to GPU if available
    if torch.cuda.is_available():
        self.model = self.model.cuda()

    # Set to evaluation mode to save memory
    self.model.eval()

    # Disable gradients for inference
    torch.set_grad_enabled(False)

def destroy_node(self):
    # Clean up AI resources
    if hasattr(self, 'model'):
        del self.model

    # Force garbage collection
    import gc
    gc.collect()

    super().destroy_node()
```

## Integration Strategies

### 1. Service-Based Integration
- Use services for synchronous AI decision-making
- Good for critical decisions that must complete
- Can block other operations if AI processing is slow

### 2. Topic-Based Integration
- Use topics for continuous AI processing and updates
- Good for perception and monitoring tasks
- Non-blocking, but may miss updates if processing is slow

### 3. Hybrid Approach
- Combine services and topics for complex AI systems
- Use topics for continuous monitoring
- Use services for critical decision points

## Summary

AI integration with ROS 2 enables intelligent robotic systems:

- **Service patterns** allow AI to provide decision-making capabilities
- **Client patterns** allow AI to orchestrate other services
- **Popular libraries** like TensorFlow and PyTorch can be integrated
- **Real-world examples** show practical applications
- **Best practices** ensure robust and efficient integration

The key to successful AI-ROS integration is understanding when to use each pattern and implementing proper error handling and resource management.