# Practical Examples and Exercises: Sensor Simulation

This section provides hands-on examples and exercises to reinforce your understanding of sensor simulation concepts in Isaac Sim, including LiDAR, depth cameras, and IMUs for humanoid robot applications.

## Example 1: Basic LiDAR Setup and Configuration

### Objective
Learn to configure and use a basic LiDAR sensor in Isaac Sim to generate point cloud data.

### Setup Code
```python
# Example: Basic LiDAR sensor configuration
import omni
from omni.isaac.core.utils.prims import create_prim
from omni.isaac.range_sensor import acquire_lidar_sensor_interface
import numpy as np

# Create a basic LiDAR sensor setup
def setup_basic_lidar(robot_path="/World/Robot"):
    """
    Set up a basic LiDAR sensor on a robot
    """
    # Create LiDAR sensor prim
    lidar_path = f"{robot_path}/Lidar"

    create_prim(
        prim_path=lidar_path,
        prim_type="RotatingLidarSensor",
        position=(0.0, 0.0, 1.0),  # Position on top of robot
        orientation=(0.0, 0.0, 0.0, 1.0)
    )

    # Configure LiDAR parameters
    lidar_config = {
        "rotation_frequency": 10,  # Hz
        "channels": 16,           # Number of laser channels
        "points_per_channel": 1000,  # Points per revolution per channel
        "horizontal_resolution": 1.0,  # Degrees per point
        "vertical_resolution": 2.0,    # Degrees between channels
        "range": 25.0,            # Maximum range in meters
        "min_range": 0.1,         # Minimum range in meters
        "max_range": 25.0         # Maximum range in meters
    }

    # Apply configuration through Isaac Sim API
    apply_lidar_configuration(lidar_path, lidar_config)

    return lidar_path

def apply_lidar_configuration(lidar_path, config):
    """
    Apply configuration to LiDAR sensor
    """
    # In practice, this would use Isaac Sim's range sensor interface
    lidar_interface = acquire_lidar_sensor_interface()

    # Set LiDAR parameters
    lidar_interface.set_lidar_parameters(
        lidar_path,
        config["rotation_frequency"],
        config["channels"],
        config["points_per_channel"],
        config["horizontal_resolution"],
        config["vertical_resolution"],
        config["range"]
    )

def capture_lidar_data(lidar_path):
    """
    Capture and process LiDAR point cloud data
    """
    lidar_interface = acquire_lidar_sensor_interface()

    # Get point cloud data
    point_cloud = lidar_interface.get_point_cloud_data(lidar_path)

    # Process point cloud data
    if point_cloud is not None:
        # Convert to numpy array for processing
        points = np.array(point_cloud.points)

        # Calculate basic statistics
        num_points = len(points)
        if num_points > 0:
            avg_distance = np.mean(np.linalg.norm(points[:, :3], axis=1))
            min_distance = np.min(np.linalg.norm(points[:, :3], axis=1))
            max_distance = np.max(np.linalg.norm(points[:, :3], axis=1))

            print(f"LiDAR Data - Points: {num_points}, Avg Distance: {avg_distance:.2f}m")
            print(f"Min Distance: {min_distance:.2f}m, Max Distance: {max_distance:.2f}m")

        return point_cloud

    return None

# Usage example
lidar_sensor_path = setup_basic_lidar()
lidar_data = capture_lidar_data(lidar_sensor_path)
```

### Exercise 1.1: LiDAR Parameter Tuning
**Objective**: Experiment with different LiDAR parameters to understand their effects on point cloud quality.

**Steps**:
1. Set up the basic LiDAR sensor as shown above
2. Capture data with different channel counts (8, 16, 32, 64)
3. Capture data with different ranges (10m, 25m, 50m)
4. Capture data with different resolutions (0.5°, 1.0°, 2.0°)
5. Compare the resulting point clouds in terms of density, coverage, and performance

**Expected Learning**: Understanding the trade-offs between LiDAR quality and performance.

## Example 2: Depth Camera Configuration and Data Processing

### Objective
Configure and process data from a depth camera sensor in Isaac Sim.

