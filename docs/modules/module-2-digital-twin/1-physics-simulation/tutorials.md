# Hands-On Tutorials: Gazebo Physics Simulation

This section provides step-by-step tutorials to help you implement physics simulation concepts in Gazebo.

## Tutorial 1: Setting Up Your First Physics Simulation

### Objective
Create a basic physics simulation with a simple robot model in Gazebo.

### Prerequisites
- Gazebo installed and running
- Basic understanding of SDF/URDF format
- Text editor for creating model files

### Step 1: Create a Basic Robot Model
Create a file called `simple_robot.sdf`:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <model name="simple_robot">
    <link name="chassis">
      <pose>0 0 0.1 0 0 0</pose>
      <inertial>
        <mass>1.0</mass>
        <inertia>
          <ixx>0.01</ixx>
          <ixy>0.0</ixy>
          <ixz>0.0</ixz>
          <iyy>0.01</iyy>
          <iyz>0.0</iyz>
          <izz>0.01</izz>
        </inertia>
      </inertial>
      <visual name="visual">
        <geometry>
          <box size="0.5 0.3 0.2"/>
        </geometry>
      </visual>
      <collision name="collision">
        <geometry>
          <box size="0.5 0.3 0.2"/>
        </geometry>
      </collision>
    </link>
  </model>
</sdf>
```

### Step 2: Create a World File
Create a file called `physics_world.world`:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <world name="physics_world">
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
    </physics>

    <include>
      <uri>model://ground_plane</uri>
    </include>

    <include>
      <uri>model://sun</uri>
    </include>

    <model name="simple_robot">
      <include>
        <uri>file://path/to/simple_robot.sdf</uri>
      </include>
    </model>
  </world>
</sdf>
```

### Step 3: Run the Simulation
```bash
# Launch Gazebo with your world file
gazebo physics_world.world
```

### Step 4: Observe Physics Behavior
- The robot should fall to the ground due to gravity
- It should come to rest on the ground plane
- Try to manually move the robot in the GUI to see collision response

## Tutorial 2: Adjusting Gravity Settings

### Objective
Learn how to modify gravity parameters and observe their effects.

### Step 1: Modify Gravity in World File
Update your `physics_world.world` file to change gravity:

```xml
<world name="physics_world">
  <!-- Try lunar gravity -->
  <gravity>0 0 -1.62</gravity>

  <!-- Or zero gravity -->
  <!-- <gravity>0 0 0</gravity> -->

  <!-- Or high gravity -->
  <!-- <gravity>0 0 -20</gravity> -->

  <!-- Physics engine configuration -->
  <physics type="ode">
    <max_step_size>0.001</max_step_size>
    <real_time_factor>1.0</real_time_factor>
    <real_time_update_rate>1000</real_time_update_rate>
  </physics>

  <!-- Include other elements -->
</world>
```

### Step 2: Run and Compare
1. Run the simulation with Earth gravity (default: -9.81)
2. Record the robot's fall time and behavior
3. Change to lunar gravity (-1.62) and run again
4. Compare the differences in motion
5. Try zero gravity (0 0 0) and observe floating behavior

### Step 3: Create a Gravity Comparison Tool
Create a world with multiple identical robots under different gravity conditions:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <world name="gravity_comparison">
    <!-- Earth robot -->
    <model name="earth_robot">
      <pose>-2 0 2 0 0 0</pose>
      <include>
        <uri>model://simple_robot</uri>
      </include>
    </model>

    <!-- Lunar robot -->
    <model name="lunar_robot">
      <pose>0 0 2 0 0 0</pose>
      <include>
        <uri>model://simple_robot</uri>
      </include>
    </model>

    <!-- Zero gravity robot -->
    <model name="space_robot">
      <pose>2 0 2 0 0 0</pose>
      <include>
        <uri>model://simple_robot</uri>
      </include>
    </model>
  </world>
</sdf>
```

## Tutorial 3: Collision Detection and Response

### Objective
Configure collision properties and observe different collision behaviors.

### Step 1: Create Models with Different Collision Properties
Create `bouncy_sphere.sdf`:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <model name="bouncy_sphere">
    <link name="sphere">
      <inertial>
        <mass>0.5</mass>
        <inertia>
          <ixx>0.001</ixx>
          <ixy>0.0</ixy>
          <ixz>0.0</ixz>
          <iyy>0.001</iyy>
          <iyz>0.0</iyz>
          <izz>0.001</izz>
        </inertia>
      </inertial>
      <visual name="visual">
        <geometry>
          <sphere radius="0.1"/>
        </geometry>
        <material>
          <ambient>1 0 0 1</ambient>
          <diffuse>1 0 0 1</diffuse>
        </material>
      </visual>
      <collision name="collision">
        <geometry>
          <sphere radius="0.1"/>
        </geometry>
        <surface>
          <bounce>
            <restitution_coefficient>0.8</restitution_coefficient>
            <threshold>100000</threshold>
          </bounce>
        </surface>
      </collision>
    </link>
  </model>
</sdf>
```

