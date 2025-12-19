# Obstacle Avoidance for Humanoid Robots

This section covers obstacle avoidance techniques specifically designed for humanoid robots, leveraging Isaac ROS navigation capabilities with specialized algorithms for bipedal locomotion and human-like navigation patterns.

## Understanding Humanoid Obstacle Avoidance

### Unique Challenges for Humanoid Robots

Humanoid robots face specific challenges in obstacle avoidance that differ from wheeled robots:

1. **Balance Preservation**: Avoiding obstacles while maintaining dynamic balance
2. **Step Planning**: Navigating with discrete footstep patterns
3. **Kinematic Constraints**: Limited turning and stepping capabilities
4. **Collision Avoidance**: Protecting multiple body segments during navigation
5. **Social Navigation**: Navigating around humans with appropriate social behavior

### Types of Obstacles for Humanoid Navigation

- **Static Obstacles**: Furniture, walls, fixed structures
- **Dynamic Obstacles**: Moving humans, other robots, doors
- **Step Obstacles**: Curbs, stairs, thresholds that affect step planning
- **Narrow Passages**: Doorways, corridors requiring careful navigation
- **Unstructured Terrain**: Uneven surfaces, slopes, obstacles of varying heights

## Isaac ROS Navigation Components for Humanoids

### Humanoid-Specific Navigation Stack

