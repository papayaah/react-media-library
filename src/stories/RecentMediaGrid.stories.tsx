import type { Meta, StoryObj } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import { MediaLibraryProvider } from '../components/MediaLibraryProvider';
import { RecentMediaGrid } from '../components/RecentMediaGrid';
import { tailwindPreset, mantinePreset } from '../presets';
import {
    Image,
    Video,
    Music,
    FileText,
    File,
} from 'lucide-react';
import '@mantine/core/styles.css';
import { useState } from 'react';
import { MediaAsset } from '../types';

const icons = {
    photo: <Image size={48} opacity={0.5} />,
    video: <Video size={48} />,
    audio: <Music size={48} />,
    document: <FileText size={48} />,
    file: <File size={48} />,
};

const meta: Meta<typeof RecentMediaGrid> = {
    title: 'MediaLibrary/RecentMediaGrid',
    component: RecentMediaGrid,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TailwindPreset: Story = {
    render: () => {
        const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);

        return (
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">
                        Selected Assets: {selectedAssets.length}
                    </h3>
                    {selectedAssets.length > 0 && (
                        <ul className="text-xs text-blue-700 space-y-1">
                            {selectedAssets.map((asset) => (
                                <li key={asset.id}>
                                    • {asset.fileName} ({asset.fileType})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <MediaLibraryProvider enableDragDrop={true}>
                    <RecentMediaGrid
                        preset={tailwindPreset}
                        icons={icons}
                        maxItems={12}
                        multiSelect={true}
                        columns={4}
                        onSelectionChange={setSelectedAssets}
                    />
                </MediaLibraryProvider>
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: `
**Tailwind CSS Preset - Multi-Select Mode**

A lightweight recent media grid component perfect for mounting in other apps.

**Features:**
- ✅ Displays recent media items (sorted by upload date)
- ✅ Multi-select mode with visual feedback
- ✅ Integrated lightweight media viewer
- ✅ Selection change callback
- ✅ Click to view, click overlay to select
- ✅ Responsive grid layout

**Usage:**
\`\`\`tsx
import { MediaLibraryProvider, RecentMediaGrid } from '@buzzer/media-library';
import { tailwindPreset } from '@buzzer/media-library/presets';

const [selectedAssets, setSelectedAssets] = useState([]);

<MediaLibraryProvider>
  <RecentMediaGrid
    preset={tailwindPreset}
    icons={icons}
    maxItems={12}
    multiSelect={true}
    columns={4}
    onSelectionChange={setSelectedAssets}
  />
</MediaLibraryProvider>
\`\`\`
        `,
            },
        },
    },
};

export const TailwindSingleSelect: Story = {
    render: () => {
        const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);

        return (
            <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-green-900 mb-2">
                        Selected Asset: {selectedAssets.length > 0 ? selectedAssets[0].fileName : 'None'}
                    </h3>
                    {selectedAssets.length > 0 && (
                        <p className="text-xs text-green-700">
                            Type: {selectedAssets[0].fileType} | Size: {selectedAssets[0].size} bytes
                        </p>
                    )}
                </div>

                <MediaLibraryProvider enableDragDrop={true}>
                    <RecentMediaGrid
                        preset={tailwindPreset}
                        icons={icons}
                        maxItems={8}
                        multiSelect={false}
                        columns={4}
                        onSelectionChange={setSelectedAssets}
                    />
                </MediaLibraryProvider>
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: `
**Tailwind CSS Preset - Single-Select Mode**

Perfect for when you need users to select just one media item.

**Usage:**
\`\`\`tsx
<RecentMediaGrid
  preset={tailwindPreset}
  icons={icons}
  maxItems={8}
  multiSelect={false}
  onSelectionChange={setSelectedAssets}
/>
\`\`\`
        `,
            },
        },
    },
};

export const MantinePreset: Story = {
    render: () => {
        const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);

        return (
            <MantineProvider>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                        background: 'var(--mantine-color-blue-0)',
                        border: '1px solid var(--mantine-color-blue-3)',
                        borderRadius: '8px',
                        padding: '1rem'
                    }}>
                        <h3 style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--mantine-color-blue-9)',
                            marginBottom: '0.5rem'
                        }}>
                            Selected Assets: {selectedAssets.length}
                        </h3>
                        {selectedAssets.length > 0 && (
                            <ul style={{
                                fontSize: '0.75rem',
                                color: 'var(--mantine-color-blue-7)',
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                            }}>
                                {selectedAssets.map((asset) => (
                                    <li key={asset.id} style={{ marginBottom: '0.25rem' }}>
                                        • {asset.fileName} ({asset.fileType})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <MediaLibraryProvider enableDragDrop={true}>
                        <RecentMediaGrid
                            preset={mantinePreset}
                            icons={icons}
                            maxItems={12}
                            multiSelect={true}
                            columns={4}
                            onSelectionChange={setSelectedAssets}
                        />
                    </MediaLibraryProvider>
                </div>
            </MantineProvider>
        );
    },
    parameters: {
        docs: {
            description: {
                story: `
**Mantine UI Preset - Multi-Select Mode**

Same component, different UI library. All features work identically.

**Usage:**
\`\`\`tsx
import { MantineProvider } from '@mantine/core';
import { MediaLibraryProvider, RecentMediaGrid } from '@buzzer/media-library';
import { mantinePreset } from '@buzzer/media-library/presets';

<MantineProvider>
  <MediaLibraryProvider>
    <RecentMediaGrid
      preset={mantinePreset}
      icons={icons}
      maxItems={12}
      multiSelect={true}
      onSelectionChange={setSelectedAssets}
    />
  </MediaLibraryProvider>
</MantineProvider>
\`\`\`
        `,
            },
        },
    },
};

export const MantineDarkMode: Story = {
    render: () => {
        const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);

        return (
            <MantineProvider forceColorScheme="dark">
                <div style={{ background: '#1a1b1e', minHeight: '100vh', padding: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            background: 'var(--mantine-color-dark-6)',
                            border: '1px solid var(--mantine-color-dark-4)',
                            borderRadius: '8px',
                            padding: '1rem'
                        }}>
                            <h3 style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'var(--mantine-color-blue-4)',
                                marginBottom: '0.5rem'
                            }}>
                                Selected Assets: {selectedAssets.length}
                            </h3>
                            {selectedAssets.length > 0 && (
                                <ul style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--mantine-color-gray-4)',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0
                                }}>
                                    {selectedAssets.map((asset) => (
                                        <li key={asset.id} style={{ marginBottom: '0.25rem' }}>
                                            • {asset.fileName} ({asset.fileType})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <MediaLibraryProvider enableDragDrop={true}>
                            <RecentMediaGrid
                                preset={mantinePreset}
                                icons={icons}
                                maxItems={12}
                                multiSelect={true}
                                columns={4}
                                onSelectionChange={setSelectedAssets}
                            />
                        </MediaLibraryProvider>
                    </div>
                </div>
            </MantineProvider>
        );
    },
    parameters: {
        docs: {
            description: {
                story: `
**Mantine UI Preset - Dark Mode**

The component automatically adapts to dark mode with Mantine's theming system.
        `,
            },
        },
    },
};

export const CompactLayout: Story = {
    render: () => {
        const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);

        return (
            <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">
                        Selected: {selectedAssets.length}
                    </h3>
                </div>

                <MediaLibraryProvider enableDragDrop={true}>
                    <RecentMediaGrid
                        preset={tailwindPreset}
                        icons={icons}
                        maxItems={6}
                        multiSelect={true}
                        columns={6}
                        gap="0.5rem"
                        onSelectionChange={setSelectedAssets}
                    />
                </MediaLibraryProvider>
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: `
**Compact Layout**

A more compact grid layout with 6 columns and smaller gaps.
Perfect for sidebars or smaller spaces.

**Usage:**
\`\`\`tsx
<RecentMediaGrid
  preset={tailwindPreset}
  icons={icons}
  maxItems={6}
  columns={6}
  gap="0.5rem"
  onSelectionChange={setSelectedAssets}
/>
\`\`\`
        `,
            },
        },
    },
};

