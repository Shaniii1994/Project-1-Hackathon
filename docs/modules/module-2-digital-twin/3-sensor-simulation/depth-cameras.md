# Depth Camera Simulation

Depth cameras provide 3D information by capturing both color and depth data simultaneously, making them valuable sensors for robotics applications. Unlike LiDAR, depth cameras provide dense depth information in a 2D grid format, which is particularly useful for object recognition, scene understanding, and close-range navigation.

## Understanding Depth Camera Technology

### How Depth Cameras Work
Depth cameras use various technologies to measure distance:
- **Stereo Vision**: Two cameras capture images from slightly different positions, using triangulation to calculate depth
- **Structured Light**: Projects a known light pattern and analyzes distortions to determine depth
- **Time-of-Flight (ToF)**: Measures the time light takes to travel to objects and back

### Depth Camera Specifications
Key parameters that define depth camera performance:
- **Resolution**: Width × height of depth image (e.g., 640×480)
- **Depth Range**: Minimum and maximum measurable distances
- **Accuracy**: How precisely depth can be measured
- **Frame Rate**: How frequently depth data is updated
- **Field of View**: Angular coverage (horizontal and vertical)

## Depth Camera Simulation in Unity

### Basic Depth Camera Implementation
```csharp
// Example: Basic depth camera simulation
using UnityEngine;

[RequireComponent(typeof(Camera))]
public class DepthCameraSimulation : MonoBehaviour
{
    [Header("Depth Camera Settings")]
    public int resolutionWidth = 640;
    public int resolutionHeight = 480;
    public float minDepth = 0.1f;
    public float maxDepth = 10.0f;
    public float verticalFOV = 60.0f;

    [Header("Output Settings")]
    public bool visualizeDepth = true;
    public Shader depthVisualizationShader;

    private Camera depthCamera;
    private RenderTexture depthTexture;
    private Texture2D outputTexture;

    void Start()
    {
        depthCamera = GetComponent<Camera>();
        SetupDepthCamera();
    }

    void SetupDepthCamera()
    {
        // Configure camera properties
        depthCamera.fieldOfView = verticalFOV;
        depthCamera.nearClipPlane = minDepth * 0.8f; // Slightly less than min depth
        depthCamera.farClipPlane = maxDepth * 1.2f;  // Slightly more than max depth

        // Create render texture for depth data
        depthTexture = new RenderTexture(resolutionWidth, resolutionHeight, 24);
        depthTexture.format = RenderTextureFormat.Depth;
        depthTexture.antiAliasing = 1;
        depthTexture.filterMode = FilterMode.Point; // Avoid interpolation artifacts

        depthCamera.targetTexture = depthTexture;
    }

    void Update()
    {
        if (visualizeDepth)
        {
            VisualizeDepth();
        }
    }

    void VisualizeDepth()
    {
        // Create output texture if needed
        if (outputTexture == null)
        {
            outputTexture = new Texture2D(resolutionWidth, resolutionHeight, TextureFormat.RGB24, false);
        }

        // Read depth data from render texture
        RenderTexture.active = depthTexture;
        outputTexture.ReadPixels(new Rect(0, 0, resolutionWidth, resolutionHeight), 0, 0);
        outputTexture.Apply();

        // Convert depth values to visual representation
        Color[] pixels = outputTexture.GetPixels();
        for (int i = 0; i < pixels.Length; i++)
        {
            float depthValue = pixels[i].r; // Depth is stored in red channel
            pixels[i] = DepthToColor(depthValue);
        }
        outputTexture.SetPixels(pixels);
        outputTexture.Apply();

        RenderTexture.active = null;
    }

    Color DepthToColor(float depthValue)
    {
        // Convert normalized depth value to color for visualization
        // Map depth range to color spectrum
        float normalizedDepth = Mathf.InverseLerp(minDepth, maxDepth, depthValue);
        return Color.HSVToRGB(normalizedDepth * 0.33f, 1.0f, 1.0f); // Blue to red
    }

    // Method to get depth at specific pixel
    public float GetDepthAtPixel(int x, int y)
    {
        if (x < 0 || x >= resolutionWidth || y < 0 || y >= resolutionHeight)
            return -1.0f;

        RenderTexture.active = depthTexture;
        Texture2D tempTexture = new Texture2D(1, 1, TextureFormat.RGB24, false);
        tempTexture.ReadPixels(new Rect(x, y, 1, 1), 0, 0);
        Color pixelColor = tempTexture.GetPixel(0, 0);
        RenderTexture.active = null;
        DestroyImmediate(tempTexture);

        // Extract depth value (simplified - actual implementation may vary)
        return pixelColor.r * (maxDepth - minDepth) + minDepth;
    }

    void OnDestroy()
    {
        if (depthTexture != null)
        {
            depthTexture.Release();
        }
        if (outputTexture != null)
        {
            DestroyImmediate(outputTexture);
        }
    }
}
```

