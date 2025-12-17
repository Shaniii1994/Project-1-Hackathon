---
sidebar_position: 15
---

# Humanoid Modeling with URDF

## Introduction to Humanoid Robots

A **humanoid robot** is a robot with a human-like body structure, typically featuring a head, torso, two arms, and two legs. Modeling humanoid robots in URDF requires careful attention to the kinematic structure that mimics human movement patterns.

## Humanoid Robot Anatomy in URDF

### Basic Humanoid Structure

A typical humanoid robot consists of these main components:
- **Torso**: The central body containing the main computer and power systems
- **Head**: Contains cameras, sensors, and sometimes a display
- **Arms**: Shoulders, upper arms, forearms, and hands
- **Legs**: Hips, thighs, shins, and feet

### Degrees of Freedom Considerations

Humanoid robots typically have 20-40+ degrees of freedom (DOF) to achieve human-like mobility:
- **Arms**: ~6-7 DOF each (shoulder: 3, elbow: 1, wrist: 2-3)
- **Legs**: ~6 DOF each (hip: 3, knee: 1, ankle: 2)
- **Head**: ~2-3 DOF (neck: 2-3)
- **Torso**: ~0-3 DOF (waist: 0-3)

## Complete Humanoid URDF Example

Here's a simplified but complete humanoid robot model:

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
  <!-- Material definitions -->
  <material name="black">
    <color rgba="0 0 0 1"/>
  </material>
  <material name="blue">
    <color rgba="0 0 1 1"/>
  </material>
  <material name="green">
    <color rgba="0 1 0 1"/>
  </material>
  <material name="grey">
    <color rgba="0.5 0.5 0.5 1"/>
  </material>
  <material name="orange">
    <color rgba="1 0.423529411765 0.0392156862745 1"/>
  </material>
  <material name="brown">
    <color rgba="0.870588235294 0.811764705882 0.764705882353 1"/>
  </material>
  <material name="red">
    <color rgba="1 0 0 1"/>
  </material>
  <material name="white">
    <color rgba="1 1 1 1"/>
  </material>

  <!-- Base link (torso) -->
  <link name="base_link">
    <inertial>
      <mass value="10.0"/>
      <origin xyz="0 0 0.3"/>
      <inertia ixx="0.5" ixy="0.0" ixz="0.0" iyy="0.5" iyz="0.0" izz="0.2"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0.3"/>
      <geometry>
        <box size="0.3 0.2 0.6"/>
      </geometry>
      <material name="white"/>
    </visual>
    <collision>
      <origin xyz="0 0 0.3"/>
      <geometry>
        <box size="0.3 0.2 0.6"/>
      </geometry>
    </collision>
  </link>

  <!-- Head -->
  <link name="head">
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.01"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0"/>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
      <material name="grey"/>
    </visual>
    <collision>
      <origin xyz="0 0 0"/>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
    </collision>
  </link>

  <joint name="head_joint" type="revolute">
    <parent link="base_link"/>
    <child link="head"/>
    <origin xyz="0 0 0.6"/>
    <axis xyz="0 1 0"/>
    <limit lower="-0.5" upper="0.5" effort="10" velocity="1"/>
  </joint>

  <!-- Left Arm -->
  <!-- Left Shoulder -->
  <link name="left_upper_arm">
    <inertial>
      <mass value="1.5"/>
      <origin xyz="0 0 -0.1"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.005"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder length="0.2" radius="0.05"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder length="0.2" radius="0.05"/>
      </geometry>
    </collision>
  </link>

  <joint name="left_shoulder_pitch" type="revolute">
    <parent link="base_link"/>
    <child link="left_upper_arm"/>
    <origin xyz="0.15 0 0.4"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" effort="20" velocity="1"/>
  </joint>

  <!-- Left Elbow -->
  <link name="left_lower_arm">
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 -0.1"/>
      <inertia ixx="0.005" ixy="0.0" ixz="0.0" iyy="0.005" iyz="0.0" izz="0.002"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder length="0.2" radius="0.04"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder length="0.2" radius="0.04"/>
      </geometry>
    </collision>
  </link>

  <joint name="left_elbow_joint" type="revolute">
    <parent link="left_upper_arm"/>
    <child link="left_lower_arm"/>
    <origin xyz="0 0 -0.2"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" effort="15" velocity="1"/>
  </joint>

  <!-- Right Arm (symmetrical to left) -->
  <link name="right_upper_arm">
    <inertial>
      <mass value="1.5"/>
      <origin xyz="0 0 -0.1"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.005"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder length="0.2" radius="0.05"/>
      </geometry>
      <material name="red"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder length="0.2" radius="0.05"/>
      </geometry>
    </collision>
  </link>

  <joint name="right_shoulder_pitch" type="revolute">
    <parent link="base_link"/>
    <child link="right_upper_arm"/>
    <origin xyz="-0.15 0 0.4"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" effort="20" velocity="1"/>
  </joint>

  <link name="right_lower_arm">
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 -0.1"/>
      <inertia ixx="0.005" ixy="0.0" ixz="0.0" iyy="0.005" iyz="0.0" izz="0.002"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder length="0.2" radius="0.04"/>
      </geometry>
      <material name="red"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder length="0.2" radius="0.04"/>
      </geometry>
    </collision>
  </link>

  <joint name="right_elbow_joint" type="revolute">
    <parent link="right_upper_arm"/>
    <child link="right_lower_arm"/>
    <origin xyz="0 0 -0.2"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" effort="15" velocity="1"/>
  </joint>

  <!-- Left Leg -->
  <link name="left_thigh">
    <inertial>
      <mass value="2.0"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.02" ixy="0.0" ixz="0.0" iyy="0.02" iyz="0.0" izz="0.008"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder length="0.3" radius="0.06"/>
      </geometry>
      <material name="green"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder length="0.3" radius="0.06"/>
      </geometry>
    </collision>
  </link>

  <joint name="left_hip_joint" type="revolute">
    <parent link="base_link"/>
    <child link="left_thigh"/>
    <origin xyz="0.075 0 0"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.0" upper="1.0" effort="30" velocity="1"/>
  </joint>

  <link name="left_shin">
    <inertial>
      <mass value="1.5"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.005"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder length="0.3" radius="0.05"/>
      </geometry>
      <material name="green"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder length="0.3" radius="0.05"/>
      </geometry>
    </collision>
  </link>

  <joint name="left_knee_joint" type="revolute">
    <parent link="left_thigh"/>
    <child link="left_shin"/>
    <origin xyz="0 0 -0.3"/>
    <axis xyz="1 0 0"/>
    <limit lower="0" upper="1.57" effort="25" velocity="1"/>
  </joint>

  <!-- Right Leg -->
  <link name="right_thigh">
    <inertial>
      <mass value="2.0"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.02" ixy="0.0" ixz="0.0" iyy="0.02" iyz="0.0" izz="0.008"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder length="0.3" radius="0.06"/>
      </geometry>
      <material name="orange"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder length="0.3" radius="0.06"/>
      </geometry>
    </collision>
  </link>

  <joint name="right_hip_joint" type="revolute">
    <parent link="base_link"/>
    <child link="right_thigh"/>
    <origin xyz="-0.075 0 0"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.0" upper="1.0" effort="30" velocity="1"/>
  </joint>

  <link name="right_shin">
    <inertial>
      <mass value="1.5"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.005"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder length="0.3" radius="0.05"/>
      </geometry>
      <material name="orange"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder length="0.3" radius="0.05"/>
      </geometry>
    </collision>
  </link>

  <joint name="right_knee_joint" type="revolute">
    <parent link="right_thigh"/>
    <child link="right_shin"/>
    <origin xyz="0 0 -0.3"/>
    <axis xyz="1 0 0"/>
    <limit lower="0" upper="1.57" effort="25" velocity="1"/>
  </joint>
