# Hands-On Tutorials: Isaac ROS Implementation

This section provides step-by-step tutorials to help you implement Isaac ROS perception and processing capabilities in your robotics applications.

## Tutorial 1: Setting Up Isaac ROS Perception Pipeline

### Objective
Create a basic Isaac ROS perception pipeline that processes camera data and performs object detection using GPU acceleration.

### Prerequisites
- Isaac Sim environment with robot and camera
- NVIDIA GPU with CUDA support
- Isaac ROS packages installed
- Basic ROS 2 knowledge

### Step 1: Environment Setup
First, let's set up the ROS 2 environment for Isaac ROS:

```bash
# Source ROS 2 and Isaac ROS
source /opt/ros/humble/setup.bash
source /usr/local/share/isaac_ros_managed_apps/setup.sh

# Verify Isaac ROS packages are available
ros2 pkg list | grep isaac_ros
```

### Step 2: Create a Perception Package
Create a new ROS 2 package for your Isaac ROS perception nodes:

```bash
# Create the workspace
mkdir -p ~/isaac_ros_ws/src
cd ~/isaac_ros_ws/src

# Create perception package
ros2 pkg create --build-type ament_python isaac_ros_perception_examples
cd isaac_ros_perception_examples
mkdir -p isaac_ros_perception_examples
```

Create the main perception node:

```python
# isaac_ros_perception_examples/isaac_ros_perception_examples/perception_node.py
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np

class IsaacROSPerceptionNode(Node):
    def __init__(self):
        super().__init__('isaac_ros_perception_node')

        # Initialize OpenCV bridge
        self.bridge = CvBridge()

        # Create subscription to camera image
        self.subscription = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )

        # Create publisher for processed image
        self.publisher = self.create_publisher(
            Image,
            '/camera/image_processed',
            10
        )

        self.get_logger().info('Isaac ROS Perception Node Initialized')

    def image_callback(self, msg):
        """
        Process incoming camera image
        """
        try:
            # Convert ROS Image message to OpenCV image
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Process image using Isaac ROS techniques
            processed_image = self.process_image(cv_image)

            # Convert back to ROS Image message
            processed_msg = self.bridge.cv2_to_imgmsg(processed_image, encoding='bgr8')
            processed_msg.header = msg.header

            # Publish processed image
            self.publisher.publish(processed_msg)

            self.get_logger().info('Processed image published')

        except Exception as e:
            self.get_logger().error(f'Error processing image: {str(e)}')

    def process_image(self, image):
        """
        Process image using Isaac ROS perception techniques
        """
        # In a real implementation, this would use Isaac ROS packages like:
        # - Isaac ROS Image Pipeline for preprocessing
        # - Isaac ROS DetectNet for object detection
        # - Isaac ROS Stereo Dense Reconstruction for 3D processing

        # For this tutorial, we'll implement a basic feature detection pipeline
        processed = self.basic_feature_detection(image)
        return processed

    def basic_feature_detection(self, image):
        """
        Basic feature detection using OpenCV (placeholder for Isaac ROS functionality)
        """
        # Convert to grayscale for feature detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Detect features using Shi-Tomasi corner detection (similar to Isaac ROS FAST detector)
        corners = cv2.goodFeaturesToTrack(
            gray,
            maxCorners=100,
            qualityLevel=0.01,
            minDistance=10,
            blockSize=3
        )

        # Draw circles around detected features
        result_image = image.copy()
        if corners is not None:
            corners = np.int0(corners)
            for corner in corners:
                x, y = corner.ravel()
                cv2.circle(result_image, (x, y), 5, (0, 255, 0), 2)

        return result_image

def main(args=None):
    rclpy.init(args=args)

    perception_node = IsaacROSPerceptionNode()

    try:
        rclpy.spin(perception_node)
    except KeyboardInterrupt:
        pass
    finally:
        perception_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 3: Create the Package Entry Point
Create a setup.py file for the package:

```python
# setup.py
from setuptools import find_packages, setup

package_name = 'isaac_ros_perception_examples'

setup(
    name=package_name,
    version='0.0.1',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Your Name',
    maintainer_email='your.email@example.com',
    description='Examples for Isaac ROS perception',
    license='TODO: License declaration',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'perception_node = isaac_ros_perception_examples.perception_node:main',
        ],
    },
)
```

Create the package.xml file:

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>isaac_ros_perception_examples</name>
  <version>0.0.1</version>
  <description>Examples for Isaac ROS perception</description>
  <maintainer email="your.email@example.com">Your Name</maintainer>
  <license>TODO: License declaration</license>

  <depend>rclpy</depend>
  <depend>sensor_msgs</depend>
  <depend>cv_bridge</depend>

  <test_depend>ament_copyright</test_depend>
  <test_depend>ament_flake8</test_depend>
  <test_depend>ament_pep257</test_depend>
  <test_depend>python3-pytest</test_depend>

  <export>
    <build_type>ament_python</build_type>
  </export>
</package>
```

### Step 4: Build and Test the Package
```bash
cd ~/isaac_ros_ws
colcon build --packages-select isaac_ros_perception_examples
source install/setup.bash

# Run the perception node
ros2 run isaac_ros_perception_examples perception_node
```

## Tutorial 2: Isaac ROS GPU-Accelerated Perception

### Objective
Implement GPU-accelerated perception using Isaac ROS specialized packages.

### Step 1: Install Isaac ROS Dependencies
```bash
# Install Isaac ROS perception packages
sudo apt update
sudo apt install ros-humble-isaac-ros-image-pipeline
sudo apt install ros-humble-isaac-ros-visual-slam
sudo apt install ros-humble-isaac-ros-detect-net
sudo apt install ros-humble-isaac-ros-segmentation
```

