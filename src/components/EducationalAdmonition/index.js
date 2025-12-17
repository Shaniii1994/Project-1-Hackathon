import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

export default function EducationalAdmonition({ type, title, children }) {
  const admonitionType = type || 'note';
  const titleText = title || type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className={clsx(styles.admonition, styles[admonitionType])}>
      <div className={styles.admonitionHeader}>
        <span className={styles.admonitionTitle}>{titleText}</span>
      </div>
      <div className={styles.admonitionBody}>
        {children}
      </div>
    </div>
  );
}