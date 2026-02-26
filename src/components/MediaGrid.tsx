'use client';

import React, { useState, useMemo } from 'react';
import { useMediaLibraryContext } from './MediaLibraryProvider';
import { MediaAsset, ComponentPreset, MediaGridIcons, DragDropProps, LibraryAsset } from '../types';
import { MediaViewer } from './MediaViewer';
import { renderIcon } from '../utils/renderIcon';

interface MediaGridProps extends DragDropProps {
    preset: ComponentPreset;
    icons?: MediaGridIcons;
    onSelectionChange?: (selectedAssets: MediaAsset[], isSelectMode: boolean) => void;
    /** Called when a curated library asset is clicked (for direct apply without import) */
    onLibraryAssetSelect?: (asset: LibraryAsset) => void;
    /** Called when drag starts on a curated library asset */
    onLibraryDragStart?: (asset: LibraryAsset, event: React.DragEvent) => void;
    /** Default view mode (default: 'grid') */
    defaultViewMode?: 'grid' | 'list' | 'masonry';
    /** Default item variant (default: 'default') */
    defaultItemVariant?: 'default' | 'minimal';
    /** Columns in masonry view (default: 4) */
    masonryColumns?: number;
}

const typeIconMap = (icons: MediaGridProps['icons']) => ({
    image: icons?.photo,
    video: icons?.video,
    audio: icons?.audio,
    document: icons?.document,
    other: icons?.file,
});

const renderTypeIcon = (icon: MediaGridIcons[keyof MediaGridIcons] | undefined, size: number = 48) => {
    return renderIcon(icon, size);
};