Create `sticky_sphere.sdf`:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <model name="sticky_sphere">
    <link name="sphere">
      <inertial>
        <mass>0.5</mass>
        <inertia>
          <ixx>0.001</ixx>
          <ixy>0.0</ixy>
          <ixz>0.0</ixz>
          <iyy>0.001</iyy>
          <iyz>0.0</iyz>
          <izz>0.001</izz>
        </inertia>
      </inertial>
      <visual name="visual">
        <geometry>
          <sphere radius="0.1"/>
        </geometry>
        <material>
          <ambient>0 0 1 1</ambient>
          <diffuse>0 0 1 1</diffuse>
        </material>
      </visual>
      <collision name="collision">
        <geometry>
          <sphere radius="0.1"/>
        </geometry>
        <surface>
          <friction>
            <ode>
              <mu>10.0</mu>
              <mu2>10.0</mu2>
            </ode>
          </friction>
          <bounce>
            <restitution_coefficient>0.01</restitution_coefficient>
          </bounce>
        </surface>
      </collision>
    </link>
  </model>
</sdf>
```

### Step 2: Create a Collision Test World
Create `collision_test.world`:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <world name="collision_test">
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
    </physics>

    <include>
      <uri>model://ground_plane</uri>
    </include>

    <include>
      <uri>model://sun</uri>
    </include>

    <!-- Place spheres at different heights -->
    <include>
      <uri>model://bouncy_sphere</uri>
      <pose>0 0 2 0 0 0</pose>
    </include>

    <include>
      <uri>model://sticky_sphere</uri>
      <pose>0.5 0 2 0 0 0</pose>
    </include>

    <!-- Add some obstacles -->
    <model name="wall">
      <link name="wall_link">
        <visual name="visual">
          <geometry>
            <box size="0.1 2.0 1.0"/>
          </geometry>
          <material>
            <ambient>0.5 0.5 0.5 1</ambient>
          </material>
        </visual>
        <collision name="collision">
          <geometry>
            <box size="0.1 2.0 1.0"/>
          </geometry>
        </collision>
        <pose>1.5 0 0.5 0 0 0</pose>
      </link>
    </model>
  </world>
</sdf>
```

### Step 3: Run and Observe
1. Launch the collision test world
2. Observe how the bouncy sphere behaves differently from the sticky sphere
3. Watch how they interact with the wall obstacle
4. Try changing parameters and rerunning

## Tutorial 4: Dynamics and Inertial Properties

### Objective
Understand how inertial properties affect robot dynamics.

### Step 1: Create Robots with Different Mass Distributions
Create `light_robot.sdf`:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <model name="light_robot">
    <link name="body">
      <inertial>
        <mass>0.1</mass>  <!-- Very light -->
        <inertia>
          <ixx>0.001</ixx>
          <ixy>0.0</ixy>
          <ixz>0.0</ixz>
          <iyy>0.001</iyy>
          <iyz>0.0</iyz>
          <izz>0.001</izz>
        </inertia>
      </inertial>
      <visual name="visual">
        <geometry>
          <cylinder radius="0.1" length="0.2"/>
        </geometry>
        <material>
          <ambient>0 1 0 1</ambient>
        </material>
      </visual>
      <collision name="collision">
        <geometry>
          <cylinder radius="0.1" length="0.2"/>
        </geometry>
      </collision>
    </link>
  </model>
</sdf>
```

Create `heavy_robot.sdf`:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <model name="heavy_robot">
    <link name="body">
      <inertial>
        <mass>10.0</mass>  <!-- Very heavy -->
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
          <cylinder radius="0.1" length="0.2"/>
        </geometry>
        <material>
          <ambient>1 1 0 1</ambient>
        </material>
      </visual>
      <collision name="collision">
        <geometry>
          <cylinder radius="0.1" length="0.2"/>
        </geometry>
      </collision>
    </link>
  </model>
</sdf>
```

### Step 2: Create a Dynamics Comparison World
Create `dynamics_comparison.world`:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <world name="dynamics_comparison">
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
    </physics>

    <include>
      <uri>model://ground_plane</uri>
    </include>

    <include>
      <uri>model://sun</uri>
    </include>

    <!-- Place robots with different masses -->
    <include>
      <uri>model://light_robot</uri>
      <pose>-1 0 2 0 0 0</pose>
    </include>

    <include>
      <uri>model://heavy_robot</uri>
      <pose>1 0 2 0 0 0</pose>
    </include>

    <!-- Add a gentle force source (optional) -->
    <model name="pusher">
      <link name="pusher_link">
        <visual name="visual">
          <geometry>
            <box size="0.05 0.05 0.05"/>
          </geometry>
        </visual>
        <static>true</static>
      </link>
      <pose>0 0.5 0.05 0 0 0</pose>
    </model>
  </world>
