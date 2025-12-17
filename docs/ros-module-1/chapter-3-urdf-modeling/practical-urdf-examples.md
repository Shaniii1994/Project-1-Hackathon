---
sidebar_position: 16
---

# Practical URDF Examples and Code Snippets

## Introduction

This section provides complete, working URDF examples that demonstrate practical humanoid robot modeling techniques. Each example is designed to be educational and applicable to real-world robotics projects.

## Example 1: Simple Single Link Robot

Let's start with the most basic URDF to understand the structure:

```xml
<?xml version="1.0"?>
<robot name="simple_robot">
  <!-- Base link - this is the reference frame for the entire robot -->
  <link name="base_link">
    <inertial>
      <!-- Physical properties for simulation -->
      <mass value="1.0"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
    <visual>
      <!-- How the link appears visually -->
      <origin xyz="0 0 0"/>
      <geometry>
        <box size="0.2 0.2 0.2"/>
      </geometry>
      <material name="gray">
        <color rgba="0.5 0.5 0.5 1"/>
      </material>
    </visual>
    <collision>
      <!-- Geometry used for collision detection -->
      <origin xyz="0 0 0"/>
      <geometry>
        <box size="0.2 0.2 0.2"/>
      </geometry>
    </collision>
  </link>
</robot>
```

## Example 2: Robot with Joint

This example shows how to connect two links with a joint:

```xml
<?xml version="1.0"?>
<robot name="two_link_robot">
  <!-- Materials -->
  <material name="blue">
    <color rgba="0 0 1 1"/>
  </material>
  <material name="red">
    <color rgba="1 0 0 1"/>
  </material>

  <!-- Base link -->
  <link name="base_link">
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0"/>
      <geometry>
        <cylinder radius="0.1" length="0.1"/>
      </geometry>
      <material name="blue"/>
    </visual>
  </link>

  <!-- Second link -->
  <link name="second_link">
    <inertial>
      <mass value="0.5"/>
      <origin xyz="0 0 -0.1"/>
      <inertia ixx="0.05" ixy="0" ixz="0" iyy="0.05" iyz="0" izz="0.02"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <box size="0.05 0.05 0.2"/>
      </geometry>
      <material name="red"/>
    </visual>
  </link>

  <!-- Joint connecting the two links -->
  <joint name="joint_1" type="revolute">
    <parent link="base_link"/>
    <child link="second_link"/>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>  <!-- Rotation around Y-axis -->
    <limit lower="-1.57" upper="1.57" effort="10" velocity="1"/>
  </joint>
</robot>
```

## Example 3: Simple Humanoid Torso

A basic torso with head attachment:

```xml
<?xml version="1.0"?>
<robot name="simple_torso">
  <!-- Materials -->
  <material name="white">
    <color rgba="1 1 1 1"/>
  </material>
  <material name="gray">
    <color rgba="0.5 0.5 0.5 1"/>
  </material>

  <!-- Main torso body -->
  <link name="torso">
    <inertial>
      <mass value="5.0"/>
      <origin xyz="0 0 0.25"/>
      <inertia ixx="0.2" ixy="0" ixz="0" iyy="0.2" iyz="0" izz="0.1"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0.25"/>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
      <material name="white"/>
    </visual>
    <collision>
      <origin xyz="0 0 0.25"/>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
    </collision>
  </link>

  <!-- Head -->
  <link name="head">
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.01"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0"/>
      <geometry>
        <sphere radius="0.08"/>
      </geometry>
      <material name="gray"/>
    </visual>
    <collision>
      <origin xyz="0 0 0"/>
      <geometry>
        <sphere radius="0.08"/>
      </geometry>
    </collision>
  </link>

  <!-- Neck joint connecting torso and head -->
  <joint name="neck_joint" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0 0 0.5"/>  <!-- Position head on top of torso -->
    <axis xyz="0 1 0"/>  <!-- Y-axis for head nodding -->
    <limit lower="-0.5" upper="0.5" effort="5" velocity="0.5"/>
  </joint>
</robot>
```

## Example 4: Complete Simple Humanoid

A more complete humanoid with arms and legs:

