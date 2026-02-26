import { ReactNode } from 'react';

export type MediaAIGenerateRequest = {
    prompt: string;
    width: number;
    height: number;
    /** Provider/model identifier (provider-specific) */
    model?: string;
    negativePrompt?: string;
    steps?: number;
    seed?: number;
};

export type MediaAIGeneratedImage = {
    file: File;
    metadata?: {
        provider?: string;
        model?: string;
        prompt?: string;
        negativePrompt?: string;
        seed?: number;
        steps?: number;
        width?: number;
        height?: number;
        createdAt?: number;
    };
};

export type MediaAIGenerator = {
    generateImages: (req: MediaAIGenerateRequest) => Promise<MediaAIGeneratedImage[]>;
};

export type PexelsImage = {
    name: string;
    url: string;
    size?: number;
    modified?: string | number;
};

export type MediaPexelsProvider = {
    fetchImages: () => Promise<PexelsImage[]>;
};

// Freepik API Response Types (matching actual API)
export type FreepikIconResponse = {
    data: Array<{
        id: number;
        name: string;
        slug: string;
        free_svg: boolean;
        created: string;
        author: {
            id: number;
            name: string;
            slug: string;
            avatar: string;
            assets: number;
        };
        style: {
            id: number;
            name: string;
        };
        family: {
            id: number;
            name: string;
            total: number;
        };
        thumbnails: Array<{
            url: string;
            width: number;
            height: number;
        }>;
        tags: Array<{
            name: string;
            slug: string;
        }>;
    }>;
    meta: {
        pagination: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
};

export type FreepikDownloadResponse = {
    data: {
        filename: string;
        url: string;
    };
};

// Normalized content type for the package
export type FreepikContent = {
    id: string;
    name: string;
    thumbnailUrl: string;
    type: 'icon' | 'photo' | 'vector';
    isFree: boolean;
    metadata?: {
        author?: {
            id: number;
            name: string;
            slug: string;
        };
        style?: {
            id: number;
            name: string;
        };
        family?: {
            id: number;
            name: string;
        };
        tags?: Array<{ name: string; slug: string }>;
        created?: string;
    };
};

export type MediaFreepikProvider = {
    /** Search for icons. Calls consumer's backend route. */
    searchIcons: (options: {
        query?: string;
        order?: 'relevance' | 'popularity' | 'date';
        page?: number;
        perPage?: number;
    }) => Promise<FreepikContent[]>;

    /** Search for photos/vectors/resources. Calls consumer's backend route. */
    searchResources?: (options: {
        query?: string;
        type?: 'photo' | 'vector' | 'psd';
        order?: string;
        page?: number;
        perPage?: number;
    }) => Promise<FreepikContent[]>;

    /** Download content. Calls consumer's backend route which returns a File. */
    downloadContent: (
        content: FreepikContent,
        options?: {
            pngSize?: number;
            format?: string;
        }
    ) => Promise<File>;
};

// Curated Asset Library Types
export type LibraryAssetCategory = {
    id: string;
    name: string;
    description?: string;
    thumbnailUrl?: string;
};

export type LibraryAsset = {
    id: string;
    name: string;
    category: string;
    thumbnailUrl: string;
    fullUrl: string;
    width?: number;
    height?: number;
    tags?: string[];
};

export type MediaLibraryAssetsProvider = {
    getCategories: () => Promise<LibraryAssetCategory[]>;
    getAssets: (categoryId: string) => Promise<LibraryAsset[]>;
    downloadAsset: (asset: LibraryAsset) => Promise<File>;
};

export interface MediaAsset {
    // Local-only fields (for offline support)
    id?: number; // Local IndexedDB ID (temporary until synced)

    // Cloud fields (synced) - optional, added for cross-device sync
    cloudId?: string; // UUID from backend (primary key in cloud)
    userId?: string; // User who owns this asset

    // File storage
    handleName: string; // OPFS filename (local cache - authoritative for UX)
    cloudUrl?: string; // Server URL/path (if synced to server)
    /** Optional thumbnail stored in OPFS for faster grids/previews */
    thumbnailHandleName?: string;
    thumbnailMimeType?: string;
    thumbnailSize?: number;

    // Metadata
    fileName: string;
    fileType: MediaType;
    mimeType: string;
    size: number;
    /** For images, store intrinsic dimensions */
    width?: number;
    height?: number;

    // Timestamps
    createdAt: number; // Local creation time
    updatedAt: number; // Last modification time
    syncedAt?: number; // Last successful sync timestamp
    cloudCreatedAt?: string; // ISO timestamp from backend

    // Sync state
    syncStatus?: 'pending' | 'syncing' | 'synced' | 'error';
    syncError?: string;

    // UI
    previewUrl?: string; // Standard preview (thumbnail if available)
    fullUrl?: string; // Full resolution original image
    thumbnailUrl?: string; // Explicit thumbnail URL
}

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other';

// Icon component type - accepts a component that takes size and optional props
export interface IconComponent {
    (props: { size?: number | string;[key: string]: any }): ReactNode;
}

// Media Grid Icons interface
export interface MediaGridIcons {
    upload?: IconComponent | ReactNode;
    search?: IconComponent | ReactNode;
    trash?: IconComponent | ReactNode;
    photo?: IconComponent | ReactNode;
    video?: IconComponent | ReactNode;
    audio?: IconComponent | ReactNode;
    document?: IconComponent | ReactNode;
    file?: IconComponent | ReactNode;
    // View toggle icons
    layoutGrid?: IconComponent | ReactNode;
    list?: IconComponent | ReactNode;
    columns?: IconComponent | ReactNode;
    slidersHorizontal?: IconComponent | ReactNode;
    // Other UI icons
    check?: IconComponent | ReactNode;
    x?: IconComponent | ReactNode;
    crop?: IconComponent | ReactNode;
    rotateCw?: IconComponent | ReactNode;
    rotateCcw?: IconComponent | ReactNode;
    flipHorizontal?: IconComponent | ReactNode;
    flipVertical?: IconComponent | ReactNode;
    zoomIn?: IconComponent | ReactNode;
    zoomOut?: IconComponent | ReactNode;
    undo?: IconComponent | ReactNode;
    hand?: IconComponent | ReactNode;
    cloud?: IconComponent | ReactNode;
    dots?: IconComponent | ReactNode;
}

export interface MediaLibraryConfig {
    dbName?: string;
    opfsDirectory?: string;
}

/**
 * Configuration for server-side media sync.
 * When provided, media will be automatically synced to server when user is authenticated.
 */
export interface MediaSyncConfig {
    /**
     * Base URL for the API (e.g., '/api' or 'https://example.com/api')
     */
    apiBaseUrl: string;

    /**
     * Get the current user ID from your authentication system.
     * Should return a non-empty string if authenticated, or null if not authenticated.
     * When null, sync operations will be skipped (offline-first behavior).
     */
    getUserId: () => Promise<string | null>;

    /**
     * Enable automatic background sync (default: true)
     */
    autoSync?: boolean;

    /**
     * Interval for background sync in milliseconds (default: 30000 = 30 seconds)
     */
    syncInterval?: number;

    /**
     * Called when sync status changes
     */
    onSyncStatusChange?: (status: 'idle' | 'syncing' | 'synced' | 'error') => void;

    /**
     * Called when sync error occurs
     */
    onSyncError?: (error: Error) => void;
}

// Component Preset Types
export interface CardProps {
    children: ReactNode;
    onClick?: () => void;
    selected?: boolean;
    className?: string;
    style?: React.CSSProperties;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
}

export interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    disabled?: boolean;
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    leftIcon?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    color?: string;
    'aria-label'?: string;
}

export interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    leftIcon?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    label?: string;
    'aria-label'?: string;
    className?: string;
    style?: React.CSSProperties;
}

export interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    className?: string;
    style?: React.CSSProperties;
}

export interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'primary' | 'secondary';
    className?: string;
    style?: React.CSSProperties;
}

export interface TextProps {
    children: ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fw?: number | string;
    c?: string;
    mb?: number | string;
    className?: string;
    style?: React.CSSProperties;
}

export interface ImageProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    loading?: 'lazy' | 'eager';
    decoding?: 'async' | 'auto' | 'sync';
    onLoad?: () => void;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export interface EmptyStateProps {
    icon?: ReactNode;
    message: string;
    className?: string;
}

export interface FileButtonProps {
    onSelect: (files: File[]) => void;
    multiple?: boolean;
    disabled?: boolean;
    children: ReactNode;
}

export interface GridProps {
    children: ReactNode;
    columns?: number;
    gap?: string;
    className?: string;
}

export interface SkeletonProps {
    className?: string;
}

export interface UploadCardProps {
    onClick: () => void;
    isDragging: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
}

export interface ViewerProps {
    isOpen: boolean;
    onClose: () => void;
    main: React.ReactNode;
    sidebar: React.ReactNode;
    actions: React.ReactNode;
}

export interface ViewerThumbnailProps {
    src: string;
    alt: string;
    selected: boolean;
    onClick: () => void;
    style?: React.CSSProperties;
}

export interface MenuItem {
    id: string;
    label: ReactNode;
    icon?: ReactNode;
    onClick?: () => void;
    color?: string;
    disabled?: boolean;
    divider?: boolean;
}

export interface MenuProps {
    target: ReactNode;
    items?: MenuItem[];
    children?: ReactNode;
    position?: string;
    width?: number;
    className?: string;
    style?: React.CSSProperties;
}

