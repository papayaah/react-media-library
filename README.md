# @reactkits.dev/react-media-library

A headless, blazing-fast media library for React 19. **100/100 Lighthouse scores** with minimal setup.

![Lighthouse Scores](https://raw.githubusercontent.com/papayaah/react-media-library/main/demo/lighthouse-result.png)

![Demo](https://raw.githubusercontent.com/papayaah/react-media-library/main/demo/lighthouse-demo.gif)

## Why This Library?

- **Headless** - Bring your own UI. Works with Tailwind, Mantine, or any component library
- **Fast** - Optimized for performance from day one. Zero layout shift, lazy loading, tree-shakeable
- **Simple** - Full media library in 10 lines of code
- **Local Storage** - No server needed. Uses IndexedDB + OPFS

## Installation

```bash
npm install @reactkits.dev/react-media-library

# Optional: icons
npm install lucide-react
```

## Quick Start

```tsx
import {
  MediaLibraryProvider,
  MediaGrid,
  tailwindPreset,
  lucideIcons
} from '@reactkits.dev/react-media-library';

function App() {
  return (
    <MediaLibraryProvider enableDragDrop={true}>
      <MediaGrid
        preset={tailwindPreset}
        icons={lucideIcons}
      />
    </MediaLibraryProvider>
  );
}
```

That's it. Drag & drop uploads, search, filters, grid/list/masonry views - all included.

## Headless Architecture

The library doesn't ship any UI. You provide components via a `preset`:

```tsx
const myPreset = {
  Card: (props) => <div className="my-card" {...props} />,
  Button: (props) => <button className="my-btn" {...props} />,
  TextInput: ({ value, onChange }) => (
    <input value={value} onChange={e => onChange(e.target.value)} />
  ),
  // ... see types for full list
};

<MediaGrid preset={myPreset} />
```

Built-in presets: `tailwindPreset`, `mantinePreset`

## Bundle Size

| Module | Gzipped |
|--------|---------|
| Core | 17 KB |
| Image Editor | 4.6 KB (lazy) |
| Cropper (optional) | 15 KB (lazy) |

## License

MIT
