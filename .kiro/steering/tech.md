# Technology Stack

## Core Technologies

- **React 19**: Peer dependency, library targets latest React features
- **TypeScript**: Strict mode enabled with comprehensive type definitions
- **Vite**: Build tool for library bundling and development
- **IndexedDB (idb)**: Client-side database for asset metadata
- **OPFS**: Origin Private File System for file storage

## Build System

- **Bundler**: Vite with library mode
- **Output formats**: ESM (`.mjs`) and CommonJS (`.js`)
- **Type generation**: vite-plugin-dts for `.d.ts` files
- **External dependencies**: React and React-DOM are externalized

## Optional Dependencies

- **cropperjs**: Image editing (optional peer dependency)
- **lucide-react**: Default icon preset (user must install separately)

## UI Presets

The library includes preset examples for:
- Tailwind CSS (default)
- Mantine UI
- Custom presets (user-defined)

## Development Tools

- **Storybook**: Component documentation and examples
- **PostCSS**: CSS processing with Tailwind and Mantine presets
- **ESLint**: Code linting

## Common Commands

```bash
# Development
npm run dev              # Start Vite dev server
npm run storybook        # Launch Storybook on :6006

# Building
npm run build            # Build library for distribution
npm run build-storybook  # Build static Storybook

# Quality
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

## TypeScript Configuration

- Target: ES2020
- Module: ESNext with bundler resolution
- Strict mode enabled
- JSX: react-jsx (automatic runtime)
- Declaration files generated with source maps