```xml
<?xml version="1.0"?>
<robot name="complete_humanoid">
  <!-- Materials -->
  <material name="blue">
    <color rgba="0 0 1 1"/>
  </material>
  <material name="red">
    <color rgba="1 0 0 1"/>
  </material>
  <material name="green">
    <color rgba="0 1 0 1"/>
  </material>
  <material name="white">
    <color rgba="1 1 1 1"/>
  </material>
  <material name="gray">
    <color rgba="0.5 0.5 0.5 1"/>
  </material>

  <!-- Main body (torso) -->
  <link name="base_link">
    <inertial>
      <mass value="8.0"/>
      <origin xyz="0 0 0.3"/>
      <inertia ixx="0.4" ixy="0" ixz="0" iyy="0.4" iyz="0" izz="0.2"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0.3"/>
      <geometry>
        <box size="0.25 0.15 0.6"/>
      </geometry>
      <material name="white"/>
    </visual>
    <collision>
      <origin xyz="0 0 0.3"/>
      <geometry>
        <box size="0.25 0.15 0.6"/>
      </geometry>
    </collision>
  </link>

  <!-- Head -->
  <link name="head">
    <inertial>
      <mass value="0.8"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.008" ixy="0" ixz="0" iyy="0.008" iyz="0" izz="0.008"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0"/>
      <geometry>
        <sphere radius="0.09"/>
      </geometry>
      <material name="gray"/>
    </visual>
    <collision>
      <origin xyz="0 0 0"/>
      <geometry>
        <sphere radius="0.09"/>
      </geometry>
    </collision>
  </link>

  <joint name="neck_joint" type="revolute">
    <parent link="base_link"/>
    <child link="head"/>
    <origin xyz="0 0 0.6"/>
    <axis xyz="0 1 0"/>
    <limit lower="-0.5" upper="0.5" effort="10" velocity="0.5"/>
  </joint>

  <!-- Left Arm -->
  <link name="left_upper_arm">
    <inertial>
      <mass value="1.2"/>
      <origin xyz="0 0 -0.1"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.004"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder radius="0.04" length="0.2"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder radius="0.04" length="0.2"/>
      </geometry>
    </collision>
  </link>

  <joint name="left_shoulder_joint" type="revolute">
    <parent link="base_link"/>
    <child link="left_upper_arm"/>
    <origin xyz="0.125 0 0.45"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" effort="20" velocity="1"/>
  </joint>

  <link name="left_lower_arm">
    <inertial>
      <mass value="0.8"/>
      <origin xyz="0 0 -0.09"/>
      <inertia ixx="0.005" ixy="0" ixz="0" iyy="0.005" iyz="0" izz="0.002"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.09"/>
      <geometry>
        <cylinder radius="0.03" length="0.18"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.09"/>
      <geometry>
        <cylinder radius="0.03" length="0.18"/>
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

  <!-- Right Arm (symmetric to left) -->
  <link name="right_upper_arm">
    <inertial>
      <mass value="1.2"/>
      <origin xyz="0 0 -0.1"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.004"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder radius="0.04" length="0.2"/>
      </geometry>
      <material name="red"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder radius="0.04" length="0.2"/>
      </geometry>
    </collision>
  </link>

  <joint name="right_shoulder_joint" type="revolute">
    <parent link="base_link"/>
    <child link="right_upper_arm"/>
    <origin xyz="-0.125 0 0.45"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" effort="20" velocity="1"/>
  </joint>

  <link name="right_lower_arm">
    <inertial>
      <mass value="0.8"/>
      <origin xyz="0 0 -0.09"/>
      <inertia ixx="0.005" ixy="0" ixz="0" iyy="0.005" iyz="0" izz="0.002"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.09"/>
      <geometry>
        <cylinder radius="0.03" length="0.18"/>
      </geometry>
      <material name="red"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.09"/>
      <geometry>
        <cylinder radius="0.03" length="0.18"/>
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
      <mass value="1.8"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.02" ixy="0" ixz="0" iyy="0.02" iyz="0" izz="0.007"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder radius="0.05" length="0.3"/>
      </geometry>
      <material name="green"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder radius="0.05" length="0.3"/>
      </geometry>
    </collision>
  </link>

  <joint name="left_hip_joint" type="revolute">
    <parent link="base_link"/>
    <child link="left_thigh"/>
    <origin xyz="0.07 0 0"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.0" upper="1.0" effort="30" velocity="1"/>
  </joint>

  <link name="left_shin">
    <inertial>
      <mass value="1.5"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.005"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder radius="0.045" length="0.3"/>
      </geometry>
      <material name="green"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder radius="0.045" length="0.3"/>
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

  <!-- Right Leg (symmetric to left) -->
  <link name="right_thigh">
    <inertial>
      <mass value="1.8"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.02" ixy="0" ixz="0" iyy="0.02" iyz="0" izz="0.007"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder radius="0.05" length="0.3"/>
      </geometry>
      <material name="green"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder radius="0.05" length="0.3"/>
      </geometry>
    </collision>
  </link>

  <joint name="right_hip_joint" type="revolute">
    <parent link="base_link"/>
    <child link="right_thigh"/>
    <origin xyz="-0.07 0 0"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.0" upper="1.0" effort="30" velocity="1"/>
  </joint>

  <link name="right_shin">
    <inertial>
      <mass value="1.5"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.005"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder radius="0.045" length="0.3"/>
      </geometry>
      <material name="green"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder radius="0.045" length="0.3"/>
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

## Example 5: URDF with Mesh Files

Using external mesh files for more realistic shapes:

```xml
<?xml version="1.0"?>
<robot name="mesh_humanoid">
  <!-- Using mesh files for more complex shapes -->

  <!-- Torso with mesh -->
  <link name="base_link">
    <inertial>
      <mass value="8.0"/>
      <origin xyz="0 0 0.3"/>
      <inertia ixx="0.4" ixy="0" ixz="0" iyy="0.4" iyz="0" izz="0.2"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0.3" rpy="0 0 0"/>
      <geometry>
        <!-- Using a mesh file from the robot_description package -->
        <mesh filename="package://robot_description/meshes/torso.dae" scale="1 1 1"/>
      </geometry>
    </visual>
    <collision>
      <origin xyz="0 0 0.3" rpy="0 0 0"/>
      <geometry>
        <!-- Using a simpler collision mesh for performance -->
        <mesh filename="package://robot_description/meshes/torso_collision.stl" scale="1 1 1"/>
      </geometry>
    </collision>
  </link>

  <!-- Head with mesh -->
  <link name="head">
    <inertial>
      <mass value="0.8"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.008" ixy="0" ixz="0" iyy="0.008" iyz="0" izz="0.008"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <geometry>
        <mesh filename="package://robot_description/meshes/head.dae" scale="1 1 1"/>
      </geometry>
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <geometry>
        <sphere radius="0.09"/>
      </geometry>
    </collision>
  </link>

  <joint name="neck_joint" type="revolute">
    <parent link="base_link"/>
    <child link="head"/>
    <origin xyz="0 0 0.6"/>
    <axis xyz="0 1 0"/>
    <limit lower="-0.5" upper="0.5" effort="10" velocity="0.5"/>
  </joint>
