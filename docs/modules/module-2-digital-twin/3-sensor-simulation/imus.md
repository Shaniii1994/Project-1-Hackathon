# IMU Simulation and Data

An Inertial Measurement Unit (IMU) is a critical sensor in robotics that measures specific force, angular rate, and sometimes the magnetic field surrounding the body. IMUs provide essential information about a robot's motion and orientation, making them fundamental for navigation, stabilization, and control applications.

## Understanding IMU Technology

### IMU Components
A typical IMU consists of multiple sensors:
- **Accelerometer**: Measures linear acceleration along three axes (X, Y, Z)
- **Gyroscope**: Measures angular velocity around three axes (roll, pitch, yaw)
- **Magnetometer**: Measures magnetic field strength along three axes (provides heading reference)

### IMU Specifications
Key parameters that define IMU performance:
- **Range**: Maximum measurable acceleration/rotation rates
- **Resolution**: Smallest detectable change in measurement
- **Bias**: Systematic offset in measurements
- **Noise Density**: Random noise level in measurements
- **Drift**: Slow change in bias over time
- **Bandwidth**: Frequency range of accurate measurements

## IMU Simulation in Robotics Environments

### Basic IMU Implementation
```csharp
// Example: Basic IMU simulation
using UnityEngine;

public class ImuSimulation : MonoBehaviour
{
    [Header("IMU Configuration")]
    public float accelerometerRange = 16.0f; // ±16g
    public float gyroscopeRange = 2000.0f;   // ±2000 deg/s
    public float magnetometerRange = 1300.0f; // ±1300 µT

    [Header("Noise Parameters")]
    public float accelerometerNoise = 0.001f; // g/√Hz
    public float gyroscopeNoise = 0.001f;     // deg/s/√Hz
    public float magnetometerNoise = 0.1f;    // µT

    [Header("Bias Parameters")]
    public float accelerometerBiasX = 0.0f;
    public float accelerometerBiasY = 0.0f;
    public float accelerometerBiasZ = 0.0f;
    public float gyroscopeBiasX = 0.0f;
    public float gyroscopeBiasY = 0.0f;
    public float gyroscopeBiasZ = 0.0f;

    [Header("Sampling")]
    public int updateRate = 100; // Hz

    private float lastUpdateTime;
    private float updateInterval;

    // IMU data structure
    public struct ImuData
    {
        public Vector3 acceleration;    // m/s²
        public Vector3 angularVelocity; // rad/s
        public Vector3 magneticField;   // µT
        public float deltaTime;         // Time since last measurement
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
            SimulateImuReading();
            lastUpdateTime = Time.time;
        }
    }

    ImuData SimulateImuReading()
    {
        ImuData data = new ImuData();

        // Calculate true acceleration (from physics)
        Vector3 trueAcceleration = CalculateTrueAcceleration();

        // Calculate true angular velocity (from rotation changes)
        Vector3 trueAngularVelocity = CalculateTrueAngularVelocity();

        // Calculate true magnetic field (from environment)
        Vector3 trueMagneticField = CalculateTrueMagneticField();

        // Apply IMU characteristics
        data.acceleration = SimulateAccelerometer(trueAcceleration);
        data.angularVelocity = SimulateGyroscope(trueAngularVelocity);
        data.magneticField = SimulateMagnetometer(trueMagneticField);
        data.deltaTime = updateInterval;

        return data;
    }

    Vector3 CalculateTrueAcceleration()
    {
        // Get acceleration from Unity's physics
        // This is a simplified approach - in practice, you'd track velocity changes
        Rigidbody rb = GetComponent<Rigidbody>();
        if (rb != null)
        {
            // Use numerical differentiation of velocity for acceleration
            Vector3 currentVelocity = rb.velocity;
            Vector3 acceleration = (currentVelocity - rb.velocity) / Time.fixedDeltaTime;
            return acceleration;
        }
        else
        {
            // Calculate from forces if no rigidbody
            Vector3 gravity = Physics.gravity;
            Vector3 externalForces = CalculateExternalForces();
            return gravity + externalForces / CalculateMass();
        }
    }

    Vector3 CalculateTrueAngularVelocity()
    {
        // Get angular velocity from rotation changes
        Rigidbody rb = GetComponent<Rigidbody>();
        if (rb != null)
        {
            return rb.angularVelocity; // Already in rad/s
        }
        else
        {
            // Calculate from rotation change
            return CalculateAngularVelocityFromRotation();
        }
    }

    Vector3 CalculateTrueMagneticField()
    {
        // Earth's magnetic field varies by location, but typically ~25-65 µT
        // For simulation, use a representative value
        Vector3 magneticNorth = Vector3.zero;

        // In a real simulation, you'd get this from environmental magnetic field
        // For now, use a default value with local variation
        magneticNorth = new Vector3(23.0f, 5.0f, 42.0f); // Example: ~50 µT total

        return magneticNorth;
    }

    Vector3 SimulateAccelerometer(Vector3 trueAcceleration)
    {
        Vector3 measured = trueAcceleration;

        // Add bias
        measured.x += accelerometerBiasX;
        measured.y += accelerometerBiasY;
        measured.z += accelerometerBiasZ;

        // Add noise
        measured.x += RandomGaussian() * accelerometerNoise;
        measured.y += RandomGaussian() * accelerometerNoise;
        measured.z += RandomGaussian() * accelerometerNoise;

        // Convert from Unity units (m/s²) to g (where 1g = 9.81 m/s²)
        measured /= 9.81f;

        // Apply range limits
        measured.x = Mathf.Clamp(measured.x, -accelerometerRange, accelerometerRange);
        measured.y = Mathf.Clamp(measured.y, -accelerometerRange, accelerometerRange);
        measured.z = Mathf.Clamp(measured.z, -accelerometerRange, accelerometerRange);

        return measured;
    }

    Vector3 SimulateGyroscope(Vector3 trueAngularVelocity)
    {
        Vector3 measured = trueAngularVelocity;

        // Convert from rad/s to deg/s for typical IMU output
        measured *= Mathf.Rad2Deg;

        // Add bias
        measured.x += gyroscopeBiasX;
        measured.y += gyroscopeBiasY;
        measured.z += gyroscopeBiasZ;

        // Add noise
        measured.x += RandomGaussian() * gyroscopeNoise;
        measured.y += RandomGaussian() * gyroscopeNoise;
        measured.z += RandomGaussian() * gyroscopeNoise;

        // Apply range limits
        measured.x = Mathf.Clamp(measured.x, -gyroscopeRange, gyroscopeRange);
        measured.y = Mathf.Clamp(measured.y, -gyroscopeRange, gyroscopeRange);
        measured.z = Mathf.Clamp(measured.z, -gyroscopeRange, gyroscopeRange);

        // Convert back to rad/s
        measured /= Mathf.Rad2Deg;

        return measured;
    }

    Vector3 SimulateMagnetometer(Vector3 trueMagneticField)
    {
        Vector3 measured = trueMagneticField;

        // Add noise
        measured.x += RandomGaussian() * magnetometerNoise;
        measured.y += RandomGaussian() * magnetometerNoise;
        measured.z += RandomGaussian() * magnetometerNoise;

        // Apply range limits
        measured.x = Mathf.Clamp(measured.x, -magnetometerRange, magnetometerRange);
        measured.y = Mathf.Clamp(measured.y, -magnetometerRange, magnetometerRange);
        measured.z = Mathf.Clamp(measured.z, -magnetometerRange, magnetometerRange);

        return measured;
    }

    float RandomGaussian()
    {
        // Box-Muller transform for Gaussian random numbers
        float u1 = Random.value;
        float u2 = Random.value;
        return Mathf.Sqrt(-2.0f * Mathf.Log(u1)) * Mathf.Cos(2.0f * Mathf.PI * u2);
    }

    Vector3 CalculateExternalForces()
    {
        // Calculate forces acting on the object
        // This would include contact forces, applied forces, etc.
        return Vector3.zero; // Simplified for example
    }

    float CalculateMass()
    {
        // Return mass of the object
        Rigidbody rb = GetComponent<Rigidbody>();
        return rb != null ? rb.mass : 1.0f;
    }

    Vector3 CalculateAngularVelocityFromRotation()
    {
        // Calculate angular velocity from rotation changes
        // This is a simplified approach
        return Vector3.zero; // Simplified for example
    }
}
```

