# Quickstart: Module 1 — The Robotic Nervous System (ROS 2)

## Prerequisites

- Node.js LTS (18.x or higher)
- npm or yarn package manager
- Git for version control
- Basic command line familiarity

## Setup Docusaurus Project

1. **Install Docusaurus globally**:
   ```bash
   npm install -g @docusaurus/init
   ```

2. **Create new Docusaurus site**:
   ```bash
   npx @docusaurus/init@latest init ros-education classic
   cd ros-education
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start development server**:
   ```bash
   npm run start
   ```

## Create Module Structure

1. **Create module directory structure**:
   ```bash
   mkdir -p docs/ros-module-1/chapter-1-foundations
   mkdir -p docs/ros-module-1/chapter-2-python-integration
   mkdir -p docs/ros-module-1/chapter-3-urdf-modeling
   ```

2. **Add initial chapter files**:
   ```bash
   touch docs/ros-module-1/introduction.md
   touch docs/ros-module-1/chapter-1-foundations/index.md
   touch docs/ros-module-1/chapter-2-python-integration/index.md
   touch docs/ros-module-1/chapter-3-urdf-modeling/index.md
   ```

## Configure Navigation

1. **Update sidebar configuration** in `sidebars.js`:
   ```javascript
   module.exports = {
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
   ```

## Add First Content

1. **Create introduction content** in `docs/ros-module-1/introduction.md`:
   ```markdown
   # Introduction to ROS 2 for AI Students

   Welcome to Module 1: The Robotic Nervous System (ROS 2). This module is designed for AI students with basic Python knowledge who are new to robotics.

   In this module, you will learn:
   - The fundamentals of ROS 2 as a robotic communication middleware
   - How to connect your Python knowledge with ROS 2 using rclpy
   - How to model humanoid robots using URDF

   Each chapter builds upon the previous one, so we recommend following the sequence.
   ```

2. **Run the development server** to see your changes:
   ```bash
   npm run start
   ```

## Deployment

1. **Build the static site**:
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages** (if configured):
   ```bash
   npm run deploy
   ```

## Next Steps

- Continue adding content to each chapter following the established structure
- Add code examples using Docusaurus' code block features
- Include practical exercises and challenges for students
- Review content for technical accuracy