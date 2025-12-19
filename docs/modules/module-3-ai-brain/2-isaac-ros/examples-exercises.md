# Practical Examples and Exercises: Isaac ROS Concepts

This section provides hands-on examples and exercises to reinforce your understanding of Isaac ROS perception and sensor processing concepts, including practical applications and implementation challenges.

## Exercise 1: Isaac ROS Perception Pipeline Implementation

### Objective
Implement a complete perception pipeline using Isaac ROS components to process sensor data and extract meaningful information for robotics applications.

### Setup Requirements
- Isaac Sim environment with a robot equipped with RGB-D camera
- Isaac ROS perception packages installed
- Basic ROS 2 knowledge

### Exercise Steps

#### Step 1: Environment Setup
```bash
# Launch Isaac Sim with a perception-equipped robot
ros2 launch isaac_sim_common isaac_sim.launch.py headless:=False

# Verify Isaac ROS packages are available
ros2 pkg list | grep isaac_ros
```

#### Step 2: Create a Perception Node
Create a ROS 2 package for perception processing:

```python
# perception_pipeline.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from geometry_msgs.msg import PointStamped
from cv_bridge import CvBridge
import cv2
import numpy as np

class IsaacROSPerceptionNode(Node):
    def __init__(self):
        super().__init__('isaac_ros_perception_pipeline')

        # Initialize CV Bridge
        self.bridge = CvBridge()

        # Create subscribers for RGB and depth images
        self.rgb_sub = self.create_subscription(
            Image,
            '/camera/rgb/image_rect_color',
            self.rgb_callback,
            10
        )

        self.depth_sub = self.create_subscription(
            Image,
            '/camera/depth/image_rect_raw',
            self.depth_callback,
            10
        )

        self.camera_info_sub = self.create_subscription(
            CameraInfo,
            '/camera/rgb/camera_info',
            self.camera_info_callback,
            10
        )

        # Publishers for processed data
        self.detection_pub = self.create_publisher(
            # Isaac ROS Detection2DArray message
            'isaac_ros_messages/msg/Detection2DArray',
            '/perception/detections',
            10
        )

        self.segmentation_pub = self.create_publisher(
            Image,
            '/perception/segmentation',
            10
        )

        # Initialize camera parameters
        self.camera_matrix = None
        self.distortion_coeffs = None

        # Initialize Isaac ROS perception components
        self.setup_perception_components()

    def setup_perception_components(self):
        """
        Initialize Isaac ROS perception components
        """
        self.get_logger().info("Setting up Isaac ROS perception components...")

        # In actual implementation:
        # - Initialize Isaac ROS DetectNet for object detection
        # - Initialize Isaac ROS Segmentation for semantic segmentation
        # - Initialize Isaac ROS Stereo Dense Reconstruction for 3D processing

        # For this exercise, we'll use placeholder components
        self.object_detector = self.initialize_mock_detector()
        self.segmenter = self.initialize_mock_segmenter()

    def initialize_mock_detector(self):
        """
        Initialize mock object detector (placeholder for Isaac ROS DetectNet)
        """
        return type('MockDetector', (), {
            'detect': lambda self, img: self.mock_detection(img),
            'mock_detection': lambda self, img: [
                {'bbox': [100, 100, 200, 200], 'class': 'robot', 'confidence': 0.95},
                {'bbox': [300, 150, 400, 250], 'class': 'human', 'confidence': 0.88}
            ]
        })()

    def initialize_mock_segmenter(self):
        """
        Initialize mock segmenter (placeholder for Isaac ROS Segmentation)
        """
        return type('MockSegmenter', (), {
            'segment': lambda self, img: self.mock_segmentation(img),
            'mock_segmentation': lambda self, img: np.random.randint(0, 10, size=(img.shape[0], img.shape[1]))
        })()

    def rgb_callback(self, msg):
        """
        Process RGB image data
        """
        try:
            # Convert ROS Image to OpenCV
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Apply Isaac ROS perception processing
            detections = self.object_detector.detect(cv_image)
            segmentation = self.segmenter.segment(cv_image)

            # Publish results
            self.publish_detections(detections, msg.header)
            self.publish_segmentation(segmentation, msg.header)

        except Exception as e:
            self.get_logger().error(f"Error processing RGB image: {str(e)}")

    def depth_callback(self, msg):
        """
        Process depth image data
        """
        try:
            # Convert depth image to OpenCV
            depth_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='32FC1')

            # Process depth data with Isaac ROS components
            processed_depth = self.process_depth_with_isaac_ros(depth_image)

            # Publish processed depth
            self.publish_depth_results(processed_depth, msg.header)

        except Exception as e:
            self.get_logger().error(f"Error processing depth image: {str(e)}")

    def camera_info_callback(self, msg):
        """
        Handle camera calibration information
        """
        self.camera_matrix = np.array(msg.k).reshape(3, 3)
        self.distortion_coeffs = np.array(msg.d)

    def process_depth_with_isaac_ros(self, depth_image):
        """
        Process depth image using Isaac ROS techniques
        """
        # In actual Isaac ROS implementation, this would use:
        # - Isaac ROS Depth Image Processing nodes
        # - Isaac ROS Point Cloud Utilities
        # - Isaac ROS Stereo Dense Reconstruction

        # For demonstration, apply basic processing
        processed = cv2.medianBlur(depth_image, 5)  # Remove noise
        processed = cv2.bilateralFilter(processed, 9, 75, 75)  # Preserve edges

        return processed

    def publish_detections(self, detections, header):
        """
        Publish object detection results
        """
        # Create Isaac ROS detection message
        # In practice, this would use Isaac ROS message types
        detection_msg = type('MockDetectionMsg', (), {
            'header': header,
            'detections': detections
        })()

        self.detection_publisher.publish(detection_msg)

    def publish_segmentation(self, segmentation, header):
        """
        Publish segmentation results
        """
        # Convert segmentation to ROS Image format
        seg_image = self.bridge.cv2_to_imgmsg(segmentation.astype(np.uint8), encoding='mono8')
        seg_image.header = header
        self.segmentation_publisher.publish(seg_image)

    def publish_depth_results(self, processed_depth, header):
        """
        Publish depth processing results
        """
        # Convert to ROS Image format
        depth_msg = self.bridge.cv2_to_imgmsg(processed_depth, encoding='32FC1')
        depth_msg.header = header
        # self.depth_publisher.publish(depth_msg)  # Uncomment when publisher is created

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

#### Step 3: Create Launch File
```xml
<!-- launch/perception_pipeline.launch.py -->
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # Isaac ROS Perception Pipeline Node
        Node(
            package='isaac_ros_perception_examples',
            executable='perception_pipeline',
            name='isaac_ros_perception_pipeline',
            parameters=[],
            remappings=[
                ('/camera/rgb/image_rect_color', '/front_stereo_camera/left/image_rect_color'),
                ('/camera/depth/image_rect_raw', '/front_stereo_camera/depth'),
                ('/camera/rgb/camera_info', '/front_stereo_camera/left/camera_info')
            ],
            output='screen'
        )
    ])