## Advanced IMU Simulation with Drift and Temperature Effects

### Bias Drift Simulation
```csharp
// Example: IMU with bias drift simulation
public class AdvancedImuSimulation : MonoBehaviour
{
    [Header("Drift Parameters")]
    public float accelerometerBiasDrift = 0.0001f; // g/s
    public float gyroscopeBiasDrift = 0.0001f;     // deg/s/s
    public float magnetometerBiasDrift = 0.01f;    // µT/s

    [Header("Temperature Effects")]
    public float accelerometerTempCoeff = 0.0001f; // g/°C
    public float gyroscopeTempCoeff = 0.001f;      // deg/s/°C
    public float temperature = 25.0f;              // Current temperature in °C
    public float nominalTemperature = 25.0f;       // Nominal temperature

    private float accumulatedAccelBiasX = 0.0f;
    private float accumulatedAccelBiasY = 0.0f;
    private float accumulatedAccelBiasZ = 0.0f;
    private float accumulatedGyroBiasX = 0.0f;
    private float accumulatedGyroBiasY = 0.0f;
    private float accumulatedGyroBiasZ = 0.0f;

    private float lastTime = 0.0f;

    void Start()
    {
        lastTime = Time.time;
    }

    void Update()
    {
        float currentTime = Time.time;
        float deltaTime = currentTime - lastTime;

        if (deltaTime > 0)
        {
            UpdateBiasDrift(deltaTime);
            lastTime = currentTime;
        }
    }

    void UpdateBiasDrift(float deltaTime)
    {
        // Update accumulated bias drift
        accumulatedAccelBiasX += RandomGaussian() * accelerometerBiasDrift * deltaTime;
        accumulatedAccelBiasY += RandomGaussian() * accelerometerBiasDrift * deltaTime;
        accumulatedAccelBiasZ += RandomGaussian() * accelerometerBiasDrift * deltaTime;

        accumulatedGyroBiasX += RandomGaussian() * gyroscopeBiasDrift * deltaTime;
        accumulatedGyroBiasY += RandomGaussian() * gyroscopeBiasDrift * deltaTime;
        accumulatedGyroBiasZ += RandomGaussian() * gyroscopeBiasDrift * deltaTime;
    }

    Vector3 ApplyAdvancedAccelerometerModel(Vector3 trueAcceleration)
    {
        Vector3 measured = trueAcceleration;

        // Convert to g
        measured /= 9.81f;

        // Add static bias
        measured.x += accelerometerBiasX;
        measured.y += accelerometerBiasY;
        measured.z += accelerometerBiasZ;

        // Add accumulated drift
        measured.x += accumulatedAccelBiasX;
        measured.y += accumulatedAccelBiasY;
        measured.z += accumulatedAccelBiasZ;

        // Add temperature effect
        float tempEffect = (temperature - nominalTemperature) * accelerometerTempCoeff;
        measured.x += tempEffect * RandomGaussian();
        measured.y += tempEffect * RandomGaussian();
        measured.z += tempEffect * RandomGaussian();

        // Add noise
        measured.x += RandomGaussian() * accelerometerNoise;
        measured.y += RandomGaussian() * accelerometerNoise;
        measured.z += RandomGaussian() * accelerometerNoise;

        // Apply range limits
        measured.x = Mathf.Clamp(measured.x, -accelerometerRange, accelerometerRange);
        measured.y = Mathf.Clamp(measured.y, -accelerometerRange, accelerometerRange);
        measured.z = Mathf.Clamp(measured.z, -accelerometerRange, accelerometerRange);

        return measured;
    }

    Vector3 ApplyAdvancedGyroscopeModel(Vector3 trueAngularVelocity)
    {
        Vector3 measured = trueAngularVelocity * Mathf.Rad2Deg; // Convert to deg/s

        // Add static bias
        measured.x += gyroscopeBiasX;
        measured.y += gyroscopeBiasY;
        measured.z += gyroscopeBiasZ;

        // Add accumulated drift
        measured.x += accumulatedGyroBiasX;
        measured.y += accumulatedGyroBiasY;
        measured.z += accumulatedGyroBiasZ;

        // Add temperature effect
        float tempEffect = (temperature - nominalTemperature) * gyroscopeTempCoeff;
        measured.x += tempEffect * RandomGaussian();
        measured.y += tempEffect * RandomGaussian();
        measured.z += tempEffect * RandomGaussian();

        // Add noise
        measured.x += RandomGaussian() * gyroscopeNoise;
        measured.y += RandomGaussian() * gyroscopeNoise;
        measured.z += RandomGaussian() * gyroscopeNoise;

        // Apply range limits
        measured.x = Mathf.Clamp(measured.x, -gyroscopeRange, gyroscopeRange);
        measured.y = Mathf.Clamp(measured.y, -gyroscopeRange, gyroscopeRange);
        measured.z = Mathf.Clamp(measured.z, -gyroscopeRange, gyroscopeRange);

        // Convert back to rad/s
        measured /= Mathf.Rad2Deg;

        return measured;
    }

    float RandomGaussian()
    {
        float u1 = Random.value;
        float u2 = Random.value;
        return Mathf.Sqrt(-2.0f * Mathf.Log(u1)) * Mathf.Cos(2.0f * Mathf.PI * u2);
    }

    // Other parameters and methods from basic implementation...
}
```