const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes)) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatTimestamp = (ms: number) => {
    if (!ms) return '';
    const date = new Date(ms);
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

interface GridAssetItemProps {
    asset: MediaAsset;
    preset: ComponentPreset;
    isSelected: boolean;
    isSelectMode: boolean;
    onToggleSelection: (id: number) => void;
    onAssetClick: (asset: MediaAsset) => void;
    onDeleteAsset: (asset: MediaAsset) => void;
    renderTypeIcon: (icon: any, size: number) => React.ReactNode;
    iconMap: any;
    icons?: MediaGridIcons;
    // Delete confirmation (double-tap pattern)
    isDeleteConfirm: boolean;
    onDeleteConfirmChange: (assetId: number | null) => void;
    onEnterSelectMode?: () => void;
    // Drag & drop props
    draggable?: boolean;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    variant?: 'default' | 'minimal';
    viewMode?: 'grid' | 'masonry' | 'list';
}

const GridAssetItem: React.FC<GridAssetItemProps> = ({
    asset,
    preset,
    isSelected,
    isSelectMode,
    onToggleSelection,
    onAssetClick,
    onDeleteAsset,
    renderTypeIcon,
    iconMap,
    icons,
    isDeleteConfirm,
    onDeleteConfirmChange,
    onEnterSelectMode,
    draggable,
    isDragging,
    onDragStart,
    onDragEnd,
    variant = 'default',
    viewMode = 'grid',
}) => {
    const { Card, Image, Badge, Button, Skeleton, Menu } = preset;
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card
            onClick={() => onToggleSelection(asset.id!)}
            selected={isSelected}
            style={{
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
                border: isSelected ? '2px solid #2563eb' : undefined,
                // Drag animation styles
                opacity: isDragging ? 0.4 : 1,
                transition: 'opacity 0.15s ease-out',
                cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
            }}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            {/* Selection Indicator - Top Left (Visible only in Select Mode) */}
            {isSelected && isSelectMode && (
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 11 }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#2563eb',
                        border: '2px solid #ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </div>
            )}

            {/* Top Right Actions (Hidden in Select Mode) */}
            {!isSelectMode && (
                <div
                    style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        zIndex: 10,
                        display: 'flex',
                        gap: '0.25rem',
                        opacity: isHovered || isSelected ? 1 : 0,
                        transition: 'opacity 0.2s',
                    }}
                >
                    {/* View/Zoom Button */}
                    <div
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAssetClick(asset);
                        }}
                        title="View"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                    </div>

                    {/* More/Dots Button (Context Menu) */}
                    {Menu && (
                        <Menu
                            target={
                                <div
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                                        cursor: 'pointer',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    title="More options"
                                >
                                    {icons?.dots ? renderIcon(icons.dots, 14) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="1"></circle>
                                            <circle cx="19" cy="12" r="1"></circle>
                                            <circle cx="5" cy="12" r="1"></circle>
                                        </svg>
                                    )}
                                </div>
                            }
                            items={[
                                {
                                    id: 'view',
                                    label: 'Quick View',
                                    icon: renderIcon(icons?.search || icons?.zoomIn, 14),
                                    onClick: () => onAssetClick(asset),
                                },
                                {
                                    id: 'download',
                                    label: 'Download',
                                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4a2 2 0 0 1 2-2z"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
                                    onClick: () => {
                                        if (asset.previewUrl) {
                                            const link = document.createElement('a');
                                            link.href = asset.previewUrl;
                                            link.download = asset.fileName;
                                            link.click();
                                        }
                                    },
                                },
                                {
                                    id: 'select',
                                    label: 'Select item',
                                    icon: renderIcon(icons?.check, 14),
                                    onClick: () => {
                                        if (!isSelectMode) onEnterSelectMode?.();
                                        onToggleSelection(asset.id!);
                                    },
                                },
                                {
                                    id: 'delete',
                                    label: 'Move to Trash',
                                    icon: renderIcon(icons?.trash, 14),
                                    color: 'red',
                                    divider: true,
                                    onClick: () => onDeleteConfirmChange(asset.id!),
                                },
                            ]}
                        />
                    )}
                </div>
            )}

            <div
                style={{
                    width: '100%',
                    height: variant === 'minimal' ? 'auto' : (viewMode === 'grid' ? '120px' : '160px'),
                    minHeight: variant === 'minimal' ? undefined : (viewMode === 'grid' ? '120px' : '160px'),
                    // Force square in grid mode, otherwise use original aspect ratio for masonry
                    aspectRatio: viewMode === 'grid' ? '1 / 1' : (variant === 'minimal' && asset.width && asset.height
                        ? `${asset.width} / ${asset.height}`
                        : undefined),
                    overflow: 'hidden',
                    borderBottom: variant === 'minimal' ? 'none' : '1px solid #e5e7eb',
                    position: 'relative',
                    // Always use a light background with subtle checkerboard to show transparency
                    backgroundColor: '#ffffff',
                    backgroundImage: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    flexShrink: 0 // Prevent height collapse
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {asset.previewUrl ? (
                    <>
                        {!isImageLoaded && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 5,
                                width: '100%',
                                height: '100%'
                            }}>
                                <Skeleton className="w-full h-full" />
                            </div>
                        )}
                        {asset.fileType === 'video' || (asset.fileType === 'other' && asset.fileName?.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/)) ? (
                            <video
                                src={asset.previewUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block' // Remove inline spacing
                                }}
                                onLoadedData={() => setIsImageLoaded(true)}
                                muted
                                loop
                                playsInline
                                onMouseEnter={(e) => e.currentTarget.play()}
                                onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                        ) : (
                            <Image
                                src={asset.previewUrl}
                                alt={asset.fileName}
                                onLoad={() => setIsImageLoaded(true)}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover', // Always cover to fill the square/masonry container
                                    padding: 0,
                                    opacity: isImageLoaded ? 1 : 0,
                                    transition: 'opacity 0.2s',
                                    display: 'block' // Remove inline spacing
                                }}
                            />
                        )}
                    </>
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        {renderTypeIcon(iconMap[asset.fileType], 48)}
                    </div>
                )}
            </div>

            {variant !== 'minimal' && (
                <div style={{ padding: '0.75rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {asset.fileName}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <Badge variant="default">{asset.fileType}</Badge>
                        <Badge variant="secondary">{formatFileSize(asset.size)}</Badge>
                        {asset.width && asset.height && (
                            <Badge variant="secondary">{asset.width} × {asset.height}</Badge>
                        )}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '0.75rem' }}>
                        {formatTimestamp(asset.createdAt)}
                    </div>

                    {!isSelectMode && (
                        <div onClick={(e) => e.stopPropagation()}>
                            {isDeleteConfirm ? (
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            fullWidth
                                            onClick={() => {
                                                onDeleteAsset(asset);
                                                onDeleteConfirmChange(null);
                                            }}
                                        >
                                            Confirm
                                        </Button>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            fullWidth
                                            onClick={() => onDeleteConfirmChange(null)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    fullWidth
                                    onClick={() => onDeleteConfirmChange(asset.id!)}
                                >
                                    Delete
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Minimal Variant - Delete Info */}
            {variant === 'minimal' && isDeleteConfirm && !isSelectMode && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                        zIndex: 20
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Button
                            variant="danger"
                            size="md"
                            style={{
                                width: '44px',
                                height: '44px',
                                minWidth: '44px',
                                borderRadius: '50%',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                flexShrink: 0
                            }}
                            onClick={() => {
                                onDeleteAsset(asset);
                                onDeleteConfirmChange(null);
                            }}
                            aria-label="Confirm Delete"
                        >
                            {renderIcon(icons?.trash || icons?.check, 20)}
                        </Button>
                        <Button
                            variant="secondary"
                            size="md"
                            style={{
                                width: '44px',
                                height: '44px',
                                minWidth: '44px',
                                borderRadius: '50%',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                flexShrink: 0
                            }}
                            onClick={() => onDeleteConfirmChange(null)}
                            aria-label="Cancel"
                        >
                            {renderIcon(icons?.x, 20)}
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

/**
 * MediaGrid - The complete, opinionated media library component
 * 
 * This component provides all features:
 * - File upload (button + drag & drop)
 * - Search by filename
 * - Filter by file type
 * - Date range filtering
 * - Select mode with bulk delete
 * - Individual delete
 * - Image viewer modal
 * - Responsive grid
 * - Loading & empty states
 * 
 * It's UI-agnostic - just pass a preset with your UI components!
 */
export const MediaGrid: React.FC<MediaGridProps> = ({
    preset,
    icons = {},
    onSelectionChange,
    onLibraryAssetSelect: onLibraryAssetSelectProp,
    onLibraryDragStart: onLibraryDragStartProp,
    draggable = false,
    onDragStart: onDragStartProp,
    onDragEnd: onDragEndProp,
    itemWrapper: ItemWrapper,
    defaultViewMode = 'grid',
    defaultItemVariant = 'default',
    masonryColumns = 4,
}) => {
    const {
        assets,
        loading,
        uploading,
        uploadFiles,
        deleteAsset,
        isDragging,
        draggedItemCount,
        pendingUploads,
        aiAvailable,
        aiGenerating,
        aiError,
        generateImages,
        pexelsAvailable,
        pexelsImages,
        pexelsLoading,
        pexelsSelected,
        pexelsImporting,
        fetchPexelsImages,
        togglePexelsSelect,
        selectAllPexels,
        deselectAllPexels,
        importPexelsImages,
        // Freepik
        freepikAvailable,
        freepikContent,
        freepikLoading,
        freepikSelected,
        freepikImporting,
        freepikSearchQuery,
        setFreepikSearchQuery,
        freepikOrder,
        setFreepikOrder,
        searchFreepikIcons,
        toggleFreepikSelect,
        selectAllFreepik,
        deselectAllFreepik,
        importFreepikContent,
        // Library
        libraryAvailable,
        libraryCategories,
        libraryAssets,
        libraryLoading,
        librarySelectedCategory,
        librarySelected,
        libraryImporting,
        fetchLibraryCategories,
        fetchLibraryAssets,
        libraryBack,
        toggleLibrarySelect,
        selectAllLibrary,
        deselectAllLibrary,
        importLibraryAssets,
    } = useMediaLibraryContext();

    // Track which item is being dragged for animation
    const [draggingId, setDraggingId] = useState<number | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Selection
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Delete confirmation (double-tap pattern)
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

    // Image viewer
    const [viewingAsset, setViewingAsset] = useState<MediaAsset | null>(null);

    // View Mode
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'masonry'>(defaultViewMode);

    const { Button, TextInput, Select, Checkbox, Badge, Loader, FileButton, Skeleton, Modal, Menu, AIGenerateSidebar, PexelsImagePicker, FreepikContentPicker, LibraryAssetPicker } = preset;

    // AI generation UI (optional)
    const [aiModalOpen, setAiModalOpen] = useState(false);

    // Pexels UI (optional)
    const [pexelsModalOpen, setPexelsModalOpen] = useState(false);

    // Freepik UI (optional)
    const [freepikModalOpen, setFreepikModalOpen] = useState(false);

    // Library UI (optional)
    const [libraryModalOpen, setLibraryModalOpen] = useState(false);
    const [libraryInlineOpen, setLibraryInlineOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiWidth, setAiWidth] = useState('768');
    const [aiHeight, setAiHeight] = useState('768');
    const [aiSteps, setAiSteps] = useState('25');
    const [aiModel, setAiModel] = useState('');

    // Filtered assets
    const filteredAssets = useMemo(() => {
        const fromTimestamp = dateFrom ? new Date(dateFrom).getTime() : null;
        const toTimestamp = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : null;
        const searchTerm = searchQuery.trim().toLowerCase();

        return assets.filter((asset) => {
            const matchesType = typeFilter === 'all' || asset.fileType === typeFilter;
            const matchesSearch = !searchTerm || asset.fileName.toLowerCase().includes(searchTerm);
            const createdAt = asset.createdAt ?? 0;
            const matchesFrom = fromTimestamp ? createdAt >= fromTimestamp : true;
            const matchesTo = toTimestamp ? createdAt <= toTimestamp : true;

            return matchesType && matchesSearch && matchesFrom && matchesTo;
        });
    }, [assets, searchQuery, typeFilter, dateFrom, dateTo]);

    const toggleSelection = (idArg: number | string) => {
        const id = Number(idArg);
        if (isNaN(id)) return;

        setSelectedIds((prev) => {
            const next = isSelectMode ? new Set(prev) : new Set<number>();

            if (isSelectMode) {
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
            } else {
                next.add(id);
            }

            if (onSelectionChange) {
                const selectedAssets = assets.filter((a) => a.id != null && next.has(Number(a.id)));
                onSelectionChange(selectedAssets, isSelectMode);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        const nextIds = new Set(filteredAssets.map((a) => a.id!));
        setSelectedIds(nextIds);
        if (onSelectionChange) {
            const selectedAssets = assets.filter((a) => a.id != null && nextIds.has(Number(a.id)));
            onSelectionChange(selectedAssets, isSelectMode);
        }
    };

    const handleDeselectAll = () => {
        const nextIds = new Set<number>();
        setSelectedIds(nextIds);
        if (onSelectionChange) {
            onSelectionChange([], isSelectMode);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        // First click shows confirmation, second click deletes
        if (!bulkDeleteConfirm) {
            setBulkDeleteConfirm(true);
            return;
        }

        const assetsToDelete = assets.filter((a) => selectedIds.has(a.id!));
        await Promise.all(assetsToDelete.map((a) => deleteAsset(a)));
        setSelectedIds(new Set());
        setIsSelectMode(false);
        setBulkDeleteConfirm(false);
    };

    const cancelBulkDelete = () => {
        setBulkDeleteConfirm(false);
    };

    const handleAssetClick = (asset: MediaAsset) => {
        if (asset.fileType === 'image' || asset.fileType === 'video') {
            setViewingAsset(asset);
        }
    };

    const iconMap = useMemo(() => typeIconMap(icons), [icons]);

    // Drag handlers
    const handleDragStart = (asset: MediaAsset, e: React.DragEvent) => {
        const numericId = asset.id != null ? Number(asset.id) : null;
        setDraggingId(numericId);

        // Set data transfer with multiple formats for flexibility
        e.dataTransfer.setData('application/json', JSON.stringify({
            id: asset.id,
            fileName: asset.fileName,
            fileType: asset.fileType,
            mimeType: asset.mimeType,
            previewUrl: asset.previewUrl,
            size: asset.size,
        }));
        if (asset.previewUrl) {
            e.dataTransfer.setData('text/uri-list', asset.previewUrl);
        }
        e.dataTransfer.setData('text/plain', asset.fileName);
        e.dataTransfer.effectAllowed = 'copyMove';

        onDragStartProp?.(asset, e);
    };

    const handleDragEnd = (asset: MediaAsset, e: React.DragEvent) => {
        setDraggingId(null);
        onDragEndProp?.(asset, e);
    };

    return (
        <div style={{ padding: '0.75rem', position: 'relative' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                    Media Library
                </h1>
                <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                    Upload and manage your images, videos, and other assets
                </p>
            </div>

            {/* Tab Switcher: Uploads / Library */}
            {libraryAvailable && (
                <div style={{ display: 'flex', marginBottom: '1rem', borderRadius: 8, overflow: 'hidden', border: '1px solid #dee2e6' }}>
                    <button
                        onClick={() => {
                            setLibraryInlineOpen(false);
                            deselectAllLibrary();
                        }}
                        style={{
                            flex: 1,
                            padding: '0.5rem 1rem',
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            background: !libraryInlineOpen ? '#7c3aed' : 'transparent',
                            color: !libraryInlineOpen ? '#fff' : '#6b7280',
                            transition: 'all 0.15s',
                        }}
                    >
                        Uploads
                    </button>
                    <button
                        onClick={() => {
                            if (!libraryInlineOpen) fetchLibraryCategories();
                            setLibraryInlineOpen(true);
                        }}
                        style={{
                            flex: 1,
                            padding: '0.5rem 1rem',
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            border: 'none',
                            borderLeft: '1px solid #dee2e6',
                            cursor: 'pointer',
                            background: libraryInlineOpen ? '#7c3aed' : 'transparent',
                            color: libraryInlineOpen ? '#fff' : '#6b7280',
                            transition: 'all 0.15s',
                        }}
                    >
                        Library
                    </button>
                </div>
            )}

            {/* Actions */}
            {!libraryInlineOpen && <div style={{
                marginBottom: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '0.6rem',
                alignItems: 'center'
            }}>
                {!loading && filteredAssets.length > 0 && (
                    <Button
                        variant={isSelectMode ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => {
                            setIsSelectMode(!isSelectMode);
                            setSelectedIds(new Set());
                            setBulkDeleteConfirm(false);
                        }}
                        leftIcon={renderIcon(isSelectMode ? icons?.x : icons?.check, 16)}
                    >
                        {isSelectMode ? 'Cancel' : 'Select'}
                    </Button>
                )}

                {aiAvailable && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setAiModalOpen(true)}
                        disabled={uploading || aiGenerating}
                        leftIcon={renderIcon(icons?.photo, 16)}
                    >
                        Generate
                    </Button>
                )}

                {pexelsAvailable && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setPexelsModalOpen(true);
                            fetchPexelsImages();
                        }}
                        disabled={uploading}
                        leftIcon={renderIcon(icons?.photo, 16)}
                    >
                        Pexels
                    </Button>
                )}

                {freepikAvailable && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setFreepikModalOpen(true);
                            searchFreepikIcons();
                        }}
                        disabled={uploading}
                        leftIcon={renderIcon(icons?.photo, 16)}
                    >
                        Freepik
                    </Button>
                )}

                {uploading && <Loader size="sm" />}
            </div>}

            {aiAvailable && AIGenerateSidebar ? (
                <AIGenerateSidebar
                    isOpen={aiModalOpen}
                    onClose={() => setAiModalOpen(false)}
                    prompt={aiPrompt}
                    onPromptChange={setAiPrompt}
                    width={aiWidth}
                    onWidthChange={setAiWidth}
                    height={aiHeight}
                    onHeightChange={setAiHeight}
                    steps={aiSteps}
                    onStepsChange={setAiSteps}
                    model={aiModel}
                    onModelChange={setAiModel}
                    onPresetChange={(val) => {
                        if (!val) return;
                        setAiWidth(val);
                        setAiHeight(val);
                    }}
                    error={aiError}
                    generating={aiGenerating}
                    onGenerate={async () => {
                        const width = Math.max(1, Number(aiWidth) || 768);
                        const height = Math.max(1, Number(aiHeight) || 768);
                        const steps = Number(aiSteps);
                        await generateImages({
                            prompt: aiPrompt.trim(),
                            width,
                            height,
                            steps: Number.isFinite(steps) ? steps : undefined,
                            model: aiModel.trim() || undefined,
                        });
                        setAiModalOpen(false);
                    }}
                    onCancel={() => setAiModalOpen(false)}
                />
            ) : aiAvailable ? (
                <Modal
                    isOpen={aiModalOpen}
                    onClose={() => setAiModalOpen(false)}
                    title="Generate image"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                Prompt
                            </div>
                            <TextInput
                                value={aiPrompt}
                                onChange={setAiPrompt}
                                placeholder="Describe the image you want..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Width
                                </div>
                                <TextInput
                                    value={aiWidth}
                                    onChange={setAiWidth}
                                    type="number"
                                    placeholder="768"
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Height
                                </div>
                                <TextInput
                                    value={aiHeight}
                                    onChange={setAiHeight}
                                    type="number"
                                    placeholder="768"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Preset
                                </div>
                                <Select
                                    value=""
                                    onChange={(val) => {
                                        if (!val) return;
                                        setAiWidth(val);
                                        setAiHeight(val);
                                    }}
                                    placeholder="Pick a size"
                                    options={[
                                        { value: '512', label: '512 × 512' },
                                        { value: '768', label: '768 × 768' },
                                        { value: '1024', label: '1024 × 1024' },
                                    ]}
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Steps (optional)
                                </div>
                                <TextInput
                                    value={aiSteps}
                                    onChange={setAiSteps}
                                    type="number"
                                    placeholder="25"
                                />
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                Model (optional)
                            </div>
                            <TextInput
                                value={aiModel}
                                onChange={setAiModel}
                                placeholder="e.g. stability-ai/sdxl:… (provider-specific)"
                            />
                        </div>

                        {aiError && (
                            <div style={{ color: '#b91c1c', fontSize: '0.875rem' }}>
                                {aiError}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <Button variant="secondary" onClick={() => setAiModalOpen(false)} disabled={aiGenerating}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                loading={aiGenerating}
                                disabled={!aiPrompt.trim()}
                                onClick={async () => {
                                    const width = Math.max(1, Number(aiWidth) || 768);
                                    const height = Math.max(1, Number(aiHeight) || 768);
                                    const steps = Number(aiSteps);
                                    await generateImages({
                                        prompt: aiPrompt.trim(),
                                        width,
                                        height,
                                        steps: Number.isFinite(steps) ? steps : undefined,
                                        model: aiModel.trim() || undefined,
                                    });
                                    setAiModalOpen(false);
                                }}
                            >
                                Generate
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}

            {pexelsAvailable && PexelsImagePicker && (
                <PexelsImagePicker
                    isOpen={pexelsModalOpen}
                    onClose={() => {
                        setPexelsModalOpen(false);
                        deselectAllPexels();
                    }}
                    images={pexelsImages}
                    loading={pexelsLoading}
                    selected={pexelsSelected}
                    onToggleSelect={togglePexelsSelect}
                    onSelectAll={selectAllPexels}
                    onDeselectAll={deselectAllPexels}
                    importing={pexelsImporting}
                    onImport={async () => {
                        await importPexelsImages();
                        setPexelsModalOpen(false);
                    }}
                />
            )}

            {freepikAvailable && FreepikContentPicker && (
                <FreepikContentPicker
                    isOpen={freepikModalOpen}
                    onClose={() => {
                        setFreepikModalOpen(false);
                        deselectAllFreepik();
                    }}
                    content={freepikContent}
                    loading={freepikLoading}
                    searchQuery={freepikSearchQuery}
                    onSearchQueryChange={setFreepikSearchQuery}
                    onSearch={searchFreepikIcons}
                    selected={freepikSelected}
                    onToggleSelect={toggleFreepikSelect}
                    onSelectAll={selectAllFreepik}
                    onDeselectAll={deselectAllFreepik}
                    importing={freepikImporting}
                    onImport={async () => {
                        await importFreepikContent();
                        setFreepikModalOpen(false);
                    }}
                    order={freepikOrder}
                    onOrderChange={setFreepikOrder}
                />
            )}

            {LibraryAssetPicker && libraryModalOpen && (
                <LibraryAssetPicker
                    isOpen={libraryModalOpen}
                    onClose={() => {
                        setLibraryModalOpen(false);
                        deselectAllLibrary();
                    }}
                    categories={libraryCategories}
                    assets={libraryAssets}
                    loading={libraryLoading}
                    selectedCategory={librarySelectedCategory}
                    onCategorySelect={(categoryId) => {
                        fetchLibraryAssets(categoryId);
                    }}
                    onBack={libraryBack}
                    selected={librarySelected}
                    onToggleSelect={toggleLibrarySelect}
                    onSelectAll={selectAllLibrary}
                    onDeselectAll={deselectAllLibrary}
                    importing={libraryImporting}
                    onImport={async () => {
                        await importLibraryAssets();
                        setLibraryModalOpen(false);
                    }}
                />
            )}

            {/* ===== Uploads Tab Content ===== */}
            {!libraryInlineOpen && <div style={{ position: 'relative' }}>
                {isDragging && (
                    <div style={{
                        position: 'absolute',
                        inset: '-0.5rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        border: '2px dashed #3b82f6',
                        borderRadius: '16px',
                        zIndex: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.3s ease',
                        pointerEvents: 'none'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#3b82f6',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        }}>
                            {renderIcon(icons?.upload, 32)}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1.125rem', marginBottom: '4px' }}>
                                Drop to Upload
                            </div>
                            <div style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: 500 }}>
                                Release to add assets to your library
                            </div>
                        </div>
                    </div>
                )}

                {/* Selection Bar */}
                {isSelectMode && filteredAssets.length > 0 && (
                    <div style={{
                        marginBottom: '1rem',
                        padding: '0.875rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        background: '#f9fafb',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span style={{
                                fontSize: '0.813rem',
                                fontWeight: '600',
                                color: '#1f2937',
                                whiteSpace: 'nowrap'
                            }}>
                                {selectedIds.size > 0
                                    ? `${selectedIds.size} selected`
                                    : 'Select items'}
                            </span>
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                flex: '1 1 auto',
                                justifyContent: 'flex-end',
                                minWidth: 'fit-content'
                            }}>
                                {selectedIds.size > 0 ? (
                                    <>
                                        {selectedIds.size < filteredAssets.length && (
                                            <Button variant="secondary" size="sm" onClick={handleSelectAll} style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}>
                                                All
                                            </Button>
                                        )}
                                        {selectedIds.size === filteredAssets.length && !bulkDeleteConfirm && (
                                            <Button variant="secondary" size="sm" onClick={handleDeselectAll} style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}>
                                                None
                                            </Button>
                                        )}
                                        {bulkDeleteConfirm ? (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <Button variant="danger" size="sm" onClick={handleBulkDelete} style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}>
                                                    Confirm
                                                </Button>
                                                <Button variant="secondary" size="sm" onClick={cancelBulkDelete} style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}>
                                                    No
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                leftIcon={renderIcon(icons?.trash, 14)}
                                                onClick={handleBulkDelete}
                                                style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <Button variant="secondary" size="sm" onClick={handleSelectAll} style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}>
                                        Select All
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Search and Type Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <TextInput
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search files..."
                                leftIcon={renderIcon(icons?.search, 18, { stroke: 1.5, style: { opacity: 0.6 } })}
                                className="media-filter-search"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Select
                                value={typeFilter}
                                onChange={setTypeFilter}
                                placeholder="All Types"
                                options={[
                                    { value: 'all', label: 'All Types' },
                                    { value: 'image', label: 'Images' },
                                    { value: 'video', label: 'Videos' },
                                    { value: 'audio', label: 'Audio' },
                                    { value: 'document', label: 'Documents' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Date Range Row */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#667eea' }}></div>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
                            <TextInput
                                value={dateFrom}
                                onChange={setDateFrom}
                                type="date"
                                placeholder="From"
                                className="media-filter-date"
                                style={{ fontSize: '12px' }}
                            />
                            <TextInput
                                value={dateTo}
                                onChange={setDateTo}
                                type="date"
                                placeholder="To"
                                className="media-filter-date"
                                style={{ fontSize: '12px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* View Toggles & Upload */}
                <div style={{
                    marginBottom: '1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <FileButton onSelect={uploadFiles} multiple disabled={uploading}>
                        <Button
                            variant="primary"
                            size="sm"
                            leftIcon={renderIcon(icons?.upload, 16)}
                            style={{
                                paddingLeft: '0.75rem',
                                paddingRight: '1rem',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                                flexShrink: 0
                            }}
                        >
                            Upload
                        </Button>
                    </FileButton>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>

                        <Button
                            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid view"
                            style={{ padding: '0 0.5rem', minWidth: '36px' }}
                        >
                            {renderIcon(icons?.layoutGrid, 18, undefined, 'Grid')}
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            aria-label="List view"
                            style={{ padding: '0 0.5rem', minWidth: '36px' }}
                        >
                            {renderIcon(icons?.list, 18, undefined, 'List')}
                        </Button>
                        <Button
                            variant={viewMode === 'masonry' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setViewMode('masonry')}
                            aria-label="Masonry view"
                            style={{ padding: '0 0.5rem', minWidth: '36px' }}
                        >
                            {renderIcon(icons?.columns, 18, undefined, 'Masonry')}
                        </Button>
                    </div>
                </div>

                {/* Media Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {/* Show skeleton cards to reserve layout space and prevent CLS */}
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={`loading-skeleton-${i}`} style={{
                                aspectRatio: '4/5',
                                borderRadius: '0.5rem',
                                overflow: 'hidden'
                            }}>
                                <Skeleton className="w-full h-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {viewMode === 'masonry' ? (
                            <div style={{ columnCount: masonryColumns, columnGap: '8px' }}>

                                {filteredAssets.map((asset) => {
                                    const numericId = Number(asset.id);
                                    const isSelected = !isNaN(numericId) && selectedIds.has(numericId);
                                    const isItemDragging = !isNaN(numericId) && draggingId === numericId;

                                    const gridItem = (
                                        <GridAssetItem
                                            key={asset.id}
                                            asset={asset}
                                            preset={preset}
                                            isSelected={isSelected}
                                            isSelectMode={isSelectMode}
                                            onToggleSelection={toggleSelection}
                                            onAssetClick={handleAssetClick}
                                            onDeleteAsset={deleteAsset}
                                            renderTypeIcon={renderTypeIcon}
                                            iconMap={iconMap}
                                            icons={icons}
                                            isDeleteConfirm={deleteConfirmId === asset.id}
                                            onDeleteConfirmChange={setDeleteConfirmId}
                                            draggable={draggable && !ItemWrapper}
                                            isDragging={isItemDragging}
                                            onDragStart={(e) => handleDragStart(asset, e)}
                                            onDragEnd={(e) => handleDragEnd(asset, e)}
                                            variant={defaultItemVariant === 'minimal' ? 'minimal' : (asset.fileType === 'image' ? 'minimal' : 'default')}
                                            viewMode="masonry"
                                        />
                                    );

                                    const masonryItem = (
                                        <div key={asset.id} style={{ breakInside: 'avoid', marginBottom: '8px' }}>
                                            {gridItem}
                                        </div>
                                    );

                                    // If itemWrapper provided, wrap the item
                                    if (ItemWrapper) {
                                        return (
                                            <ItemWrapper key={asset.id} asset={asset}>
                                                {masonryItem}
                                            </ItemWrapper>
                                        );
                                    }

                                    return masonryItem;
                                })}
                            </div>
                        ) : viewMode === 'list' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {/* List Header - Condensed for sidebar */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '0.5rem 0.75rem',
                                    borderBottom: '1px solid #e5e7eb',
                                    color: '#6b7280',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    <span>Asset Details</span>
                                    <span>Actions</span>
                                </div>

                                {filteredAssets.map((asset) => {
                                    const numericId = Number(asset.id);
                                    const isSelected = !isNaN(numericId) && selectedIds.has(numericId);
                                    const isItemDragging = !isNaN(numericId) && draggingId === numericId;

                                    return (
                                        <div
                                            key={asset.id}
                                            onClick={() => handleAssetClick(asset)}
                                            draggable={draggable && !ItemWrapper}
                                            onDragStart={(e) => handleDragStart(asset, e)}
                                            onDragEnd={(e) => handleDragEnd(asset, e)}
                                            style={{
                                                display: 'flex',
                                                gap: '12px',
                                                padding: '12px',
                                                background: isSelected ? '#eff6ff' : 'white',
                                                border: isSelected ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                cursor: draggable ? (isItemDragging ? 'grabbing' : 'grab') : 'pointer',
                                                opacity: isItemDragging ? 0.4 : 1,
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                boxShadow: isSelected ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                            }}
                                        >
                                            {/* Left: Thumbnail */}
                                            <div style={{
                                                width: '64px',
                                                height: '64px',
                                                flexShrink: 0,
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                background: '#f8fafc',
                                                border: '1px solid #f1f5f9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative'
                                            }}>
                                                {asset.fileType === 'image' && asset.previewUrl ? (
                                                    <img
                                                        src={asset.previewUrl}
                                                        alt={asset.fileName}
                                                        loading="lazy"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    renderTypeIcon(iconMap[asset.fileType], 32)
                                                )}

                                                {isSelectMode && (
                                                    <div
                                                        style={{ position: 'absolute', top: '4px', left: '4px' }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onChange={() => toggleSelection(asset.id!)}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Info Stack */}
                                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    fontSize: '13px',
                                                    color: '#1e293b',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {asset.fileName}
                                                </div>

                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                                    <Badge
                                                        variant="secondary"
                                                        style={{
                                                            fontSize: '9px',
                                                            padding: '0px 4px',
                                                            height: '16px',
                                                            textTransform: 'uppercase',
                                                            backgroundColor: asset.fileType === 'image' ? '#f0f9ff' : '#f1f5f9',
                                                            color: asset.fileType === 'image' ? '#0369a1' : '#475569',
                                                            border: 'none'
                                                        }}
                                                    >
                                                        {asset.fileType}
                                                    </Badge>

                                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        {asset.width && asset.height ? `${asset.width}×${asset.height}` : formatFileSize(asset.size)}
                                                    </span>

                                                    <span style={{ fontSize: '11px', color: '#cbd5e1' }}>•</span>

                                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        {formatTimestamp(asset.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions Menu */}
                                            <div
                                                style={{ alignSelf: 'center', flexShrink: 0 }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {Menu && (
                                                    <Menu
                                                        target={
                                                            <div style={{ padding: '4px', borderRadius: '6px', cursor: 'pointer' }}>
                                                                {renderIcon(icons?.dots, 16, { color: '#64748b' })}
                                                            </div>
                                                        }
                                                        items={[
                                                            {
                                                                id: 'view',
                                                                label: 'View Full',
                                                                icon: renderIcon(icons?.search || icons?.zoomIn, 14),
                                                                onClick: () => handleAssetClick(asset),
                                                            },
                                                            {
                                                                id: 'copy',
                                                                label: 'Copy URL',
                                                                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
                                                                onClick: () => {
                                                                    if (asset.previewUrl) {
                                                                        navigator.clipboard.writeText(asset.previewUrl);
                                                                    }
                                                                },
                                                            },
                                                            {
                                                                id: 'download',
                                                                label: 'Download',
                                                                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4a2 2 0 0 1 2-2z"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
                                                                onClick: () => {
                                                                    if (asset.previewUrl) {
                                                                        const link = document.createElement('a');
                                                                        link.href = asset.previewUrl;
                                                                        link.download = asset.fileName;
                                                                        link.click();
                                                                    }
                                                                },
                                                            },
                                                            {
                                                                id: 'delete',
                                                                label: 'Move to Trash',
                                                                icon: renderIcon(icons?.trash, 14),
                                                                color: 'red',
                                                                divider: true,
                                                                onClick: () => setDeleteConfirmId(asset.id!),
                                                            },
                                                        ]}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                                {/* Grid View (Default) */}

                                {isDragging && Array.from({ length: Math.max(1, draggedItemCount) }).map((_, i) => (
                                    <div key={`drag-skeleton-${i}`} style={{ height: '120px' }}>
                                        <Skeleton className="w-full h-full" />
                                    </div>
                                ))}

                                {Array.from({ length: pendingUploads }).map((_, i) => (
                                    <div key={`skeleton-${i}`} style={{ height: '120px' }}>
                                        <Skeleton className="w-full h-full" />
                                    </div>
                                ))}

                                {filteredAssets.map((asset) => {
                                    const numericId = Number(asset.id);
                                    const gridItem = (
                                        <GridAssetItem
                                            key={asset.id}
                                            asset={asset}
                                            preset={preset}
                                            isSelected={!isNaN(numericId) && selectedIds.has(numericId)}
                                            isSelectMode={isSelectMode}
                                            onToggleSelection={toggleSelection}
                                            onAssetClick={handleAssetClick}
                                            onDeleteAsset={deleteAsset}
                                            renderTypeIcon={renderTypeIcon}
                                            iconMap={iconMap}
                                            icons={icons}
                                            isDeleteConfirm={deleteConfirmId === asset.id}
                                            onDeleteConfirmChange={setDeleteConfirmId}
                                            draggable={draggable && !ItemWrapper}
                                            isDragging={!isNaN(numericId) && draggingId === numericId}
                                            onDragStart={(e) => handleDragStart(asset, e)}
                                            onDragEnd={(e) => handleDragEnd(asset, e)}
                                            variant={defaultItemVariant}
                                            viewMode="grid"
                                        />
                                    );

                                    // If itemWrapper provided, wrap the item (for dnd-kit, react-dnd, etc.)
                                    if (ItemWrapper) {
                                        return (
                                            <ItemWrapper key={asset.id} asset={asset}>
                                                {gridItem}
                                            </ItemWrapper>
                                        );
                                    }

                                    return gridItem;
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* Media Viewer */}
                <MediaViewer
                    isOpen={viewingAsset !== null}
                    onClose={() => setViewingAsset(null)}
                    initialAssetId={viewingAsset?.id ?? null}
                    assets={filteredAssets}
                    preset={preset}
                    onDelete={deleteAsset}
                    onSave={uploadFiles}
                    icons={icons}
                />
            </div>}
            {/* ===== End Uploads Tab Content ===== */}

            {/* ===== Library Tab Content ===== */}
            {
                libraryAvailable && libraryInlineOpen && (
                    <div>
                        {librarySelectedCategory && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                                    {libraryCategories.find((c) => c.id === librarySelectedCategory)?.name || 'Assets'}
                                </h2>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={libraryBack}
                                    leftIcon={'←'}
                                >
                                    All Categories
                                </Button>
                            </div>
                        )}

                        {libraryLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <Loader size="sm" />
                            </div>
                        ) : !librarySelectedCategory ? (
                            /* Category pills */
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {libraryCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => fetchLibraryAssets(cat.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #dee2e6',
                                            background: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '0.813rem',
                                            fontWeight: 500,
                                            color: '#374151',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {cat.thumbnailUrl && (
                                            <img
                                                src={cat.thumbnailUrl}
                                                alt=""
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: 4,
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        )}
                                        <span>{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            /* Asset grid */
                            <>
                                {libraryAssets.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                        No assets in this category
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                            gap: '0.5rem',
                                        }}
                                    >
                                        {libraryAssets.map((asset) => (
                                            <div
                                                key={asset.id}
                                                draggable={draggable}
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('application/json', JSON.stringify({
                                                        libraryAssetId: asset.id,
                                                        name: asset.name,
                                                        category: asset.category,
                                                        thumbnailUrl: asset.thumbnailUrl,
                                                        fullUrl: asset.fullUrl,
                                                    }));
                                                    if (asset.fullUrl) {
                                                        e.dataTransfer.setData('text/uri-list', asset.fullUrl);
                                                    }
                                                    e.dataTransfer.setData('text/plain', asset.name);
                                                    e.dataTransfer.effectAllowed = 'copy';
                                                    onLibraryDragStartProp?.(asset, e);
                                                }}
                                                onClick={() => {
                                                    if (onLibraryAssetSelectProp) {
                                                        onLibraryAssetSelectProp(asset);
                                                    }
                                                }}
                                                style={{
                                                    position: 'relative',
                                                    aspectRatio: '1',
                                                    borderRadius: 8,
                                                    overflow: 'hidden',
                                                    cursor: draggable ? 'grab' : 'pointer',
                                                    border: '1px solid #dee2e6',
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                <img
                                                    src={asset.thumbnailUrl}
                                                    alt={asset.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        padding: '4px 6px',
                                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '0.688rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                        {asset.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Tip */}
                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                                    Click an image to add it to your library and apply it
                                </div>
                            </>
                        )}
                    </div>
                )
            }
        </div >
    );
};

export type { MediaGridProps };
