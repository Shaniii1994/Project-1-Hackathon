# Hands-On Tutorials: Sensor Configuration and Data Analysis

This section provides step-by-step tutorials to help you configure sensors and analyze their data in robotics applications.

## Tutorial 1: LiDAR Configuration and Data Analysis

### Objective
Configure a LiDAR sensor and analyze its point cloud data for obstacle detection.

### Prerequisites
- Unity with robotics environment from previous tutorials
- Basic understanding of 3D coordinate systems
- Simple robot model with mounting points

### Step 1: Set Up LiDAR Component
1. Create a new GameObject in your scene:
   - Right-click in Hierarchy → Create Empty
   - Name it "LiDAR_Sensor"
   - Position it at (0, 0.5, 0) relative to robot center

2. Attach the LiDAR script:
   - Create a C# script named "LiDAR_Sensor.cs"
   - Copy the LiDAR simulation code from previous sections
   - Attach it to the LiDAR_Sensor GameObject

3. Configure basic parameters:
   ```
   Horizontal Rays: 360 (1 degree resolution)
   Vertical Rays: 16 (for 3D LiDAR)
   Max Range: 20m
   Min Range: 0.1m
   Field of View: 360° horizontal, 30° vertical
   Update Rate: 10 Hz
   ```

### Step 2: Configure Advanced Parameters
1. Adjust noise settings for realistic simulation:
   - Range Noise: 0.02m (2cm standard deviation)
   - Angular Resolution: 1° for horizontal, 2° for vertical
   - Intensity Variation: Based on surface properties

2. Set up visualization:
   - Enable point cloud visualization
   - Set point size to 0.05m
   - Choose color based on distance (blue=close, red=far)

### Step 3: Collect and Analyze Data
1. Create a data collection script:
```csharp
using UnityEngine;
using System.Collections.Generic;

public class LidarDataCollector : MonoBehaviour
{
    public LidarSimulation lidar;
    public float collectionInterval = 1.0f;
    private float lastCollectionTime;

    [System.Serializable]
    public class PointCloudData
    {
        public Vector3[] points;
        public float[] intensities;
        public float timestamp;
    }

    private List<PointCloudData> collectedData = new List<PointCloudData>();

    void Update()
    {
        if (Time.time - lastCollectionTime >= collectionInterval)
        {
            CollectPointCloud();
            lastCollectionTime = Time.time;
        }
    }

    void CollectPointCloud()
    {
        var lidarData = lidar.GeneratePointCloud();

        PointCloudData data = new PointCloudData();
        data.points = lidarData.points;
        data.intensities = lidarData.intensities;
        data.timestamp = Time.time;

        collectedData.Add(data);

        // Analyze the collected data
        AnalyzePointCloud(data);
    }

    void AnalyzePointCloud(PointCloudData data)
    {
        // Calculate basic statistics
        float minDistance = float.MaxValue;
        float maxDistance = 0;
        Vector3 centroid = Vector3.zero;

        for (int i = 0; i < data.points.Length; i++)
        {
            float distance = data.points[i].magnitude;
            minDistance = Mathf.Min(minDistance, distance);
            maxDistance = Mathf.Max(maxDistance, distance);
            centroid += data.points[i];
        }

        if (data.points.Length > 0)
        {
            centroid /= data.points.Length;
        }

        Debug.Log($"Point Cloud: {data.points.Length} points, " +
                 $"Range: {minDistance:F2}-{maxDistance:F2}m, " +
                 $"Centroid: {centroid}");
    }

    public PointCloudData GetLatestData()
    {
        if (collectedData.Count > 0)
        {
            return collectedData[collectedData.Count - 1];
        }
        return new PointCloudData();
    }
}
```