## Coordinate Systems and Transformations

### IMU Frame of Reference
IMUs measure in their own body frame, which must be transformed to other coordinate systems:

```csharp
// Example: Coordinate system transformations
public class ImuCoordinateTransform : MonoBehaviour
{
    // Convert IMU readings to world frame
    public ImuData TransformToWorldFrame(ImuData imuData)
    {
        ImuData worldData = new ImuData();

        // Transform acceleration from body to world frame
        // Note: Acceleration transformation is complex due to rotation
        worldData.acceleration = transform.TransformDirection(imuData.acceleration);

        // Transform angular velocity from body to world frame
        worldData.angularVelocity = transform.TransformDirection(imuData.angularVelocity);

        // Transform magnetic field from body to world frame
        worldData.magneticField = transform.TransformDirection(imuData.magneticField);

        worldData.deltaTime = imuData.deltaTime;

        return worldData;
    }

    // Convert IMU readings to robot frame (if IMU is offset from robot center)
    public ImuData TransformToRobotFrame(ImuData imuData, Vector3 offsetFromRobotCenter)
    {
        ImuData robotFrameData = new ImuData();

        // Acceleration: Transform considering the offset
        // This includes centripetal acceleration due to rotation
        Vector3 angularVel = imuData.angularVelocity;
        Vector3 offset = offsetFromRobotCenter;

        // Cross product for centripetal acceleration: ω × (ω × r)
        Vector3 centripetalAcc = Vector3.Cross(angularVel, Vector3.Cross(angularVel, offset));

        robotFrameData.acceleration = imuData.acceleration + centripetalAcc;

        // Angular velocity remains the same
        robotFrameData.angularVelocity = imuData.angularVelocity;

        // Magnetic field transforms normally
        robotFrameData.magneticField = imuData.magneticField;

        robotFrameData.deltaTime = imuData.deltaTime;

        return robotFrameData;
    }
}
```

