# Hands-On Tutorials: Unity Environment Setup

This section provides step-by-step tutorials to help you create and configure high-fidelity Unity environments for robotics education.

## Tutorial 1: Setting Up Your First Robotics Environment

### Objective
Create a basic robotics lab environment in Unity with proper lighting and materials.

### Prerequisites
- Unity installed (2020.3 LTS or newer recommended)
- Basic understanding of Unity interface
- A simple robot model (or cube as placeholder)

### Step 1: Create a New Unity Project
1. Open Unity Hub
2. Click "New Project"
3. Select the "3D (Built-in Render Pipeline)" template
4. Name your project "RoboticsEnvironment"
5. Choose a location and click "Create"

### Step 2: Set Up the Basic Environment
1. Delete the default "Main Camera" and "Directional Light"
2. Create a floor plane:
   - Right-click in Hierarchy → 3D Object → Plane
   - Rename to "Floor"
   - Set position to (0, 0, 0)
   - Scale to (2, 1, 2) for a larger floor

3. Create walls:
   - Right-click → 3D Object → Cube
   - Rename to "Wall_Left"
   - Set position to (-10, 1, 0)
   - Set scale to (1, 2, 20)
   - Duplicate and rename as "Wall_Right", "Wall_Front", "Wall_Back"
   - Position accordingly (Right: x=10, Front: z=-10, Back: z=10)

### Step 3: Add Materials to Surfaces
1. In the Project window, right-click → Create → Material
2. Name it "Floor_Material"
3. Select the material and change its color to light gray
4. Assign this material to the Floor object
5. Create another material for walls, name it "Wall_Material"
6. Change its color to white and assign to all walls

### Step 4: Set Up Proper Lighting
1. Right-click in Hierarchy → Light → Directional Light
2. Rename to "Main_Light"
3. Set rotation to (50, -30, 0) for realistic lighting
4. Adjust intensity to 1.0
5. Create a second light as fill light:
   - Right-click → Light → Directional Light
   - Rename to "Fill_Light"
   - Set rotation to (-50, 150, 0)
   - Set color to gray
   - Adjust intensity to 0.3

### Step 5: Add a Robot Model
1. Create a robot placeholder:
   - Right-click → 3D Object → Capsule
   - Rename to "Robot"
   - Set position to (0, 1, 0)
   - Create a material for the robot (red color)
   - Assign to the robot object

2. Add basic components:
   - Select the robot
   - Add a Rigidbody component (for physics)
   - Add a simple script for basic movement

### Step 6: Set Up the Camera
1. Right-click in Hierarchy → Camera
2. Rename to "Main_Camera"
3. Set position to (0, 5, -10)
4. Set rotation to (15, 0, 0)
5. Set Field of View to 60

### Step 7: Test the Environment
1. Press Play to test the environment
2. Verify that lighting looks realistic
3. Check that materials are applied correctly
4. Confirm the robot is visible and properly positioned

## Tutorial 2: Advanced Lighting Setup

### Objective
Implement professional lighting techniques for realistic robotics environments.

### Step 1: Create a Lighting Scene
1. In the main menu, go to Window → Rendering → Lighting Settings
2. In the Lighting window, change the Environment Lighting:
   - Set Source to Gradient
   - Adjust the Skybox Material if available
   - Set Environment Intensity to 1.0

### Step 2: Add Realistic Light Sources
1. Create a main directional light for overhead lighting:
   ```
   GameObject: Directional Light
   Name: "Main_Overhead_Light"
   Rotation: (45, 45, 0)
   Intensity: 1.0
   Color: Slightly warm white (RGB: 255, 250, 240)
   ```

2. Add fill lighting to reduce harsh shadows:
   ```
   GameObject: Directional Light
   Name: "Fill_Light"
   Rotation: (-45, -135, 0)
   Intensity: 0.3
   Color: Cool gray (RGB: 200, 200, 210)
   ```

3. Add accent lighting for robot features:
   ```
   GameObject: Spotlight
   Name: "Robot_Accent_Light"
   Position: (2, 3, 2)
   Rotation: (-60, 45, 0)
   Intensity: 0.5
   Spot Angle: 60
   Range: 10
   ```

### Step 3: Configure Lightmapping Settings
1. In Lighting Settings:
   - Set Mixed Light Mode to "Baked Indirect"
   - Set Lightmapper to "Progressive CPU" or "Progressive GPU"
   - Set Lightmap Resolution to 40 (for good quality)
   - Set Lightmap Padding to 4
   - Set Lightmap Size to 1024