```

#### Step 4: Run and Test the Pipeline
```bash
# Build the package
colcon build --packages-select isaac_ros_perception_examples

# Source the workspace
source install/setup.bash

# Run the perception pipeline
ros2 launch isaac_ros_perception_examples perception_pipeline.launch.py
```

### Expected Learning Outcomes
- Understanding of Isaac ROS perception pipeline architecture
- Ability to integrate different sensor modalities
- Experience with Isaac ROS message types and formats
- Knowledge of GPU-accelerated processing techniques

## Exercise 2: Isaac ROS Visual SLAM Implementation

### Objective
Implement a Visual SLAM system using Isaac ROS components to create maps and track robot position in real-time.

### Exercise Steps

#### Step 1: Set Up SLAM Environment
```python
# vslam_node.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo, Imu
from geometry_msgs.msg import PoseStamped
from nav_msgs.msg import Odometry
from visualization_msgs.msg import MarkerArray
import numpy as np
import cv2

class IsaacROSVisualSLAMNode(Node):
    def __init__(self):
        super().__init__('isaac_ros_vslam_node')

        # Initialize components
        self.bridge = CvBridge()
        self.keyframes = []
        self.map_points = []
        self.current_pose = np.eye(4)  # 4x4 transformation matrix

        # Subscribe to stereo camera data
        self.left_image_sub = self.create_subscription(
            Image,
            '/stereo_camera/left/image_rect_color',
            self.left_image_callback,
            10
        )

        self.right_image_sub = self.create_subscription(
            Image,
            '/stereo_camera/right/image_rect_color',
            self.right_image_callback,
            10
        )

        self.camera_info_sub = self.create_subscription(
            CameraInfo,
            '/stereo_camera/left/camera_info',
            self.camera_info_callback,
            10
        )

        self.imu_sub = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )

        # Publishers
        self.odom_publisher = self.create_publisher(Odometry, '/vslam/odometry', 10)
        self.pose_publisher = self.create_publisher(PoseStamped, '/vslam/pose', 10)
        self.map_publisher = self.create_publisher(MarkerArray, '/vslam/map', 10)

        # Initialize Isaac ROS SLAM components
        self.initialize_vslam_components()

    def initialize_vslam_components(self):
        """
        Initialize Isaac ROS Visual SLAM components
        """
        # In actual Isaac ROS:
        # from isaac_ros_visual_slam import VisualSlamNode
        # self.vslam_node = VisualSlamNode()

        # For demonstration:
        self.feature_detector = self.initialize_feature_detector()
        self.pose_estimator = self.initialize_pose_estimator()
        self.map_builder = self.initialize_map_builder()

        self.get_logger().info("Isaac ROS VSLAM components initialized")

    def initialize_feature_detector(self):
        """
        Initialize feature detection using Isaac ROS techniques
        """
        # Isaac ROS provides GPU-accelerated feature detection
        detector_config = {
            'max_features': 1000,
            'detector_type': 'fast',  # or 'orb', 'sift'
            'threshold': 20,
            'nonmax_suppression': True
        }

        # In actual Isaac ROS implementation
        # return IsaacROSFeatureDetector(**detector_config)

        # For demonstration:
        return type('MockFeatureDetector', (), {
            'detect_features': lambda self, img: self.mock_feature_detection(img),
            'mock_feature_detection': lambda self, img: cv2.goodFeaturesToTrack(
                cv2.cvtColor(img, cv2.COLOR_BGR2GRAY),
                maxCorners=detector_config['max_features'],
                qualityLevel=0.01,
                minDistance=10
            )
        })()

    def initialize_pose_estimator(self):
        """
        Initialize pose estimation component
        """
        # In actual Isaac ROS:
        # from isaac_ros_visual_slam import PoseEstimator
        # return PoseEstimator()

        # For demonstration:
        return type('MockPoseEstimator', (), {
            'estimate_pose': lambda self, matches, K: self.mock_pose_estimation(matches, K),
            'mock_pose_estimation': lambda self, matches, K: {
                'R': np.eye(3),
                't': np.zeros(3),
                'success': True
            }
        })()

    def initialize_map_builder(self):
        """
        Initialize map building component
        """
        # In actual Isaac ROS:
        # from isaac_ros_visual_slam import MapBuilder
        # return MapBuilder()

        # For demonstration:
        return type('MockMapBuilder', (), {
            'add_keyframe': lambda self, pose, features: self.mock_add_keyframe(pose, features),
            'triangulate_points': lambda self, matches, pose1, pose2: self.mock_triangulate(matches, pose1, pose2),
            'optimize_map': lambda self: self.mock_bundle_adjustment(),
            'mock_add_keyframe': lambda self, pose, feats: len(feats),
            'mock_triangulate': lambda self, matches, p1, p2: np.random.random((len(matches), 3)),
            'mock_bundle_adjustment': lambda self: True
        })()

    def left_image_callback(self, msg):
        """
        Process left camera image for stereo SLAM
        """
        try:
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Extract features
            features = self.feature_detector.detect_features(cv_image)

            if features is not None and len(features) > 10:
                # Store for stereo processing
                self.current_left_image = cv_image
                self.current_left_features = features
                self.current_left_timestamp = msg.header.stamp

                # Process if we have both left and right images
                if hasattr(self, 'current_right_image'):
                    self.process_stereo_frame()

        except Exception as e:
            self.get_logger().error(f"Error processing left image: {str(e)}")

    def right_image_callback(self, msg):
        """
        Process right camera image for stereo SLAM
        """
        try:
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Store for stereo processing
            self.current_right_image = cv_image
            self.current_right_timestamp = msg.header.stamp

        except Exception as e:
            self.get_logger().error(f"Error processing right image: {str(e)}")

    def camera_info_callback(self, msg):
        """
        Handle camera calibration information
        """
        self.camera_matrix = np.array(msg.k).reshape(3, 3)
        self.baseline = self.extract_baseline_from_stereo_info(msg)

    def imu_callback(self, msg):
        """
        Handle IMU data for Visual-Inertial SLAM
        """
        # Store IMU data for fusion with visual data
        self.latest_imu_data = {
            'linear_acceleration': [msg.linear_acceleration.x, msg.linear_acceleration.y, msg.linear_acceleration.z],
            'angular_velocity': [msg.angular_velocity.x, msg.angular_velocity.y, msg.angular_velocity.z],
            'orientation': [msg.orientation.x, msg.orientation.y, msg.orientation.z, msg.orientation.w]
        }

    def process_stereo_frame(self):
        """
        Process stereo frame for VSLAM
        """
        if not (hasattr(self, 'current_left_features') and hasattr(self, 'current_right_image')):
            return

        # Match features between left and right images
        matches = self.match_stereo_features(
            self.current_left_features,
            self.current_right_image
        )

        if len(matches) > 10:
            # Estimate depth from stereo matches
            points_3d = self.triangulate_points_stereo(matches)

            # Update pose estimation
            pose_change = self.pose_estimator.estimate_pose(matches, self.camera_matrix)

            if pose_change['success']:
                # Update current pose
                R = pose_change['R']
                t = pose_change['t']

                T = np.eye(4)
                T[:3, :3] = R
                T[:3, 3] = t

                self.current_pose = self.current_pose @ np.linalg.inv(T)

                # Add to map if significant movement occurred
                if self.should_add_keyframe():
                    self.add_keyframe_to_map()

                # Publish results
                self.publish_vslam_results()

    def match_stereo_features(self, left_features, right_image):
        """
        Match features between left and right stereo images
        """
        # Convert right image to grayscale
        right_gray = cv2.cvtColor(right_image, cv2.COLOR_BGR2GRAY)

        # Use Lucas-Kanade optical flow for stereo matching
        right_features, status, error = cv2.calcOpticalFlowPyrLK(
            cv2.cvtColor(self.current_left_image, cv2.COLOR_BGR2GRAY),
            right_gray,
            left_features,
            None,
            winSize=(21, 21),
            maxLevel=3,
            criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01)
        )

        # Filter valid matches
        valid_matches = []
        for i, (left_pt, right_pt, stat) in enumerate(zip(left_features, right_features, status)):
            if stat[0] == 1:  # Successful match
                # Check epipolar constraint (simplified)
                disparity = abs(left_pt[0][0] - right_pt[0][0])
                if disparity > 0:  # Valid disparity
                    valid_matches.append({
                        'left': left_pt[0],
                        'right': right_pt[0],
                        'disparity': disparity
                    })

        return valid_matches

    def triangulate_points_stereo(self, matches):
        """
        Triangulate 3D points from stereo matches
        """
        if not hasattr(self, 'camera_matrix') or not hasattr(self, 'baseline'):
            return []

        points_3d = []
        for match in matches:
            # Convert pixel coordinates to normalized image coordinates
            left_norm = (match['left'] - self.camera_matrix[0:2, 2]) / self.camera_matrix[0:2, 0:2].diagonal()
            right_norm = (match['right'] - self.camera_matrix[0:2, 2]) / self.camera_matrix[0:2, 0:2].diagonal()

            # Calculate 3D position using stereo geometry
            if match['disparity'] > 0:
                depth = (self.camera_matrix[0, 0] * self.baseline) / match['disparity']
                X = (left_norm[0] * depth)
                Y = (left_norm[1] * depth)
                Z = depth

                points_3d.append([X, Y, Z])

        return np.array(points_3d) if points_3d else np.array([]).reshape(0, 3)

    def should_add_keyframe(self):
        """
        Determine if current frame should become a keyframe
        """
        if len(self.keyframes) == 0:
            return True

        # Calculate distance from last keyframe
        last_keyframe_pose = self.keyframes[-1]['pose']
        current_position = self.current_pose[:3, 3]
        last_position = last_keyframe_pose[:3, 3]

        distance = np.linalg.norm(current_position - last_position)

        # Add keyframe if moved significantly
        return distance > 0.5  # 50cm threshold

    def add_keyframe_to_map(self):
        """
        Add current frame as a keyframe to the map
        """
        keyframe = {
            'image': self.current_left_image,
            'features': self.current_left_features,
            'pose': self.current_pose.copy(),
            'timestamp': self.current_left_timestamp
        }

        self.keyframes.append(keyframe)

        # Update map with new keyframe
        self.map_builder.add_keyframe(self.current_pose, self.current_left_features)

        # Periodically optimize map
        if len(self.keyframes) % 10 == 0:  # Every 10 keyframes
            self.map_builder.optimize_map()
            self.get_logger().info("Performed map optimization")

    def publish_vslam_results(self):
        """
        Publish VSLAM results
        """
        # Publish odometry
        odom_msg = Odometry()
        odom_msg.header.stamp = self.get_clock().now().to_msg()
        odom_msg.header.frame_id = "map"
        odom_msg.child_frame_id = "camera"

        # Extract position and orientation from transformation matrix
        position = self.current_pose[:3, 3]
        rotation_matrix = self.current_pose[:3, :3]

        # Convert rotation matrix to quaternion
        quat = self.rotation_matrix_to_quaternion(rotation_matrix)

        odom_msg.pose.pose.position.x = position[0]
        odom_msg.pose.pose.position.y = position[1]
        odom_msg.pose.pose.position.z = position[2]

        odom_msg.pose.pose.orientation.x = quat[0]
        odom_msg.pose.pose.orientation.y = quat[1]
        odom_msg.pose.pose.orientation.z = quat[2]
        odom_msg.pose.pose.orientation.w = quat[3]

        self.odom_publisher.publish(odom_msg)

        # Publish pose
        pose_msg = PoseStamped()
        pose_msg.header.stamp = self.get_clock().now().to_msg()
        pose_msg.header.frame_id = "map"

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

    def rotation_matrix_to_quaternion(self, R):
        """
        Convert rotation matrix to quaternion
        """
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

        return np.array([qw, qx, qy, qz])

    def publish_map_visualization(self):
        """
        Publish map visualization markers
        """
        marker_array = MarkerArray()

        # Create markers for keyframe positions
        for i, keyframe in enumerate(self.keyframes):
            marker = Marker()
            marker.header.frame_id = "map"
            marker.header.stamp = self.get_clock().now().to_msg()
            marker.ns = "vslam_keyframes"
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

        self.map_publisher.publish(marker_array)