### Step 4: Implement Obstacle Detection
1. Add obstacle detection to your LiDAR script:
```csharp
public class ObstacleDetector : MonoBehaviour
{
    public LidarSimulation lidar;
    public float obstacleThreshold = 2.0f; // Obstacle if closer than this
    public float minObstaclePoints = 10;  // Minimum points to consider obstacle

    public void DetectObstacles()
    {
        var lidarData = lidar.GeneratePointCloud();

        // Group nearby points into potential obstacles
        List<List<Vector3>> obstacleClusters = new List<List<Vector3>>();

        foreach (Vector3 point in lidarData.points)
        {
            if (point.magnitude < obstacleThreshold)
            {
                // Simple clustering: group points that are close together
                bool addedToCluster = false;

                foreach (List<Vector3> cluster in obstacleClusters)
                {
                    // Check if point is close to existing cluster
                    Vector3 clusterCenter = GetCentroid(cluster);
                    if (Vector3.Distance(point, clusterCenter) < 0.5f)
                    {
                        cluster.Add(point);
                        addedToCluster = true;
                        break;
                    }
                }

                // If not added to existing cluster, create new cluster
                if (!addedToCluster)
                {
                    List<Vector3> newCluster = new List<Vector3>();
                    newCluster.Add(point);
                    obstacleClusters.Add(newCluster);
                }
            }
        }

        // Filter clusters by size (minimum number of points)
        List<List<Vector3>> significantObstacles = new List<List<Vector3>>();
        foreach (List<Vector3> cluster in obstacleClusters)
        {
            if (cluster.Count >= minObstaclePoints)
            {
                significantObstacles.Add(cluster);
            }
        }

        Debug.Log($"Detected {significantObstacles.Count} significant obstacles");

        // Visualize obstacles
        VisualizeObstacles(significantObstacles);
    }

    Vector3 GetCentroid(List<Vector3> points)
    {
        Vector3 centroid = Vector3.zero;
        foreach (Vector3 point in points)
        {
            centroid += point;
        }
        return centroid / points.Count;
    }

    void VisualizeObstacles(List<List<Vector3>> obstacles)
    {
        // Clear previous visualizations
        foreach (Transform child in transform)
        {
            if (child.name.StartsWith("Obstacle_"))
            {
                Destroy(child.gameObject);
            }
        }

        // Create visualization for each obstacle
        for (int i = 0; i < obstacles.Count; i++)
        {
            Vector3 centroid = GetCentroid(obstacles[i]);
            GameObject obstacleObj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            obstacleObj.name = $"Obstacle_{i}";
            obstacleObj.transform.position = centroid;
            obstacleObj.transform.SetParent(transform);
            obstacleObj.transform.localScale = Vector3.one * 0.3f;
            obstacleObj.GetComponent<Renderer>().material.color = Color.red;
        }
    }
}
```

### Step 5: Test and Validate
1. Run the scene and observe:
   - Point cloud visualization in the Scene view
   - Obstacle detection results
   - Data collection statistics

2. Experiment with different parameters:
   - Change the obstacle threshold distance
   - Adjust the minimum points for obstacle detection
   - Modify noise levels to see impact on detection

## Tutorial 2: Depth Camera Configuration and Analysis

### Objective
Configure a depth camera and analyze its data for 3D reconstruction.

### Step 1: Set Up Depth Camera
1. Create a depth camera:
   - Right-click in Hierarchy → Camera
   - Name it "Depth_Camera"
   - Position it at robot eye level (e.g., 1m high)

2. Configure camera properties:
   ```
   Field of View: 60°
   Resolution: 640x480
   Near Clip: 0.1m
   Far Clip: 5.0m
   ```

