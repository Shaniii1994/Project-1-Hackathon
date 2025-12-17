# Environment Rendering Examples and Exercises

This section provides practical examples and hands-on exercises to reinforce your understanding of high-fidelity environment rendering in Unity for robotics education.

## Practical Examples

### Example 1: Basic Robotics Lab Environment
Create a simple robotics lab with proper lighting and materials:

```csharp
// Example: Robotics lab environment setup
using UnityEngine;

public class RoboticsLabSetup : MonoBehaviour
{
    public GameObject floor;
    public GameObject walls;
    public GameObject ceiling;
    public GameObject workbench;
    public GameObject robot;

    public Material floorMaterial;
    public Material wallMaterial;
    public Material workbenchMaterial;

    [Header("Lighting Setup")]
    public Light mainLight;
    public Light fillLight;
    public Light rimLight;

    void Start()
    {
        SetupEnvironment();
        SetupLighting();
        SetupRobot();
    }

    void SetupEnvironment()
    {
        // Floor with realistic material
        floor.GetComponent<Renderer>().material = floorMaterial;
        floorMaterial.color = new Color(0.7f, 0.7f, 0.7f); // Light gray
        floorMaterial.SetFloat("_Metallic", 0.1f);
        floorMaterial.SetFloat("_Smoothness", 0.3f);

        // Walls with appropriate material
        walls.GetComponent<Renderer>().material = wallMaterial;
        wallMaterial.color = new Color(0.9f, 0.9f, 0.9f); // Near white
        wallMaterial.SetFloat("_Metallic", 0.0f);
        wallMaterial.SetFloat("_Smoothness", 0.2f);

        // Workbench with metallic material
        workbench.GetComponent<Renderer>().material = workbenchMaterial;
        workbenchMaterial.color = new Color(0.5f, 0.4f, 0.3f); // Wood-like
        workbenchMaterial.SetFloat("_Metallic", 0.2f);
        workbenchMaterial.SetFloat("_Smoothness", 0.4f);
    }

    void SetupLighting()
    {
        // Main overhead light
        mainLight.type = LightType.Directional;
        mainLight.color = Color.white;
        mainLight.intensity = 1.0f;
        mainLight.transform.rotation = Quaternion.Euler(50f, -30f, 0f);

        // Fill light to reduce harsh shadows
        fillLight.type = LightType.Directional;
        fillLight.color = Color.gray;
        fillLight.intensity = 0.3f;
        fillLight.transform.rotation = Quaternion.Euler(-50f, 150f, 0f);

        // Rim light to highlight robot features
        rimLight.type = LightType.Spot;
        rimLight.color = Color.blue;
        rimLight.intensity = 0.5f;
        rimLight.spotAngle = 60f;
        rimLight.transform.position = new Vector3(0, 3, 2);
    }

    void SetupRobot()
    {
        // Position robot on the workbench
        robot.transform.position = new Vector3(0, 0.5f, 0);
    }
}
```

### Example 2: Outdoor Robotics Environment
Create an outdoor environment with natural lighting and weather considerations:

```csharp
// Example: Outdoor robotics environment
using UnityEngine;

public class OutdoorEnvironment : MonoBehaviour
{
    public GameObject terrain;
    public GameObject skybox;
    public Light sunLight;
    public GameObject[] obstacles;
    public GameObject robot;

    [Header("Weather Effects")]
    public GameObject rainEffect;
    public GameObject fogEffect;

    void Start()
    {
        SetupTerrain();
        SetupSkybox();
        SetupSunLight();
        SetupObstacles();
    }

    void SetupTerrain()
    {
        // Create a simple terrain for outdoor environment
        Terrain terrainComponent = terrain.GetComponent<Terrain>();
        terrainComponent.terrainData.heightmapResolution = 513;
        terrainComponent.terrainData.size = new Vector3(100, 30, 100);

        // Add grass texture
        TerrainData terrainData = terrainComponent.terrainData;
        SplatPrototype[] splatPrototypes = new SplatPrototype[1];
        splatPrototypes[0] = new SplatPrototype();
        // Add appropriate textures for grass/dirt
    }

    void SetupSkybox()
    {
        RenderSettings.skybox = skybox.GetComponent<Renderer>().sharedMaterial;
    }

    void SetupSunLight()
    {
        sunLight.type = LightType.Directional;
        sunLight.color = Color.white;
        sunLight.intensity = 1.0f;
        sunLight.transform.rotation = Quaternion.Euler(45f, 45f, 0f);
    }

    void SetupObstacles()
    {
        // Place obstacles randomly in the environment
        foreach (GameObject obstacle in obstacles)
        {
            float x = Random.Range(-40f, 40f);
            float z = Random.Range(-40f, 40f);
            obstacle.transform.position = new Vector3(x, 0, z);
        }
    }
}
```

