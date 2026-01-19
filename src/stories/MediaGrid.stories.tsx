import type { Meta, StoryObj } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import { MediaLibraryProvider } from '../components/MediaLibraryProvider';
import { MediaGrid } from '../components/MediaGrid';
import { tailwindPreset, lucideIcons } from '../presets';
import { mantinePreset } from '../presets/mantine';
import type { MediaAIGenerator, MediaPexelsProvider } from '../types';
import '@mantine/core/styles.css';

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
            <MediaGrid preset={tailwindPreset} icons={lucideIcons} />
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
import { MediaLibraryProvider, MediaGrid } from '@reactkits.dev/media-library';
import { tailwindPreset, lucideIcons } from '@reactkits.dev/media-library/presets';

<MediaLibraryProvider>
  <MediaGrid preset={tailwindPreset} icons={lucideIcons} />
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
                <MediaGrid preset={mantinePreset} icons={lucideIcons} />
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
import { MediaLibraryProvider, MediaGrid } from '@reactkits.dev/media-library';
import { mantinePreset } from '@reactkits.dev/media-library/presets';

<MantineProvider>
  <MediaLibraryProvider>
    <MediaGrid preset={mantinePreset} icons={lucideIcons} />
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
                    <MediaGrid preset={mantinePreset} icons={lucideIcons} />
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
            <MediaGrid preset={tailwindPreset} icons={lucideIcons} />
        </MediaLibraryProvider>
    ),
    parameters: {
        docs: {
            description: {
                story: `
**Creating Your Own Preset**

The MediaGrid component is UI-agnostic. Create a preset for any UI library:

\`\`\`tsx
import { ComponentPreset } from '@reactkits.dev/media-library';

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
import { lucideIcons } from '@reactkits.dev/media-library/presets';
<MediaGrid preset={myPreset} icons={lucideIcons} />
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

const env = (import.meta as any).env || {};
const STORYBOOK_AI_GENERATE_URL: string | undefined =
    env.STORYBOOK_AI_GENERATE_URL || env.VITE_STORYBOOK_AI_GENERATE_URL;

const mockAIGenerator: MediaAIGenerator = {
    async generateImages(req) {
        // Optional "real backend" mode (no API keys in Storybook).
        if (STORYBOOK_AI_GENERATE_URL) {
            const res = await fetch(STORYBOOK_AI_GENERATE_URL, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(req),
            });
            if (!res.ok) throw new Error('AI backend request failed');
            const blob = await res.blob();
            const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/jpeg' ? 'jpg' : 'png';
            const file = new File([blob], `ai-${Date.now()}.${ext}`, { type: blob.type || 'image/png' });
            return [{ file, metadata: { provider: res.headers.get('x-ai-provider') ?? 'backend' } }];
        }

        // Default mock mode: deterministic SVG image with the prompt embedded.
        const safeText = (req.prompt || 'AI').slice(0, 120).replace(/[<>]/g, '');
        const w = Math.max(1, Number(req.width) || 768);
        const h = Math.max(1, Number(req.height) || 768);
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c3aed"/>
      <stop offset="1" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect x="${Math.round(w * 0.06)}" y="${Math.round(h * 0.06)}" width="${Math.round(w * 0.88)}" height="${Math.round(h * 0.88)}" rx="20" fill="rgba(255,255,255,0.18)"/>
  <text x="${Math.round(w * 0.1)}" y="${Math.round(h * 0.18)}" font-family="ui-sans-serif, system-ui" font-size="${Math.max(16, Math.round(Math.min(w, h) * 0.05))}" fill="white" font-weight="700">
    Mock AI Image
  </text>
  <text x="${Math.round(w * 0.1)}" y="${Math.round(h * 0.28)}" font-family="ui-sans-serif, system-ui" font-size="${Math.max(12, Math.round(Math.min(w, h) * 0.03))}" fill="white" opacity="0.95">
    ${safeText}
  </text>
</svg>`;

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const file = new File([blob], `mock-ai-${Date.now()}.svg`, { type: 'image/svg+xml' });
        return [{ file, metadata: { provider: 'mock', width: w, height: h, prompt: req.prompt } }];
    },
};

export const MantineWithAIGenerate: Story = {
    render: () => (
        <MantineProvider>
            <MediaLibraryProvider enableDragDrop={true} ai={mockAIGenerator}>
                <MediaGrid preset={mantinePreset} icons={lucideIcons} />
            </MediaLibraryProvider>
        </MantineProvider>
    ),
    parameters: {
        docs: {
            description: {
                story: `
This story demonstrates the **AI Generate** flow inside the MediaGrid.

- Default mode uses a **mock** generator (no network, no secrets).
- Optional: set \`STORYBOOK_AI_GENERATE_URL\` (or \`VITE_STORYBOOK_AI_GENERATE_URL\`) to point to a local backend endpoint that returns image bytes.
`,
            },
        },
    },
};

const STORYBOOK_PEXELS_URL: string | undefined =
    env.STORYBOOK_PEXELS_URL || env.VITE_STORYBOOK_PEXELS_URL;

const mockPexelsProvider: MediaPexelsProvider = {
    async fetchImages() {
        // Optional "real backend" mode (no API keys in Storybook).
        if (STORYBOOK_PEXELS_URL) {
            const res = await fetch(STORYBOOK_PEXELS_URL);
            const data = await res.json();
            return (data.images || []).map((img: any) => ({
                name: img.name,
                url: img.url,
                size: img.size,
                modified: img.modified,
            }));
        }

        // Default mock mode: return a few placeholder images
        return [
            {
                name: 'pexels-mock-1.jpg',
                url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
                size: 123456,
                modified: Date.now() - 86400000,
            },
            {
                name: 'pexels-mock-2.jpg',
                url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop',
                size: 234567,
                modified: Date.now() - 172800000,
            },
            {
                name: 'pexels-mock-3.jpg',
                url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
                size: 345678,
                modified: Date.now() - 259200000,
            },
            {
                name: 'pexels-mock-4.jpg',
                url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
                size: 456789,
                modified: Date.now() - 345600000,
            },
            {
                name: 'pexels-mock-5.jpg',
                url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop',
                size: 567890,
                modified: Date.now() - 432000000,
            },
            {
                name: 'pexels-mock-6.jpg',
                url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop',
                size: 678901,
                modified: Date.now() - 518400000,
            },
        ];
    },
};

export const MantineWithPexels: Story = {
    render: () => (
        <MantineProvider>
            <MediaLibraryProvider enableDragDrop={true} pexels={mockPexelsProvider}>
                <MediaGrid preset={mantinePreset} icons={lucideIcons} />
            </MediaLibraryProvider>
        </MantineProvider>
    ),
    parameters: {
        docs: {
            description: {
                story: `
This story demonstrates the **Pexels** integration inside the MediaGrid.

- Default mode uses **mock** images from Unsplash (no network, no secrets).
- Optional: set \`STORYBOOK_PEXELS_URL\` (or \`VITE_STORYBOOK_PEXELS_URL\`) to point to a local backend endpoint that returns Pexels image data.
`,
            },
        },
    },
};

export const MantineWithAIGenerateAndPexels: Story = {
    render: () => (
        <MantineProvider>
            <MediaLibraryProvider enableDragDrop={true} ai={mockAIGenerator} pexels={mockPexelsProvider}>
                <MediaGrid preset={mantinePreset} icons={lucideIcons} />
            </MediaLibraryProvider>
        </MantineProvider>
    ),
    parameters: {
        docs: {
            description: {
                story: `
This story demonstrates **both AI Generate and Pexels** working together in the MediaGrid.

- Both features use mock providers by default.
- Optional: set environment variables to use real backends.
`,
            },
        },
    },
};