## IMU Data Processing and Integration

### Integration for Position and Orientation
```csharp
// Example: Basic integration of IMU data
public class ImuIntegration
{
    private Vector3 integratedVelocity = Vector3.zero;
    private Vector3 integratedPosition = Vector3.zero;
    private Quaternion integratedOrientation = Quaternion.identity;

    public struct IntegratedState
    {
        public Vector3 position;
        public Vector3 velocity;
        public Quaternion orientation;
    }

    public IntegratedState IntegrateImuData(ImuData imuData, float deltaTime)
    {
        IntegratedState state = new IntegratedState();

        // Integrate angular velocity to get orientation change
        Vector3 angularDisplacement = imuData.angularVelocity * deltaTime;
        Quaternion deltaRotation = Quaternion.Euler(angularDisplacement);
        integratedOrientation = integratedOrientation * deltaRotation;

        // Transform acceleration to world frame for integration
        // This is simplified - in practice, you'd use the current orientation
        Vector3 worldAcceleration = integratedOrientation * imuData.acceleration;

        // Integrate acceleration to get velocity
        integratedVelocity += worldAcceleration * deltaTime;

        // Integrate velocity to get position
        integratedPosition += integratedVelocity * deltaTime;

        state.position = integratedPosition;
        state.velocity = integratedVelocity;
        state.orientation = integratedOrientation;

        return state;
    }

    // Reset integration (for calibration or when other sensors provide corrections)
    public void ResetIntegration(Vector3 position, Vector3 velocity, Quaternion orientation)
    {
        integratedPosition = position;
        integratedVelocity = velocity;
        integratedOrientation = orientation;
    }
}
```

