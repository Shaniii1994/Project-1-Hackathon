import React from 'react';
import NavbarSimple from '@theme-original/Navbar';
import styles from '../css/navbar.module.css';

export default function Navbar(props) {
  return (
    <div className={styles.navbarSlideDown}>
      <NavbarSimple {...props} />
    </div>
  );
}