3. Add depth camera script:
```csharp
using UnityEngine;

public class DepthCamera : MonoBehaviour
{
    [Header("Depth Camera Settings")]
    public int resolutionWidth = 640;
    public int resolutionHeight = 480;
    public float minDepth = 0.1f;
    public float maxDepth = 5.0f;
    public float noiseLevel = 0.01f;

    private Camera cam;
    private RenderTexture depthTexture;
    private Texture2D readTexture;

    void Start()
    {
        cam = GetComponent<Camera>();
        SetupDepthCamera();
    }

    void SetupDepthCamera()
    {
        cam.fieldOfView = 60.0f;
        cam.nearClipPlane = minDepth * 0.8f;
        cam.farClipPlane = maxDepth * 1.2f;

        depthTexture = new RenderTexture(resolutionWidth, resolutionHeight, 24);
        depthTexture.format = RenderTextureFormat.Depth;
        depthTexture.antiAliasing = 1;
        cam.targetTexture = depthTexture;

        readTexture = new Texture2D(resolutionWidth, resolutionHeight, TextureFormat.RFloat, false);
    }

    public float[,] GetDepthData()
    {
        RenderTexture.active = depthTexture;
        readTexture.ReadPixels(new Rect(0, 0, resolutionWidth, resolutionHeight), 0, 0);
        readTexture.Apply();

        float[,] depthData = new float[resolutionWidth, resolutionHeight];
        Color[] pixels = readTexture.GetPixels();

        for (int y = 0; y < resolutionHeight; y++)
        {
            for (int x = 0; x < resolutionWidth; x++)
            {
                int index = y * resolutionWidth + x;
                float rawDepth = pixels[index].r;

                // Convert from normalized depth to actual depth
                float actualDepth = minDepth + rawDepth * (maxDepth - minDepth);

                // Add noise
                actualDepth += RandomGaussian() * noiseLevel;

                depthData[x, y] = actualDepth;
            }
        }

        RenderTexture.active = null;
        return depthData;
    }

    float RandomGaussian()
    {
        float u1 = Random.value;
        float u2 = Random.value;
        return Mathf.Sqrt(-2.0f * Mathf.Log(u1)) * Mathf.Cos(2.0f * Mathf.PI * u2);
    }

    void OnDestroy()
    {
        if (depthTexture != null)
        {
            depthTexture.Release();
        }
        if (readTexture != null)
        {
            DestroyImmediate(readTexture);
        }
    }
}
```

### Step 2: Implement Surface Detection
1. Add surface detection to your depth camera script:
```csharp
public class DepthSurfaceDetector : MonoBehaviour
{
    public DepthCamera depthCamera;
    public float surfaceThreshold = 0.1f; // Max difference to be considered same surface
    public int minSurfacePoints = 100;    // Minimum points for valid surface

    public struct Surface
    {
        public Vector3 normal;
        public Vector3 center;
        public float distance;
        public int pointCount;
    }

    public List<Surface> DetectSurfaces()
    {
        float[,] depthData = depthCamera.GetDepthData();
        List<Surface> surfaces = new List<Surface>();

        // Simple plane detection using RANSAC-inspired approach
        int width = depthData.GetLength(0);
        int height = depthData.GetLength(1);

        // Sample random points and check for planar regions
        for (int sample = 0; sample < 10; sample++)
        {
            int centerX = Random.Range(50, width - 50);
            int centerY = Random.Range(50, height - 50);

            if (depthData[centerX, centerY] > 0)
            {
                Surface surface = AnalyzeSurfaceRegion(depthData, centerX, centerY);
                if (surface.pointCount >= minSurfacePoints)
                {
                    surfaces.Add(surface);
                }
            }
        }

        return surfaces;
    }

    Surface AnalyzeSurfaceRegion(float[,] depthData, int centerX, int centerY)
    {
        Surface surface = new Surface();
        List<Vector3> regionPoints = new List<Vector3>();

        int width = depthData.GetLength(0);
        int height = depthData.GetLength(1);

        // Collect points in a region around the center
        int regionSize = 20;
        for (int dy = -regionSize; dy <= regionSize; dy++)
        {
            for (int dx = -regionSize; dx <= regionSize; dx++)
            {
                int x = centerX + dx;
                int y = centerY + dy;

                if (x >= 0 && x < width && y >= 0 && y < height)
                {
                    float depth = depthData[x, y];
                    if (depth > 0 && depth < depthCamera.maxDepth)
                    {
                        // Convert pixel coordinates to 3D world coordinates
                        Vector3 worldPoint = PixelTo3D(x, y, depth);
                        regionPoints.Add(worldPoint);
                    }
                }
            }
        }

        if (regionPoints.Count >= 3)
        {
            // Calculate plane parameters using the points
            surface.center = CalculateCentroid(regionPoints);
            surface.normal = CalculateSurfaceNormal(regionPoints);
            surface.distance = surface.center.magnitude;
            surface.pointCount = regionPoints.Count;
        }

        return surface;
    }

    Vector3 CalculateCentroid(List<Vector3> points)
    {
        Vector3 sum = Vector3.zero;
        foreach (Vector3 point in points)
        {
            sum += point;
        }
        return sum / points.Count;
    }

    Vector3 CalculateSurfaceNormal(List<Vector3> points)
    {
        // Simple normal calculation using first three points
        if (points.Count >= 3)
        {
            Vector3 v1 = points[1] - points[0];
            Vector3 v2 = points[2] - points[0];
            return Vector3.Cross(v1, v2).normalized;
        }
        return Vector3.up; // Default normal
    }

    Vector3 PixelTo3D(int x, int y, float depth)
    {
        // Convert pixel coordinates to normalized device coordinates
        float normX = (float)x / depthCamera.resolutionWidth * 2 - 1;
        float normY = (float)y / depthCamera.resolutionHeight * 2 - 1;

        // Convert to world coordinates (simplified)
        float fovRad = depthCamera.cam.fieldOfView * Mathf.Deg2Rad;
        float pixelWidth = depth * Mathf.Tan(fovRad / 2) * 2 / depthCamera.resolutionWidth;
        float pixelHeight = depth * Mathf.Tan(fovRad / 2) * 2 / depthCamera.resolutionHeight;

        float worldX = normX * depth * Mathf.Tan(fovRad / 2);
        float worldY = normY * depth * Mathf.Tan(fovRad / 2);

        return new Vector3(worldX, worldY, depth);
    }
}
```

