# Sensor Fusion: Combining Multiple Sensor Inputs

Sensor fusion is the process of combining data from multiple sensors to achieve better accuracy, reliability, and robustness than could be achieved by using a single sensor alone. In robotics, sensor fusion is essential for creating comprehensive perception systems that enable robots to understand their environment and navigate effectively.

## Understanding Sensor Fusion

### Why Sensor Fusion is Important
Individual sensors have limitations:
- **LiDAR**: Excellent for distance measurement but limited in texture information
- **Cameras**: Rich visual information but affected by lighting conditions
- **IMU**: High-frequency motion data but prone to drift over time
- **GPS**: Accurate positioning but limited indoors and in urban canyons

Sensor fusion combines the strengths of different sensors while compensating for their individual weaknesses.

### Types of Sensor Fusion
- **Data-Level Fusion**: Combines raw sensor data before processing
- **Feature-Level Fusion**: Combines extracted features from different sensors
- **Decision-Level Fusion**: Combines decisions or classifications from different sensors
- **Hybrid Fusion**: Combines multiple fusion levels

## Mathematical Foundations

### Kalman Filter Basics
The Kalman filter is a fundamental algorithm for sensor fusion, particularly for IMU and other continuous measurements:

```csharp
// Example: Basic Kalman Filter implementation for position estimation
using UnityEngine;

public class KalmanFilter
{
    // State vector [position, velocity]
    private Matrix state;           // [2x1] state vector [x, v]
    private Matrix covariance;      // [2x2] error covariance matrix
    private Matrix processNoise;    // [2x2] process noise covariance
    private Matrix measurementNoise; // [1x1] measurement noise covariance
    private Matrix transition;      // [2x2] state transition model
    private Matrix observation;     // [1x2] observation model

    public KalmanFilter(float initialPosition, float initialVelocity,
                       float processNoiseValue, float measurementNoiseValue)
    {
        // Initialize state [position, velocity]
        state = new Matrix(2, 1);
        state[0, 0] = initialPosition;
        state[1, 0] = initialVelocity;

        // Initialize covariance matrix
        covariance = new Matrix(2, 2);
        covariance[0, 0] = 1.0f;  // Position uncertainty
        covariance[1, 1] = 1.0f;  // Velocity uncertainty

        // Process noise (system model uncertainty)
        processNoise = new Matrix(2, 2);
        processNoise[0, 0] = processNoiseValue;
        processNoise[1, 1] = processNoiseValue;

        // Measurement noise (sensor uncertainty)
        measurementNoise = new Matrix(1, 1);
        measurementNoise[0, 0] = measurementNoiseValue;

        // State transition model (constant velocity model)
        transition = new Matrix(2, 2);
        // Will be updated with time in prediction step

        // Observation model (we can measure position)
        observation = new Matrix(1, 2);
        observation[0, 0] = 1.0f;  // We can observe position
        observation[0, 1] = 0.0f;  // We don't directly observe velocity
    }

    public void Predict(float deltaTime)
    {
        // Update transition matrix with time
        transition[0, 0] = 1.0f;
        transition[0, 1] = deltaTime;
        transition[1, 0] = 0.0f;
        transition[1, 1] = 1.0f;

        // Predict state: x_pred = F * x
        Matrix newState = transition * state;

        // Predict covariance: P_pred = F * P * F^T + Q
        Matrix transitionT = transition.Transpose();
        Matrix newCovariance = (transition * covariance * transitionT) + processNoise;

        state = newState;
        covariance = newCovariance;
    }

    public void Update(float measurement)
    {
        // Innovation: y = z - H * x_pred
        Matrix innovation = new Matrix(1, 1);
        innovation[0, 0] = measurement - (observation * state)[0, 0];

        // Innovation covariance: S = H * P_pred * H^T + R
        Matrix innovationCov = observation * covariance * observation.Transpose() + measurementNoise;

        // Kalman gain: K = P_pred * H^T * S^(-1)
        Matrix kalmanGain = covariance * observation.Transpose() * innovationCov.Inverse();

        // Update state: x_new = x_pred + K * y
        state = state + kalmanGain * innovation;

        // Update covariance: P_new = (I - K * H) * P_pred
        Matrix identity = Matrix.Identity(2);
        Matrix temp = identity - (kalmanGain * observation);
        covariance = temp * covariance;
    }

    public float GetPosition() { return state[0, 0]; }
    public float GetVelocity() { return state[1, 0]; }
}

// Simple Matrix class for Kalman filter (simplified implementation)
public class Matrix
{
    private float[,] data;
    private int rows, cols;

    public Matrix(int r, int c)
    {
        rows = r;
        cols = c;
        data = new float[rows, cols];
    }

    public float this[int r, int c]
    {
        get { return data[r, c]; }
        set { data[r, c] = value; }
    }

    public static Matrix operator*(Matrix a, Matrix b)
    {
        if (a.cols != b.rows) throw new System.ArgumentException("Matrix dimensions don't match");

        Matrix result = new Matrix(a.rows, b.cols);
        for (int i = 0; i < a.rows; i++)
        {
            for (int j = 0; j < b.cols; j++)
            {
                float sum = 0;
                for (int k = 0; k < a.cols; k++)
                {
                    sum += a[i, k] * b[k, j];
                }
                result[i, j] = sum;
            }
        }
        return result;
    }

    public static Matrix operator+(Matrix a, Matrix b)
    {
        if (a.rows != b.rows || a.cols != b.cols) throw new System.ArgumentException("Matrix dimensions don't match");

        Matrix result = new Matrix(a.rows, a.cols);
        for (int i = 0; i < a.rows; i++)
        {
            for (int j = 0; j < a.cols; j++)
            {
                result[i, j] = a[i, j] + b[i, j];
            }
        }
        return result;
    }

    public static Matrix operator-(Matrix a, Matrix b)
    {
        if (a.rows != b.rows || a.cols != b.cols) throw new System.ArgumentException("Matrix dimensions don't match");

        Matrix result = new Matrix(a.rows, a.cols);
        for (int i = 0; i < a.rows; i++)
        {
            for (int j = 0; j < a.cols; j++)
            {
                result[i, j] = a[i, j] - b[i, j];
            }
        }
        return result;
    }

    public Matrix Transpose()
    {
        Matrix result = new Matrix(cols, rows);
        for (int i = 0; i < rows; i++)
        {
            for (int j = 0; j < cols; j++)
            {
                result[j, i] = data[i, j];
            }
        }
        return result;
    }

    public Matrix Inverse()
    {
        // Simplified 2x2 matrix inverse (for demonstration)
        if (rows == 2 && cols == 2)
        {
            Matrix result = new Matrix(2, 2);
            float det = data[0, 0] * data[1, 1] - data[0, 1] * data[1, 0];
            if (det != 0)
            {
                result[0, 0] = data[1, 1] / det;
                result[0, 1] = -data[0, 1] / det;
                result[1, 0] = -data[1, 0] / det;
                result[1, 1] = data[0, 0] / det;
            }
            return result;
        }
        throw new System.NotImplementedException("Only 2x2 matrix inverse implemented for demo");
    }

    public static Matrix Identity(int size)
    {
        Matrix result = new Matrix(size, size);
        for (int i = 0; i < size; i++)
        {
            result[i, i] = 1.0f;
        }
        return result;
    }
}
```