### Step 2: Create Isaac ROS DetectNet Node
```python
# isaac_ros_perception_examples/isaac_ros_perception_examples/detectnet_node.py
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
from isaac_ros_messages.msg import Detection2DArray  # Placeholder - use actual Isaac ROS message type

import jetson.inference
import jetson.utils

class IsaacROSDetectNetNode(Node):
    def __init__(self):
        super().__init__('isaac_ros_detectnet_node')

        # Initialize OpenCV bridge
        self.bridge = CvBridge()

        # Create subscription to camera image
        self.image_subscription = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )

        # Create publisher for detection results
        self.detection_publisher = self.create_publisher(
            Detection2DArray,  # Use actual Isaac ROS detection message type
            '/detections',
            10
        )

        # Initialize Isaac ROS DetectNet (in actual implementation)
        # self.net = jetson.inference.detectNet("ssd-mobilenet-v2", threshold=0.5)

        # For this tutorial, we'll use a mock implementation
        self.get_logger().info('Isaac ROS DetectNet Node Initialized')

    def image_callback(self, msg):
        """
        Process image using Isaac ROS DetectNet
        """
        try:
            # Convert ROS Image to OpenCV format
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # In actual Isaac ROS implementation:
            # - Convert image to CUDA memory
            # - Run DetectNet inference
            # - Convert results to ROS messages

            # Mock implementation for tutorial
            detections = self.mock_detect_objects(cv_image)

            # Create and publish detection message
            detection_msg = self.create_detection_message(detections, msg.header)
            self.detection_publisher.publish(detection_msg)

            self.get_logger().info(f'Detected {len(detections)} objects')

        except Exception as e:
            self.get_logger().error(f'Error in DetectNet processing: {str(e)}')

    def mock_detect_objects(self, image):
        """
        Mock object detection for tutorial purposes
        In actual Isaac ROS: this would use GPU-accelerated inference
        """
        # In real Isaac ROS DetectNet, this would be:
        # cuda_img = jetson.utils.cudaFromNumpy(image)
        # detections = self.net.Detect(cuda_img)

        # For this tutorial, return mock detections
        mock_detections = [
            {'bbox': [100, 100, 200, 200], 'class': 'person', 'confidence': 0.92},
            {'bbox': [300, 150, 400, 250], 'class': 'robot', 'confidence': 0.88}
        ]

        return mock_detections

    def create_detection_message(self, detections, header):
        """
        Create Isaac ROS detection message from detection results
        """
        # In actual implementation, use Isaac ROS detection message format
        # For this tutorial, return a mock message
        detection_msg = type('MockDetectionMsg', (), {
            'header': header,
            'detections': detections
        })()

        return detection_msg

def main(args=None):
    rclpy.init(args=args)

    detectnet_node = IsaacROSDetectNetNode()

    try:
        rclpy.spin(detectnet_node)
    except KeyboardInterrupt:
        pass
    finally:
        detectnet_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 3: Launch Isaac ROS Perception Pipeline
Create a launch file for the perception pipeline:

```python
# isaac_ros_perception_examples/isaac_ros_perception_examples/launch/perception_pipeline.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os

def generate_launch_description():
    # Isaac ROS perception pipeline launch file

    perception_node = Node(
        package='isaac_ros_perception_examples',
        executable='perception_node',
        name='isaac_ros_perception_node',
        parameters=[
            # Add parameters here if needed
        ],
        remappings=[
            ('/camera/image_raw', '/camera/rgb/image_raw'),
            ('/camera/image_processed', '/camera/rgb/image_processed')
        ],
        output='screen'
    )

    detectnet_node = Node(
        package='isaac_ros_perception_examples',
        executable='detectnet_node',
        name='isaac_ros_detectnet_node',
        parameters=[
            # Isaac ROS DetectNet specific parameters
        ],
        remappings=[
            ('/camera/image_raw', '/camera/rgb/image_raw'),
            ('/detections', '/perception/detections')
        ],
        output='screen'
    )

    return LaunchDescription([
        perception_node,
        detectnet_node
    ])
```

## Tutorial 3: Isaac ROS VSLAM Implementation

### Objective
Implement Visual SLAM using Isaac ROS VSLAM packages for mapping and localization.

### Step 1: Set Up VSLAM Components
```python
# isaac_ros_perception_examples/isaac_ros_perception_examples/vslam_node.py
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from geometry_msgs.msg import PoseStamped
from nav_msgs.msg import Odometry
from visualization_msgs.msg import MarkerArray
from cv_bridge import CvBridge
import numpy as np

