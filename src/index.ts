// Hooks
export { useMediaLibrary } from './hooks/useMediaLibrary';
export { useMediaDragDrop } from './hooks/useMediaDragDrop';
export { useTheme } from './hooks/useTheme';

// Components
export { MediaLibraryProvider, useMediaLibraryContext } from './components/MediaLibraryProvider';
export { MediaGrid } from './components/MediaGrid';
export type { MediaGridProps } from './components/MediaGrid';
export { RecentMediaGrid } from './components/RecentMediaGrid';
export type { RecentMediaGridProps } from './components/RecentMediaGrid';

// Presets
export { tailwindPreset, lucideIcons } from './presets';
// Note: mantinePreset is available but not exported by default to avoid bundling Mantine
// Import directly: import { mantinePreset } from '@reactkits.dev/media-library/presets/mantine'

// Types
export type {
    MediaAIGenerateRequest,
    MediaAIGeneratedImage,
    MediaAIGenerator,
    PexelsImage,
    MediaPexelsProvider,
    PexelsImagePickerProps,
    MediaAsset,
    MediaType,
    MediaLibraryConfig,
    ComponentPreset,
    CardProps,
    ButtonProps,
    TextInputProps,
    SelectProps,
    CheckboxProps,
    BadgeProps,
    ImageProps,
    ModalProps,
    LoaderProps,
    EmptyStateProps,
    FileButtonProps,
    GridProps,
    AIGenerateSidebarProps,
} from './types';

// Services
export {
    initDB,
    saveFileToOpfs,
    getFileFromOpfs,
    deleteFileFromOpfs,
    addAssetToDB,
    listAssetsFromDB,
    deleteAssetFromDB,
    getAssetType,
    importFileToLibrary,
} from './services/storage';