### Extended Kalman Filter (EKF)
For non-linear systems, the Extended Kalman Filter linearizes around the current estimate:

```csharp
// Example: Simplified EKF for robot pose estimation
public class ExtendedKalmanFilter
{
    // State: [x, y, theta] (position and orientation)
    private Vector3 state;           // [x, y, theta]
    private Matrix covariance;       // [3x3] covariance matrix
    private Matrix processNoise;     // Process noise
    private Matrix measurementNoise; // Measurement noise

    public ExtendedKalmanFilter(Vector3 initialState, Matrix initialCovariance)
    {
        state = initialState;
        covariance = initialCovariance;

        // Initialize noise matrices
        processNoise = new Matrix(3, 3);
        processNoise[0, 0] = 0.1f;  // x process noise
        processNoise[1, 1] = 0.1f;  // y process noise
        processNoise[2, 2] = 0.05f; // theta process noise

        measurementNoise = new Matrix(3, 3);
        measurementNoise[0, 0] = 0.5f;  // x measurement noise
        measurementNoise[1, 1] = 0.5f;  // y measurement noise
        measurementNoise[2, 2] = 0.1f;  // theta measurement noise
    }

    // Predict step using motion model
    public void Predict(Vector2 controlInput, float deltaTime)
    {
        // Motion model: simple differential drive
        float velocity = controlInput.x;      // Linear velocity
        float angularVelocity = controlInput.y; // Angular velocity

        // Update state prediction
        state.x += velocity * Mathf.Cos(state.z) * deltaTime;
        state.y += velocity * Mathf.Sin(state.z) * deltaTime;
        state.z += angularVelocity * deltaTime;

        // Normalize angle to [-π, π]
        state.z = Mathf.Repeat(state.z + Mathf.PI, 2 * Mathf.PI) - Mathf.PI;

        // Compute Jacobian of motion model
        Matrix jacobian = ComputeMotionJacobian(velocity, angularVelocity, deltaTime);

        // Update covariance
        Matrix jacobianT = jacobian.Transpose();
        covariance = jacobian * covariance * jacobianT + processNoise;
    }

    // Update step with measurement
    public void Update(Vector3 measurement)
    {
        // Innovation
        Vector3 innovation = measurement - state;

        // Normalize angle difference
        innovation.z = Mathf.Repeat(innovation.z + Mathf.PI, 2 * Mathf.PI) - Mathf.PI;

        // Innovation covariance
        Matrix innovationCov = covariance + measurementNoise;

        // Kalman gain
        Matrix kalmanGain = covariance * innovationCov.Inverse();

        // Update state
        Vector3 update = MultiplyMatrixByVector(kalmanGain, innovation);
        state += update;

        // Normalize angle
        state.z = Mathf.Repeat(state.z + Mathf.PI, 2 * Mathf.PI) - Mathf.PI;

        // Update covariance
        Matrix identity = Matrix.Identity(3);
        covariance = (identity - kalmanGain) * covariance;
    }

    Matrix ComputeMotionJacobian(float velocity, float angularVelocity, float deltaTime)
    {
        Matrix jacobian = new Matrix(3, 3);

        // Partial derivatives of motion model
        if (Mathf.Abs(angularVelocity) > 0.001f)
        {
            jacobian[0, 0] = 1.0f;  // ∂x/∂x
            jacobian[0, 1] = 0.0f;  // ∂x/∂y
            jacobian[0, 2] = -velocity / angularVelocity * Mathf.Sin(state.z) +
                             velocity / angularVelocity * Mathf.Sin(state.z + angularVelocity * deltaTime); // ∂x/∂theta

            jacobian[1, 0] = 0.0f;  // ∂y/∂x
            jacobian[1, 1] = 1.0f;  // ∂y/∂y
            jacobian[1, 2] = velocity / angularVelocity * Mathf.Cos(state.z) -
                             velocity / angularVelocity * Mathf.Cos(state.z + angularVelocity * deltaTime); // ∂y/∂theta
        }
        else
        {
            // For small angular velocity (straight line motion)
            jacobian[0, 0] = 1.0f;
            jacobian[0, 1] = 0.0f;
            jacobian[0, 2] = -velocity * Mathf.Sin(state.z) * deltaTime; // ∂x/∂theta

            jacobian[1, 0] = 0.0f;
            jacobian[1, 1] = 1.0f;
            jacobian[1, 2] = velocity * Mathf.Cos(state.z) * deltaTime;  // ∂y/∂theta
        }

        jacobian[2, 0] = 0.0f;  // ∂theta/∂x
        jacobian[2, 1] = 0.0f;  // ∂theta/∂y
        jacobian[2, 2] = 1.0f;  // ∂theta/∂theta

        return jacobian;
    }

    Vector3 MultiplyMatrixByVector(Matrix m, Vector3 v)
    {
        Vector3 result = new Vector3();
        result.x = m[0, 0] * v.x + m[0, 1] * v.y + m[0, 2] * v.z;
        result.y = m[1, 0] * v.x + m[1, 1] * v.y + m[1, 2] * v.z;
        result.z = m[2, 0] * v.x + m[2, 1] * v.y + m[2, 2] * v.z;
        return result;
    }

    public Vector3 GetState() { return state; }
    public Matrix GetCovariance() { return covariance; }
}
```

