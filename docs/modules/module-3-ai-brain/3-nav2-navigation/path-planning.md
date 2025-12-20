# Path Planning for Humanoid Robots

This section covers path planning algorithms specifically adapted for humanoid robots, addressing the unique kinematic constraints and movement capabilities that distinguish humanoid navigation from wheeled or other robot types.

## Understanding Humanoid Path Planning

### Differences from Traditional Path Planning

Humanoid robots have distinct path planning requirements compared to wheeled robots:

1. **Kinematic Constraints**: Humanoid robots have joint limits, balance requirements, and step constraints
2. **Bipedal Locomotion**: Must consider walking patterns, step placement, and balance maintenance
3. **3D Navigation**: Often need to consider vertical movement for stairs, ramps, and elevated surfaces
4. **Dynamic Stability**: Path must maintain center of mass within support polygon during execution
5. **Energy Efficiency**: Walking patterns should be energy-efficient for battery-powered robots

### Key Considerations for Humanoid Navigation

- **Step Height Limitations**: Cannot step over obstacles higher than ankle joint range
- **Step Width Constraints**: Must maintain appropriate step width for stability
- **Turning Radius**: Limited turning capabilities compared to wheeled robots
- **Ground Clearance**: Need to maintain appropriate foot clearance for safe walking
- **Balance Maintenance**: Path must allow for dynamic balance during execution

## Nav2 Configuration for Humanoids

### Humanoid-Specific Parameters

```yaml
# Example: Nav2 configuration for humanoid robot
bt_navigator:
  ros__parameters:
    use_sim_time: true
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odometry/filtered
    bt_loop_duration: 10
    default_server_timeout: 20
    enable_groot_monitoring: True
    groot_zmq_publisher_port: 1666
    groot_zmq_server_port: 1667
    default_nav_through_poses_bt_xml: "navigate_w_replanning_and_recovery.xml"
    default_nav_to_pose_bt_xml: "navigate_w_replanning_and_recovery.xml"

    # Humanoid-specific behavior trees
    behavior_tree_xml: |
      <root main_tree_to_execute="MainTree">
        <BehaviorTree ID="MainTree">
          <SequenceStar name="NavigateWithReplanning">
            <RateController name="Rate" hz="1.0"/>
            <RecoveryNode name="Recovery" number_of_retries="2">
              <SequenceStar name="RecoveryActions">
                <ClearEntireCostmap name="ClearGlobalCostmap-Context"/>
                <SmoothPath name="SmoothPath"/>
                <TruncatePath name="TruncatePath"/>
                <HumanoidStepAdjustment name="StepAdjustment"/>  # Humanoid-specific recovery
                <BackUp name="Backup"/>
                <Spin name="Spin"/>
                <Wait name="Wait" time="5"/>
              </SequenceStar>
              <ReactiveFallback name="MoveRobot">
                <GoalReached name="GoalReached"/>
                <ComputePathToPose name="ComputePathToPose">
                  <HumanoidPathPlanner name="HumanoidPathPlanner"/>  # Humanoid-specific planner
                </ComputePathToPose>
                <FollowPath name="FollowPath">
                  <HumanoidController name="HumanoidController"/>  # Humanoid-specific controller
                </FollowPath>
              </ReactiveFallback>
            </RecoveryNode>
          </SequenceStar>
        </BehaviorTree>
      </root>

controller_server:
  ros__parameters:
    use_sim_time: true
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.001
    min_theta_velocity_threshold: 0.001
    progress_checker_plugin: "progress_checker"
    goal_checker_plugin: "goal_checker"
    controller_plugins: ["FollowPath"]

    # Humanoid-specific controller configuration
    FollowPath:
      plugin: "nav2_mppi_controller::MPPILocalPlanner"
      # Humanoid-specific parameters
      max_vel_x: 0.3      # Slower max speed for stability (was 0.5 for wheeled)
      min_vel_x: 0.05     # Minimum forward speed for walking gait
      max_vel_y: 0.1      # Limited lateral movement for bipedal stability
      max_vel_theta: 0.3  # Reduced turning speed for balance (was 1.0)
      min_vel_theta: 0.05 # Minimum turning speed for smooth motion
      acc_lim_x: 0.5      # Lower acceleration for stability (was 2.5)
      acc_lim_y: 0.2      # Limited lateral acceleration
      acc_lim_theta: 0.8  # Controlled turning acceleration
      decel_lim_x: -0.5   # Symmetric deceleration
      decel_lim_y: -0.2
      decel_lim_theta: -0.8
      xy_goal_tolerance: 0.3  # Larger tolerance for humanoid feet positioning
      yaw_goal_tolerance: 0.2 # Slightly relaxed angular tolerance

    progress_checker:
      plugin: "nav2_controller::SimpleProgressChecker"
      required_movement_radius: 0.5  # Increased for humanoid step size (was 0.5)
      movement_time_allowance: 10.0  # More time allowance for humanoid movement

    goal_checker:
      plugin: "nav2_controller::SimpleGoalChecker"
      xy_goal_tolerance: 0.3    # Larger tolerance for humanoid feet (was 0.25)
      yaw_goal_tolerance: 0.2   # Slightly larger angular tolerance (was 0.25)
      stateful: true

local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 10.0
      publish_frequency: 5.0
      global_frame: odom
      robot_base_frame: base_link
      use_rollout_costs: true
      always_send_full_costmap: false
      footprint: "[[-0.3, -0.2], [-0.3, 0.2], [0.3, 0.2], [0.3, -0.2]]"  # Larger humanoid footprint (was smaller for wheeled)
      footprint_padding: 0.05  # Increased padding for humanoid safety
      resolution: 0.05  # Higher resolution for step planning (was 0.05)
      robot_radius: 0.35  # Larger radius for humanoid (was 0.3)
      plugins: ["voxel_layer", "inflation_layer"]

      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0  # Higher inflation for humanoid safety (was 3.0)
        inflation_radius: 0.70    # Larger inflation for humanoid step size (was 0.55)
        inflate_unknown: false
        inflate_around_unknown: true

      voxel_layer:
        plugin: "nav2_costmap_2d::VoxelLayer"
        enabled: true
        publish_voxel_map: true
        origin_z: 0.0
        z_resolution: 0.2      # Higher resolution for humanoid height (was 0.2)
        z_voxels: 15           # More voxels for humanoid body (was 10)
        max_obstacle_height: 2.0  # Account for humanoid height (was 2.0)
        mark_threshold: 0
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: true
          marking: true
          data_type: "LaserScan"
          raytrace_max_range: 3.0
          raytrace_min_range: 0.0
          obstacle_max_range: 2.5
          obstacle_min_range: 0.0

global_costmap:
  global_costmap:
    ros__parameters:
      update_frequency: 1.0
      publish_frequency: 0.5
      global_frame: map
      robot_base_frame: base_link
      use_simulation: true
      rolling_window: false
      track_unknown_space: true
      footprint: "[[-0.3, -0.2], [-0.3, 0.2], [0.3, 0.2], [0.3, -0.2]]"  # Humanoid footprint
      footprint_padding: 0.05
      resolution: 0.1      # Reasonable resolution for humanoid navigation
      robot_radius: 0.35   # Humanoid-specific radius
      plugins: ["static_layer", "obstacle_layer", "inflation_layer"]

      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
        enabled: true
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: true
          marking: true
          data_type: "LaserScan"
          raytrace_max_range: 3.0
          raytrace_min_range: 0.0
          obstacle_max_range: 2.5
          obstacle_min_range: 0.0

      static_layer:
        plugin: "nav2_costmap_2d::StaticLayer"
        map_subscribe_transient_local: true

      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.70  # Larger inflation for humanoid safety margin
        inflate_unknown: false
```

## Humanoid-Specific Path Planning Algorithms

### Step-Constrained Path Planning

