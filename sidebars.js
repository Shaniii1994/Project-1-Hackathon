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
  ],
};

module.exports = sidebars;