### Step 3: Test Depth Camera
1. Add the DepthSurfaceDetector script to your camera
2. Create a test script to run detection:
```csharp
using UnityEngine;

public class DepthTestController : MonoBehaviour
{
    public DepthSurfaceDetector surfaceDetector;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            DetectSurfaces();
        }
    }

    void DetectSurfaces()
    {
        var surfaces = surfaceDetector.DetectSurfaces();
        Debug.Log($"Detected {surfaces.Count} surfaces");

        foreach (var surface in surfaces)
        {
            Debug.Log($"Surface: Normal={surface.normal}, " +
                     $"Center={surface.center}, Points={surface.pointCount}");
        }
    }
}
```

## Tutorial 3: IMU Configuration and Analysis

### Objective
Configure an IMU sensor and analyze its data for motion detection and orientation estimation.

### Step 1: Set Up IMU Component
1. Create an IMU GameObject:
   - Right-click in Hierarchy → Create Empty
   - Name it "IMU_Sensor"
   - Position it at robot center (0, 0.5, 0)

2. Attach the IMU script:
```csharp
using UnityEngine;

public class IMUSensor : MonoBehaviour
{
    [Header("IMU Configuration")]
    public float accelerometerRange = 16.0f; // ±16g
    public float gyroscopeRange = 2000.0f;   // ±2000 deg/s
    public float accelerometerNoise = 0.001f; // g
    public float gyroscopeNoise = 0.001f;     // rad/s
    public float magnetometerNoise = 0.1f;    // µT
    public int updateRate = 100;              // Hz

    [Header("Bias Settings")]
    public Vector3 accelerometerBias = Vector3.zero;
    public Vector3 gyroscopeBias = Vector3.zero;

    private float updateInterval;
    private float lastUpdateTime;

    [System.Serializable]
    public struct IMUData
    {
        public Vector3 acceleration;    // m/s²
        public Vector3 angularVelocity; // rad/s
        public Vector3 magneticField;   // µT
        public float deltaTime;
    }

    void Start()
    {
        updateInterval = 1.0f / updateRate;
        lastUpdateTime = Time.time;
    }

    void Update()
    {
        if (Time.time - lastUpdateTime >= updateInterval)
        {
            lastUpdateTime = Time.time;
        }
    }

    public IMUData GetRawData()
    {
        IMUData data = new IMUData();

        // Get true values from Unity's physics
        Rigidbody rb = GetComponent<Rigidbody>();
        if (rb != null)
        {
            // True acceleration (including gravity)
            Vector3 trueAccel = rb.velocity / Time.fixedDeltaTime + Physics.gravity;

            // True angular velocity
            Vector3 trueAngularVel = rb.angularVelocity;

            // True magnetic field (simplified)
            Vector3 trueMagField = new Vector3(23.0f, 5.0f, 42.0f); // Earth's field

            // Apply IMU characteristics
            data.acceleration = ApplyAccelerometerModel(trueAccel);
            data.angularVelocity = ApplyGyroscopeModel(trueAngularVel);
            data.magneticField = ApplyMagnetometerModel(trueMagField);
        }
        else
        {
            // If no rigidbody, use simplified model
            data.acceleration = ApplyAccelerometerModel(Physics.gravity);
            data.angularVelocity = ApplyGyroscopeModel(Vector3.zero);
            data.magneticField = ApplyMagnetometerModel(new Vector3(23.0f, 5.0f, 42.0f));
        }

        data.deltaTime = updateInterval;
        return data;
    }

    Vector3 ApplyAccelerometerModel(Vector3 trueAccel)
    {
        Vector3 measured = trueAccel / 9.81f; // Convert to g

        // Add bias
        measured += accelerometerBias;

        // Add noise
        measured.x += RandomGaussian() * accelerometerNoise;
        measured.y += RandomGaussian() * accelerometerNoise;
        measured.z += RandomGaussian() * accelerometerNoise;

        // Apply range limits
        measured.x = Mathf.Clamp(measured.x, -accelerometerRange, accelerometerRange);
        measured.y = Mathf.Clamp(measured.y, -accelerometerRange, accelerometerRange);
        measured.z = Mathf.Clamp(measured.z, -accelerometerRange, accelerometerRange);

        return measured * 9.81f; // Convert back to m/s²
    }

    Vector3 ApplyGyroscopeModel(Vector3 trueAngularVel)
    {
        Vector3 measured = trueAngularVel;

        // Add bias
        measured += gyroscopeBias;

        // Add noise
        measured.x += RandomGaussian() * gyroscopeNoise;
        measured.y += RandomGaussian() * gyroscopeNoise;
        measured.z += RandomGaussian() * gyroscopeNoise;

        // Apply range limits (convert to deg/s for limits)
        float maxRadPerSec = gyroscopeRange * Mathf.Deg2Rad;
        measured.x = Mathf.Clamp(measured.x, -maxRadPerSec, maxRadPerSec);
        measured.y = Mathf.Clamp(measured.y, -maxRadPerSec, maxRadPerSec);
        measured.z = Mathf.Clamp(measured.z, -maxRadPerSec, maxRadPerSec);

        return measured;
    }

    Vector3 ApplyMagnetometerModel(Vector3 trueMagField)
    {
        Vector3 measured = trueMagField;

        // Add noise
        measured.x += RandomGaussian() * magnetometerNoise;
        measured.y += RandomGaussian() * magnetometerNoise;
        measured.z += RandomGaussian() * magnetometerNoise;

        return measured;
    }

    float RandomGaussian()
    {
        float u1 = Random.value;
        float u2 = Random.value;
        return Mathf.Sqrt(-2.0f * Mathf.Log(u1)) * Mathf.Cos(2.0f * Mathf.PI * u2);
    }
}
```

