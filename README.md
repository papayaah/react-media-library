# @buzzer/media-library

A complete, opinionated media library for React 19 that's UI-agnostic.

## Philosophy

**One component. Full-featured. Bring your own UI.**

The `MediaGrid` component provides everything you need for a media library:
- Upload, search, filter, select, delete
- All features built-in
- Just plug in your UI components

## Quick Start

```tsx
import { MediaLibraryProvider, MediaGrid } from '@buzzer/media-library';
import { tailwindPreset } from '@buzzer/media-library/presets';

function App() {
  return (
    <MediaLibraryProvider enableDragDrop={true}>
      <MediaGrid preset={tailwindPreset} icons={icons} />
    </MediaLibraryProvider>
  );
}
```

That's it! You get a complete media library with all features.

## Features

### ✅ Upload
- File button upload
- Global drag & drop (entire page)
- Multiple file support
- Upload progress indicator

### ✅ Search & Filter
- Search by filename (real-time)
- Filter by file type (all, images, videos, audio, documents, other)
- Date range filtering (from/to dates)
- Combined filtering (all filters work together)

### ✅ Selection & Bulk Operations
- Select mode toggle
- Individual selection (checkboxes)
- Select all / Deselect all
- Bulk delete with confirmation
- Selection counter

### ✅ Display & UI
- Responsive grid layout
- File type icons
- File size display (human-readable)
- Upload timestamps
- Loading states
- Empty states
- Image viewer modal

### ✅ Storage
- **IndexedDB**: Metadata storage (database name: "MediaLibrary")
- **OPFS**: File storage (directory: "media-library")
- Persistent across sessions
- Preview URLs for images

## Built-in Presets

### Tailwind CSS
```tsx
import { tailwindPreset } from '@buzzer/media-library/presets';

<MediaGrid preset={tailwindPreset} icons={icons} />
```

### Mantine UI
```tsx
import { MantineProvider } from '@mantine/core';
import { mantinePreset } from '@buzzer/media-library/presets';
import '@mantine/core/styles.css';

<MantineProvider>
  <MediaGrid preset={mantinePreset} icons={icons} />
</MantineProvider>
```

## Creating Your Own Preset

A preset is just an object with 12 UI components:

```tsx
import { ComponentPreset } from '@buzzer/media-library';

export const myPreset: ComponentPreset = {
  // 1. Card - Container for each media item
  Card: ({ children, onClick, selected }) => (
    <div onClick={onClick} className={selected ? 'selected' : ''}>
      {children}
    </div>
  ),

  // 2. Button - All action buttons
  Button: ({ children, onClick, variant, loading, leftIcon }) => (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {leftIcon} {loading ? 'Loading...' : children}
    </button>
  ),

  // 3. TextInput - Search and date inputs
  TextInput: ({ value, onChange, placeholder, type, leftIcon }) => (
    <div>
      {leftIcon}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  ),

  // 4. Select - File type filter
  Select: ({ value, onChange, options, placeholder }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  ),

  // 5. Checkbox - Selection checkboxes
  Checkbox: ({ checked, onChange, label }) => (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  ),

  // 6. Badge - File type and size badges
  Badge: ({ children, variant }) => (
    <span className={`badge badge-${variant}`}>{children}</span>
  ),

  // 7. Image - Image preview
  Image: ({ src, alt }) => (
    <img src={src} alt={alt} />
  ),

  // 8. Modal - Image viewer modal
  Modal: ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    );
  },

  // 9. Loader - Loading spinner
  Loader: ({ size }) => (
    <div className={`spinner spinner-${size}`} />
  ),

  // 10. EmptyState - No files message
  EmptyState: ({ icon, message }) => (
    <div className="empty-state">
      {icon}
      <p>{message}</p>
    </div>
  ),

  // 11. FileButton - File upload button
  FileButton: ({ onSelect, multiple, disabled, children }) => (
    <label className={disabled ? 'disabled' : ''}>
      <input
        type="file"
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) onSelect(files);
        }}
        style={{ display: 'none' }}
      />
      {children}
    </label>
  ),

  // 12. Grid - Responsive grid layout
  Grid: ({ children }) => (
    <div className="grid">
      {children}
    </div>
  ),
};
```

