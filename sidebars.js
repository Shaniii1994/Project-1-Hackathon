// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Module 1: The Robotic Nervous System (ROS 2)',
      items: [
        'ros-module-1/introduction',
        {
          type: 'category',
          label: 'Chapter 1: ROS 2 Foundations',
          items: [
            'ros-module-1/chapter-1-foundations/index',
            'ros-module-1/chapter-1-foundations/nodes-topics-services',
            'ros-module-1/chapter-1-foundations/robotic-nervous-system'
          ],
        },
        {
          type: 'category',
          label: 'Chapter 2: Python to ROS with rclpy',
          items: [
            'ros-module-1/chapter-2-python-integration/index',
            'ros-module-1/chapter-2-python-integration/rclpy-basics',
            'ros-module-1/chapter-2-python-integration/publishers-subscribers',
            'ros-module-1/chapter-2-python-integration/ai-agent-integration'
          ],
        },
        {
          type: 'category',
          label: 'Chapter 3: Humanoid Modeling with URDF',
          items: [
            'ros-module-1/chapter-3-urdf-modeling/index',
            'ros-module-1/chapter-3-urdf-modeling/links-joints-kinematics',
            'ros-module-1/chapter-3-urdf-modeling/humanoid-modeling'
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 2: Digital Twin Simulation (Gazebo & Unity)',
      items: [
        'modules/module-2-digital-twin/index',
        {
          type: 'category',
          label: 'Chapter 1: Physics Simulation with Gazebo',
          items: [
            'modules/module-2-digital-twin/1-physics-simulation/index',
            'modules/module-2-digital-twin/1-physics-simulation/gravity',
            'modules/module-2-digital-twin/1-physics-simulation/collisions',
            'modules/module-2-digital-twin/1-physics-simulation/dynamics'
          ],
        },
        {
          type: 'category',
          label: 'Chapter 2: High-Fidelity Environments in Unity',
          items: [
            'modules/module-2-digital-twin/2-high-fidelity-envs/index',
            'modules/module-2-digital-twin/2-high-fidelity-envs/rendering',
            'modules/module-2-digital-twin/2-high-fidelity-envs/human-robot-interaction',
            'modules/module-2-digital-twin/2-high-fidelity-envs/visual-quality'
          ],
        },
        {
          type: 'category',
          label: 'Chapter 3: Sensor Simulation',
          items: [
            'modules/module-2-digital-twin/3-sensor-simulation/index',
            'modules/module-2-digital-twin/3-sensor-simulation/lidar',
            'modules/module-2-digital-twin/3-sensor-simulation/depth-cameras',
            'modules/module-2-digital-twin/3-sensor-simulation/imus',
            'modules/module-2-digital-twin/3-sensor-simulation/sensor-fusion'
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;