```python
# Example: Humanoid-specific path planning implementation
import numpy as np
from nav_msgs.msg import Path
from geometry_msgs.msg import PoseStamped
from visualization_msgs.msg import Marker, MarkerArray
import heapq

class HumanoidPathPlanner:
    def __init__(self):
        # Humanoid-specific parameters
        self.step_height_limit = 0.15  # Maximum step height (15cm)
        self.step_width_limit = 0.60  # Maximum step width (60cm)
        self.turn_radius = 0.50       # Minimum turning radius
        self.balance_margin = 0.10    # Safety margin for balance

        # Initialize costmap and other components
        self.costmap = None
        self.grid_resolution = 0.05   # 5cm resolution for step planning

    def plan_path_humanoid(self, start_pose, goal_pose, costmap):
        """
        Plan path specifically for humanoid robot considering step constraints
        """
        self.costmap = costmap

        # Convert poses to grid coordinates
        start_grid = self.world_to_grid(start_pose.position)
        goal_grid = self.world_to_grid(goal_pose.position)

        # Plan path considering humanoid constraints
        path_grid = self.a_star_with_humanoid_constraints(start_grid, goal_grid)

        # Convert grid path to world coordinates
        path_world = self.grid_path_to_world_path(path_grid)

        # Smooth path considering humanoid dynamics
        smoothed_path = self.smooth_humanoid_path(path_world)

        # Convert to ROS Path message
        path_msg = self.create_path_message(smoothed_path, start_pose.header)

        return path_msg

    def a_star_with_humanoid_constraints(self, start, goal):
        """
        A* algorithm modified for humanoid constraints
        """
        # Use grid-based A* with humanoid-specific cost function
        open_set = [(0, start)]
        came_from = {}
        g_score = {start: 0}
        f_score = {start: self.heuristic(start, goal)}

        while open_set:
            current = heapq.heappop(open_set)[1]

            if current == goal:
                # Reconstruct path
                path = [current]
                while current in came_from:
                    current = came_from[current]
                    path.append(current)
                path.reverse()
                return path

            for neighbor in self.get_neighbors_with_constraints(current, goal):
                tentative_g_score = g_score[current] + self.distance(current, neighbor)

                if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g_score
                    f_score[neighbor] = tentative_g_score + self.heuristic(neighbor, goal)

                    # Check if neighbor is already in open set
                    neighbor_exists = False
                    for i, (priority, node) in enumerate(open_set):
                        if node == neighbor:
                            open_set[i] = (f_score[neighbor], neighbor)
                            neighbor_exists = True
                            break

                    if not neighbor_exists:
                        heapq.heappush(open_set, (f_score[neighbor], neighbor))

        return []  # No path found

    def get_neighbors_with_constraints(self, current, goal):
        """
        Get valid neighbors considering humanoid constraints
        """
        neighbors = []

        # 8-connectivity for better path quality
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue  # Skip current cell

                neighbor = (current[0] + dx, current[1] + dy)

                if self.is_valid_neighbor(neighbor, current, goal):
                    neighbors.append(neighbor)

        return neighbors

    def is_valid_neighbor(self, neighbor, current, goal):
        """
        Check if neighbor is valid considering humanoid constraints
        """
        # Check bounds
        if (neighbor[0] < 0 or neighbor[0] >= self.costmap.info.width or
            neighbor[1] < 0 or neighbor[1] >= self.costmap.info.height):
            return False

        # Check costmap validity
        costmap_index = neighbor[1] * self.costmap.info.width + neighbor[0]
        if costmap_index >= len(self.costmap.data):
            return False

        cost = self.costmap.data[costmap_index]
        if cost >= 50:  # Consider as occupied if cost > 50
            return False

        # Check step constraints
        current_world = self.grid_to_world(current)
        neighbor_world = self.grid_to_world(neighbor)

        step_distance = self.distance_2d(current_world, neighbor_world)

        # Step distance should be within humanoid capabilities
        if step_distance > self.step_width_limit:
            return False

        # Additional humanoid-specific checks
        # Check for height differences that exceed step height limit
        height_diff = abs(neighbor_world[2] - current_world[2])
        if height_diff > self.step_height_limit:
            return False

        return True

    def distance_2d(self, pos1, pos2):
        """
        Calculate 2D distance between two positions
        """
        return np.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)

    def smooth_humanoid_path(self, path):
        """
        Smooth path considering humanoid dynamics and balance
        """
        if len(path) < 3:
            return path

        # Use a smoothing algorithm that preserves step constraints
        smoothed_path = [path[0]]  # Start with first point

        i = 0
        while i < len(path) - 1:
            # Look ahead to find the furthest point we can go to while maintaining a valid path
            j = len(path) - 1

            while j > i:
                # Check if we can go directly from path[i] to path[j] without violating constraints
                if self.can_connect_with_humanoid_constraints(path[i], path[j]):
                    smoothed_path.append(path[j])
                    i = j
                    break
                j -= 1

            if j == i:  # No valid connection found, move to next point
                i += 1
                if i < len(path):
                    smoothed_path.append(path[i])

        return smoothed_path

    def can_connect_with_humanoid_constraints(self, pos1, pos2):
        """
        Check if direct connection between two points satisfies humanoid constraints
        """
        # Calculate distance between points
        distance = self.distance_2d(pos1, pos2)

        # Check if distance is within step capability
        if distance > self.step_width_limit * 2:  # Allow for 2 steps worth of direct connection
            return False

        # Check intermediate points for obstacles and height constraints
        steps = max(int(distance / self.grid_resolution), 2)
        for step in range(1, steps):
            t = step / steps
            intermediate_x = pos1[0] + t * (pos2[0] - pos1[0])
            intermediate_y = pos1[1] + t * (pos2[1] - pos1[1])

            # Check if intermediate point is valid
            grid_pos = self.world_to_grid([intermediate_x, intermediate_y, 0])
            if not self.is_valid_neighbor(grid_pos, self.world_to_grid(pos1), self.world_to_grid(pos2)):
                return False

        return True

    def world_to_grid(self, world_pos):
        """
        Convert world coordinates to grid coordinates
        """
        grid_x = int((world_pos.x - self.costmap.info.origin.position.x) / self.costmap.info.resolution)
        grid_y = int((world_pos.y - self.costmap.info.origin.position.y) / self.costmap.info.resolution)
        return (grid_x, grid_y)

    def grid_to_world(self, grid_pos):
        """
        Convert grid coordinates to world coordinates
        """
        world_x = grid_pos[0] * self.costmap.info.resolution + self.costmap.info.origin.position.x
        world_y = grid_pos[1] * self.costmap.info.resolution + self.costmap.info.origin.position.y
        return (world_x, world_y, 0.0)  # Z is 0 for ground plane

    def grid_path_to_world_path(self, grid_path):
        """
        Convert grid path to world coordinates path
        """
        world_path = []
        for grid_pos in grid_path:
            world_pos = self.grid_to_world(grid_pos)
            world_path.append(world_pos)
        return world_path

    def create_path_message(self, world_path, header):
        """
        Create ROS Path message from world coordinates
        """
        path_msg = Path()
        path_msg.header = header

        for world_pos in world_path:
            pose_stamped = PoseStamped()
            pose_stamped.header = header
            pose_stamped.pose.position.x = world_pos[0]
            pose_stamped.pose.position.y = world_pos[1]
            pose_stamped.pose.position.z = world_pos[2]

            # For now, use identity orientation
            pose_stamped.pose.orientation.w = 1.0

            path_msg.poses.append(pose_stamped)

        return path_msg

    def heuristic(self, pos1, pos2):
        """
        Heuristic function for A* (Euclidean distance)
        """
        return np.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)

    def distance(self, pos1, pos2):
        """
        Calculate distance between two grid positions
        """
        return np.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)
```

## Advanced Humanoid Path Planning Techniques

### Footstep Planning Integration