## IMU Calibration and Error Correction

### Bias Estimation
```csharp
// Example: IMU bias estimation when stationary
public class ImuCalibration
{
    private System.Collections.Generic.List<Vector3> accelSamples =
        new System.Collections.Generic.List<Vector3>();
    private System.Collections.Generic.List<Vector3> gyroSamples =
        new System.Collections.Generic.List<Vector3>();

    private const int CALIBRATION_SAMPLE_COUNT = 100;
    private bool isCalibrating = false;

    public struct CalibrationResult
    {
        public Vector3 accelBias;
        public Vector3 gyroBias;
        public bool success;
    }

    public void StartCalibration()
    {
        if (!isCalibrating)
        {
            isCalibrating = true;
            accelSamples.Clear();
            gyroSamples.Clear();
        }
    }

    public void AddCalibrationSample(Vector3 accelReading, Vector3 gyroReading)
    {
        if (!isCalibrating) return;

        accelSamples.Add(accelReading);
        gyroSamples.Add(gyroReading);

        if (accelSamples.Count >= CALIBRATION_SAMPLE_COUNT)
        {
            FinishCalibration();
        }
    }

    CalibrationResult FinishCalibration()
    {
        CalibrationResult result = new CalibrationResult();

        if (accelSamples.Count == 0 || gyroSamples.Count == 0)
        {
            result.success = false;
            return result;
        }

        // Calculate average for bias estimation
        Vector3 avgAccel = Vector3.zero;
        Vector3 avgGyro = Vector3.zero;

        foreach (Vector3 sample in accelSamples)
        {
            avgAccel += sample;
        }
        avgAccel /= accelSamples.Count;

        foreach (Vector3 sample in gyroSamples)
        {
            avgGyro += sample;
        }
        avgGyro /= gyroSamples.Count;

        // For accelerometer: bias should account for gravity (1g = 9.81 m/s²)
        // Assuming the IMU is stationary and level
        Vector3 expectedAccel = new Vector3(0, 9.81f, 0); // Gravity in Unity's coordinate system
        result.accelBias = avgAccel - expectedAccel;

        // For gyroscope: bias is the average reading when stationary
        result.gyroBias = avgGyro;

        result.success = true;
        isCalibrating = false;

        return result;
    }
}
```

## Performance Considerations

