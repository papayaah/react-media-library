import type { Meta, StoryObj } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import { QuickMediaPicker } from '../components/QuickMediaPicker';
import { tailwindPreset, lucideIcons } from '../presets';
import { mantinePreset } from '../presets/mantine';
import type { PexelsImage } from '../types';
import '@mantine/core/styles.css';
import { useState } from 'react';

const meta: Meta<typeof QuickMediaPicker> = {
    title: 'MediaLibrary/QuickMediaPicker',
    component: QuickMediaPicker,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockPexelsImages: PexelsImage[] = [
    { name: 'Mountain Lake', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' },
    { name: 'Forest Path', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop' },
    { name: 'Sunset Valley', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop' },
    { name: 'Green Trees', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop' },
    { name: 'Rolling Hills', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop' },
    { name: 'Ocean View', url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop' },
];

const mockFetchPexels = async (): Promise<PexelsImage[]> => {
    await new Promise((r) => setTimeout(r, 800));
    return mockPexelsImages;
};

export const TailwindPreset: Story = {
    render: () => {
        const [lastAction, setLastAction] = useState('');
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                    padding: '0.75rem 1rem',
                    background: '#f0f0f0',
                    borderRadius: 8,
                    fontSize: 13,
                }}>
                    Last action: {lastAction || 'none'}
                </div>
                <QuickMediaPicker
                    preset={tailwindPreset}
                    icons={lucideIcons}
                    pexels={mockPexelsImages}
                    onSelectMedia={(id) => setLastAction(`Selected media #${id}`)}
                    onSelectPexels={(url) => setLastAction(`Selected pexels: ${url.slice(0, 50)}...`)}
                    onClose={() => setLastAction('Closed')}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: `
**Tailwind CSS Preset**

A compact media picker with Library and Pexels tabs.
Perfect for embedding in popovers, dropdowns, or inline panels.

**Basic Usage:**

\`\`\`tsx
import { QuickMediaPicker } from '@reactkits.dev/react-media-library';
import { tailwindPreset, lucideIcons } from '@reactkits.dev/react-media-library';

<QuickMediaPicker
  preset={tailwindPreset}
  icons={lucideIcons}
  pexels={pexelsImages}
  onSelectMedia={(id) => console.log('Selected:', id)}
  onSelectPexels={(url) => console.log('Pexels:', url)}
  onClose={() => setOpen(false)}
/>
\`\`\`
`,
            },
        },
    },
};

export const MantinePreset: Story = {
    render: () => {
        const [lastAction, setLastAction] = useState('');
        return (
            <MantineProvider>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--mantine-color-gray-1)',
                        borderRadius: 8,
                        fontSize: 13,
                    }}>
                        Last action: {lastAction || 'none'}
                    </div>
                    <QuickMediaPicker
                        preset={mantinePreset}
                        icons={lucideIcons}
                        pexels={mockFetchPexels}
                        onSelectMedia={(id) => setLastAction(`Selected media #${id}`)}
                        onSelectPexels={(url) => setLastAction(`Selected pexels: ${url.slice(0, 50)}...`)}
                        onClose={() => setLastAction('Closed')}
                    />
                </div>
            </MantineProvider>
        );
    },
    parameters: {
        docs: {
            description: {
                story: `
**Mantine UI Preset with async Pexels fetch**

Same component using Mantine preset. Pexels images are loaded via an async function
when the Pexels tab is first opened (simulates a real API call with 800ms delay).

\`\`\`tsx
const fetchPexels = async () => {
  const res = await fetch('/api/pexels-images');
  const data = await res.json();
  return data.images;
};

<QuickMediaPicker
  preset={mantinePreset}
  icons={lucideIcons}
  pexels={fetchPexels}
  onSelectMedia={handleSelect}
  onClose={handleClose}
/>
\`\`\`
`,
            },
        },
    },
};

export const LibraryOnly: Story = {
    render: () => {
        const [lastAction, setLastAction] = useState('');
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                    padding: '0.75rem 1rem',
                    background: '#f0f0f0',
                    borderRadius: 8,
                    fontSize: 13,
                }}>
                    Last action: {lastAction || 'none'}
                </div>
                <QuickMediaPicker
                    preset={tailwindPreset}
                    icons={lucideIcons}
                    onSelectMedia={(id) => setLastAction(`Selected media #${id}`)}
                    onClose={() => setLastAction('Closed')}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: `
**Library Only (no Pexels tab)**

When \`pexels\` prop is omitted, only the Library tab is shown and the tab bar is hidden.

\`\`\`tsx
<QuickMediaPicker
  preset={tailwindPreset}
  icons={lucideIcons}
  onSelectMedia={handleSelect}
  onClose={handleClose}
/>
\`\`\`
`,
            },
        },
    },
};
