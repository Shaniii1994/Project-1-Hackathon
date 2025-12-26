import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import styles from '../css/homepage.module.css';

export default function LayoutWrapper(props) {
  const { children, ...layoutProps } = props;

  return (
    <Layout {...layoutProps}>
      <main className={clsx(styles.main)}>
        {children}
      </main>
    </Layout>
  );
}