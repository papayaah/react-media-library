import type { Meta, StoryObj } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import { MediaLibraryProvider } from '../components/MediaLibraryProvider';
import { MediaGrid } from '../components/MediaGrid';
import { tailwindPreset, mantinePreset } from '../presets';
import {
    Upload,
    Search,
    Trash2,
    Image,
    Video,
    Music,
    FileText,
    File,
} from 'lucide-react';
import '@mantine/core/styles.css';

const icons = {
    upload: <Upload size={16} />,
    search: <Search size={16} />,
    trash: <Trash2 size={14} />,
    photo: <Image size={48} opacity={0.5} />,
    video: <Video size={48} />,
    audio: <Music size={48} />,
    document: <FileText size={48} />,
    file: <File size={48} />,
};

const meta: Meta<typeof MediaGrid> = {
    title: 'MediaLibrary/MediaGrid',
    component: MediaGrid,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TailwindPreset: Story = {
    render: () => (
        <MediaLibraryProvider enableDragDrop={true}>
            <MediaGrid preset={tailwindPreset} icons={icons} />
        </MediaLibraryProvider>
    ),
    parameters: {
        docs: {
            description: {
                story: `
**Tailwind CSS Preset**

The MediaGrid component is the complete, opinionated media library.
It includes all features out of the box:

- ✅ File upload (button + global drag & drop)
- ✅ Search by filename
- ✅ Filter by file type
- ✅ Date range filtering
- ✅ Select mode with bulk delete
- ✅ Individual delete
- ✅ Image viewer modal
- ✅ Responsive grid
- ✅ Loading & empty states

Just pass a preset with your UI components!

**Usage:**
\`\`\`tsx
import { MediaLibraryProvider, MediaGrid } from '@buzzer/media-library';
import { tailwindPreset } from '@buzzer/media-library/presets';

<MediaLibraryProvider>
  <MediaGrid preset={tailwindPreset} icons={icons} />
</MediaLibraryProvider>
\`\`\`
        `,
            },
        },
    },
};

export const MantinePreset: Story = {
    render: () => (
        <MantineProvider>
            <MediaLibraryProvider enableDragDrop={true}>
                <MediaGrid preset={mantinePreset} icons={icons} />
            </MediaLibraryProvider>
        </MantineProvider>
    ),
    parameters: {
        docs: {
            description: {
                story: `
**Mantine UI Preset**

Same MediaGrid component, different preset.
All features work exactly the same, just with Mantine UI components.

**Usage:**
\`\`\`tsx
import { MantineProvider } from '@mantine/core';
import { MediaLibraryProvider, MediaGrid } from '@buzzer/media-library';
import { mantinePreset } from '@buzzer/media-library/presets';

<MantineProvider>
  <MediaLibraryProvider>
    <MediaGrid preset={mantinePreset} icons={icons} />
  </MediaLibraryProvider>
</MantineProvider>
\`\`\`
        `,
            },
        },
    },
};

export const MantineDarkMode: Story = {
    render: () => (
        <MantineProvider forceColorScheme="dark">
            <div style={{ background: '#1a1b1e', minHeight: '100vh' }}>
                <MediaLibraryProvider enableDragDrop={true}>
                    <MediaGrid preset={mantinePreset} icons={icons} />
                </MediaLibraryProvider>
            </div>
        </MantineProvider>
    ),
    parameters: {
        docs: {
            description: {
                story: `
**Mantine UI Preset - Dark Mode**

The same component automatically adapts to dark mode.
        `,
            },
        },
    },
};

export const CreateYourOwnPreset: Story = {
    render: () => (
        <MediaLibraryProvider>
            <MediaGrid preset={tailwindPreset} icons={icons} />
        </MediaLibraryProvider>
    ),
    parameters: {
        docs: {
            description: {
                story: `
**Creating Your Own Preset**

The MediaGrid component is UI-agnostic. Create a preset for any UI library:

\`\`\`tsx
import { ComponentPreset } from '@buzzer/media-library';

export const myPreset: ComponentPreset = {
  Card: ({ children, onClick, selected }) => (
    <div onClick={onClick} className={selected ? 'selected' : ''}>
      {children}
    </div>
  ),
  
  Button: ({ children, onClick, variant, loading }) => (
    <button onClick={onClick} className={\`btn btn-\${variant}\`}>
      {loading ? 'Loading...' : children}
    </button>
  ),
  
  TextInput: ({ value, onChange, placeholder, leftIcon }) => (
    <div>
      {leftIcon}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  ),
  
  Select: ({ value, onChange, options, placeholder }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  ),
  
  // ... implement all 12 components
};

// Use it:
<MediaGrid preset={myPreset} icons={icons} />
\`\`\`

**Required Components (12 total):**
1. Card
2. Button
3. TextInput
4. Select
5. Checkbox
6. Badge
7. Image
8. Modal
9. Loader
10. EmptyState
11. FileButton
12. Grid

**Supported UI Libraries:**
- ✅ Tailwind CSS (built-in)
- ✅ Mantine UI (built-in)
- ✅ Material-UI (create your own)
- ✅ Ant Design (create your own)
- ✅ Chakra UI (create your own)
- ✅ Any custom library!
        `,
            },
        },
    },
};