## Icons

Pass icons for a better UX:

```tsx
import {
  IconUpload,
  IconSearch,
  IconTrash,
  IconPhoto,
  IconVideo,
  IconFileMusic,
  IconFileDescription,
  IconFile,
} from '@tabler/icons-react';

const icons = {
  upload: <IconUpload size={16} />,
  search: <IconSearch size={16} />,
  trash: <IconTrash size={14} />,
  photo: <IconPhoto size={48} opacity={0.5} />,
  video: <IconVideo size={48} />,
  audio: <IconFileMusic size={48} />,
  document: <IconFileDescription size={48} />,
  file: <IconFile size={48} />,
};

<MediaGrid preset={tailwindPreset} icons={icons} />
```

## Examples

### Material-UI
```tsx
import { ComponentPreset } from '@buzzer/media-library';
import { Card, Button, TextField, Select } from '@mui/material';

export const muiPreset: ComponentPreset = {
  Card: ({ children, onClick, selected }) => (
    <Card
      onClick={onClick}
      sx={{ border: selected ? '2px solid blue' : '1px solid #e0e0e0' }}
    >
      {children}
    </Card>
  ),
  Button: ({ children, onClick, variant }) => (
    <Button
      onClick={onClick}
      variant={variant === 'primary' ? 'contained' : 'outlined'}
    >
      {children}
    </Button>
  ),
  // ... implement remaining components
};
```

### Ant Design
```tsx
import { ComponentPreset } from '@buzzer/media-library';
import { Card, Button, Input, Select } from 'antd';

export const antdPreset: ComponentPreset = {
  Card: ({ children, onClick, selected }) => (
    <Card
      onClick={onClick}
      style={{ borderColor: selected ? '#1890ff' : '#d9d9d9' }}
    >
      {children}
    </Card>
  ),
  Button: ({ children, onClick, variant, loading }) => (
    <Button
      onClick={onClick}
      type={variant === 'primary' ? 'primary' : 'default'}
      loading={loading}
    >
      {children}
    </Button>
  ),
  // ... implement remaining components
};
```

## TypeScript

Full TypeScript support with all types exported:

```tsx
import type {
  ComponentPreset,
  CardProps,
  ButtonProps,
  MediaAsset,
  MediaType,
} from '@buzzer/media-library';
```

## API Reference

### MediaGrid Props

```tsx
interface MediaGridProps {
  preset: ComponentPreset;
  icons?: {
    upload?: React.ReactNode;
    search?: React.ReactNode;
    trash?: React.ReactNode;
    photo?: React.ReactNode;
    video?: React.ReactNode;
    audio?: React.ReactNode;
    document?: React.ReactNode;
    file?: React.ReactNode;
  };
}
```

### MediaLibraryProvider Props

```tsx
interface MediaLibraryProviderProps {
  children: ReactNode;
  enableDragDrop?: boolean; // default: true
}
```

## Storybook

See live examples:

```bash
cd packages/media-library
npm run storybook
```

Visit http://localhost:6006 to see:
- Tailwind preset
- Mantine preset (light & dark)
- How to create your own preset

## Benefits

### ✅ Opinionated Structure
- All features in one component
- Consistent UX across implementations
- No need to build UI from scratch

### ✅ UI Agnostic
- Works with any UI library
- Tailwind, Mantine, MUI, Ant Design, Chakra, etc.
- Or create your own custom components

### ✅ Full-Featured
- Everything you need out of the box
- Upload, search, filter, select, delete
- Image viewer, loading states, empty states

### ✅ Type Safe
- Full TypeScript support
- Autocomplete for all props
- Compile-time errors

### ✅ Easy to Use
- One component, one preset
- Minimal boilerplate
- Works immediately

## License

MIT