## Sensor Fusion Architectures

### Centralized Fusion
All sensor data is sent to a central processor that performs the fusion:
- **Advantages**: Optimal fusion, complete information
- **Disadvantages**: Single point of failure, high computational load
- **Best for**: Small number of sensors, high-performance computing

### Distributed Fusion
Each sensor performs local processing, then fused at higher level:
- **Advantages**: Reduced communication, fault tolerance
- **Disadvantages**: Potential information loss, complexity
- **Best for**: Large sensor networks, limited communication

### Hierarchical Fusion
Multiple levels of fusion, from local to global:
- **Advantages**: Balanced approach, good scalability
- **Disadvantages**: Complex design and implementation
- **Best for**: Complex multi-robot systems

## Multi-Sensor Fusion Examples

### IMU + LiDAR Fusion
```csharp
// Example: IMU and LiDAR fusion for improved odometry
using UnityEngine;
using System.Collections.Generic;

public class ImuLidarFusion
{
    private ExtendedKalmanFilter ekf;
    private Queue<Vector3> imuQueue = new Queue<Vector3>();
    private Queue<float> imuTimeQueue = new Queue<float>();

    private Vector3 lastLidarPosition = Vector3.zero;
    private float lastLidarTime = 0.0f;

    public struct FusedState
    {
        public Vector3 position;
        public Vector3 velocity;
        public Vector3 orientation;
        public Matrix uncertainty;
    }

    public void Initialize(Vector3 initialPosition, Vector3 initialOrientation)
    {
        Vector3 initialState = new Vector3(initialPosition.x, initialPosition.y, initialOrientation.y); // x, y, theta
        Matrix initialCovariance = Matrix.Identity(3);
        initialCovariance[0, 0] = 1.0f; // x uncertainty
        initialCovariance[1, 1] = 1.0f; // y uncertainty
        initialCovariance[2, 2] = 0.5f; // theta uncertainty

        ekf = new ExtendedKalmanFilter(initialState, initialCovariance);
    }

    public void ProcessImuData(Vector3 linearAcceleration, Vector3 angularVelocity, float timestamp)
    {
        // Store IMU data with timestamp
        imuQueue.Enqueue(linearAcceleration);
        imuTimeQueue.Enqueue(timestamp);

        // Integrate IMU data for prediction
        float deltaTime = 0.01f; // Assuming 100Hz IMU
        Vector2 controlInput = new Vector2(linearAcceleration.magnitude, angularVelocity.y); // Simplified

        ekf.Predict(controlInput, deltaTime);
    }

    public FusedState ProcessLidarData(Vector3 lidarPosition, float lidarTimestamp)
    {
        // Use LiDAR position as measurement
        Vector3 measurement = new Vector3(lidarPosition.x, lidarPosition.y, 0); // Only x,y from LiDAR, theta from EKF

        // Update EKF with LiDAR measurement
        ekf.Update(measurement);

        // Return fused state
        Vector3 state = ekf.GetState();
        FusedState fused = new FusedState();
        fused.position = new Vector3(state.x, state.y, lastLidarPosition.z); // Keep z from LiDAR or other source
        fused.orientation = new Vector3(0, state.z, 0); // Assuming 2D motion for simplicity
        fused.velocity = EstimateVelocityFromImu(); // Estimate from IMU integration
        fused.uncertainty = ekf.GetCovariance();

        lastLidarPosition = lidarPosition;
        lastLidarTime = lidarTimestamp;

        return fused;
    }

    Vector3 EstimateVelocityFromImu()
    {
        // Simplified velocity estimation from IMU
        // In practice, this would be more sophisticated
        return Vector3.zero; // Placeholder
    }
}
```