</robot>
```

## Advanced Humanoid Features

### 1. Hand Modeling

For more complex humanoid robots, hands require multiple joints:

```xml
<!-- Left Hand - Simplified Example -->
<link name="left_hand">
  <inertial>
    <mass value="0.3"/>
    <origin xyz="0 0 -0.05"/>
    <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.0005"/>
  </inertial>
  <visual>
    <origin xyz="0 0 -0.05"/>
    <geometry>
      <box size="0.1 0.05 0.1"/>
    </geometry>
    <material name="grey"/>
  </visual>
</link>

<joint name="left_wrist_joint" type="revolute">
  <parent link="left_lower_arm"/>
  <child link="left_hand"/>
  <origin xyz="0 0 -0.2"/>
  <axis xyz="0 1 0"/>
  <limit lower="-0.78" upper="0.78" effort="5" velocity="1"/>
</joint>
```

### 2. Multi-DOF Joints

For more realistic movement, some joints might need multiple degrees of freedom:

```xml
<!-- Ball joint for shoulder (simplified as 3 single-DOF joints) -->
<joint name="left_shoulder_yaw" type="revolute">
  <parent link="base_link"/>
  <child link="left_clavicle"/>  <!-- Additional link for complexity -->
  <origin xyz="0.15 0 0.4"/>
  <axis xyz="0 1 0"/>
  <limit lower="-0.78" upper="0.78" effort="20" velocity="1"/>