### Advanced Depth Camera with Noise Simulation
```csharp
// Example: Depth camera with realistic noise modeling
public class AdvancedDepthCamera : MonoBehaviour
{
    [Header("Noise Parameters")]
    public float baseNoise = 0.001f;        // Base noise level (meters)
    public float distanceNoiseFactor = 0.0001f; // Noise increases with distance
    public float uniformNoise = 0.0005f;    // Uniform random noise

    [Header("Accuracy Parameters")]
    public float systematicError = 0.0f;    // Constant offset
    public float linearityError = 0.00001f; // Error that increases with depth

    private Camera cam;
    private float[] depthBuffer;

    void Start()
    {
        cam = GetComponent<Camera>();
        depthBuffer = new float[cam.pixelWidth * cam.pixelHeight];
    }

    public float ApplyNoiseAndError(float trueDepth)
    {
        if (trueDepth <= 0 || trueDepth > 100.0f) // Invalid depth
            return trueDepth;

        // Add various types of noise and error
        float noise = RandomGaussian() * (baseNoise + distanceNoiseFactor * trueDepth);
        noise += Random.value * uniformNoise * 2 - uniformNoise; // Uniform noise
        float error = systematicError + linearityError * trueDepth * trueDepth;

        float noisyDepth = trueDepth + noise + error;

        // Apply depth range limits
        if (noisyDepth < cam.nearClipPlane)
            return 0.0f; // Invalid measurement
        if (noisyDepth > cam.farClipPlane)
            return cam.farClipPlane; // Maximum range

        return noisyDepth;
    }

    float RandomGaussian()
    {
        // Box-Muller transform
        float u1 = Random.value;
        float u2 = Random.value;
        return Mathf.Sqrt(-2.0f * Mathf.Log(u1)) * Mathf.Cos(2.0f * Mathf.PI * u2);
    }
}
```

## Depth Image Processing

### Converting Depth to Point Cloud
Depth cameras provide 2D depth images that can be converted to 3D point clouds:

```csharp
// Example: Converting depth image to point cloud
public Vector3[] DepthImageToPointCloud(float[,] depthData, float fovX, float fovY)
{
    int width = depthData.GetLength(0);
    int height = depthData.GetLength(1);
    Vector3[] points = new Vector3[width * height];
    int validPoints = 0;

    float fovXRad = fovX * Mathf.Deg2Rad;
    float fovYRad = fovY * Mathf.Deg2Rad;

    for (int y = 0; y < height; y++)
    {
        for (int x = 0; x < width; x++)
        {
            float depth = depthData[x, y];

            if (depth > 0 && depth < 100.0f) // Valid depth measurement
            {
                // Calculate normalized coordinates (-1 to 1)
                float normX = (float)x / width * 2.0f - 1.0f;
                float normY = (float)y / height * 2.0f - 1.0f;

                // Calculate angles
                float angleX = normX * fovXRad / 2.0f;
                float angleY = normY * fovYRad / 2.0f;

                // Calculate 3D position
                float z = depth;
                float x3d = z * Mathf.Tan(angleX);
                float y3d = z * Mathf.Tan(angleY);

                // Transform to world coordinates based on sensor pose
                Vector3 point = transform.TransformPoint(new Vector3(x3d, y3d, z));
                points[validPoints] = point;
                validPoints++;
            }
        }
    }

    // Trim array to valid points
    System.Array.Resize(ref points, validPoints);
    return points;
}
```

