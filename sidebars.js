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
            'modules/module-2-digital-twin/physics-simulation/index',
            'modules/module-2-digital-twin/physics-simulation/gravity',
            'modules/module-2-digital-twin/physics-simulation/collisions',
            'modules/module-2-digital-twin/physics-simulation/dynamics',
            'modules/module-2-digital-twin/physics-simulation/examples-exercises',
            'modules/module-2-digital-twin/physics-simulation/diagrams-visualizations',
            'modules/module-2-digital-twin/physics-simulation/tutorials',
            'modules/module-2-digital-twin/physics-simulation/assessment'
          ],
        },
        {
          type: 'category',
          label: 'Chapter 2: High-Fidelity Environments in Unity',
          items: [
            'modules/module-2-digital-twin/high-fidelity-envs/index',
            'modules/module-2-digital-twin/high-fidelity-envs/rendering',
            'modules/module-2-digital-twin/high-fidelity-envs/human-robot-interaction',
            'modules/module-2-digital-twin/high-fidelity-envs/visual-quality',
            'modules/module-2-digital-twin/high-fidelity-envs/examples-exercises',
            'modules/module-2-digital-twin/high-fidelity-envs/screenshots-visuals',
            'modules/module-2-digital-twin/high-fidelity-envs/tutorials',
            'modules/module-2-digital-twin/high-fidelity-envs/assessment'
          ],
        },
        {
          type: 'category',
          label: 'Chapter 3: Sensor Simulation',
          items: [
            'modules/module-2-digital-twin/sensor-simulation/index',
            'modules/module-2-digital-twin/sensor-simulation/lidar',
            'modules/module-2-digital-twin/sensor-simulation/depth-cameras',
            'modules/module-2-digital-twin/sensor-simulation/imus',
            'modules/module-2-digital-twin/sensor-simulation/sensor-fusion',
            'modules/module-2-digital-twin/sensor-simulation/examples-exercises',
            'modules/module-2-digital-twin/sensor-simulation/diagrams-processing',
            'modules/module-2-digital-twin/sensor-simulation/tutorials',
            'modules/module-2-digital-twin/sensor-simulation/assessment'
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 3: AI-Robot Brain (NVIDIA Isaac™)',
      items: [
        'modules/module-3-ai-brain/index',
        {
          type: 'category',
          label: 'Chapter 1: Isaac Sim - Photorealistic Simulation',
          items: [
            'modules/module-3-ai-brain/1-isaac-sim/index',
            'modules/module-3-ai-brain/1-isaac-sim/photorealistic-simulation',
            'modules/module-3-ai-brain/1-isaac-sim/synthetic-data-generation',
            'modules/module-3-ai-brain/1-isaac-sim/environment-configuration'
          ],
        },
        {
          type: 'category',
          label: 'Chapter 2: Isaac ROS - Accelerated Perception',
          items: [
            'modules/module-3-ai-brain/2-isaac-ros/index',
            'modules/module-3-ai-brain/2-isaac-ros/perception-pipelines',
            'modules/module-3-ai-brain/2-isaac-ros/vslam-implementation',
            'modules/module-3-ai-brain/2-isaac-ros/sensor-data-processing'
          ],
        },
        {
          type: 'category',
          label: 'Chapter 3: Nav2 - Navigation and Path Planning',
          items: [
            'modules/module-3-ai-brain/3-nav2-navigation/index',
            'modules/module-3-ai-brain/3-nav2-navigation/path-planning',
            'modules/module-3-ai-brain/3-nav2-navigation/navigation-maps',
            'modules/module-3-ai-brain/3-nav2-navigation/obstacle-avoidance'
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;