### Example 3: Quality Settings Controller
Create a system to dynamically adjust quality based on performance:

```csharp
// Example: Dynamic quality adjustment system
using UnityEngine;
using UnityEngine.Rendering.PostProcessing;

public class DynamicQualityController : MonoBehaviour
{
    [Header("Quality Settings")]
    public int[] targetFPS = { 15, 30, 60 }; // Different quality levels
    public float adjustmentInterval = 2.0f; // Check performance every 2 seconds

    [Header("Performance Metrics")]
    public float currentFPS;
    public int currentQualityLevel = 1; // Start at medium

    private float lastCheckTime = 0.0f;
    private float frameCount = 0.0f;
    private float accumulatedTime = 0.0f;

    void Update()
    {
        UpdatePerformanceMetrics();
        CheckQualityAdjustment();
    }

    void UpdatePerformanceMetrics()
    {
        frameCount++;
        accumulatedTime += Time.unscaledDeltaTime;

        if (Time.time - lastCheckTime >= adjustmentInterval)
        {
            currentFPS = frameCount / accumulatedTime;
            lastCheckTime = Time.time;
            frameCount = 0.0f;
            accumulatedTime = 0.0f;
        }
    }

    void CheckQualityAdjustment()
    {
        // Adjust quality based on current FPS
        if (currentFPS < targetFPS[currentQualityLevel] * 0.8f && currentQualityLevel > 0)
        {
            // Performance too low, decrease quality
            SetQualityLevel(currentQualityLevel - 1);
        }
        else if (currentFPS > targetFPS[currentQualityLevel] * 1.2f && currentQualityLevel < targetFPS.Length - 1)
        {
            // Performance good, increase quality
            SetQualityLevel(currentQualityLevel + 1);
        }
    }

    void SetQualityLevel(int level)
    {
        if (level == currentQualityLevel) return;

        currentQualityLevel = level;
        QualitySettings.SetQualityLevel(level);

        // Apply additional optimizations based on quality level
        switch (level)
        {
            case 0: // Low quality
                RenderSettings.fog = false;
                QualitySettings.shadowResolution = ShadowResolution.Low;
                QualitySettings.anisotropicFiltering = AnisotropicFiltering.Disable;
                break;
            case 1: // Medium quality
                RenderSettings.fog = true;
                QualitySettings.shadowResolution = ShadowResolution.Medium;
                QualitySettings.anisotropicFiltering = AnisotropicFiltering.Enable;
                break;
            case 2: // High quality
                RenderSettings.fog = true;
                QualitySettings.shadowResolution = ShadowResolution.High;
                QualitySettings.anisotropicFiltering = AnisotropicFiltering.ForceEnable;
                break;
        }

        Debug.Log($"Quality adjusted to level {level} (Target ~{targetFPS[level]} FPS)");
    }
}
```

## Hands-On Exercises

### Exercise 1: Environment Creation Challenge
**Objective**: Create a complete robotics lab environment with proper lighting and materials.

**Steps**:
1. Create a new Unity scene for the robotics lab
2. Build the basic geometry (floor, walls, ceiling)
3. Add furniture (workbenches, storage units)
4. Set up proper lighting with main, fill, and rim lights
5. Apply realistic materials to all surfaces
6. Add a simple robot model to the scene
7. Test the lighting and material setup from different camera angles
8. Optimize the scene for performance while maintaining visual quality

**Expected Learning**: Understanding of basic environment creation, lighting setup, and material application in Unity.

### Exercise 2: Performance Optimization
**Objective**: Optimize an existing environment to run smoothly on different hardware configurations.

**Setup**: Start with the robotics lab from Exercise 1

**Steps**:
1. Profile the current performance using Unity's Profiler
2. Identify the main performance bottlenecks
3. Implement Level of Detail (LOD) for complex objects
4. Set up occlusion culling for static objects
5. Adjust lighting to use baked lighting where possible
6. Optimize textures by reducing resolution where appropriate
7. Test the optimized scene on different quality settings
8. Document the performance improvements achieved

**Expected Learning**: Understanding of optimization techniques and performance profiling.

### Exercise 3: Dynamic Lighting System
**Objective**: Create a lighting system that changes based on time of day or robot activity.

