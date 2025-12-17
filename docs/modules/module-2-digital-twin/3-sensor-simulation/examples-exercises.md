# Sensor Simulation Examples and Exercises

This section provides practical examples and hands-on exercises to reinforce your understanding of sensor simulation concepts, including LiDAR, depth cameras, IMUs, and sensor fusion techniques.

## Practical Examples

### Example 1: Multi-Sensor Robot Platform
Create a robot equipped with multiple sensors to demonstrate sensor complementarity:

```csharp
// Example: Multi-sensor robot platform
using UnityEngine;
using System.Collections.Generic;

public class MultiSensorRobot : MonoBehaviour
{
    [Header("Sensor Components")]
    public LidarSimulation lidar;
    public DepthCameraSimulation depthCamera;
    public ImuSimulation imu;
    public Camera rgbCamera;

    [Header("Sensor Configuration")]
    public Transform lidarMount;
    public Transform cameraMount;
    public Transform imuMount;

    [Header("Environment Interaction")]
    public List<GameObject> obstacles;
    public List<GameObject> landmarks;

    private List<Vector3> lidarPointCloud = new List<Vector3>();
    private float[,] depthImage;
    private ImuSimulation.ImuData imuData;

    void Start()
    {
        InitializeSensors();
    }

    void InitializeSensors()
    {
        // Configure sensor mounting positions
        if (lidar != null) lidar.transform.SetParent(lidarMount);
        if (depthCamera != null) depthCamera.transform.SetParent(cameraMount);
        if (imu != null) imu.transform.SetParent(imuMount);

        // Initialize sensor-specific configurations
        ConfigureLidar();
        ConfigureDepthCamera();
        ConfigureImu();
    }

    void ConfigureLidar()
    {
        if (lidar != null)
        {
            lidar.horizontalRays = 720; // 0.5 degree resolution
            lidar.verticalRays = 16;    // 3D LiDAR
            lidar.maxRange = 30.0f;
            lidar.minRange = 0.1f;
        }
    }

    void ConfigureDepthCamera()
    {
        if (depthCamera != null)
        {
            depthCamera.resolutionWidth = 640;
            depthCamera.resolutionHeight = 480;
            depthCamera.maxRange = 5.0f;
            depthCamera.minRange = 0.3f;
        }
    }

    void ConfigureImu()
    {
        if (imu != null)
        {
            imu.updateRate = 100; // 100 Hz
        }
    }

    void Update()
    {
        // Simulate sensor readings
        SimulateLidar();
        SimulateDepthCamera();
        SimulateImu();

        // Process sensor data
        ProcessSensorData();
    }

    void SimulateLidar()
    {
        if (lidar != null)
        {
            var lidarData = lidar.GeneratePointCloud();
            lidarPointCloud = new List<Vector3>(lidarData.points);
        }
    }

    void SimulateDepthCamera()
    {
        if (depthCamera != null)
        {
            // Depth camera simulation handled in component
        }
    }

    void SimulateImu()
    {
        if (imu != null)
        {
            // IMU data is updated internally
        }
    }

    void ProcessSensorData()
    {
        // Example: Combine sensor data for environment understanding
        ProcessLidarData();
        ProcessDepthData();
        ProcessImuData();

        // Example: Sensor fusion
        PerformSensorFusion();
    }

    void ProcessLidarData()
    {
        // Process LiDAR point cloud
        // Example: Detect obstacles from point cloud
        foreach (Vector3 point in lidarPointCloud)
        {
            // Transform to robot frame
            Vector3 robotFramePoint = transform.InverseTransformPoint(point);

            // Check if point is close enough to be an obstacle
            if (robotFramePoint.magnitude < 2.0f && robotFramePoint.z > 0)
            {
                // Potential obstacle in front of robot
                Debug.DrawLine(transform.position, point, Color.red);
            }
        }
    }

    void ProcessDepthData()
    {
        // Process depth camera data
        // Example: Find surfaces in depth image
    }

    void ProcessImuData()
    {
        // Process IMU data
        // Example: Detect robot movement patterns
    }

    void PerformSensorFusion()
    {
        // Example: Combine LiDAR and IMU data for better localization
        // This would implement a simple fusion algorithm
    }
}
```

### Example 2: Sensor Data Visualization System
Create a system to visualize different sensor data streams:

```csharp
// Example: Sensor data visualization
using UnityEngine;
using UnityEngine.UI;

public class SensorDataVisualizer : MonoBehaviour
{
    [Header("Visualization Components")]
    public GameObject pointCloudVisualizer;
    public RawImage depthImageView;
    public Text imuDataText;
    public Text fusionStatusText;

    [Header("Visualization Settings")]
    public float pointSize = 0.05f;
    public Color pointColor = Color.red;
    public int maxPointsToShow = 1000;

    private List<GameObject> pointCloudObjects = new List<GameObject>();

    public void UpdateLidarVisualization(Vector3[] points)
    {
        // Clear previous points
        ClearPointCloud();

        // Create new points (up to max limit)
        int pointsToShow = Mathf.Min(points.Length, maxPointsToShow);
        for (int i = 0; i < pointsToShow; i++)
        {
            GameObject pointObj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            pointObj.transform.position = points[i];
            pointObj.transform.localScale = Vector3.one * pointSize;
            pointObj.GetComponent<Renderer>().material.color = pointColor;
            pointObj.GetComponent<Collider>().enabled = false; // Remove collider to avoid physics

            pointCloudObjects.Add(pointObj);
        }
    }

    public void UpdateDepthVisualization(float[,] depthData)
    {
        int width = depthData.GetLength(0);
        int height = depthData.GetLength(1);

        // Create texture for depth visualization
        Texture2D depthTexture = new Texture2D(width, height);
        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < width; x++)
            {
                float depthValue = depthData[x, y];
                float normalizedDepth = Mathf.InverseLerp(0.1f, 5.0f, depthValue);
                Color color = Color.HSVToRGB(normalizedDepth * 0.33f, 1.0f, 1.0f); // Blue to red
                depthTexture.SetPixel(x, y, color);
            }
        }
        depthTexture.Apply();

        depthImageView.texture = depthTexture;
    }

    public void UpdateImuVisualization(ImuSimulation.ImuData imuData)
    {
        string imuText = $"Acceleration: {imuData.acceleration}\n" +
                        $"Angular Velocity: {imuData.angularVelocity}\n" +
                        $"Magnetic Field: {imuData.magneticField}\n" +
                        $"DT: {imuData.deltaTime:F3}s";

        if (imuDataText != null)
        {
            imuDataText.text = imuText;
        }
    }

    public void UpdateFusionStatus(string status)
    {
        if (fusionStatusText != null)
        {
            fusionStatusText.text = status;
        }
    }

    void ClearPointCloud()
    {
        foreach (GameObject obj in pointCloudObjects)
        {
            if (obj != null)
            {
                DestroyImmediate(obj);
            }
        }
        pointCloudObjects.Clear();
    }

    void OnDestroy()
    {
        ClearPointCloud();
    }
}
```

### Example 3: Sensor Calibration System
Create a system for sensor calibration and validation:

```csharp
// Example: Sensor calibration system
using UnityEngine;
using System.Collections.Generic;

public class SensorCalibrationSystem : MonoBehaviour
{
    [Header("Calibration Targets")]
    public GameObject[] calibrationTargets; // Known positions in environment
    public float calibrationDistance = 1.0f;

    [Header("Calibration Settings")]
    public int calibrationSamples = 100;
    public float calibrationTimeout = 10.0f;

    [Header("Sensors to Calibrate")]
    public LidarSimulation lidar;
    public DepthCameraSimulation depthCamera;
    public ImuSimulation imu;

    private bool isCalibrating = false;
    private float calibrationStartTime;
    private Dictionary<string, CalibrationData> calibrationResults =
        new Dictionary<string, CalibrationData>();

    [System.Serializable]
    public class CalibrationData
    {
        public float bias;
        public float scaleFactor;
        public float noiseLevel;
        public float accuracy;
    }

    public void StartLidarCalibration()
    {
        StartCoroutine(CalibrateLidar());
    }

    System.Collections.IEnumerator CalibrateLidar()
    {
        isCalibrating = true;
        calibrationStartTime = Time.time;

        List<float> measurements = new List<float>();
        Vector3 targetPosition = calibrationTargets[0].transform.position;

        // Collect measurements over time
        for (int i = 0; i < calibrationSamples; i++)
        {
            if (Time.time - calibrationStartTime > calibrationTimeout)
            {
                Debug.LogWarning("Calibration timeout reached");
                yield break;
            }

            // Get distance measurement to target
            float measuredDistance = GetLidarDistanceToTarget(targetPosition);
            if (measuredDistance > 0)
            {
                measurements.Add(measuredDistance);
            }

            yield return new WaitForSeconds(0.1f); // Sample every 100ms
        }

        // Calculate calibration parameters
        if (measurements.Count > 0)
        {
            float trueDistance = Vector3.Distance(transform.position, targetPosition);
            float avgMeasurement = GetAverage(measurements);
            float bias = avgMeasurement - trueDistance;
            float noiseLevel = GetStandardDeviation(measurements, avgMeasurement);

            CalibrationData lidarCalibration = new CalibrationData();
            lidarCalibration.bias = bias;
            lidarCalibration.scaleFactor = trueDistance / avgMeasurement;
            lidarCalibration.noiseLevel = noiseLevel;
            lidarCalibration.accuracy = Mathf.Abs(bias);

            calibrationResults["LiDAR"] = lidarCalibration;

            Debug.Log($"LiDAR Calibration Results - Bias: {bias:F3}, Noise: {noiseLevel:F3}");
        }

        isCalibrating = false;
    }

    float GetLidarDistanceToTarget(Vector3 targetPosition)
    {
        // Simplified: Find closest point in point cloud to target
        if (lidar != null)
        {
            var pointCloud = lidar.GeneratePointCloud();
            float minDistance = float.MaxValue;

            foreach (Vector3 point in pointCloud.points)
            {
                float distance = Vector3.Distance(point, targetPosition);
                if (distance < minDistance)
                {
                    minDistance = distance;
                }
            }

            return minDistance < float.MaxValue ? minDistance : -1.0f;
        }

        return -1.0f;
    }

    float GetAverage(List<float> values)
    {
        float sum = 0;
        foreach (float value in values)
        {
            sum += value;
        }
        return sum / values.Count;
    }

    float GetStandardDeviation(List<float> values, float mean)
    {
        float sum = 0;
        foreach (float value in values)
        {
            sum += Mathf.Pow(value - mean, 2);
        }
        return Mathf.Sqrt(sum / values.Count);
    }

    public CalibrationData GetCalibrationResult(string sensorName)
    {
        if (calibrationResults.ContainsKey(sensorName))
        {
            return calibrationResults[sensorName];
        }

        return new CalibrationData(); // Default values
    }

    public bool IsCalibrated(string sensorName)
    {
        return calibrationResults.ContainsKey(sensorName);
    }
}
```

## Hands-On Exercises

### Exercise 1: LiDAR Data Analysis
**Objective**: Analyze LiDAR point cloud data to detect obstacles and map the environment.

**Setup**: Use the multi-sensor robot from Example 1

**Steps**:
1. Generate LiDAR data for a simple environment with known obstacles
2. Implement a clustering algorithm to group points into objects
3. Calculate the position and size of detected obstacles
4. Compare detected obstacles with ground truth
5. Calculate detection accuracy metrics

**Expected Learning**: Understanding of point cloud processing and obstacle detection.

### Exercise 2: Depth Camera vs. LiDAR Comparison
**Objective**: Compare the capabilities of depth cameras and LiDAR sensors.

**Steps**:
1. Set up the same environment with both sensors
2. Collect data from both sensors simultaneously
3. Analyze the differences in coverage, resolution, and accuracy
4. Identify scenarios where each sensor performs better
5. Document the trade-offs between the two technologies

**Expected Learning**: Understanding of different sensor characteristics and applications.

### Exercise 3: IMU Integration and Drift
**Objective**: Explore the challenges of IMU integration for position estimation.

**Steps**:
1. Create a simple IMU simulation with known motion
2. Integrate acceleration data to estimate velocity and position
3. Compare integrated position with ground truth
4. Observe how drift accumulates over time
5. Implement simple drift correction techniques

**Expected Learning**: Understanding of IMU limitations and integration challenges.

### Exercise 4: Sensor Fusion Implementation
**Objective**: Implement a simple sensor fusion algorithm combining multiple sensors.