### Depth Filtering and Processing
```csharp
// Example: Depth filtering techniques
public class DepthFiltering
{
    // Median filter to reduce noise
    public float[,] ApplyMedianFilter(float[,] depthData, int filterSize = 3)
    {
        int width = depthData.GetLength(0);
        int height = depthData.GetLength(1);
        float[,] filtered = new float[width, height];

        int halfSize = filterSize / 2;

        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < width; x++)
            {
                // Collect values in neighborhood
                System.Collections.Generic.List<float> neighborhood =
                    new System.Collections.Generic.List<float>();

                for (int dy = -halfSize; dy <= halfSize; dy++)
                {
                    for (int dx = -halfSize; dx <= halfSize; dx++)
                    {
                        int nx = Mathf.Clamp(x + dx, 0, width - 1);
                        int ny = Mathf.Clamp(y + dy, 0, height - 1);

                        float value = depthData[nx, ny];
                        if (value > 0) // Only consider valid measurements
                        {
                            neighborhood.Add(value);
                        }
                    }
                }

                // Calculate median
                neighborhood.Sort();
                if (neighborhood.Count > 0)
                {
                    int medianIndex = neighborhood.Count / 2;
                    filtered[x, y] = neighborhood[medianIndex];
                }
                else
                {
                    filtered[x, y] = depthData[x, y]; // Keep original if no valid neighbors
                }
            }
        }

        return filtered;
    }

    // Hole filling for missing depth data
    public float[,] FillHoles(float[,] depthData)
    {
        int width = depthData.GetLength(0);
        int height = depthData.GetLength(1);
        float[,] filled = (float[,])depthData.Clone();

        // Simple hole filling using nearest neighbor
        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < width; x++)
            {
                if (filled[x, y] <= 0) // Hole to fill
                {
                    float nearestDepth = FindNearestValidDepth(filled, x, y, width, height);
                    filled[x, y] = nearestDepth;
                }
            }
        }

        return filled;
    }

    float FindNearestValidDepth(float[,] data, int x, int y, int width, int height)
    {
        // Search in expanding square around the hole
        for (int radius = 1; radius < Mathf.Max(width, height); radius++)
        {
            for (int dy = -radius; dy <= radius; dy++)
            {
                for (int dx = -radius; dx <= radius; dx++)
                {
                    if (Mathf.Abs(dx) == radius || Mathf.Abs(dy) == radius) // Only perimeter
                    {
                        int nx = x + dx;
                        int ny = y + dy;

                        if (nx >= 0 && nx < width && ny >= 0 && ny < height)
                        {
                            if (data[nx, ny] > 0)
                            {
                                return data[nx, ny];
                            }
                        }
                    }
                }
            }
        }

        return 0; // No valid depth found
    }
}
```

## Depth Camera Limitations and Challenges

### Common Limitations
- **Range Limitations**: Cannot measure beyond maximum range
- **Reflective Surfaces**: Mirrors and shiny objects may not return valid measurements
- **Transparency**: Glass and other transparent materials can cause incorrect measurements
- **Sunlight Interference**: Outdoor use can be affected by sunlight
- **Resolution Trade-offs**: Higher resolution may reduce frame rate

### Simulation Considerations
```csharp
// Example: Simulating depth camera limitations
public class DepthCameraLimitations : MonoBehaviour
{
    public float maxRange = 5.0f;
    public float minRange = 0.2f;
    public float reflectiveThreshold = 0.8f; // Reflectance that causes issues
    public float transparentThreshold = 0.2f; // Transparency that causes issues

    public float SimulateDepthLimitations(
        float trueDistance,
        float surfaceReflectance,
        float surfaceTransparency,
        Vector3 surfaceNormal,
        Vector3 cameraDirection)
    {
        // Range limits
        if (trueDistance > maxRange)
        {
            return maxRange + 0.1f; // Max range value
        }
        if (trueDistance < minRange)
        {
            return 0.0f; // Too close
        }

        // Reflective surface simulation
        float alignment = Vector3.Dot(surfaceNormal, -cameraDirection);
        if (surfaceReflectance > reflectiveThreshold && alignment > 0.9f)
        {
            // Highly reflective surface at good angle - may return invalid measurement
            if (Random.value < 0.3f) // 30% chance of invalid reading
            {
                return -1.0f; // Invalid measurement
            }
        }

        // Transparent surface simulation
        if (surfaceTransparency > transparentThreshold)
        {
            // May measure through transparent object
            if (Random.value < surfaceTransparency)
            {
                return trueDistance + Random.Range(0.1f, 0.5f); // Measure through to background
            }
        }

        // Add noise based on conditions
        float noise = CalculateDepthNoise(trueDistance, surfaceReflectance, surfaceTransparency);
        return trueDistance + noise;
    }

    float CalculateDepthNoise(float distance, float reflectance, float transparency)
    {
        // Noise increases with distance and with challenging surface properties
        float baseNoise = 0.001f;
        float distanceNoise = 0.0001f * distance;
        float surfaceNoise = 0.002f * (reflectance + transparency);

        return RandomGaussian() * (baseNoise + distanceNoise + surfaceNoise);
    }

    float RandomGaussian()
    {
        float u1 = Random.value;
        float u2 = Random.value;
        return Mathf.Sqrt(-2.0f * Mathf.Log(u1)) * Mathf.Cos(2.0f * Mathf.PI * u2);
    }
}
```

