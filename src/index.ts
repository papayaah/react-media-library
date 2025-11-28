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
export { tailwindPreset, mantinePreset, lucideIcons } from './presets';

// Types
export type {
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
} from './services/storage';