export const MasonryLayout: Story = {
    render: () => {
        const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);

        return (
            <div className="space-y-4">
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-pink-900 mb-2">
                        Selected: {selectedAssets.length}
                    </h3>
                </div>

                <MediaLibraryProvider enableDragDrop={true}>
                    <RecentMediaGrid
                        preset={tailwindPreset}
                        icons={icons}
                        maxItems={20}
                        multiSelect={true}
                        columns={4}
                        onSelectionChange={setSelectedAssets}
                    />
                </MediaLibraryProvider>
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: `
**Masonry Layout**

Demonstrates the masonry layout capability. 
Users can toggle between Grid and Masonry views using the built-in toggle.
Masonry view removes gaps between items for a seamless look.

**Usage:**
\`\`\`tsx
<RecentMediaGrid
  preset={tailwindPreset}
  icons={icons}
  maxItems={20}
  columns={4}
  onSelectionChange={setSelectedAssets}
/>
\`\`\`
        `,
            },
        },
    },
};

export const LargeLayout: Story = {
    render: () => {
        const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);

        return (
            <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-orange-900 mb-2">
                        Selected: {selectedAssets.length}
                    </h3>
                </div>

                <MediaLibraryProvider enableDragDrop={true}>
                    <RecentMediaGrid
                        preset={tailwindPreset}
                        icons={icons}
                        maxItems={9}
                        multiSelect={true}
                        columns={3}
                        gap="1.5rem"
                        onSelectionChange={setSelectedAssets}
                    />
                </MediaLibraryProvider>
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: `
**Large Layout**

A larger grid layout with 3 columns and bigger gaps.
Perfect for showcasing media in a prominent way.

**Usage:**
\`\`\`tsx
<RecentMediaGrid
  preset={tailwindPreset}
  icons={icons}
  maxItems={9}
  columns={3}
  gap="1.5rem"
  onSelectionChange={setSelectedAssets}
/>
\`\`\`
        `,
            },
        },
    },
};