**Steps**:
1. Create a basic environment with a robot
2. Implement a day/night cycle with changing lighting
3. Add robot activity lights (LED indicators, working lights)
4. Create lighting that responds to robot actions
5. Add post-processing effects that enhance the lighting mood
6. Test the lighting system with different robot behaviors
7. Optimize the dynamic lighting for performance
8. Document the impact of dynamic lighting on scene atmosphere

**Expected Learning**: Understanding of dynamic lighting systems and their implementation.

### Exercise 4: HRI Environment Design
**Objective**: Design an environment specifically optimized for human-robot interaction scenarios.

**Steps**:
1. Plan the interaction space considering safety zones
2. Create clear pathways for both humans and robots
3. Design visual indicators for safety boundaries
4. Implement appropriate lighting for interaction visibility
5. Add interactive elements (buttons, displays, sensors)
6. Test the environment with HRI scenarios
7. Adjust the environment based on interaction needs
8. Document design principles for HRI environments

**Expected Learning**: Understanding of environment design principles for human-robot interaction.

## Troubleshooting Common Rendering Issues

### Issue 1: Poor Performance on Educational Hardware
**Symptoms**: Low frame rates, stuttering, long loading times
**Solutions**:
- Reduce texture resolutions
- Use simpler materials with fewer shader calculations
- Implement LOD for complex models
- Use occlusion culling for static objects
- Bake lighting instead of using real-time lighting

### Issue 2: Lighting Artifacts
**Symptoms**: Incorrect shadows, light bleeding, dark spots
**Solutions**:
- Adjust lightmapping settings
- Ensure proper UV unwrapping for lightmaps
- Check for overlapping geometry
- Increase lightmap resolution where needed
- Use light probes for mixed lighting scenarios

### Issue 3: Material Problems
**Symptoms**: Incorrect colors, missing textures, wrong reflections
**Solutions**:
- Verify texture import settings
- Check material shader compatibility
- Ensure proper normal map setup
- Validate metallic/smoothness values
- Test materials under different lighting conditions

### Issue 4: Quality Level Transitions
**Symptoms**: Jarring changes when quality settings change
**Solutions**:
- Implement gradual transitions between quality levels
- Use smooth interpolation for parameter changes
- Preload assets for different quality levels
- Test transitions during gameplay/interaction
- Provide user feedback during quality changes

## Assessment and Validation

### Self-Assessment Questions
1. How did the environment creation process change your understanding of spatial design for robotics?
2. What optimization techniques had the most significant impact on performance?
3. How did dynamic lighting affect the atmosphere and usability of your environment?
4. What design principles did you learn for HRI environments?

### Validation Checklist
- [ ] Environment loads within 10 seconds on target hardware
- [ ] Frame rate remains above 30 FPS during typical interactions
- [ ] Lighting provides adequate visibility for robot features
- [ ] Materials look realistic under various lighting conditions
- [ ] Performance remains stable during robot movement
- [ ] Safety zones are clearly visible to users
- [ ] Interaction elements are intuitive and accessible

## Extension Activities

### Advanced Exercise: Multi-Environment System
Create a system that can seamlessly transition between different types of robotics environments:
1. Implement a scene management system for different environments
2. Create loading screens with progress indicators
3. Develop a system for sharing assets between environments
4. Test transitions between indoor, outdoor, and specialized environments
5. Optimize for smooth transitions without performance hiccups

### Research Project: VR Robotics Environment
Explore creating a virtual reality environment for robotics education:
1. Adapt your environment for VR headsets
2. Implement comfortable navigation systems
3. Design interfaces that work in 3D space
4. Test with actual users for usability
5. Document the advantages and challenges of VR for robotics education

## Best Practices Summary

### For Educational Robotics Environments
1. **Prioritize Clarity**: Ensure robot states and behaviors are clearly visible
2. **Maintain Performance**: Optimize for the lowest common denominator hardware
3. **Use Realistic Materials**: Help students connect simulation to reality
4. **Design for Safety**: Make safety boundaries clearly visible
5. **Enable Interaction**: Allow students to manipulate the environment safely

### Performance Guidelines
- Target 30+ FPS for smooth interaction
- Use Level of Detail (LOD) for complex objects
- Bake lighting when possible to reduce runtime calculations
- Implement occlusion culling for static environments
- Use texture atlasing to reduce draw calls

By completing these exercises, you'll have gained practical experience in creating high-fidelity environments for robotics education that balance visual quality with performance requirements.