### Camera + LiDAR Fusion
```csharp
// Example: Camera and LiDAR fusion for object detection
using UnityEngine;
using System.Collections.Generic;

public class CameraLidarFusion
{
    // Data structures for fusion
    public struct FusedDetection
    {
        public Vector3 position;      // 3D position from LiDAR
        public string objectType;     // Classification from camera
        public float confidence;      // Combined confidence
        public Bounds boundingBox3D;  // 3D bounding box
    }

    public struct CameraDetection
    {
        public Rect boundingBox2D;    // 2D bounding box in image
        public string objectType;
        public float confidence;
    }

    public struct LidarDetection
    {
        public Vector3[] points;      // Point cloud cluster
        public Vector3 center;        // Center of cluster
        public float confidence;
    }

    // Project LiDAR points to camera image
    public List<FusedDetection> FuseCameraLidar(
        List<CameraDetection> cameraDetections,
        List<LidarDetection> lidarDetections,
        Matrix cameraIntrinsic,
        Matrix extrinsicCameraLidar)
    {
        List<FusedDetection> fusedDetections = new List<FusedDetection>();

        foreach (var lidarDetection in lidarDetections)
        {
            // Project 3D LiDAR cluster center to 2D image
            Vector3 lidarCenterInCamera = TransformPoint(lidarDetection.center, extrinsicCameraLidar);
            Vector2 imagePoint = ProjectToImage(lidarCenterInCamera, cameraIntrinsic);

            // Find corresponding camera detection
            CameraDetection? matchingCameraDetection = FindMatchingCameraDetection(
                cameraDetections, imagePoint);

            FusedDetection fused = new FusedDetection();
            fused.position = lidarDetection.center;
            fused.confidence = lidarDetection.confidence;

            if (matchingCameraDetection.HasValue)
            {
                fused.objectType = matchingCameraDetection.Value.objectType;
                fused.confidence = CombineConfidences(
                    lidarDetection.confidence,
                    matchingCameraDetection.Value.confidence);

                // Create 3D bounding box from point cloud
                fused.boundingBox3D = CreateBoundingBoxFromPoints(lidarDetection.points);
            }
            else
            {
                fused.objectType = "unknown";
            }

            fusedDetections.Add(fused);
        }

        return fusedDetections;
    }

    Vector3 TransformPoint(Vector3 point, Matrix transform)
    {
        // Apply 4x4 transformation matrix to 3D point
        // Convert to homogeneous coordinates
        Vector4 homogeneous = new Vector4(point.x, point.y, point.z, 1.0f);

        // Apply transformation
        Vector4 transformed = new Vector4();
        transformed.x = transform[0, 0] * homogeneous.x + transform[0, 1] * homogeneous.y +
                        transform[0, 2] * homogeneous.z + transform[0, 3] * homogeneous.w;
        transformed.y = transform[1, 0] * homogeneous.x + transform[1, 1] * homogeneous.y +
                        transform[1, 2] * homogeneous.z + transform[1, 3] * homogeneous.w;
        transformed.z = transform[2, 0] * homogeneous.x + transform[2, 1] * homogeneous.y +
                        transform[2, 2] * homogeneous.z + transform[2, 3] * homogeneous.w;
        float w = transform[3, 0] * homogeneous.x + transform[3, 1] * homogeneous.y +
                  transform[3, 2] * homogeneous.z + transform[3, 3] * homogeneous.w;

        // Perspective division
        return new Vector3(transformed.x / w, transformed.y / w, transformed.z / w);
    }

    Vector2 ProjectToImage(Vector3 point3D, Matrix intrinsic)
    {
        // Simple pinhole camera model
        Vector2 pixel = new Vector2();
        pixel.x = intrinsic[0, 0] * point3D.x / point3D.z + intrinsic[0, 2];
        pixel.y = intrinsic[1, 1] * point3D.y / point3D.z + intrinsic[1, 2];
        return pixel;
    }

    CameraDetection? FindMatchingCameraDetection(List<CameraDetection> detections, Vector2 point2D)
    {
        foreach (var detection in detections)
        {
            if (detection.boundingBox2D.Contains(point2D))
            {
                return detection;
            }
        }
        return null;
    }

    float CombineConfidences(float confidence1, float confidence2)
    {
        // Simple weighted combination
        // Could use more sophisticated methods like Dempster-Shafer theory
        return (confidence1 + confidence2) / 2.0f;
    }

    Bounds CreateBoundingBoxFromPoints(Vector3[] points)
    {
        if (points.Length == 0) return new Bounds();

        Vector3 min = points[0];
        Vector3 max = points[0];

        foreach (Vector3 point in points)
        {
            min = Vector3.Min(min, point);
            max = Vector3.Max(max, point);
        }

        Vector3 center = (min + max) / 2.0f;
        Vector3 size = max - min;

        return new Bounds(center, size);
    }
}
```

