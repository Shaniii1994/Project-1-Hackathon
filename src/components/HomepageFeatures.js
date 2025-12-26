import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Module 1: The Robotic Nervous System',
    description: (
      <>
        Learn ROS 2 fundamentals, Python integration with rclpy, and humanoid modeling with URDF.
        Understand the core concepts that form the backbone of robotic systems.
      </>
    ),
  },
  {
    title: 'Module 2: Digital Twin Simulation',
    description: (
      <>
        Master physics simulation with Gazebo, high-fidelity environments in Unity,
        and sensor simulation for comprehensive digital twin applications.
      </>
    ),
  },
  {
    title: 'Module 3: AI-Robot Brain',
    description: (
      <>
        Explore NVIDIA Isaac technologies for perception, simulation, and navigation intelligence
        using Isaac Sim, Isaac ROS, and Nav2 for humanoid robots.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}