def main(args=None):
    rclpy.init(args=args)

    vslam_node = IsaacROSVisualSLAMNode()

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

#### Step 2: Test the VSLAM Implementation
```bash
# Build and run the VSLAM node
colcon build --packages-select isaac_ros_vslam_examples
source install/setup.bash

# Launch Isaac Sim with stereo camera
ros2 launch isaac_sim_common isaac_sim.launch.py headless:=False

# Run the VSLAM node
ros2 run isaac_ros_vslam_examples vslam_node
```

### Expected Learning Outcomes
- Understanding of stereo vision principles in robotics
- Experience with feature detection and matching
- Knowledge of pose estimation and map building
- Understanding of visual-inertial fusion concepts

## Exercise 3: Isaac ROS Sensor Fusion Pipeline

### Objective
Create a sensor fusion pipeline that combines data from multiple Isaac ROS perception nodes for enhanced robot awareness.

### Exercise Steps

#### Step 1: Create Fusion Node
```python
# sensor_fusion_node.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2, Imu, NavSatFix
from geometry_msgs.msg import PoseStamped, TwistStamped
from std_msgs.msg import Float64MultiArray
import numpy as np
from scipy.spatial.transform import Rotation as R
import message_filters

class IsaacROSSensorFusionNode(Node):
    def __init__(self):
        super().__init__('isaac_ros_sensor_fusion')

        # Initialize fusion components
        self.fusion_state = {
            'position': np.array([0.0, 0.0, 0.0]),
            'orientation': np.array([0.0, 0.0, 0.0, 1.0]),  # quaternion
            'velocity': np.array([0.0, 0.0, 0.0]),
            'angular_velocity': np.array([0.0, 0.0, 0.0]),
            'covariance': np.eye(15) * 0.1  # [pos, vel, orient, ang_vel]
        }

        # Create subscribers with message filters for synchronization
        self.image_sub = message_filters.Subscriber(self, Image, '/camera/rgb/image_rect_color')
        self.depth_sub = message_filters.Subscriber(self, Image, '/camera/depth/image_rect_raw')
        self.lidar_sub = message_filters.Subscriber(self, PointCloud2, '/lidar/points')
        self.imu_sub = message_filters.Subscriber(self, Imu, '/imu/data')
        self.gps_sub = message_filters.Subscriber(self, NavSatFix, '/gps/fix')

        # Synchronize messages with tolerance
        self.ts = message_filters.ApproximateTimeSynchronizer(
            [self.image_sub, self.depth_sub, self.lidar_sub, self.imu_sub],
            queue_size=10,
            slop=0.1  # 100ms tolerance
        )
        self.ts.registerCallback(self.fusion_callback)

        # Publishers for fused data
        self.fused_pose_pub = self.create_publisher(PoseStamped, '/fusion/pose', 10)
        self.fused_twist_pub = self.create_publisher(TwistStamped, '/fusion/twist', 10)
        self.fused_state_pub = self.create_publisher(Float64MultiArray, '/fusion/state', 10)

        # Initialize Isaac ROS fusion components
        self.initialize_fusion_components()

    def initialize_fusion_components(self):
        """
        Initialize Isaac ROS sensor fusion components
        """
        # In actual Isaac ROS:
        # from isaac_ros_fusion import SensorFusionNode
        # self.fusion_node = SensorFusionNode()

        # For demonstration:
        self.kalman_filter = self.initialize_kalman_filter()
        self.ekf_fusion = self.initialize_extended_kalman_filter()
        self.particle_filter = self.initialize_particle_filter()

        self.get_logger().info("Isaac ROS sensor fusion components initialized")

    def initialize_kalman_filter(self):
        """
        Initialize Kalman filter for sensor fusion
        """
        # State vector: [x, y, z, vx, vy, vz, qx, qy, qz, qw, wx, wy, wz]
        # (position, velocity, orientation, angular velocity)
        state_dim = 13
        measurement_dim = 10  # [pos, orient, vel, ang_vel]

        kf = {
            'state': np.zeros(state_dim),
            'covariance': np.eye(state_dim) * 0.1,
            'process_noise': np.eye(state_dim) * 0.01,
            'measurement_noise': np.eye(measurement_dim) * 0.1,
            'transition_matrix': np.eye(state_dim),
            'measurement_matrix': np.zeros((measurement_dim, state_dim))
        }

        # Initialize measurement matrix
        # Position measurements (first 3 elements)
        kf['measurement_matrix'][0:3, 0:3] = np.eye(3)
        # Orientation measurements (next 4 elements)
        kf['measurement_matrix'][3:7, 6:10] = np.eye(4)
        # Velocity measurements (next 3 elements)
        kf['measurement_matrix'][7:10, 3:6] = np.eye(3)

        return kf

    def fusion_callback(self, image_msg, depth_msg, lidar_msg, imu_msg):
        """
        Callback for synchronized sensor data fusion
        """
        try:
            # Process each sensor modality
            camera_data = self.process_camera_data(image_msg)
            depth_data = self.process_depth_data(depth_msg)
            lidar_data = self.process_lidar_data(lidar_msg)
            imu_data = self.process_imu_data(imu_msg)

            # Fuse sensor data using Isaac ROS fusion techniques
            fused_state = self.fuse_sensor_data({
                'camera': camera_data,
                'depth': depth_data,
                'lidar': lidar_data,
                'imu': imu_data
            })

            # Update fusion state
            self.update_fusion_state(fused_state)

            # Publish fused results
            self.publish_fused_data()

        except Exception as e:
            self.get_logger().error(f"Error in sensor fusion: {str(e)}")

    def process_camera_data(self, image_msg):
        """
        Process camera data using Isaac ROS perception
        """
        cv_image = self.bridge.imgmsg_to_cv2(image_msg, desired_encoding='bgr8')

        # Extract visual features using Isaac ROS techniques
        features = self.extract_visual_features(cv_image)

        # Estimate position from visual odometry
        visual_odom = self.estimate_visual_odometry(features)

        return {
            'features': features,
            'position': visual_odom['position'] if visual_odom else None,
            'orientation': visual_odom['orientation'] if visual_odom else None,
            'timestamp': image_msg.header.stamp
        }

    def process_depth_data(self, depth_msg):
        """
        Process depth data using Isaac ROS techniques
        """
        depth_image = self.bridge.imgmsg_to_cv2(depth_msg, desired_encoding='32FC1')

        # Extract depth-based features
        depth_features = self.extract_depth_features(depth_image)

        # Estimate position from depth changes
        depth_odom = self.estimate_depth_odometry(depth_features)

        return {
            'features': depth_features,
            'position': depth_odom['position'] if depth_odom else None,
            'velocity': depth_odom['velocity'] if depth_odom else None,
            'timestamp': depth_msg.header.stamp
        }

    def process_lidar_data(self, lidar_msg):
        """
        Process LiDAR data using Isaac ROS techniques
        """
        # In actual Isaac ROS, this would use Isaac ROS Point Cloud utilities
        # For demonstration, we'll extract basic information

        # Convert PointCloud2 to numpy array (simplified)
        points = self.pointcloud_to_numpy(lidar_msg)

        # Extract LiDAR-based features
        lidar_features = self.extract_lidar_features(points)

        # Estimate position from LiDAR odometry
        lidar_odom = self.estimate_lidar_odometry(lidar_features)

        return {
            'points': points,
            'features': lidar_features,
            'position': lidar_odom['position'] if lidar_odom else None,
            'timestamp': lidar_msg.header.stamp
        }

    def process_imu_data(self, imu_msg):
        """
        Process IMU data using Isaac ROS techniques
        """
        # Extract IMU measurements
        linear_acc = np.array([
            imu_msg.linear_acceleration.x,
            imu_msg.linear_acceleration.y,
            imu_msg.linear_acceleration.z
        ])

        angular_vel = np.array([
            imu_msg.angular_velocity.x,
            imu_msg.angular_velocity.y,
            imu_msg.angular_velocity.z
        ])

        orientation = np.array([
            imu_msg.orientation.x,
            imu_msg.orientation.y,
            imu_msg.orientation.z,
            imu_msg.orientation.w
        ])

        return {
            'linear_acceleration': linear_acc,
            'angular_velocity': angular_vel,
            'orientation': orientation,
            'timestamp': imu_msg.header.stamp
        }

    def fuse_sensor_data(self, sensor_data_dict):
        """
        Fuse data from multiple sensors using Isaac ROS fusion algorithms
        """
        # In Isaac ROS, this would use specialized fusion nodes like:
        # - Isaac ROS MultiSense Fusion
        # - Isaac ROS Visual-Inertial Odometry
        # - Isaac ROS Sensor Fusion

        # For demonstration, implement a simple weighted fusion
        fused_state = self.fusion_state.copy()

        # Weighted average of position estimates
        position_estimates = []
        weights = []

        if sensor_data_dict['camera']['position'] is not None:
            position_estimates.append(sensor_data_dict['camera']['position'])
            weights.append(0.3)  # Camera: medium confidence

        if sensor_data_dict['depth']['position'] is not None:
            position_estimates.append(sensor_data_dict['depth']['position'])
            weights.append(0.4)  # Depth: high confidence for position

        if sensor_data_dict['lidar']['position'] is not None:
            position_estimates.append(sensor_data_dict['lidar']['position'])
            weights.append(0.5)  # LiDAR: high confidence for position

        if position_estimates and weights:
            # Normalize weights
            total_weight = sum(weights)
            weights = [w / total_weight for w in weights]

            # Calculate weighted average
            weighted_pos = np.zeros(3)
            for est, weight in zip(position_estimates, weights):
                weighted_pos += est * weight

            fused_state['position'] = weighted_pos

        # Fusion of orientation (using IMU as primary source with visual correction)
        imu_orientation = sensor_data_dict['imu']['orientation']
        visual_orientation = sensor_data_dict['camera']['orientation']

        if visual_orientation is not None:
            # Apply visual correction to IMU orientation
            corrected_orientation = self.apply_visual_correction(
                imu_orientation, visual_orientation, alpha=0.1
            )
            fused_state['orientation'] = corrected_orientation
        else:
            fused_state['orientation'] = imu_orientation

        # Velocity fusion (from IMU integration and depth-based estimation)
        imu_velocity = self.integrate_imu_velocity(
            sensor_data_dict['imu']['linear_acceleration'],
            fused_state.get('velocity', np.zeros(3)),
            0.033  # Assuming 30Hz IMU
        )

        depth_velocity = sensor_data_dict['depth']['velocity']

        if depth_velocity is not None:
            # Fuse IMU and depth velocities
            fused_velocity = 0.7 * imu_velocity + 0.3 * depth_velocity
            fused_state['velocity'] = fused_velocity
        else:
            fused_state['velocity'] = imu_velocity

        # Angular velocity from IMU (primary source)
        fused_state['angular_velocity'] = sensor_data_dict['imu']['angular_velocity']

        return fused_state

    def apply_visual_correction(self, imu_orientation, visual_orientation, alpha=0.1):
        """
        Apply visual orientation correction to IMU orientation
        """
        # Simple complementary filter approach
        # In practice, this would use more sophisticated fusion
        corrected_quat = alpha * visual_orientation + (1 - alpha) * imu_orientation
        # Normalize quaternion
        corrected_quat = corrected_quat / np.linalg.norm(corrected_quat)
        return corrected_quat

    def integrate_imu_velocity(self, acceleration, previous_velocity, dt):
        """
        Integrate IMU acceleration to estimate velocity
        """
        # Apply gravity compensation
        gravity = np.array([0, 0, 9.81])
        net_acceleration = acceleration - gravity

        # Integrate acceleration to get velocity
        new_velocity = previous_velocity + net_acceleration * dt

        return new_velocity

    def update_fusion_state(self, new_state):
        """
        Update the internal fusion state with new estimates
        """
        # In Isaac ROS, this would involve more sophisticated state estimation
        # such as Extended Kalman Filter or Particle Filter updates

        # For demonstration, simply update with new values
        if new_state['position'] is not None:
            self.fusion_state['position'] = new_state['position']

        if new_state['orientation'] is not None:
            self.fusion_state['orientation'] = new_state['orientation']

        if new_state['velocity'] is not None:
            self.fusion_state['velocity'] = new_state['velocity']

        if new_state['angular_velocity'] is not None:
            self.fusion_state['angular_velocity'] = new_state['angular_velocity']

    def publish_fused_data(self):
        """
        Publish fused sensor data
        """
        # Publish fused pose
        pose_msg = PoseStamped()
        pose_msg.header.stamp = self.get_clock().now().to_msg()
        pose_msg.header.frame_id = "map"

        pose_msg.pose.position.x = self.fusion_state['position'][0]
        pose_msg.pose.position.y = self.fusion_state['position'][1]
        pose_msg.pose.position.z = self.fusion_state['position'][2]

        pose_msg.pose.orientation.x = self.fusion_state['orientation'][0]
        pose_msg.pose.orientation.y = self.fusion_state['orientation'][1]
        pose_msg.pose.orientation.z = self.fusion_state['orientation'][2]
        pose_msg.pose.orientation.w = self.fusion_state['orientation'][3]

        self.fused_pose_publisher.publish(pose_msg)

        # Publish fused twist (velocity)
        twist_msg = TwistStamped()
        twist_msg.header.stamp = self.get_clock().now().to_msg()
        twist_msg.header.frame_id = "base_link"

        twist_msg.twist.linear.x = self.fusion_state['velocity'][0]
        twist_msg.twist.linear.y = self.fusion_state['velocity'][1]
        twist_msg.twist.linear.z = self.fusion_state['velocity'][2]

        twist_msg.twist.angular.x = self.fusion_state['angular_velocity'][0]
        twist_msg.twist.angular.y = self.fusion_state['angular_velocity'][1]
        twist_msg.twist.angular.z = self.fusion_state['angular_velocity'][2]

        self.fused_twist_publisher.publish(twist_msg)

        # Publish full state vector
        state_msg = Float64MultiArray()
        state_msg.data = np.concatenate([
            self.fusion_state['position'],
            self.fusion_state['velocity'],
            self.fusion_state['orientation'],
            self.fusion_state['angular_velocity']
        ]).tolist()

        self.fused_state_publisher.publish(state_msg)

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

#### Step 2: Test the Fusion Pipeline
```bash
# Build and run the fusion node
colcon build --packages-select isaac_ros_sensor_fusion_examples
source install/setup.bash