2. For static objects (floor, walls):
   - Select the object
   - In Inspector, find "Lightmap Static" checkbox
   - Check the box to mark as static

### Step 4: Bake the Lighting
1. In Lighting Settings window, click "Generate Lighting"
2. Wait for the baking process to complete
3. Observe how the lighting improves the scene's realism

## Tutorial 3: Material and Texture Optimization

### Objective
Create optimized materials that look good while maintaining performance.

### Step 1: Create a Basic Material Shader
1. In Project window, right-click → Create → Material
2. Name it "Optimized_Floor_Material"
3. In the material inspector:
   - Set Albedo color to light gray
   - Set Metallic to 0.1 (slightly metallic)
   - Set Smoothness to 0.3 (moderate smoothness)

### Step 2: Create Different Surface Types
For different surfaces in the robotics environment:

**Metallic Surface (Robot Parts)**:
```
Albedo: Silver or specific robot color
Metallic: 0.8-1.0
Smoothness: 0.7-0.9
```

**Fabric Surface (Cushions, Covers)**:
```
Albedo: Desired fabric color
Metallic: 0.0
Smoothness: 0.1-0.3
```

**Plastic Surface (Control Panels)**:
```
Albedo: White or panel color
Metallic: 0.2-0.4
Smoothness: 0.4-0.6
```

### Step 3: Texture Optimization
1. Import textures with appropriate settings:
   - Select texture in Project window
   - In Inspector, set Texture Type to "Default"
   - Set Compression to "High Quality"
   - Set Max Size to appropriate resolution (512-1024 for most surfaces)
   - Enable "Compression" for smaller file sizes

2. Use texture atlasing for multiple small textures:
   - Combine multiple small textures into one larger texture
   - Update UV coordinates to match the new atlas
   - Reduces draw calls and improves performance

### Step 4: Create a Material Library
1. Create a folder called "Materials" in your Project window
2. Organize materials by type (Floors, Walls, Robots, Props)
3. Name materials consistently (e.g., "Floor_Tile_Metallic", "Wall_Paint_Smooth")
4. Create a reference document listing all materials and their uses

## Tutorial 4: Performance Optimization

### Objective
Optimize the Unity environment for smooth performance on educational hardware.

### Step 1: Implement Level of Detail (LOD)
1. Create multiple versions of complex objects with different polygon counts
2. Select your robot model in the hierarchy
3. Add an LOD Group component:
   - Component → Rendering → LOD Group
4. In the LOD Group inspector:
   - Add 3 LOD levels (0, 1, 2)
   - Set screen transition heights (0.5, 0.25, 0.125)
   - For each LOD level, set which renderers to use

### Step 2: Set Up Occlusion Culling
1. Mark static objects for occlusion:
   - Select static objects (walls, floor, furniture)
   - Check "Occludee Static" and "Occluder Static" in Inspector
2. Generate occlusion culling:
   - Go to Window → Rendering → Occlusion Culling
   - In the Occlusion window, click "Bake"
   - Wait for the baking process to complete

### Step 3: Configure Quality Settings
1. Go to Edit → Project Settings → Quality
2. Adjust settings for different quality levels:

   **Fast Quality Settings**:
   - Anti Aliasing: Disabled
   - Shadow Resolution: Low
   - Texture Quality: Low
   - Anisotropic Filtering: Disabled
   - VSync: Disabled

   **Good Quality Settings**:
   - Anti Aliasing: 2x MSAA or FXAA
   - Shadow Resolution: Medium
   - Texture Quality: Normal
   - Anisotropic Filtering: 2x
   - VSync: Enabled

   **Beautiful Quality Settings**:
   - Anti Aliasing: 4x MSAA
   - Shadow Resolution: High
   - Texture Quality: Full Res
   - Anisotropic Filtering: 4x
   - VSync: Enabled

### Step 4: Test Performance
1. Build and run your scene on target hardware
2. Use Unity's Profiler window (Window → Analysis → Profiler)
3. Monitor FPS, draw calls, and triangle count
4. Adjust settings based on performance requirements

## Tutorial 5: Human-Robot Interaction Environment

### Objective
Create an environment specifically designed for human-robot interaction scenarios.