</robot>
```

## Example 6: URDF with Transmission and Gazebo Plugins

For simulation and control:

```xml
<?xml version="1.0"?>
<robot name="controlled_humanoid" xmlns:xacro="http://www.ros.org/wiki/xacro">
  <!-- Materials -->
  <material name="blue">
    <color rgba="0 0 1 1"/>
  </material>

  <!-- Base link -->
  <link name="base_link">
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0"/>
      <geometry>
        <box size="0.2 0.2 0.2"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <origin xyz="0 0 0"/>
      <geometry>
        <box size="0.2 0.2 0.2"/>
      </geometry>
    </collision>
  </link>

  <!-- Simple arm link -->
  <link name="arm_link">
    <inertial>
      <mass value="0.5"/>
      <origin xyz="0 0 -0.1"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.005"/>
    </inertial>
    <visual>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder radius="0.02" length="0.2"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <origin xyz="0 0 -0.1"/>
      <geometry>
        <cylinder radius="0.02" length="0.2"/>
      </geometry>
    </collision>
  </link>

  <!-- Joint -->
  <joint name="arm_joint" type="revolute">
    <parent link="base_link"/>
    <child link="arm_link"/>
    <origin xyz="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="1"/>
  </joint>

  <!-- Transmission for ros2_control -->
  <transmission name="arm_transmission">
    <type>transmission_interface/SimpleTransmission</type>
    <joint name="arm_joint">
      <hardwareInterface>position_controllers/JointPositionController</hardwareInterface>
    </joint>
    <actuator name="arm_motor">
      <mechanicalReduction>1</mechanicalReduction>
    </actuator>
  </transmission>

  <!-- Gazebo plugin for simulation -->
  <gazebo reference="arm_link">
    <material>Gazebo/Blue</material>
  </gazebo>

  <gazebo>
    <plugin name="joint_state_publisher" filename="libgazebo_ros_joint_state_publisher.so">
      <joint_name>arm_joint</joint_name>
    </plugin>
  </gazebo>
</robot>
```

## Loading and Validating URDF Files

### Python Script to Load and Validate URDF

```python
#!/usr/bin/env python3
"""
Script to load and validate URDF files
"""
import xml.etree.ElementTree as ET
import sys

def validate_urdf(urdf_file):
    """
    Basic URDF validation
    """
    try:
        # Parse XML
        tree = ET.parse(urdf_file)
        root = tree.getroot()

        # Check if it's a robot
        if root.tag != 'robot':
            print(f"ERROR: Root element is not 'robot', found '{root.tag}'")
            return False

        robot_name = root.get('name')
        if not robot_name:
            print("ERROR: Robot element missing 'name' attribute")
            return False

        print(f"Validated robot: {robot_name}")

        # Count links and joints
        links = root.findall('link')
        joints = root.findall('joint')

        print(f"Found {len(links)} links and {len(joints)} joints")

        # Basic joint validation
        for joint in joints:
            joint_name = joint.get('name')
            joint_type = joint.get('type')
            parent = joint.find('parent')
            child = joint.find('child')

            if not all([joint_name, joint_type, parent, child]):
                print(f"ERROR: Joint {joint_name} missing required elements")
                return False

            if joint_type not in ['revolute', 'continuous', 'prismatic', 'fixed', 'floating', 'planar']:
                print(f"WARNING: Joint {joint_name} has unknown type: {joint_type}")

        print("URDF validation passed!")
        return True

    except ET.ParseError as e:
        print(f"XML Parse Error: {e}")
        return False
    except FileNotFoundError:
        print(f"File not found: {urdf_file}")
        return False
    except Exception as e:
        print(f"Error validating URDF: {e}")
        return False

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 validate_urdf.py <urdf_file>")
        sys.exit(1)

    urdf_file = sys.argv[1]
    success = validate_urdf(urdf_file)

    if success:
        print(f"{urdf_file} is valid!")
    else:
        print(f"{urdf_file} has issues!")
        sys.exit(1)