# Launch Isaac Sim with multiple sensors
ros2 launch isaac_sim_common isaac_sim.launch.py headless:=False

# Run the sensor fusion node
ros2 run isaac_ros_sensor_fusion_examples sensor_fusion_node
```

### Expected Learning Outcomes
- Understanding of multi-sensor fusion principles
- Experience with Isaac ROS fusion algorithms
- Knowledge of sensor synchronization techniques
- Ability to implement weighted fusion approaches

## Exercise 4: Performance Optimization Challenge

### Objective
Optimize an Isaac ROS perception pipeline for real-time performance while maintaining accuracy.

### Exercise Steps

#### Step 1: Baseline Performance Measurement
```python
# performance_benchmark.py
import time
import numpy as np
from scipy.spatial.transform import Rotation as R

class IsaacROSPipelineBenchmark:
    def __init__(self):
        self.metrics = {
            'processing_times': [],
            'memory_usage': [],
            'gpu_utilization': [],
            'accuracy_scores': [],
            'throughput': []
        }

    def benchmark_perception_pipeline(self, pipeline, test_data, iterations=100):
        """
        Benchmark Isaac ROS perception pipeline performance
        """
        processing_times = []
        accuracy_scores = []

        for i in range(iterations):
            # Generate test input
            test_input = self.generate_test_input(test_data, i)

            # Measure processing time
            start_time = time.time()
            result = pipeline.process(test_input)
            end_time = time.time()

            processing_time = end_time - start_time
            processing_times.append(processing_time)

            # Calculate accuracy against ground truth
            accuracy = self.calculate_accuracy(result, test_data['ground_truth'][i])
            accuracy_scores.append(accuracy)

            # Monitor resource usage
            memory_usage = self.monitor_memory_usage()
            gpu_util = self.monitor_gpu_utilization()

            self.metrics['processing_times'].append(processing_time)
            self.metrics['memory_usage'].append(memory_usage)
            self.metrics['gpu_utilization'].append(gpu_util)
            self.metrics['accuracy_scores'].append(accuracy)

        # Calculate statistics
        avg_time = np.mean(processing_times)
        std_time = np.std(processing_times)
        avg_accuracy = np.mean(accuracy_scores)
        fps = 1.0 / avg_time if avg_time > 0 else 0

        return {
            'average_processing_time': avg_time,
            'std_processing_time': std_time,
            'average_accuracy': avg_accuracy,
            'frames_per_second': fps,
            'total_iterations': iterations
        }

    def generate_test_input(self, test_data, iteration):
        """
        Generate test input for benchmarking
        """
        # This would generate realistic test inputs based on test_data
        # For demonstration, return a placeholder
        return np.random.random((480, 640, 3)).astype(np.uint8)

    def calculate_accuracy(self, result, ground_truth):
        """
        Calculate accuracy of perception result against ground truth
        """
        # This would compare result to ground truth
        # For demonstration, return a placeholder
        return 0.95  # 95% accuracy

    def monitor_memory_usage(self):
        """
        Monitor memory usage during processing
        """
        import psutil
        return psutil.virtual_memory().percent

    def monitor_gpu_utilization(self):
        """
        Monitor GPU utilization during processing
        """
        try:
            import pynvml
            pynvml.nvmlInit()
            handle = pynvml.nvmlDeviceGetHandleByIndex(0)
            util = pynvml.nvmlDeviceGetUtilizationRates(handle)
            return util.gpu
        except:
            return 0  # Return 0 if unable to monitor GPU

    def optimize_pipeline_performance(self, pipeline):
        """
        Apply optimization techniques to improve performance
        """
        optimizations_applied = []

        # 1. Reduce feature count if processing is slow
        avg_time = np.mean(self.metrics['processing_times'])
        if avg_time > 0.033:  # More than 30 FPS target
            pipeline.set_feature_count(max(200, int(pipeline.get_feature_count() * 0.8)))
            optimizations_applied.append("Reduced feature count for performance")

        # 2. Apply GPU memory optimization
        if self.metrics['gpu_utilization'] and np.mean(self.metrics['gpu_utilization']) > 90:
            pipeline.enable_memory_pooling()
            optimizations_applied.append("Enabled GPU memory pooling")

        # 3. Optimize batch processing
        if hasattr(pipeline, 'set_batch_size'):
            optimal_batch_size = self.find_optimal_batch_size(pipeline)
            pipeline.set_batch_size(optimal_batch_size)
            optimizations_applied.append(f"Set optimal batch size: {optimal_batch_size}")

        # 4. Apply adaptive resolution
        if avg_time > 0.05:  # More than 20 FPS target
            pipeline.enable_adaptive_resolution()
            optimizations_applied.append("Enabled adaptive resolution")

        return optimizations_applied

    def find_optimal_batch_size(self, pipeline):
        """
        Find optimal batch size for pipeline performance
        """
        batch_sizes_to_test = [1, 2, 4, 8, 16]
        best_batch_size = 1
        best_fps = 0

        for batch_size in batch_sizes_to_test:
            pipeline.set_batch_size(batch_size)

            # Test performance with this batch size
            test_result = self.test_batch_performance(pipeline, batch_size)
            fps = test_result['frames_per_second']

            if fps > best_fps and fps >= 30:  # Target 30+ FPS
                best_fps = fps
                best_batch_size = batch_size
            elif fps < 30:  # If we drop below target FPS, use previous
                break

        return best_batch_size

    def test_batch_performance(self, pipeline, batch_size):
        """
        Test pipeline performance with specific batch size
        """
        # Run a short benchmark with the given batch size
        # For demonstration, return a placeholder result
        return {'frames_per_second': 35.0}  # Placeholder FPS