```python
# Example: Humanoid-specific navigation stack configuration
import rclpy
from rclpy.node import Node
from nav2_msgs.action import NavigateToPose
from geometry_msgs.msg import PoseStamped, Twist
from sensor_msgs.msg import LaserScan, PointCloud2
from builtin_interfaces.msg import Duration
from tf2_ros import TransformListener, Buffer
import numpy as np

class HumanoidNavigationNode(Node):
    def __init__(self):
        super().__init__('humanoid_navigation_node')

        # Navigation action client
        self.nav_client = ActionClient(self, NavigateToPose, 'navigate_to_pose')

        # Sensor subscriptions
        self.laser_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.laser_callback,
            10
        )

        self.pointcloud_sub = self.create_subscription(
            PointCloud2,
            '/points_processed',
            self.pointcloud_callback,
            10
        )

        self.imu_sub = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )

        # Velocity publisher for direct control when needed
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        # TF listener for robot pose
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

        # Humanoid-specific parameters
        self.step_height_limit = 0.15  # Max step height (15cm)
        self.step_width_limit = 0.60  # Max step width (60cm)
        self.turning_radius = 0.50    # Minimum turning radius
        self.balance_margin = 0.10    # Safety margin for balance

        # Initialize Isaac ROS humanoid navigation components
        self.initialize_humanoid_navigation()

    def initialize_humanoid_navigation(self):
        """
        Initialize humanoid-specific navigation components
        """
        # Initialize step planning module
        self.step_planner = self.create_step_planner()

        # Initialize balance controller
        self.balance_controller = self.create_balance_controller()

        # Initialize humanoid-specific costmaps
        self.initialize_humanoid_costmaps()

        # Initialize footstep planner
        self.footstep_planner = self.create_footstep_planner()

        self.get_logger().info("Humanoid navigation components initialized")

    def create_step_planner(self):
        """
        Create step planning component for humanoid navigation
        """
        step_planner_config = {
            'step_height_limit': self.step_height_limit,
            'step_width_limit': self.step_width_limit,
            'foot_size': [0.25, 0.15],  # 25cm x 15cm foot
            'step_duration': 0.8,       # Time per step
            'max_search_depth': 5       # Max steps to look ahead
        }

        # In practice: return IsaacROSStepPlanner(step_planner_config)
        return self.create_mock_component('StepPlanner', step_planner_config)

    def create_balance_controller(self):
        """
        Create balance controller for humanoid stability
        """
        balance_config = {
            'control_frequency': 100,  # Hz
            'zmp_tolerance': 0.05,    # Zero Moment Point tolerance
            'com_height': 0.85,       # Center of mass height
            'balance_threshold': 0.1  # Balance stability threshold
        }

        # In practice: return IsaacROSBalanceController(balance_config)
        return self.create_mock_component('BalanceController', balance_config)

    def create_footstep_planner(self):
        """
        Create footstep planning component
        """
        footstep_config = {
            'foot_separation': 0.20,   # Distance between feet
            'max_step_length': 0.30,   # Max forward step
            'max_step_side': 0.15,     # Max lateral step
            'turn_step_angle': 0.2,    # Max turn per step (radians)
            'planning_horizon': 10     # Steps to plan ahead
        }

        # In practice: return IsaacROSFootstepPlanner(footstep_config)
        return self.create_mock_component('FootstepPlanner', footstep_config)

    def laser_callback(self, msg):
        """
        Process laser scan data for obstacle detection
        """
        # Convert laser scan to obstacle information
        obstacles = self.process_laser_scan(msg)

        # Update costmap with obstacle information
        self.update_humanoid_costmap(obstacles)

        # Check for immediate collision risks
        immediate_threats = self.identify_immediate_threats(obstacles)

        if immediate_threats:
            self.handle_immediate_threats(immediate_threats)

    def pointcloud_callback(self, msg):
        """
        Process point cloud data for 3D obstacle detection
        """
        # Convert point cloud to 3D obstacle information
        obstacles_3d = self.process_pointcloud(msg)

        # Update 3D costmap
        self.update_3d_costmap(obstacles_3d)

        # Extract step-height information for humanoid navigation
        step_obstacles = self.extract_step_obstacles(obstacles_3d)

        # Update step-aware costmap
        self.update_step_aware_costmap(step_obstacles)

    def identify_immediate_threats(self, obstacles):
        """
        Identify obstacles that pose immediate collision risk
        """
        immediate_threats = []

        # Define immediate threat zone (close to robot)
        threat_distance = 0.5  # meters

        for obstacle in obstacles:
            distance = self.calculate_distance_to_robot(obstacle)

            if distance < threat_distance:
                # Check if obstacle is in robot's path
                if self.is_in_navigation_path(obstacle):
                    immediate_threats.append({
                        'obstacle': obstacle,
                        'distance': distance,
                        'type': self.classify_obstacle(obstacle),
                        'risk_level': self.assess_risk_level(obstacle, distance)
                    })

        return immediate_threats

    def handle_immediate_threats(self, threats):
        """
        Handle immediate collision threats
        """
        for threat in threats:
            if threat['risk_level'] == 'HIGH':
                # Emergency stop or evasive action
                self.execute_emergency_action(threat)
            elif threat['risk_level'] == 'MEDIUM':
                # Slow down and replan
                self.execute_cautionary_action(threat)
            else:
                # Continue with awareness
                self.continue_with_awareness(threat)

    def execute_emergency_action(self, threat):
        """
        Execute emergency obstacle avoidance
        """
        # Stop robot immediately
        stop_cmd = Twist()
        stop_cmd.linear.x = 0.0
        stop_cmd.angular.z = 0.0
        self.cmd_vel_pub.publish(stop_cmd)

        # Assess situation and determine best action
        if threat['type'] == 'dynamic_human':
            # Wait for human to pass or request to stop
            self.request_human_awareness()
        elif threat['type'] == 'static_obstacle':
            # Replan path around obstacle
            self.replan_around_obstacle(threat['obstacle'])
        elif threat['type'] == 'step_obstacle':
            # Assess step height and plan accordingly
            self.assess_step_feasibility(threat['obstacle'])

    def execute_cautionary_action(self, threat):
        """
        Execute cautionary obstacle avoidance
        """
        # Reduce speed
        slow_cmd = Twist()
        slow_cmd.linear.x = 0.1  # Very slow
        slow_cmd.angular.z = 0.0
        self.cmd_vel_pub.publish(slow_cmd)

        # Prepare for potential evasive maneuver
        self.prepare_evasive_maneuver(threat['obstacle'])

    def assess_step_feasibility(self, obstacle):
        """
        Assess whether step obstacle is passable for humanoid
        """
        # Extract height information from obstacle
        obstacle_height = self.estimate_obstacle_height(obstacle)

        if obstacle_height > self.step_height_limit:
            # Obstacle too high to step over
            self.get_logger().warn(f"Step obstacle too high: {obstacle_height:.2f}m (limit: {self.step_height_limit:.2f}m)")

            # Plan alternative route
            alternative_route = self.find_alternative_path_around_obstacle(obstacle)

            if alternative_route:
                self.follow_alternative_path(alternative_route)
            else:
                self.request_assistance()
        else:
            # Obstacle is step-overable, plan step
            step_plan = self.plan_safe_step_over(obstacle)
            if step_plan:
                self.execute_step_over(step_plan)

    def plan_safe_step_over(self, obstacle):
        """
        Plan safe step over maneuver for obstacle
        """
        # Calculate approach position
        approach_distance = 0.3  # 30cm before obstacle
        approach_position = self.calculate_approach_position(obstacle, approach_distance)

        # Plan approach trajectory
        approach_trajectory = self.plan_approach_trajectory(approach_position)

        # Plan step-over motion
        step_over_motion = self.plan_step_over_motion(obstacle)

        # Plan recovery trajectory
        recovery_trajectory = self.plan_recovery_trajectory(obstacle)

        return {
            'approach': approach_trajectory,
            'step_over': step_over_motion,
            'recovery': recovery_trajectory
        }

    def execute_step_over(self, step_plan):
        """
        Execute planned step over maneuver
        """
        # Follow approach trajectory
        self.follow_trajectory(step_plan['approach'])

        # Execute step over motion
        self.execute_specific_motion(step_plan['step_over'])

        # Follow recovery trajectory
        self.follow_trajectory(step_plan['recovery'])

        self.get_logger().info("Step over maneuver completed successfully")

    def find_alternative_path_around_obstacle(self, obstacle):
        """
        Find alternative path around step obstacle
        """
        # Inflate obstacle to account for robot size and step limitations
        inflated_obstacle = self.inflate_obstacle_for_humanoid(obstacle)

        # Use path planner to find route around obstacle
        alternative_path = self.path_planner.plan_path_around_obstacle(
            inflated_obstacle,
            self.current_pose,
            self.goal_pose
        )

        return alternative_path

    def continue_with_awareness(self, threat):
        """
        Continue navigation with obstacle awareness
        """
        # Continue current path but monitor threat
        self.active_threats.append(threat)

        # Adjust navigation parameters for safety
        self.adjust_navigation_for_threat(threat)

    def adjust_navigation_for_threat(self, threat):
        """
        Adjust navigation parameters when threat detected
        """
        # Increase safety margins
        self.costmap_inflation_radius *= 1.5

        # Reduce speed near threat
        self.max_linear_velocity *= 0.7

        # Increase obstacle detection sensitivity
        self.obstacle_detection_threshold *= 0.8

    def request_human_awareness(self):
        """
        Request awareness from humans in the environment
        """
        # This could involve audio, visual, or other signaling
        # For now, just log the request
        self.get_logger().info("Requesting human awareness for safe passage")

    def request_assistance(self):
        """
        Request assistance when obstacle cannot be handled autonomously
        """
        # Signal for human intervention
        self.get_logger().warn("Unable to navigate obstacle autonomously, requesting assistance")

    def process_laser_scan(self, scan_msg):
        """
        Process laser scan data into obstacle information
        """
        obstacles = []

        # Process each range measurement
        for i, range_val in enumerate(scan_msg.ranges):
            if scan_msg.range_min <= range_val <= scan_msg.range_max:
                # Calculate angle of this measurement
                angle = scan_msg.angle_min + i * scan_msg.angle_increment

                # Convert to Cartesian coordinates
                x = range_val * np.cos(angle)
                y = range_val * np.sin(angle)

                # Transform to world coordinates
                world_point = self.transform_to_world_frame([x, y, 0])

                obstacles.append({
                    'position': world_point,
                    'distance': range_val,
                    'angle': angle,
                    'type': 'unknown'
                })

        return obstacles

    def process_pointcloud(self, pc_msg):
        """
        Process point cloud into 3D obstacle information
        """
        # In practice, this would use Isaac ROS point cloud processing
        # For now, return a simplified representation
        obstacles_3d = []

        # Convert PointCloud2 to numpy array
        points = self.pointcloud_to_numpy(pc_msg)

        # Cluster points to identify obstacles
        obstacle_clusters = self.cluster_points_to_obstacles(points)

        for cluster in obstacle_clusters:
            obstacle_3d = {
                'points': cluster,
                'centroid': np.mean(cluster, axis=0),
                'bounding_box': self.calculate_bounding_box(cluster),
                'height': self.calculate_height(cluster),
                'width': self.calculate_width(cluster),
                'depth': self.calculate_depth(cluster)
            }
            obstacles_3d.append(obstacle_3d)

        return obstacles_3d

    def cluster_points_to_obstacles(self, points):
        """
        Cluster 3D points into obstacle groups
        """
        # Simple clustering based on distance
        clusters = []
        visited = set()

        for i, point in enumerate(points):
            if i in visited:
                continue

            cluster = [point]
            visited.add(i)

            # Find nearby points
            for j, other_point in enumerate(points[i+1:], i+1):
                if j in visited:
                    continue

                distance = np.linalg.norm(point - other_point)
                if distance < 0.3:  # 30cm threshold for clustering
                    cluster.append(other_point)
                    visited.add(j)

            if len(cluster) > 10:  # Minimum cluster size
                clusters.append(np.array(cluster))

        return clusters

    def calculate_bounding_box(self, points):
        """
        Calculate 3D bounding box for obstacle cluster
        """
        mins = np.min(points, axis=0)
        maxs = np.max(points, axis=0)

        return {
            'min': mins,
            'max': maxs,
            'center': (mins + maxs) / 2,
            'size': maxs - mins
        }

    def calculate_height(self, points):
        """
        Calculate height of obstacle cluster
        """
        z_values = points[:, 2]
        return np.max(z_values) - np.min(z_values)

    def calculate_width(self, points):
        """
        Calculate width of obstacle cluster (X dimension)
        """
        x_values = points[:, 0]
        return np.max(x_values) - np.min(x_values)

    def calculate_depth(self, points):
        """
        Calculate depth of obstacle cluster (Y dimension)
        """
        y_values = points[:, 1]
        return np.max(y_values) - np.min(y_values)

    def update_humanoid_costmap(self, obstacles):
        """
        Update costmap with humanoid-specific considerations
        """
        # Clear current obstacle layer
        self.clear_obstacle_layer()

        # Add obstacles with humanoid-specific inflation
        for obstacle in obstacles:
            # Calculate humanoid-appropriate inflation
            inflation_radius = self.calculate_humanoid_inflation(obstacle)

            # Add obstacle to costmap with appropriate cost
            self.add_obstacle_to_costmap(obstacle['position'], inflation_radius)

    def calculate_humanoid_inflation(self, obstacle):
        """
        Calculate appropriate inflation radius for humanoid robot
        """
        # Base inflation based on robot size and balance margin
        base_inflation = 0.3  # Robot radius + safety margin

        # Increase inflation for step obstacles
        if self.is_step_obstacle(obstacle):
            base_inflation += 0.2  # Extra margin for step navigation

        # Increase inflation for dynamic obstacles
        if self.is_dynamic_obstacle(obstacle):
            base_inflation += 0.15  # Extra margin for prediction uncertainty

        return base_inflation

    def is_step_obstacle(self, obstacle):
        """
        Determine if obstacle is a step obstacle requiring special handling
        """
        # Check if obstacle height is in step range (can't step over but can step on)
        if 'height' in obstacle:
            return 0.05 <= obstacle['height'] <= self.step_height_limit

        # For 2D obstacles, estimate based on other properties
        return False

    def is_dynamic_obstacle(self, obstacle):
        """
        Determine if obstacle is dynamic (moving)
        """
        # This would be determined by tracking obstacle over time
        # For now, use a simple heuristic
        return obstacle.get('type') == 'dynamic' or obstacle.get('velocity', 0) > 0.1

    def add_obstacle_to_costmap(self, position, inflation_radius):
        """
        Add obstacle to costmap with appropriate inflation
        """
        # In practice, this would use Nav2 costmap functionality
        # For now, this is a placeholder
        pass

    def clear_obstacle_layer(self):
        """
        Clear current obstacle layer in costmap
        """
        # In practice, this would clear the Nav2 costmap obstacle layer
        # For now, this is a placeholder
        pass

    def update_3d_costmap(self, obstacles_3d):
        """
        Update 3D costmap with volumetric obstacle information
        """
        # Process 3D obstacles for volumetric costmap
        for obstacle_3d in obstacles_3d:
            self.add_3d_obstacle_to_costmap(obstacle_3d)

    def add_3d_obstacle_to_costmap(self, obstacle_3d):
        """
        Add 3D obstacle information to costmap
        """
        # Determine affected cells in 3D costmap
        affected_cells = self.calculate_affected_cells_3d(obstacle_3d)

        # Update costmap with 3D obstacle information
        for cell in affected_cells:
            self.update_cell_cost_3d(cell, obstacle_3d)

    def calculate_affected_cells_3d(self, obstacle_3d):
        """
        Calculate which 3D costmap cells are affected by obstacle
        """
        # Convert 3D bounding box to costmap cell coordinates
        min_cell = self.world_to_costmap_3d(obstacle_3d['bounding_box']['min'])
        max_cell = self.world_to_costmap_3d(obstacle_3d['bounding_box']['max'])

        # Generate all cells within bounding box
        affected_cells = []
        for z in range(int(min_cell[2]), int(max_cell[2]) + 1):
            for y in range(int(min_cell[1]), int(max_cell[1]) + 1):
                for x in range(int(min_cell[0]), int(max_cell[0]) + 1):
                    if self.is_valid_cell_3d([x, y, z]):
                        affected_cells.append([x, y, z])

        return affected_cells

    def world_to_costmap_3d(self, world_point):
        """
        Convert world coordinates to 3D costmap cell coordinates
        """
        # This would use the 3D costmap's origin and resolution
        # Simplified implementation for demonstration
        origin = [0, 0, 0]  # Costmap origin
        resolution = [0.1, 0.1, 0.2]  # Resolution in x, y, z

        cell_coords = [
            int((world_point[0] - origin[0]) / resolution[0]),
            int((world_point[1] - origin[1]) / resolution[1]),
            int((world_point[2] - origin[2]) / resolution[2])
        ]

        return cell_coords

    def is_valid_cell_3d(self, cell_coords):
        """
        Check if 3D costmap cell coordinates are valid
        """
        # This would check against actual costmap dimensions
        # Simplified for demonstration
        max_dim = 100  # Max allowed coordinate value
        return all(-max_dim <= coord <= max_dim for coord in cell_coords)

    def update_cell_cost_3d(self, cell_coords, obstacle_3d):
        """
        Update 3D costmap cell with obstacle information
        """
        # Calculate cost based on obstacle properties
        cost = self.calculate_3d_obstacle_cost(obstacle_3d)

        # Update costmap cell
        # In practice: costmap_3d[cell_coords[0], cell_coords[1], cell_coords[2]] = cost
        pass

    def calculate_3d_obstacle_cost(self, obstacle_3d):
        """
        Calculate cost value for 3D obstacle
        """
        # Higher cost for obstacles at humanoid height
        height_penalty = 1.0
        if 0.5 <= obstacle_3d['centroid'][2] <= 1.8:  # Humanoid torso height
            height_penalty = 2.0

        # Size-based cost (larger obstacles = higher cost)
        size_factor = np.prod(obstacle_3d['bounding_box']['size'])
        size_penalty = min(size_factor * 10, 255)  # Cap at maximum cost

        return int(size_penalty * height_penalty)

    def update_step_aware_costmap(self, step_obstacles):
        """
        Update costmap with step-height considerations for humanoid navigation
        """
        for step_obstacle in step_obstacles:
            # Calculate step feasibility
            step_feasible = self.is_step_feasible(step_obstacle)

            if not step_feasible:
                # Mark area as high cost or impassable
                self.mark_step_infeasible_area(step_obstacle)
            else:
                # Mark as passable but with caution cost
                self.mark_step_feasible_area(step_obstacle)

    def is_step_feasible(self, step_obstacle):
        """
        Determine if step obstacle is feasible for humanoid to step over/onto
        """
        height = step_obstacle.get('height', 0)
        width = step_obstacle.get('width', float('inf'))

        # Check height constraints
        if height > self.step_height_limit:
            return False

        # Check width constraints (step must be wide enough to place foot)
        if width < 0.20:  # Minimum foot width
            return False

        return True

    def mark_step_infeasible_area(self, step_obstacle):
        """
        Mark area around step obstacle as high cost for humanoid navigation
        """
        # Calculate area to mark as high cost
        inflation_radius = 0.5  # 50cm safety margin around step

        # In practice, this would update the costmap
        # For now, this is a placeholder
        pass

    def mark_step_feasible_area(self, step_obstacle):
        """
        Mark step-feasible area with caution cost
        """
        # Mark with moderate cost to encourage careful navigation
        caution_cost = 100  # Moderate cost

        # In practice, this would update the costmap
        # For now, this is a placeholder
        pass

    def is_in_navigation_path(self, obstacle):
        """
        Check if obstacle is in the current navigation path
        """
        # Get current navigation path
        current_path = self.get_current_navigation_path()

        # Check if obstacle is close to any path segment
        for i in range(len(current_path.poses) - 1):
            path_segment_start = current_path.poses[i].pose.position
            path_segment_end = current_path.poses[i+1].pose.position

            # Calculate distance from obstacle to path segment
            distance = self.distance_to_line_segment(
                obstacle['position'],
                [path_segment_start.x, path_segment_start.y],
                [path_segment_end.x, path_segment_end.y]
            )

            if distance < 0.3:  # Within 30cm of path
                return True

        return False

    def distance_to_line_segment(self, point, line_start, line_end):
        """
        Calculate distance from point to line segment
        """
        # Convert to numpy arrays
        p = np.array(point[:2])
        a = np.array(line_start)
        b = np.array(line_end)

        # Vector calculations
        ap = p - a
        ab = b - a
        ab_sq = np.dot(ab, ab)

        if ab_sq == 0:
            return np.linalg.norm(ap)  # Line segment is a point

        t = max(0, min(1, np.dot(ap, ab) / ab_sq))
        projection = a + t * ab
        return np.linalg.norm(p - projection)

    def classify_obstacle(self, obstacle):
        """
        Classify obstacle type based on characteristics
        """
        # Simple classification based on size and height
        if 'height' in obstacle and obstacle['height'] < 0.1:
            return 'ground_object'  # Small ground object
        elif 'height' in obstacle and obstacle['height'] > 1.5:
            return 'overhead_obstacle'  # High obstacle
        elif 'velocity' in obstacle and obstacle['velocity'] > 0.1:
            return 'dynamic_human'  # Moving obstacle
        else:
            return 'static_obstacle'  # Static obstacle

    def assess_risk_level(self, obstacle, distance):
        """
        Assess risk level of obstacle based on distance and characteristics
        """
        if distance < 0.2:  # Very close
            return 'HIGH'
        elif distance < 0.5:  # Close
            return 'MEDIUM'
        else:  # Far enough away
            return 'LOW'

    def calculate_distance_to_robot(self, obstacle):
        """
        Calculate distance from obstacle to robot
        """
        robot_pos = self.get_robot_position()
        obstacle_pos = obstacle['position']

        return np.sqrt(
            (obstacle_pos[0] - robot_pos.x)**2 +
            (obstacle_pos[1] - robot_pos.y)**2 +
            (obstacle_pos[2] - robot_pos.z)**2
        )

    def get_robot_position(self):
        """
        Get current robot position from TF
        """
        try:
            transform = self.tf_buffer.lookup_transform(
                'map', 'base_link', rclpy.time.Time()
            )
            return transform.transform.translation
        except:
            # Return default position if TF lookup fails
            return Point(x=0.0, y=0.0, z=0.0)

    def transform_to_world_frame(self, point):
        """
        Transform point from sensor frame to world frame
        """
        try:
            transform = self.tf_buffer.lookup_transform(
                'map', 'laser_frame', rclpy.time.Time()
            )

            # Apply transformation
            transformed_point = self.apply_transform(transform, point)
            return [transformed_point.x, transformed_point.y, transformed_point.z]
        except:
            # Return original point if transform unavailable
            return point

    def apply_transform(self, transform, point):
        """
        Apply transform to point
        """
        import tf_transformations

        # Convert transform to matrix
        translation = [transform.translation.x, transform.translation.y, transform.translation.z]
        rotation = [transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w]

        transform_matrix = tf_transformations.quaternion_matrix(rotation)
        transform_matrix[:3, 3] = translation

        # Apply transformation
        homogenous_point = np.array([point[0], point[1], point[2], 1.0])
        transformed_homogeneous = np.dot(transform_matrix, homogenous_point)

        return Point(
            x=transformed_homogeneous[0],
            y=transformed_homogeneous[1],
            z=transformed_homogeneous[2]
        )

    def pointcloud_to_numpy(self, pc_msg):
        """
        Convert PointCloud2 message to numpy array
        """
        import sensor_msgs.point_cloud2 as pc2
        import struct

        # Use sensor_msgs.point_cloud2 to convert
        points = []
        for point in pc2.read_points(pc_msg, field_names=("x", "y", "z"), skip_nans=True):
            points.append([point[0], point[1], point[2]])

        return np.array(points)

    def create_mock_component(self, name, config):
        """
        Create a mock component for demonstration
        """
        return type(f'Mock{name}', (), {
            'name': name,
            'config': config,
            'process': lambda self, data: f"Processed by {name}",
            'get_status': lambda self: "READY"
        })()

# Usage example
def main(args=None):
    rclpy.init(args=args)

    nav_node = HumanoidNavigationNode()

    try:
        rclpy.spin(nav_node)
    except KeyboardInterrupt:
        pass
    finally:
        nav_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Advanced Obstacle Avoidance Techniques

### Human-Aware Navigation

```python
# Example: Socially-aware navigation for humanoid robots
class SocialNavigationController:
    def __init__(self):
        self.social_force_model = self.initialize_social_model()
        self.personal_space_buffer = 0.8  # 80cm personal space
        self.approach_speed_limit = 0.5   # m/s when approaching humans

    def initialize_social_model(self):
        """
        Initialize social force model for human-aware navigation
        """
        social_model = {
            'repulsion_strength': 2.0,      # Strength of repulsion from humans
            'repulsion_range': 1.5,         # Range of human repulsion
            'attraction_strength': 0.5,     # Strength of attraction to goals
            'comfort_zone_radius': 0.8,     # Personal space radius
            'social_zone_radius': 1.2,      # Social interaction zone
            'public_zone_radius': 3.5       # Public space distance
        }

        return social_model

    def calculate_social_forces(self, robot_pose, humans, goal_pose):
        """
        Calculate social forces for navigation around humans
        """
        total_force = np.array([0.0, 0.0])

        # Attraction to goal
        goal_force = self.calculate_goal_attraction(robot_pose, goal_pose)
        total_force += goal_force

        # Repulsion from humans
        for human_pose in humans:
            human_force = self.calculate_human_repulsion(robot_pose, human_pose)
            total_force += human_force

        # Additional social forces (following, passing, etc.)
        social_forces = self.calculate_social_interaction_forces(robot_pose, humans)
        total_force += social_forces

        return total_force

    def calculate_goal_attraction(self, robot_pose, goal_pose):
        """
        Calculate attractive force towards goal
        """
        direction = np.array([goal_pose.x - robot_pose.x, goal_pose.y - robot_pose.y])
        distance = np.linalg.norm(direction)

        if distance < 0.1:  # Very close to goal
            return np.array([0.0, 0.0])

        # Normalize direction and apply strength
        direction_normalized = direction / distance
        strength = min(self.social_model['attraction_strength'], distance * 0.5)  # Strengthen with distance

        return direction_normalized * strength

    def calculate_human_repulsion(self, robot_pose, human_pose):
        """
        Calculate repulsive force from human
        """
        direction = np.array([robot_pose.x - human_pose.x, robot_pose.y - human_pose.y])
        distance = np.linalg.norm(direction)

        if distance < 0.01:  # Robot and human at same position (shouldn't happen)
            return np.array([100.0, 100.0])  # Strong repulsion

        # Calculate repulsion strength based on distance
        if distance < self.social_model['comfort_zone_radius']:
            strength_factor = 10.0  # Very strong repulsion in comfort zone
        elif distance < self.social_model['social_zone_radius']:
            strength_factor = 5.0   # Strong repulsion in social zone
        elif distance < self.social_model['public_zone_radius']:
            strength_factor = 2.0   # Moderate repulsion in public zone
        else:
            strength_factor = 0.1   # Weak repulsion at distance

        # Normalize direction and apply strength
        direction_normalized = direction / distance
        repulsion_force = direction_normalized * self.social_model['repulsion_strength'] * strength_factor / (distance ** 2)

        return repulsion_force

    def calculate_social_interaction_forces(self, robot_pose, humans):
        """
        Calculate social interaction forces (following, passing, etc.)
        """
        interaction_force = np.array([0.0, 0.0])

        for human_pose in humans:
            distance = np.linalg.norm(
                np.array([human_pose.x - robot_pose.x, human_pose.y - robot_pose.y])
            )

            if distance < 2.0:  # Within interaction range
                # Calculate preferred walking direction relative to human
                relative_angle = self.calculate_relative_angle(robot_pose, human_pose)

                # Apply forces based on social conventions
                if abs(relative_angle) < np.pi / 4:  # Approaching head-on
                    # Apply force to move aside
                    perpendicular_direction = np.array([-human_pose.y + robot_pose.y, human_pose.x - robot_pose.x])
                    perpendicular_direction = perpendicular_direction / np.linalg.norm(perpendicular_direction)
                    interaction_force += perpendicular_direction * 1.5

                elif np.pi / 2 < abs(relative_angle) < 3 * np.pi / 4:  # Passing situation
                    # Apply force to maintain passing distance
                    pass_direction = np.array([np.cos(relative_angle), np.sin(relative_angle)])
                    interaction_force += pass_direction * 0.8

        return interaction_force

    def calculate_relative_angle(self, robot_pose, human_pose):
        """
        Calculate relative angle between robot and human movement directions
        """
        # Simplified: assume human is moving in positive x direction
        human_direction = np.array([1.0, 0.0])

        # Robot to human vector
        robot_to_human = np.array([human_pose.x - robot_pose.x, human_pose.y - robot_pose.y])
        robot_to_human_norm = robot_to_human / np.linalg.norm(robot_to_human)

        # Calculate angle between directions
        cos_angle = np.dot(human_direction, robot_to_human_norm)
        angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))

        # Determine sign based on cross product
        cross_product = human_direction[0] * robot_to_human_norm[1] - human_direction[1] * robot_to_human_norm[0]
        if cross_product < 0:
            angle = -angle

        return angle

    def adjust_navigation_for_humans(self, path, humans):
        """
        Adjust navigation path considering humans in environment
        """
        adjusted_path = []

        for i, waypoint in enumerate(path):
            # Calculate social forces at this waypoint
            social_force = self.calculate_social_forces(waypoint, humans, path[-1])

            # Apply force to adjust waypoint
            adjusted_waypoint = self.apply_social_force(waypoint, social_force)

            # Ensure adjusted waypoint is still valid (not in obstacle)
            if self.is_waypoint_valid(adjusted_waypoint):
                adjusted_path.append(adjusted_waypoint)
            else:
                # Use original waypoint if adjustment leads to invalid position
                adjusted_path.append(waypoint)

        return adjusted_path

    def apply_social_force(self, waypoint, force):
        """
        Apply social force to adjust waypoint
        """
        # Limit force magnitude to prevent excessive deviation
        force_magnitude = np.linalg.norm(force)
        if force_magnitude > 0.5:  # Maximum 0.5m adjustment
            force = force / force_magnitude * 0.5

        adjusted_waypoint = type('Pose', (), {})()
        adjusted_waypoint.x = waypoint.x + force[0]
        adjusted_waypoint.y = waypoint.y + force[1]
        adjusted_waypoint.z = waypoint.z  # Keep z unchanged

        return adjusted_waypoint

    def is_waypoint_valid(self, waypoint):
        """
        Check if waypoint is valid (not in obstacle)
        """
        # In practice, this would check against costmap
        # For now, return True as placeholder
        return True

    def regulate_approach_speed(self, robot_pose, humans):
        """
        Regulate robot speed when approaching humans
        """
        min_distance_to_humans = float('inf')

        for human_pose in humans:
            distance = np.linalg.norm(
                np.array([human_pose.x - robot_pose.x, human_pose.y - robot_pose.y])
            )
            min_distance_to_humans = min(min_distance_to_humans, distance)

        # Adjust speed based on proximity to humans
        if min_distance_to_humans < 0.8:  # Very close
            speed_limit = 0.2  # Very slow
        elif min_distance_to_humans < 1.5:  # Close
            speed_limit = 0.4  # Slow
        else:  # Far enough
            speed_limit = self.approach_speed_limit  # Normal speed

        return speed_limit

