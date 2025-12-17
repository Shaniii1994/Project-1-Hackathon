# Physics Simulation Examples and Exercises

This section provides practical examples and hands-on exercises to reinforce your understanding of physics simulation concepts in Gazebo.

## Practical Examples

### Example 1: Simple Humanoid Model with Physics
Create a basic humanoid model with proper physics properties:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <model name="simple_humanoid">
    <!-- Base/Pelvis Link -->
    <link name="base_link">
      <inertial>
        <mass>10.0</mass>
        <inertia>
          <ixx>0.1</ixx>
          <ixy>0.0</ixy>
          <ixz>0.0</ixz>
          <iyy>0.1</iyy>
          <iyz>0.0</iyz>
          <izz>0.1</izz>
        </inertia>
      </inertial>
      <visual name="visual">
        <geometry>
          <box size="0.3 0.2 0.3"/>
        </geometry>
      </visual>
      <collision name="collision">
        <geometry>
          <box size="0.3 0.2 0.3"/>
        </geometry>
      </collision>
    </link>

    <!-- Torso -->
    <link name="torso">
      <inertial>
        <mass>5.0</mass>
        <inertia>
          <ixx>0.05</ixx>
          <ixy>0.0</ixy>
          <ixz>0.0</ixz>
          <iyy>0.05</iyy>
          <iyz>0.0</iyz>
          <izz>0.05</izz>
        </inertia>
      </inertial>
      <visual name="visual">
        <geometry>
          <box size="0.25 0.15 0.4"/>
        </geometry>
      </visual>
      <collision name="collision">
        <geometry>
          <box size="0.25 0.15 0.4"/>
        </geometry>
      </collision>
    </link>

    <!-- Joint connecting base to torso -->
    <joint name="base_torso_joint" type="revolute">
      <parent>base_link</parent>
      <child>torso</child>
      <axis>
        <xyz>0 0 1</xyz>
        <limit>
          <lower>-0.5</lower>
          <upper>0.5</upper>
          <effort>100</effort>
          <velocity>1.0</velocity>
        </limit>
        <dynamics>
          <damping>0.5</damping>
          <friction>0.1</friction>
        </dynamics>
      </axis>
      <origin xyz="0 0 0.25" rpy="0 0 0"/>
    </joint>
  </model>
</sdf>
```

### Example 2: Physics World Configuration
Create a world file with custom physics settings:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <world name="physics_example_world">
    <!-- Custom gravity -->
    <gravity>0 0 -9.81</gravity>

    <!-- Physics engine configuration -->
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
      <ode>
        <solver>
          <type>quick</type>
          <iters>10</iters>
          <sor>1.3</sor>
        </solver>
        <constraints>
          <cfm>0.0</cfm>
          <erp>0.2</erp>
          <contact_max_correcting_vel>100</contact_max_correcting_vel>
          <contact_surface_layer>0.001</contact_surface_layer>
        </constraints>
      </ode>
    </physics>

    <!-- Ground plane -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Lighting -->
    <include>
      <uri>model://sun</uri>
    </include>

    <!-- Your robot model -->
    <include>
      <uri>model://simple_humanoid</uri>
    </include>
  </world>
</sdf>
```

## Hands-On Exercises

### Exercise 1: Gravity Experimentation
**Objective**: Understand how different gravity values affect robot behavior.

**Steps**:
1. Create a simple humanoid model with basic joint controllers
2. Run the simulation with Earth gravity (0, 0, -9.81)
3. Record the robot's standing stability and any movement patterns
4. Change gravity to lunar value (0, 0, -1.62)
5. Run the same simulation and compare behaviors
6. Try zero gravity (0, 0, 0) and observe floating behavior
7. Document your observations about balance and movement in different gravity conditions

**Expected Learning**: How gravity affects robot balance, movement, and control strategies.

### Exercise 2: Collision Detection Tuning
**Objective**: Learn how to tune collision parameters for optimal performance and realism.

**Steps**:
1. Create a robot with multiple links and collision geometries
2. Set up an environment with various obstacles
3. Test with default collision parameters and note performance
4. Adjust friction values and observe changes in robot-environment interaction
5. Modify restitution coefficients and observe bouncing behaviors
6. Experiment with contact surface layer and correction velocity
7. Document the parameter combinations that provide the best balance of realism and performance

**Expected Learning**: How collision parameters affect simulation behavior and performance.

### Exercise 3: Dynamics Parameter Optimization
**Objective**: Understand the relationship between inertial properties and robot dynamics.

**Steps**:
1. Create a 3-link robot arm with different mass distributions
2. Set initial inertial parameters and run simulation
3. Measure the time it takes for each link to move to a target position
4. Adjust mass and inertia values for one link at a time
5. Record how changes affect the dynamics of connected links
6. Try to optimize for fastest movement while maintaining stability
7. Document the relationship between inertial properties and dynamic behavior

**Expected Learning**: How mass distribution and inertial properties affect robot dynamics.

### Exercise 4: Balance Control Challenge
**Objective**: Implement basic balance control in a physics simulation.

**Steps**:
1. Create a simple bipedal robot model
2. Implement a basic controller that adjusts joint angles based on center of mass
3. Test the robot's ability to stand upright with default physics parameters
4. Apply external forces to disturb the balance
5. Adjust controller parameters to improve balance recovery
6. Test with different gravity values to see how control must adapt
7. Document the control strategies that work best under different conditions

**Expected Learning**: How dynamics simulation interacts with control systems.

## Troubleshooting Common Physics Issues

### Issue 1: Robot Flickering or Vibrating
**Symptoms**: Robot parts oscillate rapidly or appear unstable
**Solutions**:
- Increase damping values in joint dynamics
- Reduce time step size in physics configuration
- Check mass and inertia values for realistic ranges
- Verify that collision geometries match visual geometries

### Issue 2: Robot Falling Through Ground
**Symptoms**: Robot passes through the ground plane or other static objects
**Solutions**:
- Verify collision geometries are properly defined
- Check contact parameters in physics engine
- Increase contact surface layer value
- Ensure adequate simulation update rates

### Issue 3: Performance Degradation
**Symptoms**: Simulation runs slowly or becomes unstable
**Solutions**:
- Simplify collision geometries to basic shapes
- Increase time step size (reduces accuracy)
- Reduce the number of contacts in the simulation
- Adjust solver parameters for performance

## Assessment and Validation

### Self-Assessment Questions
1. How did changing gravity values affect your robot's behavior in Exercise 1?
2. Which collision parameters had the most significant impact on simulation realism in Exercise 2?
3. How did mass distribution affect robot dynamics in Exercise 3?
4. What control strategies were most effective for balance in Exercise 4?

### Validation Checklist
- [ ] Robot behaves realistically under Earth gravity
- [ ] Collision detection properly prevents interpenetration
- [ ] Dynamic responses match expected physical behavior
- [ ] Simulation runs stably without excessive vibration
- [ ] Control systems appropriately respond to dynamic feedback

## Extension Activities

### Advanced Exercise: Multi-Physics Simulation
Combine physics simulation with sensor simulation:
1. Add IMU sensors to your robot model
2. Configure the IMU to report realistic data based on physics simulation
3. Use sensor data to improve balance control
4. Compare control performance with and without sensor feedback

### Research Project: Comparative Analysis
Compare different physics engines (ODE, Bullet, SimBody) with your robot model:
1. Run the same simulation with different physics engines
2. Compare stability, performance, and accuracy
3. Document the trade-offs between different engines
4. Recommend the best engine for your specific application