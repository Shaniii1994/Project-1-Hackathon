---
sidebar_position: 14
---

# Links, Joints, and Kinematics in URDF

## Introduction to URDF

**URDF (Unified Robot Description Format)** is an XML-based format used in ROS to describe robot models. It defines the physical and visual properties of a robot, including its links (rigid parts), joints (connections between links), and kinematic chains.

## Core URDF Components

### Links

A **link** represents a rigid part of the robot. Each link has:
- Physical properties (mass, inertia)
- Visual properties (shape, color, mesh)
- Collision properties (collision geometry)

#### Basic Link Structure

```xml
<link name="link_name">
  <inertial>
    <mass value="1.0"/>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
  </inertial>
  <visual>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <box size="0.1 0.1 0.1"/>
    </geometry>
    <material name="blue">
      <color rgba="0 0 1 1"/>
    </material>
  </visual>
  <collision>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <box size="0.1 0.1 0.1"/>
    </geometry>
  </collision>
</link>
```

### Link Properties Explained

- **`<inertial>`**: Physical properties for dynamics simulation
  - `mass`: Mass of the link in kg
  - `origin`: Center of mass location and orientation
  - `inertia`: Inertia tensor values (ixx, ixy, ixz, iyy, iyz, izz)

- **`<visual>`**: How the link appears visually
  - `origin`: Visual offset from link frame
  - `geometry`: Shape definition (box, cylinder, sphere, mesh)
  - `material`: Color and appearance

- **`<collision>`**: Collision detection geometry
  - Similar to visual but optimized for collision detection

### Available Geometries

```xml
<!-- Box geometry -->
<geometry>
  <box size="0.1 0.2 0.3"/>
</geometry>

<!-- Cylinder geometry -->
<geometry>
  <cylinder radius="0.05" length="0.2"/>
</geometry>

<!-- Sphere geometry -->
<geometry>
  <sphere radius="0.05"/>
</geometry>

<!-- Mesh geometry -->
<geometry>
  <mesh filename="package://robot_description/meshes/part.stl"/>
</geometry>
```

## Joints

A **joint** connects two links and defines how they can move relative to each other. Joints have types that determine their degrees of freedom.

### Joint Structure

```xml
<joint name="joint_name" type="joint_type">
  <parent link="parent_link_name"/>
  <child link="child_link_name"/>
  <origin xyz="0.1 0 0" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>
  <limit lower="-1.57" upper="1.57" effort="100" velocity="1"/>
</joint>
```

### Joint Types

#### 1. Fixed Joint
- No degrees of freedom
- Links are rigidly connected
- Used for attaching sensors or fixed parts

```xml
<joint name="fixed_joint" type="fixed">
  <parent link="base_link"/>
  <child link="sensor_link"/>
  <origin xyz="0.1 0 0.1" rpy="0 0 0"/>
</joint>
```

#### 2. Revolute Joint
- 1 rotational degree of freedom
- Limited by angle range
- Most common for rotating joints (elbows, knees, wrists)

```xml
<joint name="hinge_joint" type="revolute">
  <parent link="upper_arm"/>
  <child link="lower_arm"/>
  <origin xyz="0 0 -0.15" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-2.0" upper="2.0" effort="50" velocity="2"/>
</joint>
```

#### 3. Continuous Joint
- 1 rotational degree of freedom
- Unlimited rotation range
- Used for wheels, rotating sensors

```xml
<joint name="continuous_joint" type="continuous">
  <parent link="base_link"/>
  <child link="wheel"/>
  <origin xyz="0.1 0 -0.1" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
</joint>
```

#### 4. Prismatic Joint
- 1 translational degree of freedom
- Linear motion along an axis
- Used for sliding mechanisms

```xml
<joint name="slider_joint" type="prismatic">
  <parent link="base_link"/>
  <child link="slider"/>
  <origin xyz="0 0 0.1" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>
  <limit lower="0" upper="0.2" effort="100" velocity="0.5"/>
</joint>
```

#### 5. Floating Joint
- 6 degrees of freedom (3 translational, 3 rotational)
- Used for free-moving objects
- Rarely used in typical robot models

#### 6. Planar Joint
- 3 degrees of freedom (2 translational, 1 rotational)
- Motion constrained to a plane

### Joint Properties Explained

- **`parent/child`**: Links connected by the joint
- **`origin`**: Position and orientation of joint relative to parent
- **`axis`**: Axis of motion (for revolute/prismatic joints)
- **`limit`**: Motion constraints (lower, upper, effort, velocity)

## Kinematic Chains

A **kinematic chain** is a sequence of links connected by joints. It defines how motion propagates through the robot structure.