# Usage example
benchmark = IsaacROSPipelineBenchmark()

# Run initial benchmark
baseline_results = benchmark.benchmark_perception_pipeline(
    perception_pipeline, test_data, iterations=50
)

print(f"Baseline Performance: {baseline_results['frames_per_second']:.2f} FPS")

# Apply optimizations
optimizations = benchmark.optimize_pipeline_performance(perception_pipeline)

# Run benchmark after optimizations
optimized_results = benchmark.benchmark_perception_pipeline(
    perception_pipeline, test_data, iterations=50
)

print(f"Optimized Performance: {optimized_results['frames_per_second']:.2f} FPS")
print(f"Applied optimizations: {optimizations}")
```

## Troubleshooting Common Issues

### Issue 1: Poor Tracking Performance
**Symptoms**: Low feature count, frequent tracking failures, inaccurate pose estimation
**Solutions**:
- Increase feature detection threshold
- Adjust camera exposure/lighting
- Verify camera calibration
- Check for motion blur in images

### Issue 2: High Memory Usage
**Symptoms**: System slowdown, crashes, GPU memory exhaustion
**Solutions**:
- Implement memory pooling
- Reduce batch sizes
- Clear unused buffers regularly
- Use lower resolution processing

### Issue 3: Synchronization Problems
**Symptoms**: Temporal misalignment between sensors, incorrect fusion results
**Solutions**:
- Use message filters for synchronization
- Implement proper timestamp handling
- Check clock synchronization
- Adjust synchronization tolerances

## Assessment Questions

1. How does Isaac ROS leverage GPU acceleration for perception tasks?
2. What are the key components of a Visual SLAM pipeline?
3. How can you optimize Isaac ROS pipelines for real-time performance?
4. What are the challenges in fusing data from different sensor modalities?
5. How do you validate the quality of fused sensor data?

## Next Steps

After completing these practical exercises, you should have hands-on experience with Isaac ROS perception pipelines, VSLAM implementation, and sensor fusion. Continue to the Isaac ROS visualization and debugging section to learn about monitoring and validating your perception systems.