## Fusion Algorithms Comparison

### Kalman Filter
- **Best for**: Linear systems with Gaussian noise
- **Strengths**: Optimal for linear systems, well-understood
- **Weaknesses**: Limited to linear systems, sensitive to model assumptions

### Particle Filter
- **Best for**: Non-linear, non-Gaussian systems
- **Strengths**: Handles multi-modal distributions, robust
- **Weaknesses**: Computationally expensive, particle degeneracy

### Complementary Filter
- **Best for**: Combining sensors with different frequency characteristics
- **Strengths**: Simple to implement, good for IMU integration
- **Weaknesses**: Suboptimal, requires manual tuning

## Implementation Considerations

### Time Synchronization
```csharp
// Example: Time synchronization for sensor fusion
public class SensorTimeSync
{
    private struct SensorReading
    {
        public float timestamp;
        public object data;
        public int sensorId;
    }

    private Queue<SensorReading>[] sensorBuffers;
    private int numSensors;

    public SensorTimeSync(int sensorCount)
    {
        numSensors = sensorCount;
        sensorBuffers = new Queue<SensorReading>[sensorCount];
        for (int i = 0; i < sensorCount; i++)
        {
            sensorBuffers[i] = new Queue<SensorReading>();
        }
    }

    public void AddReading(int sensorId, object data, float timestamp)
    {
        SensorReading reading = new SensorReading();
        reading.timestamp = timestamp;
        reading.data = data;
        reading.sensorId = sensorId;

        sensorBuffers[sensorId].Enqueue(reading);

        // Keep buffer size reasonable
        if (sensorBuffers[sensorId].Count > 100)
        {
            sensorBuffers[sensorId].Dequeue();
        }
    }

    public bool TryGetSynchronizedReadings(float targetTime, float tolerance, out object[] syncedReadings)
    {
        syncedReadings = new object[numSensors];
        bool allSensorsAvailable = true;

        for (int i = 0; i < numSensors; i++)
        {
            // Find closest reading to target time
            SensorReading closestReading = new SensorReading();
            float minTimeDiff = float.MaxValue;
            bool found = false;

            // Look through buffer to find closest reading
            Queue<SensorReading> tempBuffer = new Queue<SensorReading>();
            while (sensorBuffers[i].Count > 0)
            {
                SensorReading reading = sensorBuffers[i].Dequeue();
                float timeDiff = Mathf.Abs(reading.timestamp - targetTime);

                if (timeDiff < minTimeDiff)
                {
                    minTimeDiff = timeDiff;
                    closestReading = reading;
                    found = true;
                }

                tempBuffer.Enqueue(reading);
            }

            // Restore buffer
            sensorBuffers[i] = tempBuffer;

            if (found && minTimeDiff <= tolerance)
            {
                syncedReadings[i] = closestReading.data;
            }
            else
            {
                allSensorsAvailable = false;
            }
        }

        return allSensorsAvailable;
    }
}
```