### Setup Code
```python
# Example: Depth camera configuration and processing
from omni.isaac.core.utils.prims import create_prim
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core import World
import cv2
import numpy as np

def setup_depth_camera(robot_path="/World/Robot"):
    """
    Set up a depth camera sensor on a robot
    """
    # Create camera prim
    camera_path = f"{robot_path}/DepthCamera"

    create_prim(
        prim_path=camera_path,
        prim_type="Camera",
        position=(0.1, 0.0, 1.2),  # Position at head level
        orientation=(0.0, 0.0, 0.0, 1.0)
    )

    # Configure camera parameters
    camera_config = {
        "focal_length": 35.0,      # mm
        "horizontal_aperture": 36.0,  # mm
        "vertical_aperture": 24.0,    # mm
        "clipping_range": (0.1, 100.0),  # Near and far clipping
        "resolution": (640, 480)    # Width, Height in pixels
    }

    # Apply camera configuration
    apply_camera_configuration(camera_path, camera_config)

    return camera_path

def apply_camera_configuration(camera_path, config):
    """
    Apply configuration to depth camera
    """
    # In practice, this would use Isaac Sim's camera interface
    stage = omni.usd.get_context().get_stage()
    camera_prim = stage.GetPrimAtPath(camera_path)

    if camera_prim.IsValid():
        # Set focal length
        camera_prim.GetAttribute("focalLength").Set(config["focal_length"])

        # Set aperture
        camera_prim.GetAttribute("horizontalAperture").Set(config["horizontal_aperture"])
        camera_prim.GetAttribute("verticalAperture").Set(config["vertical_aperture"])

        # Set clipping range
        camera_prim.GetAttribute("clippingRange").Set(
            Gf.Vec2f(config["clipping_range"][0], config["clipping_range"][1])
        )

def capture_depth_data(camera_path):
    """
    Capture and process depth camera data
    """
    # In Isaac Sim, depth data is captured through the rendering pipeline
    # This is a conceptual example - actual implementation would use Isaac Sim's sensor interface

    # For demonstration, we'll create synthetic depth data
    width, height = 640, 480
    depth_data = np.random.rand(height, width).astype(np.float32) * 10.0  # 0-10m depth

    # Add some structure to make it more realistic
    for y in range(height):
        for x in range(width):
            # Create a gradient to simulate distance
            distance = 1.0 + (x / width) * 8.0 + (y / height) * 2.0
            depth_data[y, x] = distance + np.random.normal(0, 0.01)  # Add small noise

    # Convert to realistic depth image
    depth_image = np.clip(depth_data, 0.1, 10.0)  # Clip to valid range

    # Calculate statistics
    valid_pixels = depth_image > 0.1
    avg_depth = np.mean(depth_image[valid_pixels]) if np.any(valid_pixels) else 0.0
    min_depth = np.min(depth_image[valid_pixels]) if np.any(valid_pixels) else 0.0
    max_depth = np.max(depth_image[valid_pixels]) if np.any(valid_pixels) else 0.0

    print(f"Depth Camera - Resolution: {width}x{height}")
    print(f"Avg Depth: {avg_depth:.2f}m, Min: {min_depth:.2f}m, Max: {max_depth:.2f}m")

    return depth_image

def process_depth_image(depth_image):
    """
    Process depth image to extract useful information
    """
    # Convert depth image to point cloud
    height, width = depth_image.shape

    # Create coordinate grids
    y_coords, x_coords = np.mgrid[0:height, 0:width]

    # Convert pixel coordinates to camera coordinates
    # Using simple pinhole camera model
    fx = 320  # Focal length in pixels (approximate)
    fy = 320  # Focal length in pixels (approximate)
    cx = width / 2  # Principal point x
    cy = height / 2  # Principal point y

    # Calculate 3D coordinates
    x_3d = (x_coords - cx) * depth_image / fx
    y_3d = (y_coords - cy) * depth_image / fy
    z_3d = depth_image

    # Stack to create point cloud
    point_cloud = np.stack([x_3d, y_3d, z_3d], axis=-1)

    # Reshape to (N, 3) format
    points = point_cloud.reshape(-1, 3)

    # Filter out invalid points (where depth is 0 or invalid)
    valid_points = points[np.isfinite(points).all(axis=1) & (points[:, 2] > 0.1)]

    print(f"Point cloud created with {len(valid_points)} valid points")

    return valid_points

# Usage example
camera_path = setup_depth_camera()
depth_image = capture_depth_data(camera_path)
point_cloud = process_depth_image(depth_image)
```

