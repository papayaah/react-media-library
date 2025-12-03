# Demo

## Usage

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

## Run

```bash
npm install
npm run dev
```
