import type { Meta, StoryObj } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import { MediaLibraryProvider } from '../components/MediaLibraryProvider';
import { RecentMediaGrid } from '../components/RecentMediaGrid';
import { tailwindPreset, mantinePreset, lucideIcons } from '../presets';
import '@mantine/core/styles.css';
import { useState } from 'react';
import { MediaAsset } from '../types';

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
                        icons={lucideIcons}
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
**Tailwind CSS Preset**

A lightweight recent media grid component perfect for mounting in other apps.

**Basic Usage:**

\`\`\`tsx
import { MediaLibraryProvider, RecentMediaGrid } from '@buzzer/media-library';
import { tailwindPreset } from '@buzzer/media-library/presets';

// Inside your component
const [selectedAssets, setSelectedAssets] = useState([]);

import { lucideIcons } from '@buzzer/media-library/presets';

<MediaLibraryProvider>
  <RecentMediaGrid
    preset={tailwindPreset}
    icons={lucideIcons}
    onSelectionChange={setSelectedAssets}
  />
</MediaLibraryProvider>
\`\`\`

**Optional Settings:**

\`\`\`tsx
<RecentMediaGrid
  // ... required props
  maxItems={20}           // Default: 12
  multiSelect={false}     // Default: true
  columns={4}             // Default: 4
  gap="1rem"              // Default: '1rem'
  showLayoutToggle={true} // Default: true
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
                            icons={lucideIcons}
                            maxItems={20}
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
**Mantine UI Preset**

Same component using the Mantine UI library.

**Usage:**

\`\`\`tsx
import { MantineProvider } from '@mantine/core';
import { MediaLibraryProvider, RecentMediaGrid } from '@buzzer/media-library';
import { mantinePreset } from '@buzzer/media-library/presets';

<MantineProvider>
import { lucideIcons } from '@buzzer/media-library/presets';

  <MediaLibraryProvider>
    <RecentMediaGrid
      preset={mantinePreset}
      icons={lucideIcons}
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
