# Assessment: Sensor Simulation Concepts

This assessment evaluates your understanding of sensor simulation in robotics, including LiDAR, depth cameras, IMUs, and sensor fusion techniques.

## Multiple Choice Questions

### Question 1
What is the primary advantage of using LiDAR over depth cameras for robotics applications?
A) Lower cost and power consumption
B) Better performance in all lighting conditions
C) Higher resolution color information
D) Faster processing requirements

### Question 2
In IMU data, what does the accelerometer measure when the sensor is stationary?
A) Zero acceleration
B) Gravitational acceleration (1g)
C) Centripetal acceleration
D) Angular acceleration

### Question 3
What is the main purpose of sensor fusion in robotics?
A) To reduce the number of sensors needed
B) To combine strengths of different sensors while compensating for individual weaknesses
C) To increase the cost of the robot
D) To make the robot heavier

### Question 4
Which type of filter is most commonly used for fusing IMU and GPS data?
A) Median filter
B) Low-pass filter
C) Kalman filter
D) High-pass filter

### Question 5
What is the typical update rate of a consumer-grade IMU?
A) 1-10 Hz
B) 50-200 Hz
C) 1-10 kHz
D) 10-50 kHz

## Short Answer Questions

### Question 6
Explain the difference between a 2D LiDAR and a 3D LiDAR in terms of data output and applications.

### Question 7
Describe the main sources of error in depth camera measurements and how they can be mitigated.

### Question 8
What is IMU drift, and why does it occur? How can it be corrected?

### Question 9
Explain the concept of sensor calibration and why it's important in robotics applications.

### Question 10
Compare the advantages and disadvantages of centralized vs. distributed sensor fusion architectures.

## Practical Application Questions

### Question 11
You are designing a mobile robot for indoor navigation. The robot has LiDAR, a depth camera, and an IMU. Design a sensor fusion strategy that:
- Provides robust localization in all lighting conditions
- Handles dynamic obstacles effectively
- Maintains accuracy during rapid movements
- Discuss the relative weights you would assign to each sensor and why.

### Question 12
A LiDAR sensor is producing point cloud data with many outliers due to reflective surfaces. Design a filtering strategy to remove these outliers while preserving real obstacles.

### Question 13
An IMU on your robot is showing significant drift in position estimates after 30 seconds. Explain the likely causes and propose at least 3 different correction strategies.

### Question 14
You need to calibrate a depth camera mounted on a robot. Describe the complete calibration process, including what parameters you would estimate and how you would validate the calibration.

### Question 15
Design a sensor failure detection system for a robot with multiple sensors. How would you detect when each sensor is providing unreliable data, and what fallback strategies would you implement?

## Scenario-Based Questions

### Question 16
A robot equipped with LiDAR and stereo cameras is operating in a warehouse environment with:
- Metal shelving units (reflective surfaces)
- Glass walls
- Bright fluorescent lighting
- Moving people and forklifts

Analyze which sensor is likely to perform best in each of these conditions and explain why. Propose a sensor fusion strategy that maximizes reliability in this environment.

### Question 17
You are developing a navigation system for a robot that operates both indoors and outdoors. The robot has:
- LiDAR for range sensing
- IMU for motion tracking
- Wheel encoders for odometry
- GPS for outdoor positioning

Design a navigation system that seamlessly transitions between indoor and outdoor environments, explaining how the sensor fusion changes based on environment type.

### Question 18
A robot's IMU is mounted at a position offset from the robot's center of rotation. How does this affect the IMU measurements, and how would you compensate for this offset in your sensor processing pipeline?

### Question 19
You have a depth camera with a resolution of 640x480 and a LiDAR with 720 horizontal beams and 16 vertical beams. Compare the spatial resolution and coverage of these two sensors. In what applications would each sensor be more appropriate?

### Question 20
A Kalman filter is being used to fuse IMU and GPS data for robot localization. The GPS updates at 10 Hz while the IMU updates at 100 Hz. Explain how you would implement the prediction and update steps to handle these different update rates.

## Problem-Solving Questions

### Question 21
A robot has an IMU with the following noise characteristics:
- Accelerometer noise density: 100 µg/√Hz
- Gyroscope noise density: 10 °/s/√Hz
- Sample rate: 100 Hz

