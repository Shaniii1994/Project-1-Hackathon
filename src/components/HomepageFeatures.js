import React from 'react';
import Link from '@docusaurus/Link';
import styles from '../css/homepage.module.css';

const FeatureList = [
  {
    title: 'Comprehensive Learning Modules',
    icon: '📚',
    description: (
      <>
        Explore structured curriculum covering everything from ROS 2 fundamentals to advanced AI integration.
      </>
    ),
    to: '/docs/category/tutorials'
  },
  {
    title: 'Hands-on Practice',
    icon: '🛠️',
    description: (
      <>
        Engage with practical exercises and real-world projects to reinforce your understanding.
      </>
    ),
    to: '/docs/category/exercises'
  },
  {
    title: 'Expert Guidance',
    icon: '👨‍🏫',
    description: (
      <>
        Learn from industry experts with years of experience in robotics and AI development.
      </>
    ),
    to: '/docs/category/guides'
  },
  {
    title: 'Modern Tools',
    icon: '⚙️',
    description: (
      <>
        Work with the latest ROS 2 distributions and cutting-edge development tools.
      </>
    ),
    to: '/docs/category/tools'
  },
  {
    title: 'Community Support',
    icon: '👥',
    description: (
      <>
        Join our vibrant community of learners and professionals for collaboration and support.
      </>
    ),
    to: '/community'
  },
  {
    title: 'Continuous Updates',
    icon: '🔄',
    description: (
      <>
        Stay current with the latest developments in robotics and AI with regular content updates.
      </>
    ),
    to: '/blog'
  }
];

function Feature({icon, title, description, to}) {
  return (
    <Link to={to} className={styles.featureCard}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>{description}</p>
    </Link>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        <h2 className={styles.featuresTitle}>Learning Modules</h2>
        <div className={styles.featuresGrid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}