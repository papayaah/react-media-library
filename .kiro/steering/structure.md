# Project Structure

## Root Organization

```
src/
├── components/       # React components
├── hooks/           # Custom React hooks
├── presets/         # UI library presets
├── services/        # Core services (storage, etc.)
├── stories/         # Storybook stories
├── utils/           # Utility functions
└── types.ts         # TypeScript type definitions
```

## Key Directories

### `/src/components`
Main UI components:
- `MediaLibraryProvider.tsx`: Context provider for media library state
- `MediaGrid.tsx`: Full-featured media grid with filters and selection
- `RecentMediaGrid.tsx`: Simplified recent media display
- `MediaViewer.tsx`: Modal viewer for images/videos
- `ImageEditor.tsx`: Image editing interface (uses cropperjs)

### `/src/hooks`
Custom hooks for library functionality:
- `useMediaLibrary.ts`: Core media management logic
- `useMediaDragDrop.ts`: Drag & drop functionality
- `useTheme.ts`: Theme detection (light/dark mode)

### `/src/presets`
Pre-built component presets:
- `default.tsx`: Base preset implementation
- `tailwind.tsx`: Tailwind CSS preset
- `mantine.tsx`: Mantine UI preset
- `lucide.tsx`: Lucide icon set
- `index.ts`: Preset exports

### `/src/services`
Core services:
- `storage.ts`: IndexedDB and OPFS operations

### `/src/utils`
Helper utilities:
- `renderIcon.tsx`: Icon rendering logic

## Demo Application

`demo/` contains a full React app demonstrating library usage with Vite, TypeScript, and Tailwind CSS.

## Configuration Files

- `vite.config.ts`: Library build configuration
- `tsconfig.json`: TypeScript compiler options
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.cjs`: PostCSS with Tailwind and Mantine support
- `.storybook/`: Storybook configuration

## Export Strategy

All public APIs are exported through `src/index.ts`:
- Components and their props
- Hooks
- Presets (UI components and icons)
- Types
- Storage services

## Conventions

- Components use named exports
- Props interfaces are exported alongside components
- Type definitions centralized in `types.ts`
- Preset system follows `ComponentPreset` interface
- Icons are optional and passed via props (not bundled)