</joint>

<joint name="left_shoulder_roll" type="revolute">
  <parent link="left_clavicle"/>
  <child link="left_upper_arm"/>
  <origin xyz="0 0 0"/>
  <axis xyz="0 0 1"/>
  <limit lower="-1.57" upper="1.57" effort="20" velocity="1"/>
</joint>
```

## Kinematic Considerations for Humanoid Robots

### 1. Center of Mass

For stable humanoid robots, the center of mass should be carefully calculated:

```xml
<!-- Torso with calculated center of mass -->
<link name="base_link">
  <inertial>
    <mass value="15.0"/>  <!-- Higher mass for stability -->
    <origin xyz="0 0 0.2"/>  <!-- Lower center of mass -->
    <inertia ixx="1.0" ixy="0.0" ixz="0.0" iyy="1.0" iyz="0.0" izz="0.5"/>
  </inertial>
  <!-- visual and collision elements -->
</link>
```

### 2. Foot Design for Stability

Humanoid feet should be designed for stability:

```xml
<link name="left_foot">
  <inertial>
    <mass value="0.5"/>
    <origin xyz="0.05 0 -0.02"/>  <!-- Center of mass forward for stability -->
    <inertia ixx="0.002" ixy="0.0" ixz="0.0" iyy="0.003" iyz="0.0" izz="0.004"/>
  </inertial>
  <visual>
    <origin xyz="0.05 0 -0.05"/>  <!-- Flat bottom for contact -->
    <geometry>
      <box size="0.15 0.08 0.1"/>  <!-- Wide foot for stability -->
    </geometry>
    <material name="black"/>
  </visual>
  <collision>
    <origin xyz="0.05 0 -0.05"/>
    <geometry>
      <box size="0.15 0.08 0.1"/>
    </geometry>
  </collision>
</link>
```

## URDF for Simulation vs Real Robots

### For Simulation
- Detailed collision geometry
- Accurate inertial properties
- Complex visual meshes

### For Real Robots
- Simplified collision models for real-time performance
- Conservative joint limits
- Safety margins in motion ranges

## Validation and Testing

### URDF Validation Tools

```bash
# Check URDF syntax
xmllint --noout robot.urdf

# Check kinematic structure
check_urdf robot.urdf

# Visualize in RViz
ros2 run rviz2 rviz2
```

### Common Issues and Solutions

1. **Self-Collision**: Ensure links don't collide with themselves when moving
2. **Mass Distribution**: Verify center of mass is realistic for stability
3. **Joint Limits**: Set appropriate limits to prevent damage
4. **Mesh Paths**: Ensure all mesh files are accessible

## Integration with ROS 2

Humanoid URDF models are typically used with:

- **Robot State Publisher**: Publishes TF transforms
- **Joint State Publisher**: Simulates joint positions
- **Controllers**: For actual robot control
- **Simulators**: Gazebo, Webots, etc.

```xml
<!-- Include robot state publisher configuration -->
<node pkg="robot_state_publisher" exec="robot_state_publisher" name="robot_state_publisher">
  <param name="robot_description" value="$(var robot_description)"/>
</node>
```

## Summary

Modeling humanoid robots in URDF requires careful attention to:

- **Anatomical accuracy**: Proper joint types and ranges of motion
- **Stability**: Center of mass and foot design considerations
- **Complexity balance**: Detailed enough for functionality but simple enough for performance
- **Safety**: Conservative joint limits and collision avoidance
- **Validation**: Proper testing and verification of the model

A well-designed humanoid URDF model serves as the foundation for simulation, control, and real-world deployment of humanoid robotic systems.