### Simple Kinematic Chain Example

```xml
<?xml version="1.0"?>
<robot name="simple_arm">
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.1"/>
      </geometry>
    </visual>
  </link>

  <!-- Upper arm -->
  <link name="upper_arm">
    <visual>
      <geometry>
        <cylinder radius="0.025" length="0.2"/>
      </geometry>
    </visual>
  </link>

  <!-- Lower arm -->
  <link name="lower_arm">
    <visual>
      <geometry>
        <cylinder radius="0.025" length="0.15"/>
      </geometry>
    </visual>
  </link>

  <!-- Joint connecting base to upper arm -->
  <joint name="shoulder_joint" type="revolute">
    <parent link="base_link"/>
    <child link="upper_arm"/>
    <origin xyz="0 0 0.05" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="1.57" effort="50" velocity="2"/>
  </joint>

  <!-- Joint connecting upper arm to lower arm -->
  <joint name="elbow_joint" type="revolute">
    <parent link="upper_arm"/>
    <child link="lower_arm"/>
    <origin xyz="0 0 -0.2" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="1.57" effort="50" velocity="2"/>
  </joint>
</robot>
```

## Coordinate Systems and Transformations

### URDF Coordinate Convention
- **X**: Forward (or right, depending on design)
- **Y**: Left (or forward, depending on design)
- **Z**: Up

### Origin Specification
The `origin` tag defines position (xyz) and orientation (rpy - roll, pitch, yaw) of a joint or link element relative to its parent's coordinate frame.

```xml
<!-- Position only -->
<origin xyz="0.1 0 0"/>

<!-- Orientation only -->
<origin rpy="0 0 1.57"/>

<!-- Both position and orientation -->
<origin xyz="0.1 0 0" rpy="0 0 1.57"/>
```

## Advanced Joint Concepts

### Joint Safety Controllers

```xml
<joint name="safe_joint" type="revolute">
  <parent link="base"/>
  <child link="arm"/>
  <origin xyz="0 0 0.1"/>
  <axis xyz="0 1 0"/>
  <limit lower="-2.0" upper="2.0" effort="50" velocity="2"/>
  <!-- Safety limits to prevent damage -->
  <safety_controller k_position="20" k_velocity="400" soft_lower_limit="-1.9" soft_upper_limit="1.9"/>
</joint>
```

### Joint Calibration

```xml
<joint name="calibrated_joint" type="revolute">
  <parent link="base"/>
  <child link="arm"/>
  <origin xyz="0 0 0.1"/>
  <axis xyz="0 1 0"/>
  <limit lower="-2.0" upper="2.0" effort="50" velocity="2"/>
  <!-- Calibration offset -->
  <calibration rising="0.1"/>
</joint>
```

### Mimic Joints

Mimic joints follow the motion of another joint with a scaling factor:

```xml
<joint name="mirror_joint" type="revolute">
  <parent link="base"/>
  <child link="mirror_arm"/>
  <origin xyz="0 0.1 0.1"/>
  <axis xyz="0 1 0"/>
  <limit lower="-1.57" upper="1.57" effort="50" velocity="2"/>
  <!-- This joint mimics the main_joint with a 1:1 ratio -->
  <mimic joint="main_joint" multiplier="1.0" offset="0.0"/>
</joint>
```

## URDF Best Practices

### 1. Meaningful Names
```xml
<!-- Good -->
<link name="left_upper_arm"/>
<joint name="left_elbow_pitch"/>

<!-- Avoid -->
<link name="link1"/>
<joint name="j1"/>
```

### 2. Consistent Coordinate Frames
- Define a clear base frame
- Maintain consistent orientation conventions
- Document coordinate frame relationships

### 3. Proper Inertial Properties
- Calculate realistic mass and inertia values
- Use CAD software to compute inertial properties
- Verify that center of mass is correctly positioned

### 4. Appropriate Joint Limits
- Set realistic motion limits based on physical constraints
- Consider safety margins in limit settings
- Account for cable management and collision avoidance

## Common URDF Validation

Before using a URDF model, validate it:

```bash
# Check XML syntax
xmllint --noout robot.urdf

# Use check_urdf tool (if available)
check_urdf robot.urdf
```

## Summary

URDF is the foundation for representing robots in ROS:

- **Links** define the rigid parts of the robot
- **Joints** define how parts connect and move relative to each other
- **Kinematic chains** describe the complete robot structure
- Proper coordinate systems and transformations are essential
- Best practices ensure robust and usable robot models

Understanding these concepts is crucial for creating accurate robot models that can be used for simulation, visualization, and control.