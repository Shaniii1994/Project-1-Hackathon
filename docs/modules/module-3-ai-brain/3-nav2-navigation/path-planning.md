# Path Planning for Humanoid Robots

This section covers path planning algorithms specifically adapted for humanoid robots, taking into account their unique kinematic constraints and navigation requirements.

## Understanding Humanoid Path Planning

### Differences from Wheeled Robots

Humanoid robots have distinct path planning requirements compared to wheeled robots:

1. **Kinematic Constraints**: Humanoids have joint limits, balance requirements, and step constraints
2. **Footstep Planning**: Must consider discrete foot placements and stepping motions
3. **Balance Maintenance**: Path must maintain center of mass within support polygon
4. **Terrain Negotiation**: Must handle stairs, slopes, and uneven terrain differently

### Key Considerations

- **Step Height Limits**: Maximum height differences the robot can step over
- **Step Width Limits**: Maximum distance between consecutive foot placements
- **Turning Radius**: Limited turning capabilities compared to wheeled robots
- **Balance Constraints**: Maintaining stability during locomotion

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
                <BackUp name="Backup"/>
                <Spin name="Spin"/>
                <Wait name="Wait" time="5"/>
              </SequenceStar>
              <ReactiveFallback name="MoveRobot">
                <GoalReached name="GoalReached"/>
                <ComputePathToPose name="ComputePathToPose"/>
                <FollowPath name="FollowPath"/>
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
      max_vel_x: 0.3      # Slower max speed for stability
      min_vel_x: 0.05     # Minimum forward speed
      max_vel_y: 0.1      # Limited lateral movement
      max_vel_theta: 0.5  # Reduced turning speed for balance
      min_vel_theta: 0.1  # Minimum turning speed
      acc_lim_x: 0.5      # Lower acceleration for stability
      acc_lim_y: 0.2      # Limited lateral acceleration
      acc_lim_theta: 0.8  # Controlled turning acceleration

    progress_checker:
      plugin: "nav2_controller::SimpleProgressChecker"
      required_movement_radius: 0.5  # Increased for humanoid step size
      movement_time_allowance: 10.0

    goal_checker:
      plugin: "nav2_controller::SimpleGoalChecker"
      xy_goal_tolerance: 0.25    # Larger tolerance for humanoid feet
      yaw_goal_tolerance: 0.2    # Slightly relaxed angular tolerance
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
      footprint: "[[-0.3, -0.2], [-0.3, 0.2], [0.3, 0.2], [0.3, -0.2]]"  # Larger footprint for humanoid
      footprint_padding: 0.01
      resolution: 0.05  # Higher resolution for step planning
      robot_radius: 0.30
      plugins: ["voxel_layer", "inflation_layer"]

      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0  # Higher inflation for humanoid safety
        inflation_radius: 0.55    # Larger inflation for humanoid step size
        inflate_unknown: false
        inflate_around_unknown: true

      voxel_layer:
        plugin: "nav2_costmap_2d::VoxelLayer"
        enabled: true
        publish_voxel_map: true
        origin_z: 0.0
        z_resolution: 0.2      # Higher resolution for humanoid height
        z_voxels: 10           # Enough voxels for humanoid body
        max_obstacle_height: 2.0  # Account for humanoid height
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
      footprint: "[[-0.3, -0.2], [-0.3, 0.2], [0.3, 0.2], [0.3, -0.2]]"
      footprint_padding: 0.01
      resolution: 0.1      # Reasonable resolution for humanoid navigation
      robot_radius: 0.30
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
        inflation_radius: 0.60  # Larger inflation for humanoid safety margin
        inflate_unknown: false