```python
# Example: Footstep planning integration with path planning
class FootstepPathPlanner:
    def __init__(self):
        # Initialize footstep planner with humanoid kinematics
        self.left_foot_offset = np.array([0.0, 0.1, 0.0])  # Left foot offset from center
        self.right_foot_offset = np.array([0.0, -0.1, 0.0])  # Right foot offset from center
        self.step_length = 0.3  # Maximum step length forward
        self.step_width = 0.2  # Maximum step width sideways
        self.step_height = 0.15  # Maximum step height for obstacles

    def plan_footsteps(self, path, robot_pose):
        """
        Plan footstep sequence along a path considering humanoid kinematics
        """
        footsteps = []

        # Start with current robot pose
        current_pose = robot_pose

        # Plan footsteps for each segment of the path
        for i in range(len(path) - 1):
            segment_start = path[i]
            segment_end = path[i + 1]

            # Generate footstep sequence for this segment
            segment_footsteps = self.generate_footsteps_for_segment(
                segment_start, segment_end, current_pose
            )

            footsteps.extend(segment_footsteps)
            current_pose = segment_footsteps[-1] if segment_footsteps else current_pose

        return footsteps

    def generate_footsteps_for_segment(self, start, end, current_pose):
        """
        Generate footstep sequence for a path segment
        """
        footsteps = []

        # Calculate direction and distance for this segment
        direction = np.array([end.position.x - start.position.x,
                             end.position.y - start.position.y])
        distance = np.linalg.norm(direction)

        if distance < 0.01:  # Very short segment, no additional footsteps needed
            return footsteps

        # Normalize direction
        direction_norm = direction / distance

        # Calculate number of steps needed
        num_steps = int(distance / self.step_length) + 1
        step_size = distance / num_steps

        # Generate alternating footsteps (left, right, left, right...)
        for step_idx in range(num_steps):
            # Calculate step position
            step_offset = step_idx * step_size
            step_position = np.array([start.position.x, start.position.y]) + direction_norm * step_offset

            # Determine foot (left or right based on step index)
            if step_idx % 2 == 0:  # Left foot
                foot_offset = self.left_foot_offset
            else:  # Right foot
                foot_offset = self.right_foot_offset

            # Apply foot offset in world frame
            foot_position = step_position + self.rotate_vector(foot_offset, current_pose.orientation)

            # Create footstep pose
            foot_pose = PoseStamped()
            foot_pose.header = start.header
            foot_pose.pose.position.x = foot_position[0]
            foot_pose.pose.position.y = foot_position[1]
            foot_pose.pose.position.z = 0.0  # Assume ground contact

            # Set orientation to match path direction
            foot_pose.pose.orientation = self.calculate_foot_orientation(direction_norm)

            footsteps.append(foot_pose)

        return footsteps

    def rotate_vector(self, vector, quaternion):
        """
        Rotate a vector by a quaternion
        """
        # Convert quaternion to rotation matrix
        q = np.array([quaternion.x, quaternion.y, quaternion.z, quaternion.w])
        rotation_matrix = self.quaternion_to_rotation_matrix(q)

        # Apply rotation
        rotated = rotation_matrix @ vector
        return rotated

    def quaternion_to_rotation_matrix(self, q):
        """
        Convert quaternion to rotation matrix
        """
        w, x, y, z = q

        rotation_matrix = np.array([
            [1 - 2*y**2 - 2*z**2, 2*x*y - 2*z*w, 2*x*z + 2*y*w],
            [2*x*y + 2*z*w, 1 - 2*x**2 - 2*z**2, 2*y*z - 2*x*w],
            [2*x*z - 2*y*w, 2*y*z + 2*x*w, 1 - 2*x**2 - 2*y**2]
        ])

        return rotation_matrix

    def calculate_foot_orientation(self, direction):
        """
        Calculate appropriate foot orientation based on movement direction
        """
        # Calculate yaw angle from direction
        yaw = np.arctan2(direction[1], direction[0])

        # Convert to quaternion (rotation around Z axis)
        cy = np.cos(yaw * 0.5)
        sy = np.sin(yaw * 0.5)

        orientation = type('MockQuaternion', (), {
            'x': 0.0,
            'y': 0.0,
            'z': sy,
            'w': cy
        })()

        return orientation

    def validate_footstep_sequence(self, footsteps, environment_map):
        """
        Validate footstep sequence against environment constraints
        """
        valid_footsteps = []

        for i, footstep in enumerate(footsteps):
            # Check if footstep location is safe and traversable
            if self.is_footstep_safe(footstep, environment_map):
                valid_footsteps.append(footstep)
            else:
                # Try to find alternative footstep nearby
                alternative = self.find_safe_alternative_footstep(footstep, environment_map)
                if alternative:
                    valid_footsteps.append(alternative)
                else:
                    # If no safe alternative, stop planning
                    break

        return valid_footsteps

    def is_footstep_safe(self, footstep, environment_map):
        """
        Check if footstep location is safe for humanoid
        """
        # Check for obstacles at footstep location
        # Check for step height constraints
        # Check for ground stability

        # This is a simplified check - in practice, would involve more detailed collision checking
        foot_position = np.array([footstep.pose.position.x, footstep.pose.position.y])

        # Check costmap for this position
        grid_pos = self.world_to_grid(foot_position)
        costmap_idx = grid_pos[1] * environment_map.info.width + grid_pos[0]

        if costmap_idx < len(environment_map.data):
            cost = environment_map.data[costmap_idx]
            return cost < 50  # Safe if cost is below threshold
        else:
            return False

    def find_safe_alternative_footstep(self, original_footstep, environment_map):
        """
        Find safe alternative footstep nearby if original is unsafe
        """
        original_pos = np.array([original_footstep.pose.position.x, original_footstep.pose.position.y])

        # Try nearby positions in a spiral pattern
        for radius in np.linspace(0.05, 0.3, 10):  # 5cm to 30cm search radius
            for angle in np.linspace(0, 2*np.pi, 12):  # 12 angles
                offset = np.array([radius * np.cos(angle), radius * np.sin(angle)])
                candidate_pos = original_pos + offset

                # Check if candidate position is safe
                candidate_grid = self.world_to_grid(candidate_pos)
                costmap_idx = candidate_grid[1] * environment_map.info.width + candidate_grid[0]

                if (0 <= candidate_grid[0] < environment_map.info.width and
                    0 <= candidate_grid[1] < environment_map.info.height and
                    costmap_idx < len(environment_map.data)):

                    cost = environment_map.data[costmap_idx]
                    if cost < 50:  # Safe position found
                        alternative = PoseStamped()
                        alternative.header = original_footstep.header
                        alternative.pose.position.x = candidate_pos[0]
                        alternative.pose.position.y = candidate_pos[1]
                        alternative.pose.position.z = original_footstep.pose.position.z
                        alternative.pose.orientation = original_footstep.pose.orientation

                        return alternative

        return None  # No safe alternative found
```

## Path Planning for Complex Humanoid Environments

### Stair and Obstacle Navigation