if __name__ == '__main__':
    main()
```

## Working with URDF in ROS 2

### Launch File for Robot State Publisher

```xml
<?xml version="1.0"?>
<launch>
  <!-- Declare arguments -->
  <arg name="model" default="simple_humanoid.urdf"/>
  <arg name="use_sim_time" default="false"/>

  <!-- Load URDF from file -->
  <param from="$(find-pkg-share your_robot_description)/urdf/$(var model)"/>

  <!-- Robot State Publisher Node -->
  <node pkg="robot_state_publisher" exec="robot_state_publisher" name="robot_state_publisher">
    <param name="use_sim_time" value="$(var use_sim_time)"/>
  </node>

  <!-- Joint State Publisher (for GUI control) -->
  <node pkg="joint_state_publisher_gui" exec="joint_state_publisher_gui" name="joint_state_publisher_gui">
    <param name="use_sim_time" value="$(var use_sim_time)"/>
  </node>
</launch>
```

## Best Practices for URDF Development

### 1. File Organization
```
robot_description/
├── urdf/
│   ├── robot.urdf
│   └── components/
│       ├── arm.urdf.xacro
│       └── leg.urdf.xacro
├── meshes/
│   ├── parts/
│   └── collision/
└── launch/
    └── display.launch.py
```

### 2. Xacro for Complex Models
For complex robots, use Xacro (XML Macros) to avoid repetition:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="xacro_humanoid">

  <!-- Define properties -->
  <xacro:property name="M_PI" value="3.1415926535897931" />
  <xacro:property name="arm_length" value="0.2" />
  <xacro:property name="arm_radius" value="0.02" />

  <!-- Macro for creating an arm -->
  <xacro:macro name="arm" params="side parent *origin">
    <link name="${side}_upper_arm">
      <inertial>
        <mass value="1.0"/>
        <origin xyz="0 0 -${arm_length/2}"/>
        <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.005"/>
      </inertial>
      <visual>
        <origin xyz="0 0 -${arm_length/2}"/>
        <geometry>
          <cylinder radius="${arm_radius}" length="${arm_length}"/>
        </geometry>
      </visual>
    </link>

    <joint name="${side}_shoulder_joint" type="revolute">
      <parent link="${parent}"/>
      <child link="${side}_upper_arm"/>
      <xacro:insert_block name="origin"/>
      <axis xyz="1 0 0"/>
      <limit lower="${-M_PI/2}" upper="${M_PI/2}" effort="20" velocity="1"/>
    </joint>
  </xacro:macro>

  <!-- Base link -->
  <link name="base_link">
    <inertial>
      <mass value="5.0"/>
      <origin xyz="0 0 0.25"/>
      <inertia ixx="0.2" ixy="0" ixz="0" iyy="0.2" iyz="0" izz="0.1"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0.25"/>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
    </visual>
  </link>

  <!-- Use the macro to create both arms -->
  <xacro:arm side="left" parent="base_link">
    <origin xyz="0.15 0 0.4" rpy="0 0 0"/>
  </xacro:arm>

  <xacro:arm side="right" parent="base_link">
    <origin xyz="-0.15 0 0.4" rpy="0 0 0"/>
  </xacro:arm>
</robot>
```

## Common URDF Issues and Solutions

### Issue 1: Self-Collision
**Problem**: Robot links collide with each other during movement
**Solution**: Adjust joint limits or add safety controllers

### Issue 2: Mass Properties
**Problem**: Robot is unstable in simulation
**Solution**: Ensure realistic mass distribution and center of mass

### Issue 3: Joint Limits
**Problem**: Robot moves beyond physical limits
**Solution**: Set appropriate joint limits based on real hardware

## Summary

These practical examples demonstrate:

- Basic URDF structure and components
- How to create kinematic chains
- Proper use of materials and colors
- Integration with simulation and control systems
- Best practices for organization and validation

The examples progress from simple single links to complex humanoid models, showing how to build up complexity systematically while maintaining proper URDF structure and validation.