export interface AIGenerateSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    prompt: string;
    onPromptChange: (value: string) => void;
    width: string;
    onWidthChange: (value: string) => void;
    height: string;
    onHeightChange: (value: string) => void;
    steps: string;
    onStepsChange: (value: string) => void;
    model: string;
    onModelChange: (value: string) => void;
    onPresetChange: (value: string) => void;
    error: string | null;
    generating: boolean;
    onGenerate: () => void;
    onCancel: () => void;
}

export interface PexelsImagePickerProps {
    isOpen: boolean;
    onClose: () => void;
    images: PexelsImage[];
    loading: boolean;
    selected: Set<string>;
    onToggleSelect: (url: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    importing: boolean;
    onImport: () => void;
}

export interface FreepikContentPickerProps {
    isOpen: boolean;
    onClose: () => void;

    // Content state
    content: FreepikContent[];
    loading: boolean;

    // Search state
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onSearch: () => void;

    // Selection state
    selected: Set<string>;
    onToggleSelect: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;

    // Import state
    importing: boolean;
    onImport: () => void;

    // Order/sort
    order: 'relevance' | 'popularity' | 'date';
    onOrderChange: (order: 'relevance' | 'popularity' | 'date') => void;
}

export interface LibraryAssetPickerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: LibraryAssetCategory[];
    assets: LibraryAsset[];
    loading: boolean;
    selectedCategory: string | null;
    onCategorySelect: (categoryId: string) => void;
    onBack: () => void;
    selected: Set<string>;
    onToggleSelect: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    importing: boolean;
    onImport: () => void;
}

// Drag & Drop Props - for MediaGrid and RecentMediaGrid
export interface DragDropProps {
    /** Enable drag functionality on items */
    draggable?: boolean;

    /** Called when drag starts - receives asset and native event */
    onDragStart?: (asset: MediaAsset, event: React.DragEvent) => void;

    /** Called when drag ends */
    onDragEnd?: (asset: MediaAsset, event: React.DragEvent) => void;

    /** For DnD library users: wrap each item with custom component */
    itemWrapper?: React.ComponentType<{
        asset: MediaAsset;
        children: React.ReactNode;
    }>;
}

// Component Preset Interface
export interface ComponentPreset {
    Card: React.FC<CardProps>;
    Button: React.FC<ButtonProps>;
    TextInput: React.FC<TextInputProps>;
    Select: React.FC<SelectProps>;
    Checkbox: React.FC<CheckboxProps>;
    Badge: React.FC<BadgeProps>;
    Image: React.FC<ImageProps>;
    Modal: React.FC<ModalProps>;
    Loader: React.FC<LoaderProps>;
    EmptyState: React.FC<EmptyStateProps>;
    FileButton: React.FC<FileButtonProps>;
    Grid: React.FC<GridProps>;
    Skeleton: React.FC<SkeletonProps>;
    UploadCard: React.FC<UploadCardProps>;
    Viewer: React.FC<ViewerProps>;
    ViewerThumbnail: React.FC<ViewerThumbnailProps>;
    Text: React.FC<TextProps>;
    /** Optional: AI Generate Sidebar. If provided, renders as sidebar instead of modal. */
    AIGenerateSidebar?: React.FC<AIGenerateSidebarProps>;
    /** Optional: Pexels Image Picker. If provided, enables Pexels integration. */
    PexelsImagePicker?: React.FC<PexelsImagePickerProps>;
    /** Optional: Freepik Content Picker. If provided, enables Freepik integration. */
    FreepikContentPicker?: React.FC<FreepikContentPickerProps>;
    /** Optional: Library Asset Picker. If provided, enables curated asset library integration. */
    LibraryAssetPicker?: React.FC<LibraryAssetPickerProps>;
    Menu?: React.FC<MenuProps>;
}

export interface QuickMediaPickerProps {
    /** Called when user selects a media asset from the library */
    onSelectMedia: (mediaId: number) => void;
    /** Called when user selects a Pexels image */
    onSelectPexels?: (url: string) => void;
    /** Called when the picker should close */
    onClose: () => void;
    /** Component preset for headless rendering of inner content */
    preset: ComponentPreset;
    /** Icon set for headless rendering */
    icons?: MediaGridIcons;
    /** Pexels images (static array) or async fetch function. If omitted, Pexels tab is hidden. */
    pexels?: PexelsImage[] | (() => Promise<PexelsImage[]>);
    /** Width of the picker container in px (default: 280) */
    width?: number;
    /** Height of the scrollable content area in px (default: 200) */
    scrollHeight?: number;
    /** Max items to show in the library grid (default: 12) */
    maxItems?: number;
    /** Number of columns in the grids (default: 3) */
    columns?: number;
    /** Gap between grid items (default: '6px') */
    gap?: string;
    /** CSS class for the outer container */
    className?: string;
    /** Inline style for the outer container */
    style?: React.CSSProperties;
}