### Step 2: Implement Motion Detection
1. Add motion detection capabilities:
```csharp
using UnityEngine;
using System.Collections.Generic;

public class IMUMotionDetector : MonoBehaviour
{
    public IMUSensor imu;
    public float motionThreshold = 0.5f;     // m/s²
    public float rotationThreshold = 0.1f;   // rad/s
    public int historySize = 10;             // Number of samples for averaging

    private Queue<IMUSensor.IMUData> imuHistory = new Queue<IMUSensor.IMUData>();

    public struct MotionState
    {
        public bool isMoving;
        public bool isRotating;
        public Vector3 linearVelocity;
        public Vector3 angularVelocity;
        public float accelerationMagnitude;
    }

    public MotionState GetMotionState()
    {
        IMUSensor.IMUData currentData = imu.GetRawData();

        // Add to history queue
        imuHistory.Enqueue(currentData);
        if (imuHistory.Count > historySize)
        {
            imuHistory.Dequeue();
        }

        // Calculate motion state
        MotionState state = new MotionState();

        // Check for linear motion
        float accelMag = currentData.acceleration.magnitude;
        state.accelerationMagnitude = accelMag;
        state.isMoving = accelMag > motionThreshold;

        // Check for rotational motion
        float angVelMag = currentData.angularVelocity.magnitude;
        state.isRotating = angVelMag > rotationThreshold;

        state.angularVelocity = currentData.angularVelocity;

        // Estimate linear velocity by integrating acceleration
        state.linearVelocity = EstimateVelocity();

        return state;
    }

    Vector3 EstimateVelocity()
    {
        // Simple velocity estimation from acceleration history
        Vector3 totalAccel = Vector3.zero;
        int count = 0;

        foreach (var data in imuHistory)
        {
            totalAccel += data.acceleration;
            count++;
        }

        if (count > 0)
        {
            Vector3 avgAccel = totalAccel / count;
            // This is a simplified estimate - in reality, you'd need to account for gravity
            return avgAccel * imuHistory.Count * imu.updateInterval;
        }

        return Vector3.zero;
    }

    public void CalibrateIMU()
    {
        // Collect samples while stationary
        List<IMUSensor.IMUData> samples = new List<IMUSensor.IMUData>();

        for (int i = 0; i < 100; i++)
        {
            samples.Add(imu.GetRawData());
            // In a real implementation, you'd wait between samples
        }

        // Calculate bias estimates
        Vector3 avgAccel = Vector3.zero;
        Vector3 avgGyro = Vector3.zero;

        foreach (var sample in samples)
        {
            avgAccel += sample.acceleration;
            avgGyro += sample.angularVelocity;
        }

        avgAccel /= samples.Count;
        avgGyro /= samples.Count;

        // Expected acceleration due to gravity (when stationary)
        Vector3 expectedAccel = new Vector3(0, 9.81f, 0);
        Vector3 accelBias = avgAccel - expectedAccel;
        Vector3 gyroBias = avgGyro; // When stationary, expected gyro is zero

        Debug.Log($"Calibration - Accel Bias: {accelBias}, Gyro Bias: {gyroBias}");
    }
}
```