**Steps**:
1. Use the multi-sensor platform from Example 1
2. Implement a weighted average fusion of position estimates
3. Implement a basic Kalman filter for IMU-LiDAR fusion
4. Compare fused results with individual sensor results
5. Analyze the improvement in accuracy and robustness

**Expected Learning**: Understanding of sensor fusion principles and implementation.

### Exercise 5: Sensor Failure Simulation
**Objective**: Understand how sensor fusion systems handle sensor failures.

**Steps**:
1. Implement sensor failure detection in your fusion system
2. Simulate sensor failures (data dropout, bias jumps, noise increase)
3. Test how the fusion system adapts to missing or degraded sensors
4. Implement fallback strategies when sensors fail
5. Evaluate system robustness under various failure scenarios

**Expected Learning**: Understanding of robust sensor fusion design.

## Troubleshooting Common Sensor Issues

### Issue 1: LiDAR Multi-path Interference
**Symptoms**: Incorrect distance measurements, especially with reflective surfaces
**Solutions**:
- Implement surface reflectance modeling
- Use statistical validation of measurements
- Apply temporal filtering to reject outliers
- Consider using multiple LiDAR sensors for validation

### Issue 2: Depth Camera Range Limitations
**Symptoms**: Missing data at close or far ranges, inconsistent measurements
**Solutions**:
- Implement proper near/far plane settings
- Use multiple depth sensors for extended range
- Apply inpainting algorithms for hole filling
- Combine with other sensors for complete coverage

### Issue 3: IMU Bias and Drift
**Symptoms**: Position estimates drift over time, accumulating errors
**Solutions**:
- Implement regular calibration procedures
- Use sensor fusion to correct drift
- Apply zero-velocity updates when possible
- Implement adaptive bias estimation

### Issue 4: Sensor Synchronization
**Symptoms**: Misaligned sensor data, inconsistent fusion results
**Solutions**:
- Implement proper timestamping
- Use interpolation for different sampling rates
- Apply time delay compensation
- Validate synchronization with known motion

## Assessment and Validation

### Self-Assessment Questions
1. How did the multi-sensor approach improve your robot's perception compared to single sensors?
2. What were the main challenges you encountered in implementing sensor fusion?
3. How did sensor calibration affect the accuracy of your system?
4. What strategies did you use to handle sensor failures or degradation?

### Validation Checklist
- [ ] LiDAR point cloud shows expected environment structure
- [ ] Depth camera provides consistent range measurements
- [ ] IMU data reflects actual motion patterns
- [ ] Sensor fusion improves overall accuracy
- [ ] System handles sensor failures gracefully
- [ ] Calibration procedures improve sensor accuracy

## Extension Activities

### Advanced Exercise: SLAM Implementation
Combine sensor data for Simultaneous Localization and Mapping:
1. Implement a simple 2D LiDAR SLAM algorithm
2. Use IMU data to improve odometry
3. Create maps of unknown environments
4. Evaluate mapping accuracy and consistency

### Research Project: Multi-Robot Sensor Fusion
Explore distributed sensor fusion across multiple robots:
1. Design communication protocols for sensor sharing
2. Implement distributed fusion algorithms
3. Test scalability with increasing numbers of robots
4. Analyze the benefits of multi-robot sensing

## Best Practices Summary

### For Sensor Simulation
1. **Model Realistic Noise**: Include appropriate noise models for each sensor type
2. **Validate Against Reality**: Compare simulated data with real sensor characteristics
3. **Consider Environmental Factors**: Account for lighting, weather, and surface properties
4. **Maintain Performance**: Optimize simulation for real-time execution

### For Sensor Fusion
1. **Understand Sensor Limitations**: Know the strengths and weaknesses of each sensor
2. **Handle Time Synchronization**: Properly align data from different sensors
3. **Implement Robustness**: Design systems that handle sensor failures gracefully
4. **Validate Results**: Continuously assess fusion performance against ground truth

### For Educational Applications
1. **Start Simple**: Begin with basic single-sensor systems before moving to fusion
2. **Visualize Data**: Provide clear visualization of sensor outputs
3. **Compare Approaches**: Show the benefits of multi-sensor systems
4. **Include Real-World Context**: Connect simulation to real robotics applications

These practical examples and exercises provide hands-on experience with sensor simulation and fusion, helping students understand the complexities and benefits of multi-sensor robotics systems.