### Efficient IMU Simulation
```csharp
// Example: Efficient IMU simulation with optimized calculations
public class EfficientImuSimulation : MonoBehaviour
{
    [Header("Performance Settings")]
    public bool enableDetailedNoise = true;
    public bool enableDriftSimulation = false;
    public bool enableTemperatureEffects = false;

    private System.Func<float> noiseGenerator;

    void Start()
    {
        // Choose noise generation method based on performance requirements
        if (enableDetailedNoise)
        {
            noiseGenerator = () => RandomGaussian();
        }
        else
        {
            // Use faster, simpler noise generation
            noiseGenerator = () => Random.value * 2 - 1; // Simple uniform noise
        }
    }

    float GetNoiseValue()
    {
        return noiseGenerator();
    }

    // Optimized noise generation for high-frequency updates
    Vector3 GetNoiseVector()
    {
        return new Vector3(GetNoiseValue(), GetNoiseValue(), GetNoiseValue());
    }

    float RandomGaussian()
    {
        // Optimized Box-Muller with precomputed constants
        float u1 = Random.value;
        float u2 = Random.value;
        return Mathf.Sqrt(-2.0f * Mathf.Log(Mathf.Max(u1, 0.001f))) *
               Mathf.Cos(2.0f * Mathf.PI * u2);
    }
}
```

## Applications in Robotics Education

### Navigation and Localization
- Use IMU data for dead reckoning navigation
- Implement sensor fusion with other sensors
- Understand drift and error accumulation in navigation

### Stabilization and Control
- Implement balance control for humanoid robots
- Use gyroscope data for attitude control
- Combine accelerometer data for vibration detection

### Motion Analysis
- Analyze robot movement patterns
- Detect falls or unusual motion events
- Understand dynamic behavior through IMU data

### Sensor Fusion Learning
- Combine IMU with other sensors (GPS, encoders, cameras)
- Implement Kalman filters for sensor fusion
- Understand complementary filtering techniques

## Common IMU Types and Specifications

### Consumer-Grade IMUs
- **MPU-6050**: Accelerometer + Gyroscope, low cost, moderate accuracy
- **BNO055**: Accelerometer + Gyroscope + Magnetometer + processing, higher accuracy

### Tactical-Grade IMUs
- Higher accuracy, lower noise, better bias stability
- More expensive but suitable for precise applications
- Often include temperature compensation

### Performance Comparison
| Grade | Accel Noise | Gyro Noise | Bias Drift | Cost |
|-------|-------------|------------|------------|------|
| Consumer | 100-500 µg/√Hz | 10-50 °/s/√Hz | 10-100 °/s/hr | Low |
| Tactical | 10-100 µg/√Hz | 1-10 °/s/√Hz | 1-10 °/s/hr | Medium |
| Navigation | 1-10 µg/√Hz | 0.1-1 °/s/√Hz | 0.1-1 °/s/hr | High |

## Troubleshooting Common IMU Issues

### Accelerometer Issues
- **Gravity compensation**: Remember that accelerometers measure gravity when stationary
- **Vibration sensitivity**: Accelerometers are sensitive to mechanical vibrations
- **Cross-axis sensitivity**: Axes may not be perfectly orthogonal

### Gyroscope Issues
- **Integration drift**: Small biases accumulate over time when integrating
- **Temperature sensitivity**: Gyro performance varies with temperature
- **Scale factor errors**: Non-uniform sensitivity across ranges

### Magnetometer Issues
- **Hard iron effects**: Permanent magnetic fields affect measurements
- **Soft iron effects**: Distorting magnetic fields affect measurements
- **Interference**: Electronic components can affect magnetic readings

## Assessment Questions

1. What are the three main components of a typical IMU and what do they measure?
2. How does IMU bias drift affect long-term navigation accuracy?
3. What are the main challenges in integrating IMU data for position estimation?
4. How can you calibrate IMU bias when the sensor is stationary?
5. What are the differences between consumer-grade and tactical-grade IMUs?

## Next Steps

After mastering IMU simulation concepts, continue to the Sensor Fusion section to learn how to combine multiple sensor inputs for enhanced perception and navigation capabilities.