### Step 3: Test IMU System
1. Create a test controller:
```csharp
using UnityEngine;

public class IMUTestController : MonoBehaviour
{
    public IMUMotionDetector motionDetector;
    public Text displayText; // UI Text component

    void Update()
    {
        var motionState = motionDetector.GetMotionState();

        string info = $"Motion: {(motionState.isMoving ? "Moving" : "Still")}\n" +
                     $"Rotation: {(motionState.isRotating ? "Rotating" : "Steady")}\n" +
                     $"Accel: {motionState.accelerationMagnitude:F3} m/s²\n" +
                     $"Ang Vel: {motionState.angularVelocity}";

        if (displayText != null)
        {
            displayText.text = info;
        }

        // Visualize motion state
        GetComponent<Renderer>().material.color =
            motionState.isMoving ? Color.red : Color.green;
    }

    void OnGUI()
    {
        if (GUI.Button(new Rect(10, 10, 100, 30), "Calibrate"))
        {
            motionDetector.CalibrateIMU();
        }
    }
}
```

## Tutorial 4: Multi-Sensor Fusion

### Objective
Combine data from multiple sensors using a simple fusion algorithm.

### Step 1: Create Fusion System
1. Create a fusion controller:
```csharp
using UnityEngine;

public class SensorFusionSystem : MonoBehaviour
{
    [Header("Sensors")]
    public IMUSensor imu;
    public LidarSimulation lidar;
    public DepthCamera depthCamera;

    [Header("Fusion Parameters")]
    public float imuWeight = 0.3f;
    public float lidarWeight = 0.4f;
    public float depthWeight = 0.3f;

    [System.Serializable]
    public struct FusedState
    {
        public Vector3 position;
        public Vector3 velocity;
        public Vector3 acceleration;
        public Quaternion orientation;
        public float confidence;
    }

    public FusedState GetFusedState()
    {
        FusedState state = new FusedState();

        // Get data from each sensor
        var imuData = imu.GetRawData();
        var lidarData = lidar.GeneratePointCloud();
        var depthData = depthCamera.GetDepthData();

        // Simple weighted fusion for position
        // In practice, this would be more sophisticated
        Vector3 imuPosition = EstimatePositionFromIMU(imuData);
        Vector3 lidarPosition = EstimatePositionFromLiDAR(lidarData);
        Vector3 depthPosition = EstimatePositionFromDepth(depthData);

        // Weighted average
        state.position = imuPosition * imuWeight +
                        lidarPosition * lidarWeight +
                        depthPosition * depthWeight;

        // Estimate velocity from IMU acceleration
        state.velocity = EstimateVelocityFromAcceleration(imuData.acceleration, imuData.deltaTime);

        // Estimate acceleration from IMU
        state.acceleration = imuData.acceleration;

        // Estimate orientation from IMU
        state.orientation = EstimateOrientationFromIMU(imuData);

        // Calculate overall confidence
        state.confidence = CalculateConfidence(imuData, lidarData, depthData);

        return state;
    }

    Vector3 EstimatePositionFromIMU(IMUSensor.IMUData imuData)
    {
        // Simplified: double integration of acceleration
        // In practice, you'd use more sophisticated methods
        return transform.position + imuData.acceleration * 0.01f; // Placeholder
    }

    Vector3 EstimatePositionFromLiDAR(LidarSimulation.PointCloudData lidarData)
    {
        // Estimate position based on detected landmarks in point cloud
        // Placeholder implementation
        return transform.position;
    }

    Vector3 EstimatePositionFromDepth(float[,] depthData)
    {
        // Estimate position based on depth measurements
        // Placeholder implementation
        return transform.position;
    }

    Vector3 EstimateVelocityFromAcceleration(Vector3 acceleration, float deltaTime)
    {
        // Simple integration (in practice, you'd maintain velocity over time)
        return acceleration * deltaTime;
    }

    Quaternion EstimateOrientationFromIMU(IMUSensor.IMUData imuData)
    {
        // Integrate angular velocity to get orientation change
        Vector3 angularDisplacement = imuData.angularVelocity * imuData.deltaTime;
        Quaternion deltaRotation = Quaternion.Euler(angularDisplacement * Mathf.Rad2Deg);

        // This is simplified - you'd maintain a running orientation estimate
        return transform.rotation * deltaRotation;
    }

    float CalculateConfidence(IMUSensor.IMUData imuData,
                             LidarSimulation.PointCloudData lidarData,
                             float[,] depthData)
    {
        // Simple confidence calculation based on data quality
        float imuConf = 1.0f / (1.0f + imuData.acceleration.magnitude * 0.1f); // Lower accel = higher confidence
        float lidarConf = Mathf.Clamp01((float)lidarData.pointCount / 1000.0f); // More points = higher confidence
        float depthConf = 0.5f; // Placeholder

        return (imuConf * imuWeight + lidarConf * lidarWeight + depthConf * depthWeight);
    }
}
```