### Handling Sensor Failures
```csharp
// Example: Robust sensor fusion with failure handling
public class RobustSensorFusion
{
    public enum SensorStatus
    {
        Good,
        Degraded,
        Failed
    }

    private Dictionary<int, SensorStatus> sensorStatus = new Dictionary<int, SensorStatus>();
    private Dictionary<int, float> lastUpdateTime = new Dictionary<int, float>();

    public void UpdateSensorStatus(int sensorId, bool dataValid, float currentTime)
    {
        if (!dataValid)
        {
            // Check if it's a temporary issue or failure
            if (sensorStatus.ContainsKey(sensorId) && sensorStatus[sensorId] == SensorStatus.Good)
            {
                if (lastUpdateTime.ContainsKey(sensorId) &&
                    currentTime - lastUpdateTime[sensorId] > 5.0f) // 5 seconds timeout
                {
                    sensorStatus[sensorId] = SensorStatus.Failed;
                }
                else
                {
                    sensorStatus[sensorId] = SensorStatus.Degraded;
                }
            }
        }
        else
        {
            sensorStatus[sensorId] = SensorStatus.Good;
            lastUpdateTime[sensorId] = currentTime;
        }
    }

    public float GetSensorWeight(int sensorId)
    {
        if (!sensorStatus.ContainsKey(sensorId))
            return 0.0f;

        switch (sensorStatus[sensorId])
        {
            case SensorStatus.Good:
                return 1.0f;
            case SensorStatus.Degraded:
                return 0.5f;
            case SensorStatus.Failed:
                return 0.0f;
            default:
                return 0.0f;
        }
    }
}
```