```python
# Example: Handling complex environments for humanoid robots
class ComplexEnvironmentPathPlanner:
    def __init__(self):
        # Specialized planners for different environment types
        self.planners = {
            'flat_ground': self.plan_flat_ground_path,
            'stairs': self.plan_stair_navigation,
            'ramps': self.plan_ramp_navigation,
            'narrow_passages': self.plan_narrow_passage_navigation,
            'crowded_spaces': self.plan_crowd_navigation
        }

    def plan_environment_specific_path(self, start_pose, goal_pose, environment_type, costmap):
        """
        Plan path using environment-specific approach
        """
        if environment_type in self.planners:
            return self.planners[environment_type](start_pose, goal_pose, costmap)
        else:
            # Default to standard humanoid path planner
            return self.plan_standard_humanoid_path(start_pose, goal_pose, costmap)

    def plan_stair_navigation(self, start_pose, goal_pose, costmap):
        """
        Plan path specifically for stair navigation
        """
        # Identify stair locations in the environment
        stair_regions = self.identify_stair_regions(costmap)

        # Plan approach to stairs
        approach_path = self.plan_path_to_stair_approach(start_pose, stair_regions)

        # Plan stair climbing sequence
        stair_climb_path = self.plan_stair_climbing_sequence(stair_regions, goal_pose)

        # Plan departure from stairs
        departure_path = self.plan_path_from_stairs(stair_climb_path[-1], goal_pose)

        # Combine all segments
        complete_path = approach_path + stair_climb_path + departure_path

        # Validate and smooth the complete path
        validated_path = self.validate_humanoid_path(complete_path, costmap)
        smoothed_path = self.smooth_humanoid_path(validated_path)

        return self.create_path_message(smoothed_path, start_pose.header)

    def identify_stair_regions(self, costmap):
        """
        Identify stair regions in the costmap using height information
        """
        # This would typically use 3D costmap information or elevation map
        # For this example, we'll simulate stair detection
        stair_regions = []

        # In practice, this would analyze elevation changes in the environment
        # to identify step-like structures
        # Look for sequences of height increases within humanoid step capabilities

        # This is a placeholder implementation
        for i in range(0, costmap.info.width, 20):  # Sample every 20 cells
            for j in range(0, costmap.info.height, 20):
                grid_pos = (i, j)
                world_pos = self.grid_to_world(grid_pos)

                # Check if this location could be part of stairs
                # (would require elevation data in practice)
                if self.is_potential_stair_region(grid_pos, costmap):
                    stair_regions.append({
                        'center': world_pos,
                        'grid_position': grid_pos,
                        'type': 'stairs',
                        'direction': self.estimate_stair_direction(grid_pos, costmap)
                    })

        return stair_regions

    def is_potential_stair_region(self, grid_pos, costmap):
        """
        Check if grid position is in a potential stair region
        """
        # Analyze height/elevation changes around this position
        # Look for step-like patterns in elevation
        # This is a simplified check - in practice would use 3D elevation data

        # For simulation purposes, return True for certain patterns
        # that might represent stairs
        return False  # Placeholder - would implement real detection

    def estimate_stair_direction(self, grid_pos, costmap):
        """
        Estimate the direction of stairs (ascending/descending, orientation)
        """
        # Analyze elevation gradients to determine stair direction
        # This would use 3D costmap or elevation map data
        return 'upward'  # Placeholder

    def plan_stair_climbing_sequence(self, stair_regions, goal_pose):
        """
        Plan the specific sequence of movements for stair climbing
        """
        stair_path = []

        # For each stair region, plan the climbing sequence
        for region in stair_regions:
            # Plan approach to stair start
            approach_poses = self.plan_stair_approach_poses(region)
            stair_path.extend(approach_poses)

            # Plan actual stair climbing steps
            climb_poses = self.plan_stair_climbing_poses(region)
            stair_path.extend(climb_poses)

            # Plan departure from stair end
            departure_poses = self.plan_stair_departure_poses(region)
            stair_path.extend(departure_poses)

        return stair_path

    def plan_stair_approach_poses(self, stair_region):
        """
        Plan poses for approaching stairs
        """
        approach_poses = []

        # Calculate approach path to stair starting point
        approach_distance = 0.5  # 50cm before stairs
        approach_direction = np.array([-1, 0, 0])  # Approach from front

        # Rotate based on stair orientation
        if stair_region.get('direction') == 'left':
            approach_direction = np.array([0, -1, 0])  # From right side
        elif stair_region.get('direction') == 'right':
            approach_direction = np.array([0, 1, 0])  # From left side
        elif stair_region.get('direction') == 'backward':
            approach_direction = np.array([1, 0, 0])  # From behind

        # Calculate approach poses
        base_pos = np.array(stair_region['center'][:2])
        for i in range(5):  # 5 approach poses
            offset = approach_direction * (approach_distance - i * 0.1)  # Gradual approach
            pos = base_pos + offset

            pose = PoseStamped()
            pose.pose.position.x = pos[0]
            pose.pose.position.y = pos[1]
            pose.pose.position.z = 0.0  # Ground level

            approach_poses.append(pose)

        return approach_poses

    def plan_stair_climbing_poses(self, stair_region):
        """
        Plan poses for actual stair climbing
        """
        climb_poses = []

        # Calculate climbing sequence based on stair geometry
        # This would involve detailed footstep planning for each step

        # For simulation, create a simple ascending path
        num_steps = 5  # Assume 5 steps to climb
        step_height = 0.15  # 15cm per step
        step_depth = 0.30  # 30cm per step

        start_pos = np.array(stair_region['center'][:2])

        for i in range(num_steps):
            # Each step: move forward and up
            pos = start_pos + np.array([i * step_depth, 0])
            height = i * step_height

            pose = PoseStamped()
            pose.pose.position.x = pos[0]
            pose.pose.position.y = pos[1]
            pose.pose.position.z = height

            # Ensure orientation maintains balance during climbing
            pose.pose.orientation = self.calculate_climbing_orientation()

            climb_poses.append(pose)

        return climb_poses

    def calculate_climbing_orientation(self):
        """
        Calculate appropriate orientation for stair climbing
        """
        # During climbing, robot should lean slightly forward to maintain balance
        # This is a simplified representation
        forward_lean = 5.0 * np.pi / 180  # 5 degrees forward lean

        # Convert to quaternion
        cy = np.cos(0)
        sy = np.sin(0)
        cp = np.cos(forward_lean)
        sp = np.sin(forward_lean)
        cr = np.cos(0)
        sr = np.sin(0)

        orientation = type('MockQuaternion', (), {
            'x': sr * cp * cy - cr * sp * sy,
            'y': cr * sp * cy + sr * cp * sy,
            'z': cr * cp * sy - sr * sp * cy,
            'w': cr * cp * cy + sr * sp * sy
        })()

        return orientation

    def plan_ramp_navigation(self, start_pose, goal_pose, costmap):
        """
        Plan path for ramp navigation considering humanoid capabilities
        """
        # Ramps require special consideration for humanoid robots
        # Need to ensure angle is within walking capability

        # Identify ramp regions
        ramp_regions = self.identify_ramp_regions(costmap)

        # Plan path that follows ramp contours
        ramp_path = []

        for ramp in ramp_regions:
            # Plan approach to ramp
            approach_path = self.plan_path_to_ramp(start_pose, ramp)

            # Plan traversal along ramp
            traversal_path = self.plan_ramp_traversal(ramp)

            # Plan departure from ramp
            departure_path = self.plan_path_from_ramp(traversal_path[-1], goal_pose)

            ramp_path.extend(approach_path + traversal_path + departure_path)

        return self.create_path_message(ramp_path, start_pose.header)

    def identify_ramp_regions(self, costmap):
        """
        Identify ramp regions in the environment
        """
        # Look for gradually changing elevation regions
        # that could represent ramps
        ramp_regions = []

        # This would analyze elevation gradients to find continuous inclines
        # that are walkable by humanoid robots (typically < 15 degrees)

        # Placeholder implementation
        return ramp_regions

    def plan_narrow_passage_navigation(self, start_pose, goal_pose, costmap):
        """
        Plan path through narrow passages considering humanoid width
        """
        # Humanoid robots have different width considerations than wheeled robots
        # Need to account for shoulder width and turning capabilities

        # Calculate effective robot width for narrow passage planning
        effective_width = self.calculate_humanoid_effective_width()

        # Plan path with increased clearance requirements
        path = self.plan_path_with_clearance(start_pose, goal_pose, costmap, effective_width)

        # Add special maneuvers for narrow passages
        refined_path = self.add_narrow_passage_maneuvers(path)

        return self.create_path_message(refined_path, start_pose.header)

    def calculate_humanoid_effective_width(self):
        """
        Calculate effective width for navigation planning
        """
        # Humanoid effective width includes shoulders and safety margin
        shoulder_width = 0.5  # 50cm shoulder width
        safety_margin = 0.2   # 20cm safety margin on each side
        effective_width = shoulder_width + 2 * safety_margin

        return effective_width

    def plan_path_with_clearance(self, start_pose, goal_pose, costmap, min_clearance):
        """
        Plan path with minimum clearance requirements
        """
        # Inflated costmap for wider robot
        inflated_costmap = self.inflate_costmap_for_clearance(costmap, min_clearance)

        # Plan path using inflated costmap
        path = self.plan_path_humanoid(start_pose, goal_pose, inflated_costmap)

        return path

    def inflate_costmap_for_clearance(self, costmap, clearance):
        """
        Inflate costmap to account for minimum clearance requirements
        """
        # Calculate inflation radius based on clearance requirement
        inflation_radius = int(clearance / costmap.info.resolution)

        # Apply inflation to costmap
        inflated_data = list(costmap.data)

        for y in range(costmap.info.height):
            for x in range(costmap.info.width):
                idx = y * costmap.info.width + x
                if inflated_data[idx] >= 50:  # Obstacle
                    # Inflate obstacle by clearance radius
                    for dy in range(-inflation_radius, inflation_radius + 1):
                        for dx in range(-inflation_radius, inflation_radius + 1):
                            nx, ny = x + dx, y + dy
                            nidx = ny * costmap.info.width + nx

                            if (0 <= nx < costmap.info.width and
                                0 <= ny < costmap.info.height and
                                nidx < len(inflated_data)):

                                distance = np.sqrt(dx*dx + dy*dy)
                                if distance <= inflation_radius:
                                    # Increase cost based on distance to obstacle
                                    cost_increase = max(0, 100 - int(distance * 20))
                                    inflated_data[nidx] = min(100, inflated_data[nidx] + cost_increase)

        # Create new costmap with inflated data
        inflated_costmap = costmap
        inflated_costmap.data = inflated_data

        return inflated_costmap

    def add_narrow_passage_maneuvers(self, path):
        """
        Add special maneuvers for navigating narrow passages
        """
        # Insert special poses for sideways walking or turning if needed
        maneuvered_path = []

        for i, pose in enumerate(path.poses):
            maneuvered_path.append(pose)

            # Check if next segment requires special maneuver
            if i < len(path.poses) - 1:
                next_pose = path.poses[i + 1]

                # If the path segment is through a narrow area, add maneuver poses
                if self.requires_maneuver(pose, next_pose):
                    maneuver_poses = self.generate_maneuver_poses(pose, next_pose)
                    maneuvered_path.extend(maneuver_poses)

        return maneuvered_path

    def requires_maneuver(self, pose1, pose2):
        """
        Determine if special maneuver is required between poses
        """
        # Check if segment goes through narrow passage
        # This would involve checking the environment around the path segment
        distance = np.sqrt((pose2.pose.position.x - pose1.pose.position.x)**2 +
                          (pose2.pose.position.y - pose1.pose.position.y)**2)

        # If distance is very short but path is near obstacles, might need maneuver
        return distance < 0.5  # Placeholder condition

    def generate_maneuver_poses(self, start_pose, end_pose):
        """
        Generate special maneuver poses for tight spaces
        """
        maneuver_poses = []

        # Generate poses for special maneuver (e.g., sideways walking)
        mid_point = PoseStamped()
        mid_point.header = start_pose.header
        mid_point.pose.position.x = (start_pose.pose.position.x + end_pose.pose.position.x) / 2
        mid_point.pose.position.y = (start_pose.pose.position.y + end_pose.pose.position.y) / 2
        mid_point.pose.position.z = (start_pose.pose.position.z + end_pose.pose.position.z) / 2

        # Add orientation change for maneuver
        mid_point.pose.orientation = self.calculate_maneuver_orientation(start_pose, end_pose)

        maneuver_poses.append(mid_point)

        return maneuver_poses

    def calculate_maneuver_orientation(self, start_pose, end_pose):
        """
        Calculate appropriate orientation for special maneuvers
        """
        # Calculate direction vector
        direction = np.array([
            end_pose.pose.position.x - start_pose.pose.position.x,
            end_pose.pose.position.y - start_pose.pose.position.y,
            end_pose.pose.position.z - start_pose.pose.position.z
        ])

        direction_norm = direction / np.linalg.norm(direction) if np.linalg.norm(direction) > 0 else direction

        # Convert to quaternion
        yaw = np.arctan2(direction_norm[1], direction_norm[0])

        cy = np.cos(yaw * 0.5)
        sy = np.sin(yaw * 0.5)

        orientation = type('MockQuaternion', (), {
            'x': 0.0,
            'y': 0.0,
            'z': sy,
            'w': cy
        })()

        return orientation

    def plan_crowd_navigation(self, start_pose, goal_pose, costmap):
        """
        Plan path in crowded environments considering human safety and comfort
        """
        # Humanoid robots navigating among humans need special considerations
        # - Maintain appropriate social distance
        # - Predict human movement
        # - Plan polite navigation behaviors

        # Use social navigation algorithms
        path = self.plan_socially_aware_path(start_pose, goal_pose, costmap)

        # Add safety behaviors
        safe_path = self.add_crowd_safety_behaviors(path)

        return self.create_path_message(safe_path, start_pose.header)

    def plan_socially_aware_path(self, start_pose, goal_pose, costmap):
        """
        Plan path considering social navigation principles
        """
        # Implement social force model or similar approach
        # This would consider human presence and social conventions

        # For now, use a simplified approach that adds extra clearance
        # around detected humans in the costmap
        socially_aware_costmap = self.add_social_clearance_to_costmap(costmap)

        path = self.plan_path_humanoid(start_pose, goal_pose, socially_aware_costmap)

        return path

    def add_social_clearance_to_costmap(self, costmap):
        """
        Add social clearance around humans in costmap
        """
        # Identify human locations (in practice, from perception system)
        # Add social distance buffers around them

        # This is a simplified implementation
        social_costmap = list(costmap.data)

        # Add social zones around humans (would be detected from perception)
        human_positions = self.get_detected_human_positions()  # From perception

        for human_pos in human_positions:
            grid_pos = self.world_to_grid([human_pos.x, human_pos.y, human_pos.z])

            # Add social distance zone (0.8m radius - personal space)
            social_radius = int(0.8 / costmap.info.resolution)

            for dy in range(-social_radius, social_radius + 1):
                for dx in range(-social_radius, social_radius + 1):
                    nx, ny = grid_pos[0] + dx, grid_pos[1] + dy
                    nidx = ny * costmap.info.width + nx

                    if (0 <= nx < costmap.info.width and
                        0 <= ny < costmap.info.height and
                        nidx < len(social_costmap)):

                        distance = np.sqrt(dx*dx + dy*dy)
                        if distance <= social_radius:
                            # Increase cost to encourage path around human
                            cost_increase = max(0, 80 - int(distance * 20))
                            social_costmap[nidx] = min(100, social_costmap[nidx] + cost_increase)

        # Create new costmap with social considerations
        social_costmap_msg = costmap
        social_costmap_msg.data = social_costmap

        return social_costmap_msg

    def get_detected_human_positions(self):
        """
        Get detected human positions from perception system
        """
        # This would come from Isaac ROS perception system
        # For simulation, return placeholder
        return [type('MockPoint', (), {'x': 2.0, 'y': 1.0, 'z': 0.0})()]

    def validate_humanoid_path(self, path, costmap):
        """
        Validate path for humanoid-specific constraints
        """
        valid_path = []

        for pose in path.poses:
            if self.is_pose_valid_for_humanoid(pose, costmap):
                valid_path.append(pose)
            else:
                # Try to find alternative nearby pose
                alternative = self.find_valid_alternative_pose(pose, costmap)
                if alternative:
                    valid_path.append(alternative)

        return valid_path

    def is_pose_valid_for_humanoid(self, pose, costmap):
        """
        Check if pose is valid for humanoid navigation
        """
        # Check if pose location is traversable
        grid_pos = self.world_to_grid([pose.pose.position.x, pose.pose.position.y, pose.pose.position.z])
        costmap_idx = grid_pos[1] * costmap.info.width + grid_pos[0]

        if costmap_idx < len(costmap.data):
            cost = costmap.data[costmap_idx]
            if cost >= 50:  # Occupied or dangerous
                return False

        # Check step height constraints (if elevation data available)
        # Check for adequate clearance for humanoid height
        # Check for stability (slope, surface type, etc.)

        return True

    def find_valid_alternative_pose(self, original_pose, costmap):
        """
        Find valid alternative pose near original pose
        """
        original_pos = np.array([original_pose.pose.position.x, original_pose.pose.position.y])

        # Search in a circular pattern around original position
        search_radius = 0.5  # 50cm search radius
        for radius in np.linspace(0.1, search_radius, 5):  # Different radii
            for angle in np.linspace(0, 2*np.pi, 12):  # Different angles
                offset = np.array([radius * np.cos(angle), radius * np.sin(angle)])
                candidate_pos = original_pos + offset

                # Check if candidate is valid
                candidate_grid = self.world_to_grid([candidate_pos[0], candidate_pos[1], original_pose.pose.position.z])
                costmap_idx = candidate_grid[1] * costmap.info.width + candidate_grid[0]

                if (0 <= candidate_grid[0] < costmap.info.width and
                    0 <= candidate_grid[1] < costmap.info.height and
                    costmap_idx < len(costmap.data)):

                    cost = costmap.data[costmap_idx]
                    if cost < 50:  # Valid position found
                        alternative_pose = PoseStamped()
                        alternative_pose.header = original_pose.header
                        alternative_pose.pose.position.x = candidate_pos[0]
                        alternative_pose.pose.position.y = candidate_pos[1]
                        alternative_pose.pose.position.z = original_pose.pose.position.z
                        alternative_pose.pose.orientation = original_pose.pose.orientation

                        return alternative_pose

        return None  # No valid alternative found
```