### Step 1: Plan the Interaction Space
1. Create a clear interaction area:
   - Use a circular or rectangular area marked on the floor
   - Add visual indicators (colored flooring or markings)
   - Ensure adequate space for both human and robot

2. Set up safety zones:
   - Create a warning zone around the robot (yellow)
   - Create a danger zone close to the robot (red)
   - Use different materials or textures to indicate zones

### Step 2: Add Interaction Elements
1. Create a human avatar:
   - Use a capsule or simple humanoid model
   - Add appropriate materials
   - Position in the interaction area

2. Add communication interfaces:
   - Create a simple UI panel (GameObject → UI → Panel)
   - Add text elements for robot status
   - Position in a visible location

3. Add safety indicators:
   - Create colored rings or zones around the robot
   - Use different materials for different safety levels
   - Add a simple script to change colors based on distance

### Step 3: Implement Interaction Logic
Create a simple interaction script:

```csharp
using UnityEngine;

public class HRIInteraction : MonoBehaviour
{
    public GameObject robot;
    public GameObject human;
    public float interactionDistance = 2.0f;
    public float safetyDistance = 0.5f;

    public Renderer safetyZoneRenderer;
    public Color safeColor = Color.green;
    public Color warningColor = Color.yellow;
    public Color dangerColor = Color.red;

    void Update()
    {
        float distance = Vector3.Distance(robot.transform.position, human.transform.position);

        if (distance <= safetyDistance)
        {
            safetyZoneRenderer.material.color = dangerColor;
            // Trigger safety protocol
        }
        else if (distance <= interactionDistance)
        {
            safetyZoneRenderer.material.color = warningColor;
            // Ready for interaction
        }
        else
        {
            safetyZoneRenderer.material.color = safeColor;
            // Outside interaction range
        }
    }
}
```

### Step 4: Test the HRI Environment
1. Run the scene and observe the safety zone color changes
2. Move the human avatar toward and away from the robot
3. Verify that the interaction logic works as expected
4. Adjust distances and colors as needed

## Tutorial 6: Complete Environment Integration

### Objective
Combine all elements into a complete, optimized robotics environment.

### Step 1: Scene Organization
1. Create appropriate folders in the hierarchy:
   - Environment (floor, walls, lighting)
   - Robots (all robot-related objects)
   - Props (furniture, equipment)
   - Effects (particles, sounds)
   - UI (interface elements)

2. Use empty GameObjects as containers:
   - Create parent objects for related items
   - Name them descriptively
   - Use consistent naming conventions

### Step 2: Final Optimization
1. Audit the scene:
   - Check for unused assets
   - Verify static batching settings
   - Review lighting and baking results
   - Test performance on target hardware

2. Set up scene loading:
   - Create multiple scenes for different environments
   - Implement a simple scene loading system
   - Add loading screens if needed

### Step 3: Documentation and Handoff
1. Create a scene documentation file:
   - List all objects and their purposes
   - Note special scripts or components
   - Include optimization settings used

2. Create a style guide:
   - Document material naming conventions
   - Specify color palettes for different elements
   - Note lighting setup procedures

## Troubleshooting Common Issues

### Issue 1: Poor Performance
**Symptoms**: Low frame rate, stuttering
**Solutions**:
- Reduce texture resolutions
- Use simpler materials
- Implement LOD for complex objects
- Bake lighting instead of using real-time lighting
- Use occlusion culling

### Issue 2: Lighting Problems
**Symptoms**: Dark areas, harsh shadows, incorrect colors
**Solutions**:
- Adjust light intensities
- Add fill lights to reduce harsh shadows
- Check material properties (metallic, smoothness)
- Verify lightmap settings and baking

### Issue 3: Material Issues
**Symptoms**: Incorrect colors, missing textures, wrong reflections
**Solutions**:
- Verify texture import settings
- Check material shader compatibility
- Ensure proper UV mapping
- Validate material property values

## Assessment Questions

1. How did the lighting setup affect the overall appearance of your environment?
2. What optimization techniques had the most significant impact on performance?
3. How did the HRI safety zones function in your implementation?
4. What challenges did you encounter when implementing the LOD system?

## Next Steps

After completing these tutorials, you should have a solid foundation in creating high-fidelity Unity environments for robotics education. The next step is to explore sensor simulation, where you'll learn how these environments can be used to generate realistic sensor data for robotic systems.