## Performance Optimization

### Efficient Fusion Pipeline
```csharp
// Example: Efficient sensor fusion pipeline
public class EfficientFusionPipeline
{
    [Header("Performance Settings")]
    public bool enableMultiThreading = true;
    public int fusionRate = 50; // Hz
    public int maxQueueSize = 100;

    private System.Collections.Concurrent.ConcurrentQueue<SensorData> sensorQueue;
    private System.Threading.Thread fusionThread;
    private volatile bool isRunning = false;

    public struct SensorData
    {
        public int sensorType;
        public object data;
        public float timestamp;
    }

    void StartFusion()
    {
        sensorQueue = new System.Collections.Concurrent.ConcurrentQueue<SensorData>();
        isRunning = true;

        if (enableMultiThreading)
        {
            fusionThread = new System.Threading.Thread(FusionLoop);
            fusionThread.Start();
        }
    }

    void FusionLoop()
    {
        float fusionInterval = 1.0f / fusionRate;
        float lastFusionTime = UnityEngine.Time.time;

        while (isRunning)
        {
            float currentTime = UnityEngine.Time.time;
            if (currentTime - lastFusionTime >= fusionInterval)
            {
                ProcessAvailableData();
                lastFusionTime = currentTime;
            }

            System.Threading.Thread.Sleep(1); // Small sleep to prevent busy waiting
        }
    }

    void ProcessAvailableData()
    {
        // Process all available sensor data
        while (sensorQueue.Count > 0)
        {
            if (sensorQueue.TryDequeue(out SensorData data))
            {
                ProcessSensorData(data);
            }
        }

        // Perform fusion with accumulated data
        PerformFusionStep();
    }

    void ProcessSensorData(SensorData data)
    {
        // Process individual sensor data
        switch (data.sensorType)
        {
            case 0: // IMU
                ProcessImuData(data.data, data.timestamp);
                break;
            case 1: // LiDAR
                ProcessLidarData(data.data, data.timestamp);
                break;
            case 2: // Camera
                ProcessCameraData(data.data, data.timestamp);
                break;
        }
    }

    void PerformFusionStep()
    {
        // Perform the actual fusion computation
        // This would integrate all processed sensor data
    }

    void ProcessImuData(object data, float timestamp) { /* Implementation */ }
    void ProcessLidarData(object data, float timestamp) { /* Implementation */ }
    void ProcessCameraData(object data, float timestamp) { /* Implementation */ }

    void StopFusion()
    {
        isRunning = false;
        fusionThread?.Join();
    }
}
```

## Applications in Robotics Education

### Multi-Sensor Navigation
- Combine wheel encoders, IMU, and LiDAR for robust localization
- Implement SLAM with multiple sensor inputs
- Learn about sensor complementarity

### Object Detection and Tracking
- Fuse camera and LiDAR for improved object detection
- Track objects using multiple sensor modalities
- Understand uncertainty propagation

### Human-Robot Interaction
- Combine multiple sensors for robust human detection
- Use sensor fusion for gesture recognition
- Implement safe interaction based on multi-sensor awareness

## Assessment Questions

1. What are the main advantages of sensor fusion over single-sensor approaches?
2. When would you choose a Kalman filter vs. a particle filter for sensor fusion?
3. How do you handle time synchronization between different sensors?
4. What are the challenges in fusing data from sensors with different update rates?
5. How can you detect and handle sensor failures in a fusion system?

## Next Steps

After understanding sensor fusion concepts, you'll have a comprehensive foundation for implementing multi-sensor systems in robotics applications. The next steps involve practical implementation and validation of these fusion algorithms in real-world scenarios.