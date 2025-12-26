import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from '../css/homepage.module.css';

export default function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <h1 className={`${styles.heroTitle} ${styles.fadeInUp}`}>
          {siteConfig.title}
        </h1>
        <p className={`${styles.heroSubtitle} ${styles.fadeInUp} ${styles.delay1}`}>
          {siteConfig.tagline}
        </p>
        <div className={`${styles.heroButtons} ${styles.fadeInUp} ${styles.delay2}`}>
          <Link
            className={styles.ctaButton}
            to="/docs/intro">
            Get Started
          </Link>
          <Link
            className={`${styles.homepageButton} ${styles.homepageButtonSecondary}`}
            to="/docs/category/tutorials">
            View Tutorials
          </Link>
        </div>
      </div>
    </section>
  );
}