Calculate the expected error accumulation in position after 1 minute of integration, assuming the robot starts from rest. Show your calculations.

### Question 22
A LiDAR system has the following specifications:
- Range: 0.1m to 30m
- Angular resolution: 0.25°
- Field of view: 360° horizontal, 30° vertical
- Update rate: 10 Hz

Calculate:
a) The number of points per scan
b) The data rate in points per second
c) The minimum detectable object size at 10m range

### Question 23
Design a sensor fusion algorithm using a weighted average approach for combining position estimates from three sensors:
- GPS: accuracy ±2m, update rate 10 Hz
- Visual Odometry: accuracy ±0.1m, update rate 30 Hz
- IMU Integration: accuracy ±0.05m short-term but drifts over time

How would you adjust the weights dynamically based on the reliability of each sensor?

## Advanced Concept Questions

### Question 24
Explain the difference between a Kalman filter and a particle filter. When would you choose one over the other for sensor fusion in robotics?

### Question 25
Describe the Extended Kalman Filter (EKF) and Unscented Kalman Filter (UKF). What are their respective advantages and disadvantages for non-linear sensor fusion problems?

## Answer Key

### Multiple Choice Answers:
1. B) Better performance in all lighting conditions
2. B) Gravitational acceleration (1g)
3. B) To combine strengths of different sensors while compensating for individual weaknesses
4. C) Kalman filter
5. B) 50-200 Hz

### Sample Answers for Short Answer Questions:

**Q6**: 2D LiDAR provides measurements in a single horizontal plane (typically 2-3m high), producing a 2D point cloud suitable for planar navigation and mapping. It's less expensive and has higher update rates. 3D LiDAR provides measurements in multiple planes, creating a full 3D point cloud suitable for complex mapping, obstacle avoidance, and manipulation tasks. It's more expensive but provides richer spatial information.

**Q7**: Main sources of error include: reflective surfaces (incorrect depth), transparent objects (no measurement), motion blur (if camera or scene moves), and ambient lighting effects. Mitigation strategies include: statistical validation of measurements, temporal filtering, combining with other sensors, and proper sensor placement.

**Q8**: IMU drift is the accumulation of errors over time when integrating IMU measurements (especially acceleration to get position). It occurs because small biases and noise in measurements compound through integration. It can be corrected using external references (GPS, visual features), zero-velocity updates, or sensor fusion with other sensors.

**Q9**: Sensor calibration is the process of determining and correcting systematic errors in sensor measurements. It's important because sensors have manufacturing variations, mounting offsets, and environmental dependencies that affect accuracy. Calibration ensures that sensor data is accurate and can be properly fused with other sensors.

## Grading Rubric

- **Multiple Choice (25 points)**: 5 points each
- **Short Answer (40 points)**: 8 points each (partial credit for partial understanding)
- **Practical Application (30 points)**: 6 points each
- **Scenario-Based (40 points)**: 8 points each
- **Problem-Solving (25 points)**: 8 points each (Q21-23)
- **Advanced Concepts (20 points)**: 10 points each

**Total: 180 points**

### Scoring Guidelines:
- **A (90-100%)**: Comprehensive understanding with detailed explanations
- **B (80-89%)**: Good understanding with mostly correct concepts
- **C (70-79%)**: Basic understanding with some gaps in knowledge
- **D (60-69%)**: Limited understanding with significant gaps
- **F (Below 60%)**: Insufficient understanding of core concepts

## Learning Objectives Assessment

After completing this assessment, you should be able to:
- [ ] Explain the principles and applications of different sensor types (LiDAR, depth cameras, IMUs)
- [ ] Understand sensor limitations and error sources
- [ ] Design basic sensor fusion algorithms
- [ ] Calibrate sensors for improved accuracy
- [ ] Troubleshoot common sensor-related problems
- [ ] Evaluate sensor performance in different environments

## Next Steps

If you scored below 80% on this assessment, review the following sections:
- For LiDAR questions: Revisit the "LiDAR Simulation and Data" section
- For depth camera questions: Revisit the "Depth Camera Simulation" section
- For IMU questions: Revisit the "IMU Simulation and Data" section
- For fusion questions: Revisit the "Sensor Fusion" section

For scores above 80%, you have a solid understanding of sensor simulation concepts and are ready to apply these concepts in practical robotics applications.