### Step 2: Test Fusion System
1. Create a fusion test controller:
```csharp
using UnityEngine;

public class FusionTestController : MonoBehaviour
{
    public SensorFusionSystem fusionSystem;
    public Text fusionStatusText;

    void Update()
    {
        var fusedState = fusionSystem.GetFusedState();

        string status = $"Fused Position: {fusedState.position}\n" +
                       $"Velocity: {fusedState.velocity}\n" +
                       $"Confidence: {fusedState.confidence:F2}\n" +
                       $"Orientation: {fusedState.orientation.eulerAngles}";

        if (fusionStatusText != null)
        {
            fusionStatusText.text = status;
        }

        // Visualize confidence with color
        float confidence = Mathf.Clamp01(fusedState.confidence);
        GetComponent<Renderer>().material.color =
            Color.Lerp(Color.red, Color.green, confidence);
    }
}
```

## Troubleshooting Common Issues

### Issue 1: Sensor Data Synchronization
**Symptoms**: Fused data appears inconsistent or jumpy
**Solutions**:
- Implement proper timestamping for all sensors
- Use interpolation for different sampling rates
- Apply time delay compensation
- Validate sensor timing with oscilloscope if possible

### Issue 2: Noise and Outliers
**Symptoms**: Erratic sensor readings affecting fusion
**Solutions**:
- Implement outlier rejection filters
- Use statistical validation of measurements
- Apply temporal smoothing
- Increase sensor sampling rate

### Issue 3: Coordinate System Mismatches
**Symptoms**: Sensors reporting data in different coordinate frames
**Solutions**:
- Define a common robot coordinate frame
- Apply proper transformation matrices
- Calibrate sensor mounting positions
- Verify axis orientations (NED vs. ENU)

## Assessment Questions

1. How did changing LiDAR resolution affect obstacle detection performance?
2. What were the key differences between depth camera and LiDAR data?
3. How did IMU integration lead to drift, and how can it be corrected?
4. What challenges did you encounter when fusing multiple sensor inputs?
5. How did sensor calibration improve the accuracy of your system?

## Next Steps

After completing these tutorials, you should have practical experience with configuring and analyzing data from different types of sensors. The next step is to create assessment questions to verify your understanding of these sensor concepts.