## Isaac ROS Integration with Path Planning

### Isaac ROS Path Planning Nodes

```python
# Example: Isaac ROS integration for path planning
class IsaacROSPathPlanningIntegration:
    def __init__(self):
        # Initialize Isaac ROS navigation components
        self.initialize_isaac_ros_navigation()

    def initialize_isaac_ros_navigation(self):
        """
        Initialize Isaac ROS navigation components
        """
        # Isaac ROS provides specialized navigation packages:
        # - Isaac ROS Navigation: GPU-accelerated navigation stack
        # - Isaac ROS Waypoint Follower: Optimized path following
        # - Isaac ROS Path Planning: GPU-accelerated planning algorithms

        # For this tutorial, we'll set up the conceptual integration
        self.nav_components = {
            'path_planner': self.initialize_path_planner(),
            'local_planner': self.initialize_local_planner(),
            'controller': self.initialize_controller(),
            'recovery': self.initialize_recovery_behaviors()
        }

        self.get_logger().info("Isaac ROS navigation components initialized")

    def initialize_path_planner(self):
        """
        Initialize GPU-accelerated path planner
        """
        # In Isaac ROS: this would use GPU-accelerated planning algorithms
        planner_config = {
            'algorithm': 'gpu_astar',  # GPU-accelerated A*
            'costmap_resolution': 0.05,
            'max_iterations': 10000,
            'gpu_enabled': True,
            'optimization_level': 'balanced'  # performance vs quality
        }

        # In actual Isaac ROS:
        # from isaac_ros_navigation import GPUPathPlanner
        # return GPUPathPlanner(**planner_config)

        # For demonstration:
        return type('MockPathPlanner', (), {
            'plan': lambda self, start, goal, costmap: self.mock_path_planning(start, goal, costmap),
            'mock_path_planning': lambda self, s, g, cm: Path()  # Return empty path as placeholder
        })()

    def initialize_local_planner(self):
        """
        Initialize local path planning and obstacle avoidance
        """
        local_planner_config = {
            'algorithm': 'teb',  # Timed Elastic Band
            'horizon': 3.0,      # Planning horizon in meters
            'frequency': 20.0,   # Planning frequency in Hz
            'obstacle_inflation': 0.7,  # Humanoid-specific inflation
            'robot_model': {
                'type': 'circle',
                'radius': 0.35  # Humanoid radius
            }
        }

        # In actual Isaac ROS:
        # from isaac_ros_navigation import LocalPlanner
        # return LocalPlanner(**local_planner_config)

        # For demonstration:
        return type('MockLocalPlanner', (), {
            'plan': lambda self, global_path, current_pose: self.mock_local_planning(global_path, current_pose),
            'mock_local_planning': lambda self, gp, cp: Path()  # Return empty path as placeholder
        })()

    def initialize_controller(self):
        """
        Initialize path following controller
        """
        controller_config = {
            'type': 'pure_pursuit',  # Or 'mpc' for Model Predictive Control
            'lookahead_distance': 0.8,  # For humanoid stability
            'max_linear_vel': 0.3,      # Conservative for humanoid
            'max_angular_vel': 0.5,     # Conservative for humanoid
            'control_frequency': 50.0   # Higher for better control
        }

        # In actual Isaac ROS:
        # from isaac_ros_navigation import Controller
        # return Controller(**controller_config)

        # For demonstration:
        return type('MockController', (), {
            'follow_path': lambda self, path, current_pose: self.mock_path_following(path, current_pose),
            'mock_path_following': lambda self, p, cp: {'linear_vel': 0.1, 'angular_vel': 0.05}
        })()

    def initialize_recovery_behaviors(self):
        """
        Initialize recovery behaviors for humanoid navigation
        """
        recovery_config = {
            'behaviors': [
                'clear_costmap',
                'humanoid_back_up',    # Humanoid-specific backup
                'humanoid_spin',       # Humanoid-specific spin
                'humanoid_wait'        # Humanoid-specific wait behavior
            ],
            'max_retries': 3,
            'retry_timeout': 10.0
        }

        # In actual Isaac ROS:
        # from isaac_ros_navigation import RecoveryBehaviors
        # return RecoveryBehaviors(**recovery_config)

        # For demonstration:
        return type('MockRecovery', (), {
            'execute': lambda self, behavior: self.mock_recovery_execution(behavior),
            'mock_recovery_execution': lambda self, b: True
        })()

    def integrate_with_perception(self, perception_data):
        """
        Integrate path planning with perception data from Isaac ROS
        """
        # Use perception data to update costmaps and planning constraints
        dynamic_obstacles = self.extract_dynamic_obstacles(perception_data)
        static_map_updates = self.extract_static_map_updates(perception_data)
        sensor_uncertainty = self.calculate_sensor_uncertainty(perception_data)

        # Update costmaps with perception data
        self.update_global_costmap_with_perception(dynamic_obstacles, static_map_updates)
        self.update_local_costmap_with_perception(dynamic_obstacles, sensor_uncertainty)

        # Plan path considering perception uncertainties
        path = self.plan_path_with_perception_awareness(dynamic_obstacles, sensor_uncertainty)

        return path

    def extract_dynamic_obstacles(self, perception_data):
        """
        Extract dynamic obstacles from perception data
        """
        # In Isaac ROS: this would use object detection and tracking results
        dynamic_obstacles = []

        # Process Isaac ROS detection results
        if hasattr(perception_data, 'detections'):
            for detection in perception_data.detections:
                if detection.is_dynamic:  # From tracking or motion analysis
                    obstacle = {
                        'position': detection.position,
                        'velocity': detection.velocity,
                        'size': detection.bounding_box_size,
                        'confidence': detection.confidence,
                        'prediction_horizon': 3.0  # 3 seconds prediction
                    }
                    dynamic_obstacles.append(obstacle)

        return dynamic_obstacles

    def extract_static_map_updates(self, perception_data):
        """
        Extract static map updates from perception data
        """
        # Process new static obstacle detections
        static_updates = []

        if hasattr(perception_data, 'static_detections'):
            for detection in perception_data.static_detections:
                if not detection.is_dynamic:  # Static obstacle
                    update = {
                        'position': detection.position,
                        'size': detection.bounding_box_size,
                        'confidence': detection.confidence
                    }
                    static_updates.append(update)

        return static_updates

    def calculate_sensor_uncertainty(self, perception_data):
        """
        Calculate uncertainty in perception data
        """
        # Calculate uncertainty based on sensor properties and environmental conditions
        uncertainty = {
            'position': 0.1,  # 10cm position uncertainty
            'velocity': 0.05,  # 5cm/s velocity uncertainty
            'classification': 0.2  # 20% classification uncertainty
        }

        # Adjust based on sensor conditions
        if perception_data.environment_condition == 'low_light':
            uncertainty['position'] *= 1.5  # Increase uncertainty in low light
        elif perception_data.environment_condition == 'high_occlusion':
            uncertainty['position'] *= 2.0  # Increase uncertainty with occlusions

        return uncertainty

    def update_global_costmap_with_perception(self, dynamic_obstacles, static_updates):
        """
        Update global costmap with perception data
        """
        # Update costmap with dynamic obstacles (temporary)
        for obstacle in dynamic_obstacles:
            self.add_dynamic_obstacle_to_costmap(obstacle)

        # Update costmap with static updates (permanent until corrected)
        for update in static_updates:
            self.add_static_update_to_costmap(update)

    def update_local_costmap_with_perception(self, dynamic_obstacles, uncertainty):
        """
        Update local costmap with perception data
        """
        # Focus on short-term obstacle avoidance
        for obstacle in dynamic_obstacles:
            if self.is_in_local_planning_horizon(obstacle):
                self.add_obstacle_to_local_costmap(obstacle, uncertainty)

    def plan_path_with_perception_awareness(self, dynamic_obstacles, uncertainty):
        """
        Plan path considering perception uncertainties
        """
        # Plan path that accounts for predicted obstacle movements
        # and sensor uncertainties

        # Use probabilistic roadmaps or similar approach that considers uncertainty
        # In Isaac ROS: this would use GPU-accelerated probabilistic planners

        # For demonstration, return a basic path planning result
        path = Path()
        path.header.frame_id = "map"
        # Add poses based on uncertainty-aware planning
        return path

    def add_dynamic_obstacle_to_costmap(self, obstacle):
        """
        Add dynamic obstacle to costmap with temporal considerations
        """
        # Calculate obstacle's predicted position over time
        prediction_steps = 10
        time_step = 0.3  # 300ms intervals

        for step in range(prediction_steps):
            predicted_time = step * time_step
            predicted_pos = self.predict_obstacle_position(obstacle, predicted_time)

            # Add to costmap with decreasing influence over time
            influence = max(0.0, 1.0 - predicted_time / (prediction_steps * time_step))
            self.update_costmap_cell(predicted_pos, obstacle.size, influence * 100)

    def predict_obstacle_position(self, obstacle, time_ahead):
        """
        Predict obstacle position based on current velocity
        """
        predicted_pos = np.array(obstacle['position']) + np.array(obstacle['velocity']) * time_ahead
        return predicted_pos.tolist()

    def update_costmap_cell(self, position, size, cost):
        """
        Update costmap cell with given cost
        """
        # Convert world position to grid coordinates
        grid_pos = self.world_to_grid(position)

        # Update cell and surrounding area based on size
        # This is a simplified implementation
        pass

    def is_in_local_planning_horizon(self, obstacle):
        """
        Check if obstacle is within local planning horizon
        """
        # Check distance from robot to obstacle
        robot_pos = self.get_robot_position()
        distance = np.linalg.norm(
            np.array(obstacle['position']) - np.array(robot_pos)
        )
        return distance < 5.0  # 5m local planning horizon

    def add_obstacle_to_local_costmap(self, obstacle, uncertainty):
        """
        Add obstacle to local costmap with uncertainty considerations
        """
        # Add uncertainty ellipse around obstacle position
        uncertainty_radius = uncertainty['position'] * 2  # 2-sigma confidence
        self.add_uncertain_obstacle_to_costmap(obstacle, uncertainty_radius)

    def add_uncertain_obstacle_to_costmap(self, obstacle, uncertainty_radius):
        """
        Add obstacle with uncertainty radius to costmap
        """
        # In practice, this would create a probabilistic cost distribution
        # around the obstacle position
        center_pos = obstacle['position']
        size = obstacle['size']

        # Add cost with probability distribution
        grid_center = self.world_to_grid(center_pos)
        uncertainty_cells = int(uncertainty_radius / self.global_costmap.info.resolution)

        for dy in range(-uncertainty_cells, uncertainty_cells + 1):
            for dx in range(-uncertainty_cells, uncertainty_cells + 1):
                distance = np.sqrt(dx*dx + dy*dy) * self.global_costmap.info.resolution
                probability = np.exp(-distance*distance / (2 * uncertainty_radius*uncertainty_radius))

                grid_x, grid_y = grid_center[0] + dx, grid_center[1] + dy
                costmap_idx = grid_y * self.global_costmap.info.width + grid_x

                if (0 <= grid_x < self.global_costmap.info.width and
                    0 <= grid_y < self.global_costmap.info.height and
                    costmap_idx < len(self.global_costmap.data)):

                    base_cost = min(100, obstacle['confidence'] * 100)
                    uncertain_cost = base_cost * probability
                    self.global_costmap.data[costmap_idx] = min(100,
                        self.global_costmap.data[costmap_idx] + uncertain_cost)

    def get_robot_position(self):
        """
        Get current robot position from localization
        """
        # This would come from robot's localization system
        # For demonstration, return placeholder
        return [0.0, 0.0, 0.0]

    def world_to_grid(self, world_pos):
        """
        Convert world coordinates to grid coordinates
        """
        # Assuming we have access to costmap info
        # This is a simplified implementation
        grid_x = int((world_pos[0] - 0.0) / 0.05)  # Assuming 0.05m resolution
        grid_y = int((world_pos[1] - 0.0) / 0.05)  # Assuming origin at (0,0)
        return (grid_x, grid_y)

# Usage example
integration = IsaacROSPathPlanningIntegration()

# In a navigation node:
# perception_data = self.get_perception_data_from_isaac_ros()
# path = integration.integrate_with_perception(perception_data)
```