### Exercise 2.1: Depth Camera Calibration
**Objective**: Understand the impact of camera parameters on depth estimation accuracy.

**Steps**:
1. Set up a depth camera with different focal lengths (18mm, 35mm, 50mm)
2. Capture depth data for the same scene with each configuration
3. Compare the accuracy of depth measurements at different distances
4. Analyze the field of view differences
5. Document the optimal focal length for your specific application

**Expected Learning**: Understanding how camera parameters affect depth perception accuracy.

## Example 3: IMU Sensor Configuration and Data Processing

### Objective
Configure and process data from an IMU sensor in Isaac Sim.

### Setup Code
```python
# Example: IMU sensor configuration and processing
from omni.isaac.core.utils.prims import define_prim
from omni.isaac.core import World
import numpy as np
from scipy.spatial.transform import Rotation as R

def setup_imu_sensor(robot_path="/World/Robot"):
    """
    Set up an IMU sensor on a robot
    """
    # Create IMU sensor prim
    imu_path = f"{robot_path}/Imu_Sensor"

    # In Isaac Sim, IMU is typically implemented as a custom sensor
    # For this example, we'll create a placeholder that will be connected to physics
    define_prim(imu_path, "Xform")

    # Configure IMU parameters
    imu_config = {
        "linear_acceleration_noise": 0.017,  # m/s²
        "angular_velocity_noise": 0.0015,    # rad/s
        "orientation_noise": 0.005,          # rad
        "update_frequency": 100,             # Hz
        "linear_acceleration_bias": 0.001,   # m/s²
        "angular_velocity_bias": 0.0001      # rad/s
    }

    # Apply configuration
    apply_imu_configuration(imu_path, imu_config)

    return imu_path

def apply_imu_configuration(imu_path, config):
    """
    Apply configuration to IMU sensor
    """
    # Store configuration as custom attributes
    # In practice, this would connect to Isaac Sim's physics engine
    stage = omni.usd.get_context().get_stage()
    imu_prim = stage.GetPrimAtPath(imu_path)

    if imu_prim.IsValid():
        # Add custom attributes for IMU configuration
        acc_noise_attr = imu_prim.CreateAttribute("imu:linearAccelerationNoise", Sdf.ValueTypeNames.Float)
        acc_noise_attr.Set(config["linear_acceleration_noise"])

        gyro_noise_attr = imu_prim.CreateAttribute("imu:angularVelocityNoise", Sdf.ValueTypeNames.Float)
        gyro_noise_attr.Set(config["angular_velocity_noise"])

        update_freq_attr = imu_prim.CreateAttribute("imu:updateFrequency", Sdf.ValueTypeNames.Int)
        update_freq_attr.Set(config["update_frequency"])

def simulate_imu_data(robot_path, time_step=0.01):
    """
    Simulate realistic IMU data based on robot motion
    """
    # Get robot's current state from physics simulation
    # In practice, this would interface with Isaac Sim's physics engine
    current_time = time.time()

    # Simulate realistic IMU measurements with noise and bias
    # These would be calculated from actual robot motion in Isaac Sim

    # Simulate linear acceleration (including gravity)
    # This would come from physics simulation in practice
    true_linear_acc = np.array([0.1, 0.05, -9.71])  # Including gravity

    # Add noise and bias
    acc_noise = np.random.normal(0, 0.017, 3)  # Accelerometer noise
    acc_bias = np.array([0.001, -0.002, 0.003])  # Accelerometer bias

    measured_linear_acc = true_linear_acc + acc_noise + acc_bias

    # Simulate angular velocity
    true_angular_vel = np.array([0.01, -0.02, 0.005])  # rad/s

    # Add noise and bias
    gyro_noise = np.random.normal(0, 0.0015, 3)  # Gyro noise
    gyro_bias = np.array([0.0001, -0.0002, 0.0003])  # Gyro bias

    measured_angular_vel = true_angular_vel + gyro_noise + gyro_bias

    # Simulate orientation (integration of angular velocity)
    # In practice, this would be obtained from the robot's orientation in the simulation
    # For this example, we'll simulate a slowly changing orientation
    base_orientation = R.from_euler('xyz', [0.1, -0.05, 0.02], degrees=True)
    rotation_change = R.from_rotvec(measured_angular_vel * time_step)
    current_orientation = base_orientation * rotation_change

    # Add noise to orientation measurement
    orientation_noise = np.random.normal(0, 0.005, 3)  # Orientation noise in radians
    noisy_orientation = current_orientation.as_euler('xyz') + orientation_noise

    imu_data = {
        "linear_acceleration": measured_linear_acc,
        "angular_velocity": measured_angular_vel,
        "orientation": noisy_orientation,
        "timestamp": current_time,
        "frame_id": "imu_link"
    }

    # Print IMU statistics
    acc_magnitude = np.linalg.norm(measured_linear_acc)
    gyro_magnitude = np.linalg.norm(measured_angular_vel)

    print(f"IMU Data - Acc: {acc_magnitude:.3f} m/s², Gyro: {gyro_magnitude:.4f} rad/s")
    print(f"Orientation: {np.degrees(noisy_orientation)} degrees")

    return imu_data

def process_imu_data(imu_data):
    """
    Process IMU data for navigation and state estimation
    """
    # Extract components
    linear_acc = imu_data["linear_acceleration"]
    angular_vel = imu_data["angular_velocity"]
    orientation = imu_data["orientation"]

    # Convert orientation to rotation matrix for transformations
    rot_matrix = R.from_euler('xyz', orientation).as_matrix()

    # Integrate angular velocity to get orientation change (simplified)
    # In practice, you'd use more sophisticated integration (e.g., quaternion integration)
    dt = 0.01  # Time step (would come from timestamps in real implementation)

    # Rotate linear acceleration from IMU frame to world frame
    world_linear_acc = rot_matrix @ linear_acc

    # Remove gravity from linear acceleration
    gravity = np.array([0, 0, 9.81])
    specific_force = world_linear_acc - gravity

    # Calculate derived quantities
    linear_velocity_change = specific_force * dt
    angular_displacement = angular_vel * dt

    processed_data = {
        "specific_force": specific_force,
        "world_linear_acceleration": world_linear_acc,
        "linear_velocity_change": linear_velocity_change,
        "angular_displacement": angular_displacement,
        "rotation_matrix": rot_matrix
    }

    print(f"Specific force magnitude: {np.linalg.norm(specific_force):.3f} m/s²")
    print(f"Estimated linear velocity change: {np.linalg.norm(linear_velocity_change):.4f} m/s")

    return processed_data

# Usage example
imu_path = setup_imu_sensor()
imu_data = simulate_imu_data("/World/Robot")
processed_imu = process_imu_data(imu_data)
```