# Usage example
social_controller = SocialNavigationController()

# In navigation loop:
# adjusted_path = social_controller.adjust_navigation_for_humans(current_path, detected_humans)
# speed_limit = social_controller.regulate_approach_speed(robot_pose, detected_humans)
```

## Performance Optimization for Real-time Operation

### Efficient Obstacle Processing Pipeline

```python
# Example: Optimized obstacle processing pipeline
class OptimizedObstacleProcessor:
    def __init__(self):
        self.max_obstacles = 100  # Maximum obstacles to process
        self.processing_frequency = 20  # Hz
        self.last_process_time = 0.0
        self.obstacle_buffer = []
        self.processing_enabled = True

    def process_obstacles_optimized(self, raw_obstacles):
        """
        Optimized obstacle processing with performance considerations
        """
        current_time = time.time()

        # Throttle processing frequency
        if current_time - self.last_process_time < 1.0 / self.processing_frequency:
            return self.get_cached_results()

        self.last_process_time = current_time

        # Early filtering: Remove obviously invalid obstacles
        valid_obstacles = self.filter_invalid_obstacles(raw_obstacles)

        # Spatial filtering: Keep only obstacles in relevant area
        relevant_obstacles = self.filter_spatially_relevant(valid_obstacles)

        # Temporal filtering: Track obstacles over time to reduce noise
        tracked_obstacles = self.track_obstacles_temporally(relevant_obstacles)

        # Priority-based processing: Process most critical obstacles first
        prioritized_obstacles = self.prioritize_obstacles(tracked_obstacles)

        # Limit processing to most important obstacles
        limited_obstacles = prioritized_obstacles[:self.max_obstacles]

        # Process obstacles with appropriate algorithms
        processed_results = self.process_obstacle_list(limited_obstacles)

        self.cached_results = processed_results
        return processed_results

    def filter_invalid_obstacles(self, obstacles):
        """
        Remove obstacles that are clearly invalid
        """
        valid_obstacles = []

        for obstacle in obstacles:
            # Check for NaN or infinite values
            if any(np.isnan(val) or np.isinf(val) for val in [obstacle['x'], obstacle['y'], obstacle['z']]):
                continue

            # Check for extremely large or small values
            if abs(obstacle['x']) > 1000 or abs(obstacle['y']) > 1000:  # Beyond reasonable range
                continue

            # Check for valid size parameters
            if 'size' in obstacle and (obstacle['size'] <= 0 or obstacle['size'] > 10):  # Unreasonable size
                continue

            valid_obstacles.append(obstacle)

        return valid_obstacles

    def filter_spatially_relevant(self, obstacles):
        """
        Keep only obstacles in relevant spatial area
        """
        # Define relevant area (e.g., ahead of robot within navigation corridor)
        robot_pose = self.get_robot_pose()
        relevant_obstacles = []

        # Navigation corridor: 2m ahead, 1m to each side
        corridor_half_width = 1.0
        corridor_length = 2.0

        for obstacle in obstacles:
            # Calculate relative position to robot
            rel_x = obstacle['x'] - robot_pose.x
            rel_y = obstacle['y'] - robot_pose.y

            # Check if in navigation corridor
            if (0 <= rel_x <= corridor_length and
                abs(rel_y) <= corridor_half_width):
                relevant_obstacles.append(obstacle)

        return relevant_obstacles

    def track_obstacles_temporally(self, obstacles):
        """
        Track obstacles over time to reduce noise and maintain consistency
        """
        # Simple tracking: associate new obstacles with existing ones based on proximity
        for new_obstacle in obstacles:
            # Find closest existing obstacle
            closest_existing = None
            min_distance = float('inf')

            for existing_obstacle in self.tracked_obstacles:
                distance = np.sqrt(
                    (new_obstacle['x'] - existing_obstacle['x'])**2 +
                    (new_obstacle['y'] - existing_obstacle['y'])**2
                )

                if distance < min_distance and distance < 0.5:  # 50cm threshold
                    min_distance = distance
                    closest_existing = existing_obstacle

            if closest_existing:
                # Update existing obstacle with new measurement (simple averaging)
                alpha = 0.7  # Tracking filter parameter
                closest_existing['x'] = alpha * new_obstacle['x'] + (1 - alpha) * closest_existing['x']
                closest_existing['y'] = alpha * new_obstacle['y'] + (1 - alpha) * closest_existing['y']
                closest_existing['confidence'] = min(closest_existing['confidence'] + 0.1, 1.0)  # Increase confidence
            else:
                # Add new obstacle to tracking
                new_obstacle['confidence'] = 0.3  # Initial low confidence
                new_obstacle['id'] = self.next_obstacle_id
                self.next_obstacle_id += 1
                self.tracked_obstacles.append(new_obstacle)

        # Remove low-confidence obstacles that haven't been seen recently
        self.tracked_obstacles = [
            obs for obs in self.tracked_obstacles
            if obs['confidence'] > 0.1  # Remove very low confidence obstacles
        ]

        return self.tracked_obstacles

    def prioritize_obstacles(self, obstacles):
        """
        Prioritize obstacles based on relevance to navigation
        """
        def calculate_priority(obstacle):
            # Priority based on distance, size, and position relative to navigation path
            robot_pose = self.get_robot_pose()

            distance = np.sqrt(
                (obstacle['x'] - robot_pose.x)**2 +
                (obstacle['y'] - robot_pose.y)**2
            )

            # Closer obstacles have higher priority
            distance_priority = max(0, 1 - distance / 5.0)  # Priority decreases with distance

            # Larger obstacles may have higher priority
            size_priority = min(obstacle.get('size', 0.5) / 2.0, 1.0)

            # Obstacles in front have higher priority
            angle_to_robot = np.arctan2(
                obstacle['y'] - robot_pose.y,
                obstacle['x'] - robot_pose.x
            )
            forward_priority = max(0, np.cos(angle_to_robot))  # Maximum for obstacles directly ahead

            # Combine priorities
            total_priority = (distance_priority * 0.4 +
                            size_priority * 0.3 +
                            forward_priority * 0.3)

            return total_priority

        # Sort obstacles by priority (highest first)
        return sorted(obstacles, key=calculate_priority, reverse=True)

    def process_obstacle_list(self, obstacles):
        """
        Process list of obstacles with appropriate algorithms
        """
        results = []

        for obstacle in obstacles:
            processed_obstacle = self.process_single_obstacle(obstacle)
            if processed_obstacle:
                results.append(processed_obstacle)

        return results

    def process_single_obstacle(self, obstacle):
        """
        Process a single obstacle with optimized algorithm
        """
        # Determine appropriate processing based on obstacle characteristics
        if obstacle.get('type') == 'static':
            return self.process_static_obstacle(obstacle)
        elif obstacle.get('velocity', 0) > 0.1:  # Moving obstacle
            return self.process_dynamic_obstacle(obstacle)
        else:
            return self.process_unknown_obstacle(obstacle)

    def process_static_obstacle(self, obstacle):
        """
        Process static obstacle (optimized for static objects)
        """
        # Static obstacles require less frequent updates
        # Just return the basic obstacle information
        return {
            'type': 'static',
            'position': (obstacle['x'], obstacle['y']),
            'size': obstacle.get('size', 0.5),
            'shape': obstacle.get('shape', 'circular'),
            'cost': self.calculate_static_cost(obstacle)
        }

    def process_dynamic_obstacle(self, obstacle):
        """
        Process dynamic obstacle (optimized for moving objects)
        """
        # Dynamic obstacles require prediction and avoidance planning
        return {
            'type': 'dynamic',
            'position': (obstacle['x'], obstacle['y']),
            'velocity': obstacle.get('velocity', (0, 0)),
            'predicted_trajectory': self.predict_dynamic_trajectory(obstacle),
            'avoidance_required': True,
            'urgency': self.calculate_dynamic_urgency(obstacle)
        }

    def predict_dynamic_trajectory(self, obstacle):
        """
        Predict future trajectory of dynamic obstacle
        """
        # Simple constant velocity prediction
        current_pos = np.array([obstacle['x'], obstacle['y']])
        velocity = np.array(obstacle.get('velocity', [0, 0]))

        prediction_horizon = 3.0  # seconds
        dt = 0.1  # time step

        trajectory = []
        for t in np.arange(0, prediction_horizon, dt):
            predicted_pos = current_pos + velocity * t
            trajectory.append(predicted_pos.tolist())

        return trajectory

    def calculate_dynamic_urgency(self, obstacle):
        """
        Calculate urgency level for dynamic obstacle avoidance
        """
        robot_pose = self.get_robot_pose()

        # Calculate time to potential collision
        relative_pos = np.array([obstacle['x'] - robot_pose.x, obstacle['y'] - robot_pose.y])
        relative_vel = np.array(obstacle.get('velocity', [0, 0])) - np.array([0, 0])  # Assume robot velocity is 0 for simplicity

        # Time to closest approach
        if np.linalg.norm(relative_vel) > 0.1:
            time_to_approach = -np.dot(relative_pos, relative_vel) / np.dot(relative_vel, relative_vel)
            time_to_approach = max(0, time_to_approach)  # Don't go backward in time
        else:
            time_to_approach = float('inf')

        # Urgency increases as time to collision decreases
        urgency = max(0, min(1, 10.0 / max(time_to_approach, 1.0)))

        return urgency

    def get_cached_results(self):
        """
        Return cached results if processing is throttled
        """
        if hasattr(self, 'cached_results'):
            return self.cached_results
        else:
            return []

    def get_robot_pose(self):
        """
        Get current robot pose (placeholder implementation)
        """
        # In practice, this would get the pose from TF or odometry
        return type('Pose', (), {'x': 0.0, 'y': 0.0, 'z': 0.0})()

