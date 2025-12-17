import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'ROS 2 Foundations',
    description: (
      <>
        Learn the core concepts of ROS 2 including nodes, topics, and services.
        Understand how ROS 2 functions as a robotic nervous system.
      </>
    ),
  },
  {
    title: 'Python Integration',
    description: (
      <>
        Connect your Python knowledge with ROS 2 using rclpy.
        Implement publishers, subscribers, and services in Python.
      </>
    ),
  },
  {
    title: 'Humanoid Modeling',
    description: (
      <>
        Create robot models using URDF with links, joints, and kinematic structures.
        Model humanoid robots for simulation and control.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function ModuleIntro() {
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