### Exercise 3.1: IMU Integration and Drift Analysis
**Objective**: Understand IMU integration and analyze drift characteristics.

**Steps**:
1. Set up an IMU sensor on a moving robot
2. Integrate angular velocity to estimate orientation
3. Integrate linear acceleration to estimate velocity and position
4. Analyze the drift over time
5. Implement simple drift correction techniques
6. Compare integrated position with ground truth

**Expected Learning**: Understanding of IMU integration challenges and drift compensation.

## Example 4: Multi-Sensor Fusion

### Objective
Combine data from multiple sensors (LiDAR, camera, IMU) to create a more robust perception system.

### Setup Code
```python
# Example: Multi-sensor fusion system
class MultiSensorFusion:
    def __init__(self):
        self.lidar_data = None
        self.camera_data = None
        self.imu_data = None

        self.fusion_results = {
            "position_estimate": np.zeros(3),
            "velocity_estimate": np.zeros(3),
            "orientation_estimate": np.array([0, 0, 0, 1]),  # Quaternion
            "confidence": 0.0
        }

        self.last_timestamp = 0.0
        self.sensor_buffer_size = 10

        # Initialize sensor data buffers
        self.lidar_buffer = []
        self.camera_buffer = []
        self.imu_buffer = []

    def update_sensor_data(self, sensor_type, data, timestamp):
        """
        Update sensor data in the fusion system
        """
        if sensor_type == "lidar":
            self.lidar_data = data
            self.lidar_buffer.append((timestamp, data))
            if len(self.lidar_buffer) > self.sensor_buffer_size:
                self.lidar_buffer.pop(0)

        elif sensor_type == "camera":
            self.camera_data = data
            self.camera_buffer.append((timestamp, data))
            if len(self.camera_buffer) > self.sensor_buffer_size:
                self.camera_buffer.pop(0)

        elif sensor_type == "imu":
            self.imu_data = data
            self.imu_buffer.append((timestamp, data))
            if len(self.imu_buffer) > self.sensor_buffer_size:
                self.imu_buffer.pop(0)

    def fuse_sensor_data(self):
        """
        Fuse data from multiple sensors using weighted averaging
        """
        if not all([self.lidar_data, self.camera_data, self.imu_data]):
            print("Insufficient sensor data for fusion")
            return self.fusion_results

        # Simple weighted fusion approach
        # In practice, you'd use more sophisticated methods like Kalman filtering

        # Position estimation (from LiDAR and camera data)
        lidar_position = self.estimate_position_from_lidar(self.lidar_data)
        camera_position = self.estimate_position_from_camera(self.camera_data)
        imu_position = self.estimate_position_from_imu(self.imu_data)

        # Weighted average based on sensor reliability
        position_weights = {
            "lidar": 0.4,
            "camera": 0.3,
            "imu": 0.3
        }

        fused_position = (position_weights["lidar"] * lidar_position +
                         position_weights["camera"] * camera_position +
                         position_weights["imu"] * imu_position)

        # Velocity estimation (primarily from IMU)
        velocity_estimate = self.estimate_velocity_from_imu(self.imu_data)

        # Orientation estimation (primarily from IMU with camera correction)
        orientation_estimate = self.estimate_orientation_from_imu(self.imu_data)

        # Calculate confidence based on data consistency
        confidence = self.calculate_fusion_confidence()

        # Update fusion results
        self.fusion_results["position_estimate"] = fused_position
        self.fusion_results["velocity_estimate"] = velocity_estimate
        self.fusion_results["orientation_estimate"] = orientation_estimate
        self.fusion_results["confidence"] = confidence

        print(f"Fused Position: [{fused_position[0]:.2f}, {fused_position[1]:.2f}, {fused_position[2]:.2f}]")
        print(f"Confidence: {confidence:.2f}")

        return self.fusion_results

    def estimate_position_from_lidar(self, lidar_data):
        """
        Estimate position from LiDAR data (simplified)
        """
        # In practice, this would involve map matching, feature extraction, etc.
        # For this example, we'll return a simple estimate
        if lidar_data is not None:
            # Calculate centroid of valid points as position estimate
            points = np.array(lidar_data.points)
            if len(points) > 0:
                # Use landmark-based positioning if landmarks are known
                # For now, return a simple estimate
                return np.mean(points[:, :3], axis=0)

        return np.zeros(3)

    def estimate_position_from_camera(self, camera_data):
        """
        Estimate position from camera data (simplified)
        """
        # In practice, this would involve visual odometry, SLAM, etc.
        # For this example, we'll return a simple estimate
        if camera_data is not None:
            # This would typically involve feature tracking and triangulation
            # For now, return a placeholder
            return np.array([0.1, 0.0, 0.0])  # Small offset as example

        return np.zeros(3)

    def estimate_position_from_imu(self, imu_data):
        """
        Estimate position by integrating IMU data
        """
        if imu_data is not None:
            # Integrate acceleration twice to get position (simplified)
            linear_acc = imu_data["linear_acceleration"]
            angular_vel = imu_data["angular_velocity"]
            dt = 0.01  # Time step

            # Rotate acceleration to world frame
            orientation = R.from_euler('xyz', imu_data["orientation"])
            world_acc = orientation.apply(linear_acc)

            # Remove gravity
            gravity = np.array([0, 0, 9.81])
            specific_force = world_acc - gravity

            # Integrate to get velocity and position
            velocity_change = specific_force * dt
            position_change = 0.5 * specific_force * dt**2

            # This is a very simplified integration - in practice you'd need proper integration
            return position_change

        return np.zeros(3)

    def estimate_velocity_from_imu(self, imu_data):
        """
        Estimate velocity by integrating IMU acceleration
        """
        if imu_data is not None:
            linear_acc = imu_data["linear_acceleration"]
            dt = 0.01

            # Rotate to world frame and remove gravity
            orientation = R.from_euler('xyz', imu_data["orientation"])
            world_acc = orientation.apply(linear_acc)
            gravity = np.array([0, 0, 9.81])
            specific_force = world_acc - gravity

            # Integrate acceleration to get velocity
            velocity_change = specific_force * dt

            return velocity_change

        return np.zeros(3)

    def estimate_orientation_from_imu(self, imu_data):
        """
        Estimate orientation from IMU data
        """
        if imu_data is not None:
            # Convert Euler angles to quaternion
            euler_angles = imu_data["orientation"]
            rotation = R.from_euler('xyz', euler_angles)
            quaternion = rotation.as_quat()

            # Use scalar-last format (w, x, y, z)
            return np.array([quaternion[3], quaternion[0], quaternion[1], quaternion[2]])

        return np.array([1, 0, 0, 0])  # Identity quaternion

    def calculate_fusion_confidence(self):
        """
        Calculate confidence in fusion results
        """
        # Simple confidence calculation based on sensor data quality
        confidence = 0.0

        if self.lidar_data is not None:
            # Confidence based on number of valid LiDAR points
            if hasattr(self.lidar_data, 'points') and len(self.lidar_data.points) > 100:
                confidence += 0.3

        if self.camera_data is not None:
            # Confidence based on image quality metrics
            confidence += 0.2

        if self.imu_data is not None:
            # IMU data is usually reliable
            confidence += 0.5

        # Normalize to 0-1 range
        return min(confidence, 1.0)

# Usage example
fusion_system = MultiSensorFusion()

# Simulate sensor updates
lidar_data = capture_lidar_data(lidar_sensor_path)
camera_data = capture_depth_data(camera_path)
imu_data = simulate_imu_data("/World/Robot")

# Update fusion system
fusion_system.update_sensor_data("lidar", lidar_data, time.time())
fusion_system.update_sensor_data("camera", camera_data, time.time())
fusion_system.update_sensor_data("imu", imu_data, time.time())

# Perform fusion
fusion_results = fusion_system.fuse_sensor_data()
```