# Usage example
obstacle_processor = OptimizedObstacleProcessor()

# In main navigation loop:
# processed_obstacles = obstacle_processor.process_obstacles_optimized(raw_sensor_data)
# navigation_system.update_obstacles(processed_obstacles)
```

## Quality Assurance and Validation

### Obstacle Detection Validation

```python
# Example: Obstacle detection validation framework
class IsaacROSOstacleValidation:
    def __init__(self):
        self.validation_metrics = {
            'detection_accuracy': [],
            'false_positive_rate': [],
            'false_negative_rate': [],
            'detection_latency': [],
            'classification_accuracy': []
        }

    def validate_obstacle_detection(self, detected_obstacles, ground_truth_obstacles):
        """
        Validate obstacle detection against ground truth
        """
        # Calculate validation metrics
        accuracy = self.calculate_detection_accuracy(detected_obstacles, ground_truth_obstacles)
        fp_rate = self.calculate_false_positive_rate(detected_obstacles, ground_truth_obstacles)
        fn_rate = self.calculate_false_negative_rate(detected_obstacles, ground_truth_obstacles)
        latency = self.calculate_detection_latency()

        # Store metrics
        self.validation_metrics['detection_accuracy'].append(accuracy)
        self.validation_metrics['false_positive_rate'].append(fp_rate)
        self.validation_metrics['false_negative_rate'].append(fn_rate)
        self.validation_metrics['detection_latency'].append(latency)

        # Generate validation report
        validation_report = {
            'timestamp': time.time(),
            'detection_accuracy': accuracy,
            'false_positive_rate': fp_rate,
            'false_negative_rate': fn_rate,
            'detection_latency_ms': latency * 1000,
            'total_detected': len(detected_obstacles),
            'total_ground_truth': len(ground_truth_obstacles),
            'validation_passed': accuracy >= 0.85 and fp_rate <= 0.1 and fn_rate <= 0.1
        }

        return validation_report

    def calculate_detection_accuracy(self, detected, ground_truth):
        """
        Calculate detection accuracy using IoU matching
        """
        if len(ground_truth) == 0:
            return 1.0 if len(detected) == 0 else 0.0

        true_positives = 0
        matched_ground_truth = set()

        for detected_obstacle in detected:
            best_match_iou = 0.0
            best_match_idx = -1

            for i, gt_obstacle in enumerate(ground_truth):
                if i in matched_ground_truth:
                    continue

                iou = self.calculate_2d_iou(detected_obstacle, gt_obstacle)
                if iou > best_match_iou and iou > 0.3:  # 30% IoU threshold
                    best_match_iou = iou
                    best_match_idx = i

            if best_match_idx >= 0:
                true_positives += 1
                matched_ground_truth.add(best_match_idx)

        precision = true_positives / max(len(detected), 1)
        recall = true_positives / max(len(ground_truth), 1)
        accuracy = 2 * (precision * recall) / max(precision + recall, 1e-8)

        return accuracy

    def calculate_2d_iou(self, obstacle1, obstacle2):
        """
        Calculate 2D Intersection over Union between two obstacles
        """
        # Convert obstacles to bounding boxes (simplified)
        bb1 = self.obstacle_to_bounding_box(obstacle1)
        bb2 = self.obstacle_to_bounding_box(obstacle2)

        # Calculate intersection
        x_left = max(bb1['xmin'], bb2['xmin'])
        y_top = max(bb1['ymin'], bb2['ymin'])
        x_right = min(bb1['xmax'], bb2['xmax'])
        y_bottom = min(bb1['ymax'], bb2['ymax'])

        if x_right < x_left or y_bottom < y_top:
            return 0.0

        intersection_area = (x_right - x_left) * (y_bottom - y_top)

        # Calculate union
        bb1_area = (bb1['xmax'] - bb1['xmin']) * (bb1['ymax'] - bb1['ymin'])
        bb2_area = (bb2['xmax'] - bb2['xmin']) * (bb2['ymax'] - bb2['ymin'])
        union_area = bb1_area + bb2_area - intersection_area

        return intersection_area / union_area if union_area > 0 else 0.0

    def obstacle_to_bounding_box(self, obstacle):
        """
        Convert obstacle to bounding box representation
        """
        # Simplified conversion - in practice, obstacles might have different representations
        center_x, center_y = obstacle['position'][0], obstacle['position'][1]
        size = obstacle.get('size', 0.5)  # Assume circular with diameter=size

        return {
            'xmin': center_x - size/2,
            'ymin': center_y - size/2,
            'xmax': center_x + size/2,
            'ymax': center_y + size/2
        }

    def calculate_false_positive_rate(self, detected, ground_truth):
        """
        Calculate false positive rate
        """
        # False positives = detected - correctly matched
        true_positives = 0
        matched_gt = set()

        for detected_obstacle in detected:
            for i, gt_obstacle in enumerate(ground_truth):
                if i in matched_gt:
                    continue

                if self.calculate_2d_iou(detected_obstacle, gt_obstacle) > 0.3:
                    true_positives += 1
                    matched_gt.add(i)
                    break

        false_positives = len(detected) - true_positives
        return false_positives / max(len(detected), 1)

    def calculate_false_negative_rate(self, detected, ground_truth):
        """
        Calculate false negative rate
        """
        # False negatives = ground truth - correctly matched
        true_positives = 0
        matched_gt = set()

        for detected_obstacle in detected:
            for i, gt_obstacle in enumerate(ground_truth):
                if i in matched_gt:
                    continue

                if self.calculate_2d_iou(detected_obstacle, gt_obstacle) > 0.3:
                    true_positives += 1
                    matched_gt.add(i)
                    break

        false_negatives = len(ground_truth) - true_positives
        return false_negatives / max(len(ground_truth), 1)

    def calculate_detection_latency(self):
        """
        Calculate average detection latency
        """
        # In practice, this would measure time from sensor input to detection output
        # For simulation, return a representative value
        return 0.05  # 50ms average latency

    def generate_validation_report(self, output_path=None):
        """
        Generate comprehensive validation report
        """
        import json
        from datetime import datetime

        # Calculate summary statistics
        summary_stats = {}
        for metric_name, values in self.validation_metrics.items():
            if values:
                summary_stats[metric_name] = {
                    'mean': sum(values) / len(values),
                    'min': min(values),
                    'max': max(values),
                    'std': self.calculate_std(values),
                    'count': len(values)
                }
            else:
                summary_stats[metric_name] = {'mean': 0, 'min': 0, 'max': 0, 'std': 0, 'count': 0}

        report = {
            'validation_report': {
                'timestamp': datetime.now().isoformat(),
                'summary_statistics': summary_stats,
                'validation_criteria': {
                    'min_accuracy': 0.85,
                    'max_false_positive_rate': 0.1,
                    'max_false_negative_rate': 0.1,
                    'max_latency_ms': 100
                },
                'compliance_status': self.evaluate_compliance(summary_stats)
            }
        }

        if output_path:
            with open(output_path, 'w') as f:
                json.dump(report, f, indent=2)

        return report

    def calculate_std(self, values):
        """
        Calculate standard deviation
        """
        if len(values) < 2:
            return 0.0

        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
        return variance ** 0.5

    def evaluate_compliance(self, stats):
        """
        Evaluate if metrics meet validation criteria
        """
        criteria = {
            'accuracy_compliant': stats['detection_accuracy']['mean'] >= 0.85,
            'fp_rate_compliant': stats['false_positive_rate']['mean'] <= 0.1,
            'fn_rate_compliant': stats['false_negative_rate']['mean'] <= 0.1,
            'latency_compliant': stats['detection_latency']['mean'] * 1000 <= 100  # Convert to ms
        }

        overall_compliant = all(criteria.values())

        return {
            'criteria_met': criteria,
            'overall_compliant': overall_compliant,
            'recommendations': self.generate_recommendations(criteria)
        }

    def generate_recommendations(self, compliance):
        """
        Generate recommendations based on compliance status
        """
        recommendations = []

        if not compliance['accuracy_compliant']:
            recommendations.append("Improve detection accuracy through better training data or algorithm tuning")
        if not compliance['fp_rate_compliant']:
            recommendations.append("Reduce false positive rate by adjusting detection thresholds")
        if not compliance['fn_rate_compliant']:
            recommendations.append("Reduce false negative rate by improving sensor coverage or sensitivity")
        if not compliance['latency_compliant']:
            recommendations.append("Optimize processing pipeline to reduce detection latency")

        return recommendations

