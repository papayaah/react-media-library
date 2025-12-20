export { tailwindPreset } from './tailwind';
export { lucideIcons } from './lucide';
export { defaultPreset } from './default';

// Mantine preset is NOT exported here to avoid eager loading
// This prevents Mantine from being bundled when not used
// Import directly: import { mantinePreset } from '@reactkits.dev/media-library/presets/mantine'