### Exercise 4.1: Sensor Fusion Performance Analysis
**Objective**: Analyze the performance of multi-sensor fusion vs. individual sensors.

**Steps**:
1. Implement the multi-sensor fusion system as shown above
2. Run the system with individual sensors disabled (one at a time)
3. Compare position estimates from each configuration
4. Analyze the improvement in accuracy and robustness
5. Document the contribution of each sensor modality
6. Test with different environmental conditions

**Expected Learning**: Understanding of sensor fusion benefits and trade-offs.

## Exercise 5: Complete Perception Pipeline

### Objective
Create a complete perception pipeline that integrates all sensor types for robot navigation.

### Exercise Steps:
1. **Environment Setup**: Create a simple environment with obstacles
2. **Sensor Configuration**: Configure LiDAR, camera, and IMU sensors on a robot
3. **Data Processing**: Implement processing pipelines for each sensor
4. **Fusion Implementation**: Combine sensor data for comprehensive perception
5. **Navigation Integration**: Use fused perception data for navigation planning
6. **Performance Evaluation**: Test the system in various scenarios

### Implementation Template:
```python
# Complete perception pipeline template
class PerceptionPipeline:
    def __init__(self):
        self.lidar_processor = self.initialize_lidar_processor()
        self.camera_processor = self.initialize_camera_processor()
        self.imu_processor = self.initialize_imu_processor()
        self.fusion_system = MultiSensorFusion()
        self.navigation_system = self.initialize_navigation_system()

    def initialize_lidar_processor(self):
        # Initialize LiDAR processing components
        return type('MockLidarProcessor', (), {
            'process': lambda self, data: self.process_lidar_data(data),
            'detect_obstacles': lambda self, pc: self.detect_obstacles(pc)
        })()

    def initialize_camera_processor(self):
        # Initialize camera processing components
        return type('MockCameraProcessor', (), {
            'process': lambda self, data: self.process_camera_data(data),
            'detect_features': lambda self, img: self.detect_features(img)
        })()

    def initialize_imu_processor(self):
        # Initialize IMU processing components
        return type('MockImuProcessor', (), {
            'process': lambda self, data: self.process_imu_data(data),
            'integrate_motion': lambda self, imu: self.integrate_motion(imu)
        })()

    def initialize_navigation_system(self):
        # Initialize navigation components
        return type('MockNavigationSystem', (), {
            'plan_path': lambda self, start, goal, obstacles: self.plan_path(start, goal, obstacles),
            'execute_navigation': lambda self, path: self.execute_navigation(path)
        })()

    def process_sensor_data(self, lidar_data, camera_data, imu_data):
        """
        Process all sensor data and integrate for navigation
        """
        # Process individual sensor data
        lidar_features = self.lidar_processor.process(lidar_data)
        camera_features = self.camera_processor.process(camera_data)
        imu_state = self.imu_processor.process(imu_data)

        # Update fusion system
        self.fusion_system.update_sensor_data("lidar", lidar_features, time.time())
        self.fusion_system.update_sensor_data("camera", camera_features, time.time())
        self.fusion_system.update_sensor_data("imu", imu_state, time.time())

        # Get fused state estimate
        fused_state = self.fusion_system.fuse_sensor_data()

        # Extract navigation-relevant information
        robot_position = fused_state["position_estimate"]
        robot_orientation = fused_state["orientation_estimate"]
        confidence = fused_state["confidence"]

        # Detect obstacles from sensor data
        obstacles = self.detect_environment_obstacles(lidar_data, camera_data)

        # Plan navigation based on fused perception
        navigation_command = self.plan_navigation(robot_position, obstacles)

        return {
            "robot_state": fused_state,
            "obstacles": obstacles,
            "navigation_command": navigation_command,
            "confidence": confidence
        }

    def detect_environment_obstacles(self, lidar_data, camera_data):
        """
        Detect obstacles from sensor data
        """
        obstacles = []

        # Detect obstacles from LiDAR
        if lidar_data is not None:
            lidar_obstacles = self.lidar_processor.detect_obstacles(lidar_data)
            obstacles.extend(lidar_obstacles)

        # Detect obstacles from camera
        if camera_data is not None:
            camera_obstacles = self.camera_processor.detect_features(camera_data)
            obstacles.extend(camera_obstacles)

        # Merge and filter obstacles
        merged_obstacles = self.merge_obstacle_detections(obstacles)

        return merged_obstacles

    def merge_obstacle_detections(self, obstacles):
        """
        Merge obstacle detections from different sensors
        """
        # Implement obstacle association and merging logic
        # This would involve matching detections from different sensors
        # that likely represent the same physical obstacles
        merged = []

        # Simple clustering approach
        for obs in obstacles:
            # Find existing cluster for this obstacle
            associated_cluster = None
            for cluster in merged:
                if self.obstacle_distance(obs, cluster['center']) < 0.5:  # 50cm threshold
                    associated_cluster = cluster
                    break

            if associated_cluster:
                # Add to existing cluster
                associated_cluster['detections'].append(obs)
                # Update cluster center
                all_centers = [det['center'] for det in associated_cluster['detections']] + [obs['center']]
                associated_cluster['center'] = np.mean(all_centers, axis=0)
            else:
                # Create new cluster
                merged.append({
                    'center': obs['center'],
                    'size': obs.get('size', [1.0, 1.0, 1.0]),
                    'detections': [obs]
                })

        return merged

    def plan_navigation(self, robot_position, obstacles):
        """
        Plan navigation path based on perception data
        """
        # In practice, this would implement path planning algorithms
        # For this example, we'll return a simple navigation command

        # Define a simple goal position
        goal_position = np.array([5.0, 0.0, 0.0])

        # Calculate direction to goal
        direction_to_goal = goal_position - robot_position
        distance_to_goal = np.linalg.norm(direction_to_goal)

        if distance_to_goal < 0.5:  # Reached goal
            return {"command": "STOP", "goal_reached": True}
        else:
            # Normalize direction vector
            if distance_to_goal > 0:
                direction_to_goal = direction_to_goal / distance_to_goal

            # Check for obstacles in the path
            safe_to_move = self.check_path_clear(robot_position, direction_to_goal, obstacles)

            if safe_to_move:
                return {
                    "command": "MOVE_FORWARD",
                    "direction": direction_to_goal,
                    "speed": min(distance_to_goal, 1.0)  # Slower as we get closer
                }
            else:
                return {
                    "command": "AVOID_OBSTACLE",
                    "obstacle_detected": True
                }

    def check_path_clear(self, start_pos, direction, obstacles):
        """
        Check if path in given direction is clear of obstacles
        """
        # Simple obstacle checking along path
        check_distance = 1.0  # Check 1m ahead
        check_points = 10     # Check 10 points along path

        for i in range(1, check_points + 1):
            check_distance = i * (1.0 / check_points)
            check_pos = start_pos + direction * check_distance

            for obstacle in obstacles:
                obstacle_pos = obstacle['center']
                distance = np.linalg.norm(check_pos - obstacle_pos)

                # Consider obstacle size in collision check
                min_distance = np.max(obstacle['size']) / 2.0 + 0.3  # Robot radius + safety margin

                if distance < min_distance:
                    return False  # Path blocked

        return True  # Path clear

# Usage example
pipeline = PerceptionPipeline()

# In a real implementation, you would continuously update with sensor data
# For this example, we'll simulate a single processing cycle
lidar_data = capture_lidar_data(lidar_sensor_path)
camera_data = capture_depth_data(camera_path)
imu_data = simulate_imu_data("/World/Robot")

results = pipeline.process_sensor_data(lidar_data, camera_data, imu_data)

print(f"Robot Position: [{results['robot_state']['position_estimate'][0]:.2f}, "
      f"{results['robot_state']['position_estimate'][1]:.2f}, "
      f"{results['robot_state']['position_estimate'][2]:.2f}]")
print(f"Navigation Command: {results['navigation_command']['command']}")
print(f"Confidence: {results['confidence']:.2f}")
```

## Troubleshooting Common Issues

### Issue 1: Sensor Synchronization Problems
**Symptoms**: Data from different sensors doesn't align temporally
**Solution**: Implement proper timestamp management and interpolation

### Issue 2: Coordinate Frame Mismatches
**Symptoms**: Sensor data appears misaligned in 3D space
**Solution**: Verify all sensor transforms and coordinate frame definitions

### Issue 3: Performance Bottlenecks
**Symptoms**: Low frame rates during sensor processing
**Solution**: Optimize algorithms and implement efficient data structures

## Assessment Questions

1. How does sensor fusion improve robot perception compared to single-sensor approaches?
2. What are the main challenges in synchronizing data from different sensor types?
3. How do you handle sensor failures in a multi-sensor fusion system?
4. What are the key parameters that affect LiDAR point cloud quality?
5. How does IMU drift affect long-term navigation accuracy?

## Next Steps

After completing these practical examples and exercises, you should have a solid understanding of sensor simulation and fusion in Isaac Sim. The next step is to explore advanced topics like sensor calibration, validation techniques, and real-world deployment considerations.