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
export { QuickMediaPicker } from './components/QuickMediaPicker';

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
    // Freepik
    FreepikIconResponse,
    FreepikDownloadResponse,
    FreepikContent,
    MediaFreepikProvider,
    FreepikContentPickerProps,
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
    QuickMediaPickerProps,
} from './types';

// Services (client-side)
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
    clearAllMediaData,
} from './services/storage';

// Sync service (can be used client-side)
export { MediaSyncService } from './services/sync';
export type { MediaSyncConfig } from './services/sync';

// Freepik API helpers (for backend routes)
export {
    searchFreepikIcons,
    downloadFreepikIcon,
    searchFreepikResources,
    downloadFreepikResource,
} from './services/freepik-api';
export type {
    SearchFreepikIconsOptions,
    DownloadFreepikIconOptions,
    SearchFreepikResourcesOptions,
    DownloadFreepikResourceOptions,
} from './services/freepik-api';
