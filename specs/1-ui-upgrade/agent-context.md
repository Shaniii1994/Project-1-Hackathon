# UI Upgrade Project Development Guidelines

Auto-generated from feature plan. Last updated: 2025-12-26

## Active Technologies

- Docusaurus v3.9.2 documentation framework
- React components for customization
- CSS modules for styling
- Node.js v20.x for build process

## Project Structure

```text
src/
├── css/
│   ├── custom.css           # Main custom styles
│   ├── homepage.module.css  # Homepage-specific styles
│   ├── navbar.module.css    # Navigation component styles
│   └── typography.css       # Typography system
├── components/
│   ├── HomepageFeatures.js     # Updated homepage features component
│   ├── HomepageHeader.js       # Custom header component
│   ├── HomepageFooter.js       # Custom footer component
│   └── LayoutWrapper.js        # Custom layout wrapper
├── pages/
│   └── index.js               # Custom homepage page
└── theme/
    └── MDXComponents.js       # Custom MDX components for documentation
```

## Commands

- `npm start` - Start Docusaurus development server
- `npm run build` - Build the documentation site
- `npm run serve` - Serve the built documentation
- `npm run swizzle` - Create custom Docusaurus components

## Code Style

- Use CSS modules for component-specific styling
- Follow BEM methodology for CSS class names
- Maintain consistent design system values
- Ensure accessibility compliance in all components
- Use semantic HTML elements appropriately

## Recent Changes

- UI Upgrade Module: Created modern, responsive design for documentation site
- Implemented WCAG AA accessibility standards
- Established consistent typography and color system
- Added responsive navigation for all device sizes

<!-- MANUAL_ADDITIONS_START -->
<!-- Add any manual customizations here that should persist -->
<!-- MANUAL_ADDITIONS_END -->