class IsaacROSVSLAMNode(Node):
    def __init__(self):
        super().__init__('isaac_ros_vslam_node')

        # Initialize components
        self.bridge = CvBridge()
        self.current_pose = np.eye(4)  # 4x4 transformation matrix
        self.keyframes = []
        self.map_points = []

        # Create subscribers for stereo camera or RGB-D camera
        self.left_image_sub = self.create_subscription(
            Image,
            '/camera/left/image_rect_color',
            self.left_image_callback,
            10
        )

        self.right_image_sub = self.create_subscription(
            Image,
            '/camera/right/image_rect_color',
            self.right_image_callback,
            10
        )

        self.camera_info_sub = self.create_subscription(
            CameraInfo,
            '/camera/left/camera_info',
            self.camera_info_callback,
            10
        )

        # Publishers for VSLAM results
        self.odom_publisher = self.create_publisher(
            Odometry,
            '/visual_slam/odometry',
            10
        )

        self.pose_publisher = self.create_publisher(
            PoseStamped,
            '/visual_slam/pose',
            10
        )

        self.map_publisher = self.create_publisher(
            MarkerArray,
            '/visual_slam/map',
            10
        )

        # Initialize camera parameters
        self.camera_matrix = None
        self.distortion_coeffs = None
        self.baseline = 0.1  # Default stereo baseline in meters

        # Initialize Isaac ROS VSLAM components (mock implementation for tutorial)
        self.initialize_vslam_components()

        self.get_logger().info('Isaac ROS VSLAM Node Initialized')

    def initialize_vslam_components(self):
        """
        Initialize Isaac ROS VSLAM components
        In actual implementation: this would initialize Isaac ROS VSLAM nodes
        """
        # Isaac ROS provides packages like:
        # - Isaac ROS Stereo Visual SLAM
        # - Isaac ROS Mono Visual SLAM
        # - Isaac ROS Visual-Inertial Odometry

        # For this tutorial, we'll use a mock implementation
        self.vslam_config = {
            'feature_detector': 'fast',
            'descriptor_extractor': 'orb',
            'matcher': 'brute_force',
            'min_keyframe_distance': 0.5,  # meters
            'max_features': 1000,
            'reprojection_threshold': 2.0  # pixels
        }

    def left_image_callback(self, msg):
        """
        Process left camera image for stereo VSLAM
        """
        try:
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # In actual Isaac ROS VSLAM: this would be handled by Isaac ROS nodes
            # For this tutorial, implement basic visual odometry
            self.process_visual_odometry(cv_image, msg.header)

        except Exception as e:
            self.get_logger().error(f'Error processing left image: {str(e)}')

    def right_image_callback(self, msg):
        """
        Process right camera image for stereo VSLAM
        """
        try:
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Store for stereo processing
            if not hasattr(self, 'right_image_buffer'):
                self.right_image_buffer = []
            self.right_image_buffer.append((cv_image, msg.header))

            # Keep only recent images
            if len(self.right_image_buffer) > 10:
                self.right_image_buffer = self.right_image_buffer[-5:]

        except Exception as e:
            self.get_logger().error(f'Error processing right image: {str(e)}')

    def camera_info_callback(self, msg):
        """
        Handle camera calibration information
        """
        # Extract camera intrinsic parameters
        self.camera_matrix = np.array(msg.k).reshape(3, 3)
        self.distortion_coeffs = np.array(msg.d)

        # Extract stereo baseline from P matrix if available
        if len(msg.p) >= 12:
            self.baseline = abs(msg.p[3] / msg.p[0])  # P[0,3] = -fx * baseline

    def process_visual_odometry(self, image, header):
        """
        Process visual odometry using Isaac ROS principles
        """
        if self.camera_matrix is None:
            self.get_logger().warn('Waiting for camera calibration...')
            return

        # Extract features from current image
        features = self.extract_features(image)

        if len(features) < 10:
            self.get_logger().warn(f'Insufficient features detected: {len(features)}')
            return

        # If this is the first frame, initialize
        if not hasattr(self, 'prev_features'):
            self.prev_image = image
            self.prev_features = features
            self.prev_header = header
            self.get_logger().info('VSLAM initialized with first frame')
            return

        # Match features with previous frame
        matches = self.match_features(self.prev_features, features)

        if len(matches) < 10:
            self.get_logger().warn(f'Insufficient matches found: {len(matches)}')
            self.prev_features = features
            return

        # Estimate pose change using essential matrix
        pose_change = self.estimate_pose_change(matches)

        if pose_change is not None:
            # Update current pose
            R = pose_change['R']
            t = pose_change['t']

            # Create transformation matrix
            T = np.eye(4)
            T[:3, :3] = R
            T[:3, 3] = t

            # Update global pose
            self.current_pose = self.current_pose @ np.linalg.inv(T)

            # Check if we should add this as a keyframe
            translation_norm = np.linalg.norm(t)
            if translation_norm > self.vslam_config['min_keyframe_distance']:
                self.add_keyframe(image, features, self.current_pose, header)

            # Publish results
            self.publish_vslam_results(self.current_pose, header)

        # Update previous frame data
        self.prev_features = features
        self.prev_image = image
        self.prev_header = header

    def extract_features(self, image):
        """
        Extract features using OpenCV (Isaac ROS would use GPU-accelerated methods)
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Use FAST detector (similar to what Isaac ROS might use)
        detector = cv2.FastFeatureDetector_create()
        keypoints = detector.detect(gray, None)

        # Use ORB descriptor (similar to Isaac ROS approach)
        orb = cv2.ORB_create(nfeatures=self.vslam_config['max_features'])
        keypoints, descriptors = orb.compute(gray, keypoints)

        return {
            'keypoints': keypoints,
            'descriptors': descriptors,
            'image': gray
        }

    def match_features(self, prev_features, curr_features):
        """
        Match features between previous and current frames
        """
        if prev_features['descriptors'] is None or curr_features['descriptors'] is None:
            return []

        # Use brute force matcher (Isaac ROS would use optimized matcher)
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(prev_features['descriptors'], curr_features['descriptors'])

        # Sort matches by distance
        matches = sorted(matches, key=lambda x: x.distance)

        # Apply distance threshold
        distance_threshold = 50  # Adjust based on descriptor type
        good_matches = [m for m in matches if m.distance < distance_threshold]

        return good_matches

    def estimate_pose_change(self, matches):
        """
        Estimate pose change using matched features
        """
        if len(matches) < 8:  # Need minimum 8 points for essential matrix
            return None

        # Get matched points
        prev_points = []
        curr_points = []

        for match in matches:
            prev_idx = match.queryIdx
            curr_idx = match.trainIdx

            if (prev_idx < len(self.prev_features['keypoints']) and
                curr_idx < len(self.curr_features['keypoints'])):

                prev_pt = self.prev_features['keypoints'][prev_idx].pt
                curr_pt = self.curr_features['keypoints'][curr_idx].pt

                prev_points.append(prev_pt)
                curr_points.append(curr_pt)

        if len(prev_points) < 8:
            return None

        prev_points = np.array(prev_points, dtype=np.float32)
        curr_points = np.array(curr_points, dtype=np.float32)

        # Find essential matrix
        E, mask = cv2.findEssentialMat(
            curr_points, prev_points,
            self.camera_matrix,
            method=cv2.RANSAC,
            prob=0.999,
            threshold=self.vslam_config['reprojection_threshold']
        )

        if E is None or E.size == 0:
            return None

        # Decompose essential matrix to get rotation and translation
        _, R, t, _ = cv2.recoverPose(E, curr_points, prev_points, self.camera_matrix)

        return {'R': R, 't': t.flatten()}

    def add_keyframe(self, image, features, pose, header):
        """
        Add current frame as a keyframe to the map
        """
        keyframe = {
            'image': image,
            'features': features,
            'pose': pose.copy(),
            'timestamp': header.stamp
        }

        self.keyframes.append(keyframe)

        # Log keyframe addition
        self.get_logger().info(f'Added keyframe #{len(self.keyframes)} at pose: {pose[:3, 3]}')

        # Periodically optimize map (bundle adjustment in real implementation)
        if len(self.keyframes) % 10 == 0:  # Every 10 keyframes
            self.optimize_map()

    def optimize_map(self):
        """
        Optimize map using bundle adjustment (placeholder for Isaac ROS functionality)
        """
        self.get_logger().info(f'Optimizing map with {len(self.keyframes)} keyframes')

        # In Isaac ROS: this would use GPU-accelerated bundle adjustment
        # For this tutorial: just log the optimization event

    def publish_vslam_results(self, pose, header):
        """
        Publish VSLAM results (odometry, pose, map visualization)
        """
        # Publish odometry
        odom_msg = Odometry()
        odom_msg.header = header
        odom_msg.header.frame_id = 'map'
        odom_msg.child_frame_id = 'camera'

        # Convert transformation matrix to pose
        position = pose[:3, 3]
        rotation_matrix = pose[:3, :3]

        # Convert rotation matrix to quaternion
        quat = self.rotation_matrix_to_quaternion(rotation_matrix)

        odom_msg.pose.pose.position.x = position[0]
        odom_msg.pose.pose.position.y = position[1]
        odom_msg.pose.pose.position.z = position[2]

        odom_msg.pose.pose.orientation.x = quat[0]
        odom_msg.pose.pose.orientation.y = quat[1]
        odom_msg.pose.pose.orientation.z = quat[2]
        odom_msg.pose.pose.orientation.w = quat[3]

        # Set velocities to zero (would come from differentiation in real implementation)
        odom_msg.twist.twist.linear.x = 0.0
        odom_msg.twist.twist.linear.y = 0.0
        odom_msg.twist.twist.linear.z = 0.0
        odom_msg.twist.twist.angular.x = 0.0
        odom_msg.twist.twist.angular.y = 0.0
        odom_msg.twist.twist.angular.z = 0.0

        self.odom_publisher.publish(odom_msg)

        # Publish pose
        pose_msg = PoseStamped()
        pose_msg.header = header
        pose_msg.header.frame_id = 'map'

        pose_msg.pose.position.x = position[0]
        pose_msg.pose.position.y = position[1]
        pose_msg.pose.position.z = position[2]

        pose_msg.pose.orientation.x = quat[0]
        pose_msg.pose.orientation.y = quat[1]
        pose_msg.pose.orientation.z = quat[2]
        pose_msg.pose.orientation.w = quat[3]

        self.pose_publisher.publish(pose_msg)

        # Publish map visualization
        self.publish_map_visualization()

    def publish_map_visualization(self):
        """
        Publish map visualization markers
        """
        marker_array = MarkerArray()

        # Create markers for keyframe positions
        for i, keyframe in enumerate(self.keyframes):
            marker = Marker()
            marker.header.frame_id = 'map'
            marker.header.stamp = self.get_clock().now().to_msg()
            marker.ns = 'vslam_keyframes'
            marker.id = i
            marker.type = Marker.SPHERE
            marker.action = Marker.ADD

            # Position from keyframe pose
            pos = keyframe['pose'][:3, 3]
            marker.pose.position.x = pos[0]
            marker.pose.position.y = pos[1]
            marker.pose.position.z = pos[2]
            marker.pose.orientation.w = 1.0

            # Size and color
            marker.scale.x = 0.1
            marker.scale.y = 0.1
            marker.scale.z = 0.1
            marker.color.a = 1.0  # Alpha
            marker.color.r = 1.0  # Red for keyframes
            marker.color.g = 0.0
            marker.color.b = 0.0

            marker_array.markers.append(marker)

        # Create trajectory line
        if len(self.keyframes) > 1:
            trajectory_marker = Marker()
            trajectory_marker.header.frame_id = 'map'
            trajectory_marker.header.stamp = self.get_clock().now().to_msg()
            trajectory_marker.ns = 'vslam_trajectory'
            trajectory_marker.id = 1000
            trajectory_marker.type = Marker.LINE_STRIP
            trajectory_marker.action = Marker.ADD

            for keyframe in self.keyframes:
                pos = keyframe['pose'][:3, 3]
                point = Point()
                point.x = pos[0]
                point.y = pos[1]
                point.z = pos[2]
                trajectory_marker.points.append(point)

            trajectory_marker.scale.x = 0.02  # Line width
            trajectory_marker.color.a = 0.8
            trajectory_marker.color.r = 0.0
            trajectory_marker.color.g = 1.0  # Green for trajectory
            trajectory_marker.color.b = 0.0

            marker_array.markers.append(trajectory_marker)

        self.map_publisher.publish(marker_array)

    def rotation_matrix_to_quaternion(self, R):
        """
        Convert rotation matrix to quaternion
        """
        # Using the algorithm from "Quaternion and Rotation Matrix Conversion"
        trace = np.trace(R)

        if trace > 0:
            s = np.sqrt(trace + 1.0) * 2  # s = 4 * qw
            qw = 0.25 * s
            qx = (R[2, 1] - R[1, 2]) / s
            qy = (R[0, 2] - R[2, 0]) / s
            qz = (R[1, 0] - R[0, 1]) / s
        else:
            if R[0, 0] > R[1, 1] and R[0, 0] > R[2, 2]:
                s = np.sqrt(1.0 + R[0, 0] - R[1, 1] - R[2, 2]) * 2
                qw = (R[2, 1] - R[1, 2]) / s
                qx = 0.25 * s
                qy = (R[0, 1] + R[1, 0]) / s
                qz = (R[0, 2] + R[2, 0]) / s
            elif R[1, 1] > R[2, 2]:
                s = np.sqrt(1.0 + R[1, 1] - R[0, 0] - R[2, 2]) * 2
                qw = (R[0, 2] - R[2, 0]) / s
                qx = (R[0, 1] + R[1, 0]) / s
                qy = 0.25 * s
                qz = (R[1, 2] + R[2, 1]) / s
            else:
                s = np.sqrt(1.0 + R[2, 2] - R[0, 0] - R[1, 1]) * 2
                qw = (R[1, 0] - R[0, 1]) / s
                qx = (R[0, 2] + R[2, 0]) / s
                qy = (R[1, 2] + R[2, 1]) / s
                qz = 0.25 * s

        return np.array([qx, qy, qz, qw])

def main(args=None):
    rclpy.init(args=args)

    vslam_node = IsaacROSVSLAMNode()

    try:
        rclpy.spin(vslam_node)
    except KeyboardInterrupt:
        pass
    finally:
        vslam_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Tutorial 4: Multi-Sensor Data Fusion

### Objective
Implement sensor fusion combining data from multiple Isaac ROS perception nodes.

### Step 1: Create Sensor Fusion Node
```python
# isaac_ros_perception_examples/isaac_ros_perception_examples/sensor_fusion_node.py
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2, Imu
from geometry_msgs.msg import PoseStamped, TwistStamped
from nav_msgs.msg import Odometry
from std_msgs.msg import Float64MultiArray
from cv_bridge import CvBridge
import numpy as np
from scipy.spatial.transform import Rotation as R
import threading
from collections import deque

class IsaacROSSensorFusionNode(Node):
    def __init__(self):
        super().__init__('isaac_ros_sensor_fusion_node')

        # Initialize components
        self.bridge = CvBridge()
        self.fusion_lock = threading.Lock()

        # Create subscribers for different sensor types
        self.image_sub = self.create_subscription(
            Image,
            '/camera/image_processed',
            self.image_callback,
            10
        )

        self.lidar_sub = self.create_subscription(
            PointCloud2,
            '/lidar/points',
            self.lidar_callback,
            10
        )

        self.imu_sub = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )

        # Publishers for fused results
        self.fused_pose_pub = self.create_publisher(
            PoseStamped,
            '/fused/localization',
            10
        )

        self.fused_odom_pub = self.create_publisher(
            Odometry,
            '/fused/odometry',
            10
        )

        self.fused_state_pub = self.create_publisher(
            Float64MultiArray,
            '/fused/state_vector',
            10
        )

        # Data buffers for synchronization
        self.image_buffer = deque(maxlen=10)
        self.lidar_buffer = deque(maxlen=5)
        self.imu_buffer = deque(maxlen=50)  # Higher frequency IMU data

        # Fusion state
        self.fused_pose = np.eye(4)  # 4x4 transformation matrix
        self.fused_velocity = np.zeros(3)  # Linear velocity
        self.fused_angular_velocity = np.zeros(3)  # Angular velocity

        # Covariance matrix for uncertainty tracking
        self.state_covariance = np.eye(12) * 0.1  # [pos, vel, orient, ang_vel]

        # Timestamp synchronization tolerance
        self.sync_tolerance = 0.05  # 50ms

        # Initialize Isaac ROS fusion components (mock for tutorial)
        self.initialize_fusion_components()

        self.get_logger().info('Isaac ROS Sensor Fusion Node Initialized')

    def initialize_fusion_components(self):
        """
        Initialize Isaac ROS sensor fusion components
        In actual implementation: this would initialize Isaac ROS fusion packages
        """
        # Isaac ROS provides packages like:
        # - Isaac ROS MultiSense Fusion
        # - Isaac ROS Visual-Inertial Odometry
        # - Isaac ROS Sensor Fusion

        # For this tutorial, we'll use a mock implementation
        self.fusion_config = {
            'sensor_weights': {
                'camera': 0.3,
                'lidar': 0.4,
                'imu': 0.3
            },
            'fusion_method': 'ekf',  # Extended Kalman Filter
            'state_vector_size': 12  # [pos_x, pos_y, pos_z, vel_x, vel_y, vel_z,
                                   #  orient_x, orient_y, orient_z, orient_w,
                                   #  ang_vel_x, ang_vel_y, ang_vel_z]
        }

    def image_callback(self, msg):
        """
        Process image data from perception pipeline
        """
        with self.fusion_lock:
            # Extract pose information from visual data
            # In real Isaac ROS: this would come from VSLAM or visual odometry
            visual_pose = self.extract_pose_from_image(msg)

            if visual_pose is not None:
                # Store in buffer with timestamp
                timestamp = msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9
                self.image_buffer.append((visual_pose, timestamp, msg.header))

                # Check for synchronized data fusion
                self.attempt_fusion()

    def lidar_callback(self, msg):
        """
        Process LiDAR data from point cloud processing
        """
        with self.fusion_lock:
            # Extract pose/position information from LiDAR
            # In real Isaac ROS: this would come from LiDAR odometry or registration
            lidar_pose = self.extract_pose_from_lidar(msg)

            if lidar_pose is not None:
                # Store in buffer with timestamp
                timestamp = msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9
                self.lidar_buffer.append((lidar_pose, timestamp, msg.header))

                # Check for synchronized data fusion
                self.attempt_fusion()

    def imu_callback(self, msg):
        """
        Process IMU data for orientation and motion
        """
        with self.fusion_lock:
            # Extract orientation and angular velocity from IMU
            imu_data = {
                'orientation': [msg.orientation.x, msg.orientation.y, msg.orientation.z, msg.orientation.w],
                'angular_velocity': [msg.angular_velocity.x, msg.angular_velocity.y, msg.angular_velocity.z],
                'linear_acceleration': [msg.linear_acceleration.x, msg.linear_acceleration.y, msg.linear_acceleration.z]
            }

            timestamp = msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9
            self.imu_buffer.append((imu_data, timestamp, msg.header))

            # Check for synchronized data fusion
            self.attempt_fusion()

    def extract_pose_from_image(self, image_msg):
        """
        Extract pose information from processed image (placeholder)
        In real Isaac ROS: this would use VSLAM or visual odometry results
        """
        # For this tutorial, return a mock pose based on some image feature
        # In real implementation, this would come from VSLAM node
        return np.eye(4)  # Identity pose as placeholder

    def extract_pose_from_lidar(self, lidar_msg):
        """
        Extract pose information from LiDAR data (placeholder)
        In real Isaac ROS: this would use LiDAR odometry or ICP registration
        """
        # For this tutorial, return a mock pose
        # In real implementation, this would come from LiDAR odometry node
        return np.eye(4)  # Identity pose as placeholder

    def attempt_fusion(self):
        """
        Attempt to fuse synchronized sensor data
        """
        # Find synchronized data across all sensors
        sync_data = self.find_synchronized_data()

        if sync_data:
            # Perform sensor fusion
            fused_result = self.fuse_sensor_data(sync_data)

            # Update internal state
            self.update_fused_state(fused_result)

            # Publish fused results
            self.publish_fused_results(sync_data['timestamp'])

    def find_synchronized_data(self):
        """
        Find synchronized data across all sensors within tolerance
        """
        if not (self.image_buffer and self.lidar_buffer and self.imu_buffer):
            return None

        # Get latest data from each sensor
        latest_image = self.image_buffer[-1]
        latest_lidar = self.lidar_buffer[-1]
        latest_imu = self.imu_buffer[-1]

        # Check timestamp synchronization
        image_time = latest_image[1]
        lidar_time = latest_lidar[1]
        imu_time = latest_imu[1]

        # Find median timestamp as reference
        ref_time = np.median([image_time, lidar_time, imu_time])

        # Check if all timestamps are within tolerance
        if (abs(image_time - ref_time) <= self.sync_tolerance and
            abs(lidar_time - ref_time) <= self.sync_tolerance and
            abs(imu_time - ref_time) <= self.sync_tolerance):

            return {
                'image': latest_image[0],
                'lidar': latest_lidar[0],
                'imu': latest_imu[0],
                'timestamp': latest_image[2]  # Use image header as reference
            }

        return None

    def fuse_sensor_data(self, sync_data):
        """
        Fuse synchronized sensor data using weighted approach
        In real Isaac ROS: this would use more sophisticated fusion algorithms
        """
        # Extract sensor data
        visual_pose = sync_data['image']
        lidar_pose = sync_data['lidar']
        imu_data = sync_data['imu']

        # Apply sensor weights for fusion
        weights = self.fusion_config['sensor_weights']

        # For position estimation, combine visual and LiDAR data
        visual_pos = visual_pose[:3, 3]
        lidar_pos = lidar_pose[:3, 3]

        fused_pos = (weights['camera'] * visual_pos + weights['lidar'] * lidar_pos) / \
                   (weights['camera'] + weights['lidar'])

        # For orientation, primarily use IMU with visual correction
        imu_orientation = np.array(imu_data['orientation'])
        visual_orientation = self.matrix_to_quaternion(visual_pose[:3, :3])

        # Simple weighted combination (in practice, use proper quaternion interpolation)
        fused_orientation = self.weighted_quaternion_blend(
            visual_orientation, imu_orientation,
            weights['camera'], weights['imu']
        )

        # For velocity, use IMU integration with visual/LiDAR correction
        fused_velocity = self.estimate_velocity_from_fusion(
            imu_data['linear_acceleration'],
            visual_pos, lidar_pos
        )

        return {
            'position': fused_pos,
            'orientation': fused_orientation,
            'velocity': fused_velocity,
            'angular_velocity': np.array(imu_data['angular_velocity'])
        }

    def weighted_quaternion_blend(self, q1, q2, w1, w2):
        """
        Perform weighted quaternion blend (simplified)
        """
        # Normalize quaternions
        q1 = q1 / np.linalg.norm(q1)
        q2 = q2 / np.linalg.norm(q2)

        # Weighted combination (simplified - in practice use proper slerp)
        blended_q = w1 * q1 + w2 * q2
        return blended_q / np.linalg.norm(blended_q)

    def estimate_velocity_from_fusion(self, linear_accel, visual_pos, lidar_pos):
        """
        Estimate velocity by combining acceleration integration and position differentiation
        """
        # This would be more sophisticated in real implementation
        # For now, return a simple estimate based on IMU acceleration
        dt = 0.01  # Assuming 100Hz IMU data

        # Integrate acceleration to get velocity
        self.fused_velocity += np.array(linear_accel) * dt

        # Apply some damping to prevent drift
        self.fused_velocity *= 0.99

        return self.fused_velocity

    def update_fused_state(self, fusion_result):
        """
        Update the internal fused state
        """
        # Update position
        self.fused_pose[:3, 3] = fusion_result['position']

        # Update orientation
        quat = fusion_result['orientation']
        rotation_matrix = self.quaternion_to_matrix(quat)
        self.fused_pose[:3, :3] = rotation_matrix

        # Update velocity
        self.fused_velocity = fusion_result['velocity']
        self.fused_angular_velocity = fusion_result['angular_velocity']

    def publish_fused_results(self, header):
        """
        Publish fused sensor results
        """
        # Publish fused pose
        pose_msg = PoseStamped()
        pose_msg.header = header
        pose_msg.header.frame_id = 'map'

        pos = self.fused_pose[:3, 3]
        pose_msg.pose.position.x = pos[0]
        pose_msg.pose.position.y = pos[1]
        pose_msg.pose.position.z = pos[2]

        quat = self.matrix_to_quaternion(self.fused_pose[:3, :3])
        pose_msg.pose.orientation.x = quat[0]
        pose_msg.pose.orientation.y = quat[1]
        pose_msg.pose.orientation.z = quat[2]
        pose_msg.pose.orientation.w = quat[3]

        self.fused_pose_pub.publish(pose_msg)

        # Publish fused odometry
        odom_msg = Odometry()
        odom_msg.header = header
        odom_msg.header.frame_id = 'map'
        odom_msg.child_frame_id = 'base_link'

        # Position
        odom_msg.pose.pose.position.x = pos[0]
        odom_msg.pose.pose.position.y = pos[1]
        odom_msg.pose.pose.position.z = pos[2]

        odom_msg.pose.pose.orientation.x = quat[0]
        odom_msg.pose.pose.orientation.y = quat[1]
        odom_msg.pose.pose.orientation.z = quat[2]
        odom_msg.pose.pose.orientation.w = quat[3]

        # Velocity
        odom_msg.twist.twist.linear.x = self.fused_velocity[0]
        odom_msg.twist.twist.linear.y = self.fused_velocity[1]
        odom_msg.twist.twist.linear.z = self.fused_velocity[2]

        odom_msg.twist.twist.angular.x = self.fused_angular_velocity[0]
        odom_msg.twist.twist.angular.y = self.fused_angular_velocity[1]
        odom_msg.twist.twist.angular.z = self.fused_angular_velocity[2]

        self.fused_odom_pub.publish(odom_msg)

        # Publish state vector for advanced applications
        state_msg = Float64MultiArray()
        state_msg.data = np.concatenate([
            pos,  # Position (3)
            self.fused_velocity,  # Velocity (3)
            quat,  # Orientation (4)
            self.fused_angular_velocity  # Angular velocity (3)
        ]).tolist()

        self.fused_state_pub.publish(state_msg)

    def matrix_to_quaternion(self, matrix):
        """
        Convert rotation matrix to quaternion
        """
        R_obj = R.from_matrix(matrix)
        quat = R_obj.as_quat()
        # Convert from [x,y,z,w] to [w,x,y,z] format
        return np.array([quat[3], quat[0], quat[1], quat[2]])

    def quaternion_to_matrix(self, quat):
        """
        Convert quaternion to rotation matrix
        """
        # Convert from [w,x,y,z] to [x,y,z,w] format
        q_xyzw = np.array([quat[1], quat[2], quat[3], quat[0]])
        R_obj = R.from_quat(q_xyzw)
        return R_obj.as_matrix()

def main(args=None):
    rclpy.init(args=args)

    fusion_node = IsaacROSSensorFusionNode()

    try:
        rclpy.spin(fusion_node)
    except KeyboardInterrupt:
        pass
    finally:
        fusion_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Tutorial 5: Performance Optimization

### Objective
Optimize Isaac ROS perception pipelines for real-time performance.

### Step 1: Create Performance Monitoring Node
```python
# Performance optimization techniques
class IsaacROSPipelineOptimizer:
    def __init__(self):
        self.performance_metrics = {
            'processing_times': [],
            'memory_usage': [],
            'gpu_utilization': [],
            'sensor_rates': {},
            'bandwidth_usage': {}
        }

        self.optimization_params = {
            'max_features': 1000,
            'processing_resolution': (640, 480),
            'batch_size': 1,
            'thread_count': 4
        }

    def optimize_perception_pipeline(self, pipeline_config):
        """
        Optimize Isaac ROS perception pipeline based on performance metrics
        """
        # Analyze current performance
        current_fps = self.measure_current_fps()
        current_gpu_util = self.measure_gpu_utilization()
        current_memory = self.measure_memory_usage()

        # Adjust parameters based on performance
        if current_fps < pipeline_config.get('target_fps', 30):
            # Reduce processing load
            self.reduce_processing_complexity()
        elif current_fps > pipeline_config.get('target_fps', 30) * 1.2:
            # Can potentially increase quality
            self.increase_processing_quality()

        # Optimize based on GPU utilization
        if current_gpu_util > 90:  # GPU overloaded
            self.reduce_gpu_workload()
        elif current_gpu_util < 50:  # GPU underutilized
            self.increase_gpu_utilization()

        # Optimize memory usage
        if current_memory > 0.8:  # 80% memory usage
            self.perform_memory_optimization()

        return self.optimization_params

    def reduce_processing_complexity(self):
        """
        Reduce processing complexity to improve performance
        """
        # Reduce feature count
        self.optimization_params['max_features'] = max(
            300,  # Minimum features for tracking
            int(self.optimization_params['max_features'] * 0.8)  # Reduce by 20%
        )

        # Reduce processing resolution
        current_res = self.optimization_params['processing_resolution']
        new_res = (int(current_res[0] * 0.8), int(current_res[1] * 0.8))
        self.optimization_params['processing_resolution'] = new_res

        self.get_logger().info("Reduced processing complexity for performance")

    def increase_processing_quality(self):
        """
        Increase processing quality when resources available
        """
        # Increase feature count (up to maximum)
        self.optimization_params['max_features'] = min(
            2000,  # Maximum features
            int(self.optimization_params['max_features'] * 1.1)  # Increase by 10%
        )

        # Increase processing resolution (up to maximum)
        current_res = self.optimization_params['processing_resolution']
        max_res = (1920, 1080)  # Maximum resolution
        new_res = (
            min(max_res[0], int(current_res[0] * 1.1)),
            min(max_res[1], int(current_res[1] * 1.1))
        )
        self.optimization_params['processing_resolution'] = new_res

        self.get_logger().info("Increased processing quality based on available resources")

    def reduce_gpu_workload(self):
        """
        Reduce GPU workload when utilization is high
        """
        # Reduce batch size for inference
        self.optimization_params['batch_size'] = max(
            1,  # Minimum batch size
            self.optimization_params['batch_size'] - 1
        )

        # Reduce feature extraction complexity
        # Use simpler feature detectors when GPU is stressed

        self.get_logger().info("Reduced GPU workload due to high utilization")

    def increase_gpu_utilization(self):
        """
        Increase GPU utilization when underutilized
        """
        # Increase batch size for better GPU utilization
        self.optimization_params['batch_size'] = min(
            8,  # Maximum batch size
            self.optimization_params['batch_size'] + 1
        )

        self.get_logger().info("Increased GPU utilization for better performance")

    def perform_memory_optimization(self):
        """
        Perform memory optimization to reduce usage
        """
        # Implement memory pooling
        # Clear unused buffers
        # Optimize data structures

        self.get_logger().info("Performed memory optimization")

    def implement_dynamic_optimization(self):
        """
        Implement dynamic optimization that adapts in real-time
        """
        import threading
        import time

        def optimization_loop():
            while not self.shutdown_flag:
                # Monitor performance every second
                time.sleep(1.0)

                # Get current metrics
                current_fps = self.measure_current_fps()
                current_gpu_util = self.measure_gpu_utilization()
                current_memory = self.measure_memory_usage()

                # Apply optimizations based on metrics
                if current_fps < 25:  # Performance below threshold
                    self.reduce_processing_complexity()
                elif current_gpu_util > 95:  # GPU maxed out
                    self.reduce_gpu_workload()
                elif current_memory > 0.85:  # High memory usage
                    self.perform_memory_optimization()

        # Start optimization thread
        optimization_thread = threading.Thread(target=optimization_loop)
        optimization_thread.daemon = True
        optimization_thread.start()

        self.get_logger().info("Started dynamic optimization system")

    def measure_current_fps(self):
        """
        Measure current processing FPS
        """
        # In practice, this would monitor actual processing rates
        # For demonstration, return a placeholder
        return 30.0

    def measure_gpu_utilization(self):
        """
        Measure current GPU utilization
        """
        try:
            import pynvml
            pynvml.nvmlInit()
            handle = pynvml.nvmlDeviceGetHandleByIndex(0)
            util = pynvml.nvmlDeviceGetUtilizationRates(handle)
            return util.gpu
        except:
            return 0  # Return 0 if unable to measure

    def measure_memory_usage(self):
        """
        Measure current memory usage percentage
        """
        import psutil
        return psutil.virtual_memory().percent / 100.0

# Usage example
optimizer = IsaacROSPipelineOptimizer()
optimizer.implement_dynamic_optimization()
```

## Troubleshooting Common Issues

### Performance Issues
- **Low FPS**: Reduce feature count, processing resolution, or batch size
- **High GPU Utilization**: Adjust batch processing, reduce complexity, or implement throttling
- **Memory Leaks**: Implement proper memory management and cleanup routines
- **Synchronization Problems**: Check timestamp alignment between sensors

### Data Quality Issues
- **Inconsistent Results**: Verify sensor calibration and coordinate frame alignment
- **Drift in Estimation**: Implement proper sensor fusion and periodic corrections
- **Noisy Measurements**: Apply filtering and outlier rejection techniques
- **Missing Data**: Implement fallback mechanisms and interpolation

## Assessment Questions

1. What are the key components of an Isaac ROS perception pipeline?
2. How does GPU acceleration improve perception performance?
3. What are the main challenges in sensor fusion for robotics applications?
4. How can you optimize Isaac ROS pipelines for real-time performance?
5. What are the important considerations when synchronizing multi-sensor data?

## Next Steps

After mastering perception pipeline concepts, continue to the Isaac ROS Best Practices section to learn about optimizing perception workflows and performance for robotics applications.