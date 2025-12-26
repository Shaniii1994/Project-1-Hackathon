import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from '../css/custom.css';

// Custom components for documentation content
const CustomCodeBlock = (props) => (
  <CodeBlock {...props} />
);

const CustomHeading = ({ as: Tag, ...props }) => (
  <Heading as={Tag} {...props} />
);

const CustomLink = (props) => (
  <Link {...props} className={styles.customLink} />
);

export default {
  // Re-export original components
  ...MDXComponents,
  // Override or add custom components
  code: CustomCodeBlock,
  h1: (props) => <CustomHeading as="h1" {...props} />,
  h2: (props) => <CustomHeading as="h2" {...props} />,
  h3: (props) => <CustomHeading as="h3" {...props} />,
  h4: (props) => <CustomHeading as="h4" {...props} />,
  h5: (props) => <CustomHeading as="h5" {...props} />,
  h6: (props) => <CustomHeading as="h6" {...props} />,
  a: CustomLink,
};