</sdf>
```

### Step 3: Run and Analyze
1. Launch the dynamics comparison world
2. Observe how differently massed robots fall and settle
3. Use Gazebo's GUI to apply forces and see different responses
4. Record how mass affects acceleration and stability

## Tutorial 5: Complete Physics System Integration

### Objective
Combine all physics concepts into a complete humanoid robot simulation.

### Step 1: Create a Simple Humanoid Model
Create `simple_humanoid.sdf`:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <model name="simple_humanoid">
    <!-- Pelvis/Body -->
    <link name="pelvis">
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
          <box size="0.2 0.15 0.25"/>
        </geometry>
        <material>
          <ambient>0.8 0.8 0.8 1</ambient>
        </material>
      </visual>
      <collision name="collision">
        <geometry>
          <box size="0.2 0.15 0.25"/>
        </geometry>
      </collision>
    </link>

    <!-- Head -->
    <link name="head">
      <inertial>
        <mass>1.0</mass>
        <inertia>
          <ixx>0.002</ixx>
          <ixy>0.0</ixy>
          <ixz>0.0</ixz>
          <iyy>0.002</iyy>
          <iyz>0.0</iyz>
          <izz>0.002</izz>
        </inertia>
      </inertial>
      <visual name="visual">
        <geometry>
          <sphere radius="0.1"/>
        </geometry>
        <material>
          <ambient>1 1 1 1</ambient>
        </material>
      </visual>
      <collision name="collision">
        <geometry>
          <sphere radius="0.1"/>
        </geometry>
      </collision>
    </link>

    <!-- Joint connecting pelvis and head -->
    <joint name="neck_joint" type="revolute">
      <parent>pelvis</parent>
      <child>head</child>
      <axis>
        <xyz>0 0 1</xyz>
        <limit>
          <lower>-0.5</lower>
          <upper>0.5</upper>
          <effort>10</effort>
          <velocity>1.0</velocity>
        </limit>
        <dynamics>
          <damping>0.5</damping>
          <friction>0.1</friction>
        </dynamics>
      </axis>
      <pose>0 0 0.2 0 0 0</pose>
    </joint>
  </model>
</sdf>
```

### Step 2: Create a Complete Physics World
Create `humanoid_physics.world`:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <world name="humanoid_physics">
    <!-- Custom gravity -->
    <gravity>0 0 -9.81</gravity>

    <!-- Physics engine with optimized parameters -->
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
      <ode>
        <solver>
          <type>quick</type>
          <iters>20</iters>
          <sor>1.3</sor>
        </solver>
        <constraints>
          <cfm>1e-5</cfm>
          <erp>0.2</erp>
          <contact_max_correcting_vel>100</contact_max_correcting_vel>
          <contact_surface_layer>0.001</contact_surface_layer>
        </constraints>
      </ode>
    </physics>

    <include>
      <uri>model://ground_plane</uri>
    </include>

    <include>
      <uri>model://sun</uri>
    </include>

    <!-- Add the humanoid model -->
    <include>
      <uri>model://simple_humanoid</uri>
    </include>
  </world>
</sdf>
```

### Step 3: Run and Experiment
1. Launch the complete humanoid simulation
2. Observe the physics behavior of the multi-link system
3. Try applying external forces using the GUI
4. Adjust parameters to see how they affect the entire system

## Troubleshooting Tips

### Common Issues and Solutions

1. **Model falls through the ground**:
   - Check collision geometries are properly defined
   - Verify the ground plane model is included
   - Adjust contact parameters in physics engine

2. **Model vibrates or oscillates**:
   - Increase damping values in joint dynamics
   - Reduce time step size
   - Check mass values are realistic

3. **Simulation runs slowly**:
   - Simplify collision geometries
   - Increase time step size (reduces accuracy)
   - Reduce solver iterations

4. **Model behaves unrealistically**:
   - Verify inertial properties are physically plausible
   - Check center of mass alignment
   - Validate joint limits and dynamics

## Assessment Questions

1. How did changing gravity affect the behavior of your robot models?
2. What differences did you observe between high and low friction surfaces?
3. How do mass and inertia affect the dynamic behavior of multi-link systems?
4. What parameters had the most significant impact on simulation stability?

## Next Steps

After completing these tutorials, you should have a solid understanding of physics simulation in Gazebo. The next step is to explore how these physics behaviors can be visualized and enhanced in high-fidelity environments using Unity, which will be covered in Chapter 2.