# Usage example
validator = IsaacROSOstacleValidation()

# During testing:
# validation_result = validator.validate_obstacle_detection(detected_obs, ground_truth_obs)
# print(f"Validation passed: {validation_result['validation_passed']}")

# Generate final report:
# report = validator.generate_validation_report("obstacle_validation_report.json")
```

## Troubleshooting Common Issues

### Performance Issues
- **Slow processing**: Optimize GPU utilization and reduce unnecessary computations
- **Memory leaks**: Monitor memory usage and implement proper cleanup
- **Latency**: Optimize pipeline architecture and reduce processing steps

### Accuracy Issues
- **False detections**: Improve sensor calibration and adjust detection thresholds
- **Missed obstacles**: Verify sensor coverage and increase sensitivity
- **Classification errors**: Improve training data and model architecture

### Integration Issues
- **ROS communication**: Verify message formats and topic connections
- **Coordinate frames**: Ensure proper TF transformations between sensors
- **Timing synchronization**: Implement proper time synchronization between sensors

## Assessment Questions

1. What are the main challenges in obstacle detection for humanoid robots compared to wheeled robots?
2. How does Isaac ROS leverage GPU acceleration for perception tasks?
3. What is the role of sensor fusion in humanoid robot obstacle avoidance?
4. How can you optimize obstacle detection performance for real-time applications?
5. What validation techniques ensure obstacle detection quality for humanoid navigation?

## Next Steps

After mastering Isaac ROS obstacle avoidance techniques, continue to the Isaac Sim Best Practices section to learn about optimizing simulation workflows and performance for perception applications.