## Performance Optimization

### Efficient Depth Processing
For real-time applications, optimize depth processing:

```csharp
// Example: Efficient depth processing using compute shaders conceptually
public class EfficientDepthProcessing
{
    // Process depth data in batches
    public void ProcessDepthInBatches(float[,] depthData, System.Action<float[,]> processCallback, int batchSize = 1000)
    {
        int width = depthData.GetLength(0);
        int height = depthData.GetLength(1);
        int totalPixels = width * height;
        int batches = Mathf.CeilToInt((float)totalPixels / batchSize);

        for (int batch = 0; batch < batches; batch++)
        {
            int startIndex = batch * batchSize;
            int endIndex = Mathf.Min(startIndex + batchSize, totalPixels);

            // Process this batch
            ProcessDepthBatch(depthData, startIndex, endIndex);

            // Yield to other processes (in Unity, you might use coroutines)
            // yield return null;
        }
    }

    void ProcessDepthBatch(float[,] depthData, int startIndex, int endIndex)
    {
        // Process specific range of pixels
        int width = depthData.GetLength(0);
        for (int i = startIndex; i < endIndex; i++)
        {
            int x = i % width;
            int y = i / width;

            if (x < depthData.GetLength(0) && y < depthData.GetLength(1))
            {
                // Process individual pixel
                depthData[x, y] = ApplyProcessing(depthData[x, y]);
            }
        }
    }

    float ApplyProcessing(float depthValue)
    {
        // Apply your specific processing to the depth value
        return depthValue;
    }
}
```

## Applications in Robotics Education

### Object Recognition
- Use depth data to identify objects in the environment
- Combine with color data for more robust recognition
- Implement shape-based recognition algorithms

### Scene Understanding
- Analyze spatial relationships between objects
- Identify surfaces, planes, and obstacles
- Create 3D maps of the environment

### Human-Robot Interaction
- Detect human presence and gestures
- Understand human activities and intentions
- Enable safe interaction based on spatial awareness

### Navigation and Mapping
- Create dense 3D maps for navigation
- Plan paths considering 3D obstacles
- Implement obstacle avoidance behaviors

## Comparison with LiDAR

| Aspect | Depth Camera | LiDAR |
|--------|--------------|-------|
| Data Density | Dense 2D grid | Sparse 3D points |
| Range | Short to medium (0.2-10m) | Medium to long (0.1-100m+)* |
| Resolution | High (640x480+) | Variable (16-128 lines) |
| Refresh Rate | High (30-60 FPS) | Moderate (5-20 FPS) |
| Cost | Low to medium | Medium to high |
| Indoor/Outdoor | Both (better indoors) | Both (better outdoors) |
| Processing | Image-based | Point cloud-based |

## Assessment Questions

1. What are the main differences between stereo vision, structured light, and ToF depth cameras?
2. How does depth camera resolution affect the quality of 3D reconstruction?
3. What are the main challenges when using depth cameras in robotics applications?
4. How can you simulate the effects of reflective and transparent surfaces in depth camera simulation?
5. What are the computational advantages and disadvantages of depth cameras vs. LiDAR?

## Next Steps

After understanding depth camera simulation, continue to the IMU Simulation section to learn about inertial sensors that provide orientation and motion information for robotics applications.