## Performance Optimization for Humanoid Path Planning

### GPU-Accelerated Path Planning

```python
# Example: GPU-accelerated path planning optimization
import cupy as cp
import numpy as np

class GPUAcceleratedPathPlanner:
    def __init__(self):
        # Check for GPU availability
        self.gpu_available = self.check_gpu_availability()

        if self.gpu_available:
            self.setup_gpu_resources()
        else:
            self.get_logger().warn("GPU not available, using CPU fallback for path planning")

    def check_gpu_availability(self):
        """
        Check if GPU is available for accelerated computation
        """
        try:
            import pynvml
            pynvml.nvmlInit()
            device_count = pynvml.nvmlDeviceGetCount()
            return device_count > 0
        except:
            return False

    def setup_gpu_resources(self):
        """
        Set up GPU resources for path planning acceleration
        """
        # Initialize CUDA context
        self.gpu_device = cp.cuda.Device(0)
        self.gpu_device.use()

        # Set up memory pools for efficient allocation
        self.memory_pool = cp.cuda.MemoryPool()
        cp.cuda.set_allocator(self.memory_pool.malloc)

        # Initialize GPU-accelerated algorithms
        self.gpu_a_star = self.initialize_gpu_astar()
        self.gpu_costmap_processing = self.initialize_gpu_costmap_processing()

    def initialize_gpu_astar(self):
        """
        Initialize GPU-accelerated A* algorithm
        """
        if not self.gpu_available:
            return None

        # In Isaac ROS: this would use optimized GPU path planning kernels
        # For demonstration, we'll outline the concept

        # GPU A* would use parallel computation for:
        # - Open set management with parallel priority queue
        # - Neighbor evaluation in parallel
        # - Cost calculation across multiple cells simultaneously

        return {
            'initialized': True,
            'algorithm': 'gpu_astar',
            'max_nodes': 100000  # Maximum nodes in search space
        }

    def initialize_gpu_costmap_processing(self):
        """
        Initialize GPU-accelerated costmap operations
        """
        if not self.gpu_available:
            return None

        # GPU costmap processing for operations like:
        # - Obstacle inflation with parallel computation
        # - Costmap filtering and smoothing
        # - Dynamic obstacle prediction

        return {
            'initialized': True,
            'operations': [
                'inflation',
                'smoothing',
                'obstacle_prediction',
                'cost_calculation'
            ]
        }

    def plan_path_gpu_accelerated(self, start, goal, costmap):
        """
        Plan path using GPU acceleration when available
        """
        if not self.gpu_available:
            # Fall back to CPU path planning
            return self.plan_path_cpu_fallback(start, goal, costmap)

        try:
            # Transfer costmap to GPU memory
            costmap_gpu = cp.asarray(costmap.data).reshape(costmap.info.height, costmap.info.width)

            # Transfer start and goal to GPU
            start_gpu = cp.array([start.x, start.y])
            goal_gpu = cp.array([goal.x, goal.y])

            # Run GPU-accelerated path planning
            path_gpu = self.gpu_astar_search(start_gpu, goal_gpu, costmap_gpu)

            # Transfer result back to CPU
            path_cpu = cp.asnumpy(path_gpu) if path_gpu is not None else None

            return path_cpu

        except Exception as e:
            self.get_logger().error(f"GPU path planning failed: {str(e)}, falling back to CPU")
            return self.plan_path_cpu_fallback(start, goal, costmap)

    def gpu_astar_search(self, start, goal, costmap_gpu):
        """
        GPU-accelerated A* search algorithm
        """
        # This would implement parallel A* on GPU
        # Using CUDA kernels for efficient neighbor exploration

        height, width = costmap_gpu.shape
        start_idx = self.world_to_grid_index(start, costmap_gpu)
        goal_idx = self.world_to_grid_index(goal, costmap_gpu)

        if start_idx is None or goal_idx is None:
            return None

        # Initialize GPU arrays for A* algorithm
        g_score_gpu = cp.full((height, width), cp.inf, dtype=cp.float32)
        f_score_gpu = cp.full((height, width), cp.inf, dtype=cp.float32)
        came_from_gpu = cp.full((height, width, 2), -1, dtype=cp.int32)

        g_score_gpu[start_idx[0], start_idx[1]] = 0
        f_score_gpu[start_idx[0], start_idx[1]] = self.heuristic_gpu(start_idx, goal_idx)

        # Use GPU-based priority queue (implemented with thrust or similar)
        open_set_gpu = cp.array([[start_idx[0], start_idx[1], f_score_gpu[start_idx[0], start_idx[1]]]])

        # A* loop (simplified for demonstration)
        max_iterations = 10000
        iteration = 0

        while len(open_set_gpu) > 0 and iteration < max_iterations:
            # Find node with minimum f_score
            min_f_idx = cp.argmin(open_set_gpu[:, 2])
            current = open_set_gpu[min_f_idx, :2].astype(cp.int32)

            # Remove from open set
            open_set_gpu = cp.delete(open_set_gpu, min_f_idx, axis=0)

            # Check if goal reached
            if cp.array_equal(current, goal_idx):
                break

            # Get neighbors (this would be parallelized in real implementation)
            neighbors = self.get_gpu_neighbors(current, costmap_gpu)

            for neighbor in neighbors:
                tentative_g_score = g_score_gpu[current[0], current[1]] + self.distance_gpu(current, neighbor)

                if tentative_g_score < g_score_gpu[neighbor[0], neighbor[1]]:
                    # This neighbor is better, update
                    came_from_gpu[neighbor[0], neighbor[1], 0] = current[0]
                    came_from_gpu[neighbor[0], neighbor[1], 1] = current[1]
                    g_score_gpu[neighbor[0], neighbor[1]] = tentative_g_score
                    f_score_gpu[neighbor[0], neighbor[1]] = tentative_g_score + self.heuristic_gpu(neighbor, goal_idx)

                    # Add to open set
                    new_node = cp.array([neighbor[0], neighbor[1], f_score_gpu[neighbor[0], neighbor[1]]])
                    open_set_gpu = cp.vstack([open_set_gpu, new_node])

            iteration += 1

        # Reconstruct path from came_from_gpu
        path = self.reconstruct_gpu_path(came_from_gpu, start_idx, goal_idx)
        return path

    def world_to_grid_index(self, world_pos, costmap_gpu):
        """
        Convert world position to grid index on GPU
        """
        # This would use costmap metadata to convert world to grid coordinates
        # For demonstration, return a simple conversion
        resolution = 0.05  # Assuming 5cm resolution
        origin_x, origin_y = 0.0, 0.0  # Assuming origin at (0,0)

        grid_x = int((world_pos[0] - origin_x) / resolution)
        grid_y = int((world_pos[1] - origin_y) / resolution)

        height, width = costmap_gpu.shape
        if 0 <= grid_x < width and 0 <= grid_y < height:
            return (grid_y, grid_x)  # Note: y first for array indexing
        else:
            return None

    def heuristic_gpu(self, pos1, pos2):
        """
        Heuristic function for A* on GPU
        """
        return cp.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)

    def distance_gpu(self, pos1, pos2):
        """
        Distance calculation on GPU
        """
        return cp.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)

    def get_gpu_neighbors(self, current, costmap_gpu):
        """
        Get valid neighbors for current position on GPU
        """
        height, width = costmap_gpu.shape
        neighbors = []

        # Check 8-connectivity neighbors
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue  # Skip current position

                nx, ny = current[0] + dy, current[1] + dx  # Note: y first for array indexing

                if 0 <= nx < height and 0 <= ny < width:
                    # Check if cell is traversable
                    if costmap_gpu[nx, ny] < 50:  # Less than 50% cost (traversable)
                        neighbors.append([nx, ny])

        return cp.array(neighbors, dtype=cp.int32) if neighbors else cp.empty((0, 2), dtype=cp.int32)

    def reconstruct_gpu_path(self, came_from_gpu, start_idx, goal_idx):
        """
        Reconstruct path from came_from array on GPU
        """
        path = []
        current = goal_idx

        while not (current[0] == start_idx[0] and current[1] == start_idx[1]):
            path.append([current[0], current[1]])

            prev_x = came_from_gpu[current[0], current[1], 0]
            prev_y = came_from_gpu[current[0], current[1], 1]

            if prev_x == -1 or prev_y == -1:  # No predecessor
                # Path not found
                return None

            current = [prev_x, prev_y]

        path.append([start_idx[0], start_idx[1]])
        path.reverse()

        # Convert grid path back to world coordinates
        path_world = []
        resolution = 0.05
        for grid_pos in path:
            world_x = grid_pos[1] * resolution  # grid_pos[1] is x index
            world_y = grid_pos[0] * resolution  # grid_pos[0] is y index
            path_world.append([world_x, world_y])

        return cp.array(path_world, dtype=cp.float32)

    def plan_path_cpu_fallback(self, start, goal, costmap):
        """
        CPU fallback path planning when GPU not available
        """
        # Implement standard A* or other path planning algorithm
        # This is a simplified implementation for demonstration
        path = [start, goal]  # Placeholder
        return path

# Usage example
gpu_planner = GPUAcceleratedPathPlanner()

# In path planning node:
# if gpu_planner.gpu_available:
#     path = gpu_planner.plan_path_gpu_accelerated(start, goal, costmap)
# else:
#     path = standard_path_planner.plan_path(start, goal, costmap)
```

