# Physics Concepts Diagrams and Visualizations

This section provides visual representations and diagrams to help understand the physics concepts covered in this chapter.

## Gravity Visualization

### Gravity Vector Representation
```mermaid
graph TD
    A[Robot Center of Mass] -->|Gravity Force| B(Ground)
    A -->|Vector: 0,0,-9.81 m/s²| C[Gravity Arrow]
    D[Earth] -->|Gravitational Field| A
    style C fill:#ff9999
    style A fill:#99ccff
    style B fill:#99ff99
```

### Gravity Effects Comparison
```
Normal Gravity (9.81 m/s²):
Robot falls quickly to ground
Stable standing requires active control

Low Gravity (1.62 m/s²):
Robot falls slowly
Larger movements possible
Less control effort needed

Zero Gravity:
Robot floats freely
Movement requires reaction forces
Balance control not applicable
```

## Collision Detection Visualization

### Broad Phase vs Narrow Phase
```mermaid
flowchart LR
    A[All Objects] --> B[Bounding Volumes]
    B --> C{Potential Collision?}
    C -->|No| D[Discard Pair]
    C -->|Yes| E[Narrow Phase Check]
    E --> F{Actual Collision?}
    F -->|No| D
    F -->|Yes| G[Collision Response]
    style A fill:#e1f5fe
    style G fill:#e8f5e8
```

### Collision Geometry Types
```
Box Collision:
  _______
 /|     /|
/_|____/ |
| |____|_|
|/_____|/

Sphere Collision:
     *****
   **     **
  *         *
  *   O     *
   **     **
     *****

Cylinder Collision:
   _____
  /     \
 |   O   |
  \_____/
```

## Dynamics Visualization

### Force and Torque Relationships
```mermaid
graph LR
    A[Applied Force] --> B[Linear Acceleration]
    C[Applied Torque] --> D[Angular Acceleration]
    B --> E[Change in Velocity]
    D --> F[Change in Angular Velocity]
    E --> G[Position Change]
    F --> H[Orientation Change]

    style A fill:#ffebee
    style C fill:#ffebee
    style G fill:#e8f5e8
    style H fill:#e8f5e8
```

### Inertial Tensor Visualization
```
3D Inertial Tensor:
┌                ┐
│ Ixx  Ixy  Ixz │
│ Iyx  Iyy  Iyz │
│ Izx  Izy  Izz │
└                ┘

Where:
- Ixx, Iyy, Izz: Moments of inertia (resistance to rotation about axes)
- Ixy, Ixz, Iyz: Products of inertia (coupling between axes)
```

## Physics Simulation Pipeline

### Complete Physics Simulation Flow
```mermaid
flowchart TD
    A[Robot Model] --> B[Inertial Properties]
    A --> C[Collision Geometries]
    A --> D[Joint Constraints]

    E[Environment] --> F[Gravity Settings]
    E --> G[Contact Parameters]
    E --> H[Friction Coefficients]

    B --> I[Physics Engine]
    C --> I
    D --> I
    F --> I
    G --> I
    H --> I

    I --> J[Collision Detection]
    J --> K[Force Calculation]
    K --> L[Integration]
    L --> M[New State]
    M --> N[Visualization Update]

    style I fill:#fff3e0
    style J fill:#e1f5fe
    style N fill:#f3e5f5
```

## Humanoid Robot Physics Model

### Simplified Humanoid Physics Representation
```
          Torso (Mass: 5kg)
              |
              | Joint (Hip)
              |
    Thigh L        Thigh R
     (2kg)          (2kg)
        |              |
    Joint (Knee)   Joint (Knee)
        |              |
    Shin L (1.5kg)   Shin R (1.5kg)
        |              |
    Foot L (0.5kg)   Foot R (0.5kg)

Gravity: (0, 0, -9.81) m/s²
Center of Mass: Calculated from all link masses and positions
```

## Contact Force Visualization

### Ground Reaction Forces
```mermaid
graph TD
    A[Robot Foot] -->|Normal Force| B(Ground Surface)
    A -->|Friction Force| C[Opposes Motion]
    D[Gravity] -->|Weight| A
    E[Applied Force] --> A

    B -.-> F[Force Vector Diagram]
    C -.-> F
    D -.-> F
    E -.-> F

    style A fill:#c8e6c9
    style B fill:#ffcc80
    style F fill:#e3f2fd
```

## Simulation Parameter Relationships

### Time Step vs Accuracy vs Performance
```
High Accuracy (Small Time Step):
┌─────────────────────────────────┐
│ ▓▓  ▓▓  ▓▓  ▓▓  ▓▓  ▓▓  ▓▓  ▓▓ │ ← More computation
│ ▓▓  ▓▓  ▓▓  ▓▓  ▓▓  ▓▓  ▓▓  ▓▓ │ ← More accurate
└─────────────────────────────────┘

Low Accuracy (Large Time Step):
┌─────────────────────────────────┐
│ ▓   ▓   ▓   ▓   ▓   ▓   ▓   ▓  │ ← Less computation
│ ▓   ▓   ▓   ▓   ▓   ▓   ▓   ▓  │ ← Less stable
└─────────────────────────────────┘
```

## Control System Integration

### Physics-Aware Control Loop
```mermaid
stateDiagram-v2
    [*] --> Sensing: Start Simulation
    Sensing --> PhysicsUpdate: Read Joint States
    PhysicsUpdate --> ControlCalc: Apply Physics
    ControlCalc --> Actuation: Calculate Commands
    Actuation --> PhysicsUpdate: Apply Forces
    PhysicsUpdate --> CheckStability: Verify Constraints
    CheckStability --> Sensing: Next Time Step
    CheckStability --> [*]: Stop if unstable
```

## Common Physics Parameters Reference

### Typical Values for Humanoid Robotics
| Parameter | Symbol | Typical Range | Units | Notes |
|-----------|--------|---------------|-------|-------|
| Gravity | g | 9.81 (Earth) | m/s² | Standard value |
| Link Mass | m | 0.1 - 10 | kg | Depends on link size |
| Joint Damping | c | 0.1 - 10 | N·s/m | Reduces oscillation |
| Joint Friction | μ | 0.1 - 1.0 | - | Static/dynamic |
| Restitution | e | 0.0 - 0.5 | - | Bounciness |
| Time Step | Δt | 0.001 - 0.01 | s | Accuracy vs performance |

## Visualization Tips

### Creating Physics Diagrams
1. Use consistent colors for different physics concepts
2. Include coordinate frame indicators (x: red, y: green, z: blue)
3. Show force vectors with arrows and labels
4. Use exploded views for complex assemblies
5. Include scale references where appropriate

### Simulation Visualization
- Color-code different physical properties (velocity, force, contact)
- Use particle effects to show contact points
- Animate force vectors to show magnitude changes
- Overlay physics data on 3D models
- Provide toggle options for different visualization layers