## Quality Assurance and Validation

### Path Planning Validation

```python
# Example: Path planning validation framework
class IsaacROSPPathPlanningValidator:
    def __init__(self):
        self.validation_metrics = {
            'path_length': [],
            'execution_time': [],
            'safety_margin': [],
            'kinematic_feasibility': [],
            'computation_efficiency': []
        }

    def validate_path_planning_results(self, planned_path, costmap, robot_specifications):
        """
        Validate path planning results against requirements
        """
        validation_results = {}

        # Check path length efficiency
        path_length = self.calculate_path_length(planned_path)
        optimal_length = self.estimate_optimal_path_length(planned_path.start, planned_path.goal, costmap)
        efficiency_ratio = path_length / max(optimal_length, 0.1)  # Avoid division by zero
        validation_results['efficiency'] = efficiency_ratio

        # Check safety margins
        safety_score = self.evaluate_path_safety(planned_path, costmap)
        validation_results['safety'] = safety_score

        # Check kinematic feasibility
        kinematic_score = self.evaluate_kinematic_feasibility(planned_path, robot_specifications)
        validation_results['kinematic_feasibility'] = kinematic_score

        # Check computational efficiency
        computation_time = self.get_last_planning_time()
        target_time = 0.1  # 100ms target for real-time planning
        efficiency_score = max(0, min(1, target_time / max(computation_time, 0.001)))
        validation_results['computation_efficiency'] = efficiency_score

        # Overall validation
        overall_score = self.calculate_overall_path_score(validation_results)
        validation_results['overall_score'] = overall_score
        validation_results['passes_validation'] = overall_score >= 0.75  # 75% threshold

        # Store for metrics tracking
        self.validation_metrics['path_length'].append(path_length)
        self.validation_metrics['safety_margin'].append(safety_score)
        self.validation_metrics['kinematic_feasibility'].append(kinematic_score)
        self.validation_metrics['computation_efficiency'].append(efficiency_score)

        return validation_results

    def calculate_path_length(self, path):
        """
        Calculate total length of the planned path
        """
        if len(path.poses) < 2:
            return 0.0

        total_length = 0.0
        for i in range(1, len(path.poses)):
            prev_pose = path.poses[i-1].pose.position
            curr_pose = path.poses[i].pose.position

            segment_length = np.sqrt(
                (curr_pose.x - prev_pose.x)**2 +
                (curr_pose.y - prev_pose.y)**2 +
                (curr_pose.z - prev_pose.z)**2
            )
            total_length += segment_length

        return total_length

    def estimate_optimal_path_length(self, start, goal, costmap):
        """
        Estimate optimal path length using straight-line distance as lower bound
        """
        straight_line_distance = np.sqrt(
            (goal.x - start.x)**2 +
            (goal.y - start.y)**2 +
            (goal.z - start.z)**2
        )

        # Account for obstacles and environment complexity
        # In practice, this would use more sophisticated estimation
        estimated_optimal = straight_line_distance * 1.2  # Add 20% for obstacles

        return estimated_optimal

    def evaluate_path_safety(self, path, costmap):
        """
        Evaluate safety of planned path considering costmap
        """
        if len(path.poses) == 0:
            return 0.0

        safety_sum = 0.0
        total_points = len(path.poses)

        for pose_stamped in path.poses:
            pose = pose_stamped.pose.position

            # Convert world coordinates to grid coordinates
            grid_x = int((pose.x - costmap.info.origin.position.x) / costmap.info.resolution)
            grid_y = int((pose.y - costmap.info.origin.position.y) / costmap.info.resolution)

            # Check if within costmap bounds
            if (0 <= grid_x < costmap.info.width and
                0 <= grid_y < costmap.info.height):

                costmap_idx = grid_y * costmap.info.width + grid_x
                if costmap_idx < len(costmap.data):
                    cost = costmap.data[costmap_idx]
                    # Convert cost to safety score (lower cost = higher safety)
                    safety_score = max(0.0, 1.0 - cost / 100.0)
                    safety_sum += safety_score

        average_safety = safety_sum / max(total_points, 1)
        return average_safety

    def evaluate_kinematic_feasibility(self, path, robot_specifications):
        """
        Evaluate if path is kinematically feasible for the robot
        """
        if len(path.poses) < 2:
            return 1.0

        feasible_segments = 0
        total_segments = len(path.poses) - 1

        for i in range(total_segments):
            start_pose = path.poses[i].pose.position
            end_pose = path.poses[i+1].pose.position

            # Check if segment is feasible for robot kinematics
            segment_feasible = self.is_segment_kinematically_feasible(
                start_pose, end_pose, robot_specifications
            )

            if segment_feasible:
                feasible_segments += 1

        feasibility_score = feasible_segments / max(total_segments, 1)
        return feasibility_score

    def is_segment_kinematically_feasible(self, start, end, robot_specs):
        """
        Check if path segment is kinematically feasible
        """
        # Check distance constraints
        distance = np.sqrt((end.x - start.x)**2 + (end.y - start.y)**2)
        max_step_distance = robot_specs.get('max_step_distance', 0.5)  # Default 50cm

        if distance > max_step_distance:
            return False

        # Check slope constraints (for humanoid walking)
        height_change = abs(end.z - start.z)
        slope = height_change / max(distance, 0.001)
        max_walkable_slope = robot_specs.get('max_walkable_slope', 0.3)  # Default 30% slope

        if slope > max_walkable_slope:
            return False

        # Check turning constraints
        # (would check if turn is within robot's turning capabilities)

        return True

    def get_last_planning_time(self):
        """
        Get the time taken for the last path planning operation
        """
        # This would be measured during actual planning
        # For demonstration, return a placeholder
        return 0.05  # 50ms

    def calculate_overall_path_score(self, validation_results):
        """
        Calculate overall path quality score
        """
        # Weighted average of different validation metrics
        weights = {
            'efficiency': 0.3,
            'safety': 0.3,
            'kinematic_feasibility': 0.25,
            'computation_efficiency': 0.15
        }

        total_score = 0.0
        total_weight = 0.0

        for metric, weight in weights.items():
            if metric in validation_results:
                total_score += validation_results[metric] * weight
                total_weight += weight

        return total_score / max(total_weight, 0.001) if total_weight > 0 else 0.0

    def generate_validation_report(self, output_path=None):
        """
        Generate comprehensive validation report
        """
        import json
        from datetime import datetime

        # Calculate summary statistics
        summary_stats = {}
        for metric, values in self.validation_metrics.items():
            if values:
                summary_stats[metric] = {
                    'mean': sum(values) / len(values),
                    'min': min(values),
                    'max': max(values),
                    'std': self.calculate_std(values),
                    'count': len(values)
                }
            else:
                summary_stats[metric] = {'mean': 0, 'min': 0, 'max': 0, 'std': 0, 'count': 0}

        report = {
            'validation_report': {
                'timestamp': datetime.now().isoformat(),
                'summary_statistics': summary_stats,
                'validation_criteria': {
                    'min_efficiency': 1.5,  # Path should be within 1.5x of optimal
                    'min_safety': 0.8,      # 80% safety threshold
                    'min_kinematic_feasibility': 0.95,  # 95% kinematic feasibility
                    'min_computation_efficiency': 0.7   # 70% efficiency of target time
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
            'efficiency_compliant': stats['path_length']['mean'] <= 1.5,
            'safety_compliant': stats['safety_margin']['mean'] >= 0.8,
            'kinematic_compliant': stats['kinematic_feasibility']['mean'] >= 0.95,
            'computation_compliant': stats['computation_efficiency']['mean'] >= 0.7
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

        if not compliance['efficiency_compliant']:
            recommendations.append("Optimize path planning algorithm for shorter paths")
        if not compliance['safety_compliant']:
            recommendations.append("Increase safety margins in costmap inflation")
        if not compliance['kinematic_compliant']:
            recommendations.append("Adjust path planning for robot kinematic constraints")
        if not compliance['computation_compliant']:
            recommendations.append("Optimize algorithm performance or reduce complexity")

        return recommendations

# Usage example
validator = IsaacROSPPathPlanningValidator()

# Validate a planned path
# validation_results = validator.validate_path_planning_results(planned_path, costmap, robot_specs)
# print(f"Path validation score: {validation_results['overall_score']:.2f}")

# Generate validation report
# report = validator.generate_validation_report("path_validation_report.json")
```

## Assessment Questions

1. What are the key differences between standard path planning and humanoid-specific path planning?
2. How does Isaac ROS accelerate perception and path planning using GPU computation?
3. What are the main challenges in fusing data from multiple sensor types for navigation?
4. How can you optimize path planning performance while maintaining safety for humanoid robots?
5. What validation techniques ensure path quality for real-world humanoid navigation?

## Next Steps

After mastering perception pipeline concepts, continue to the Sensor Data Processing section to learn about handling and processing multi-sensor data streams for robotics applications.