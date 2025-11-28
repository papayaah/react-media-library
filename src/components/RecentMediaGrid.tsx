import React, { useState, useMemo } from 'react';
import { useMediaLibraryContext } from './MediaLibraryProvider';
import { MediaAsset, ComponentPreset, MediaGridIcons } from '../types';
import { MediaViewer } from './MediaViewer';
import { renderIcon } from '../utils/renderIcon';

export interface RecentMediaGridProps {
    preset: ComponentPreset;
    icons?: MediaGridIcons;
    maxItems?: number;
    onSelectionChange?: (selectedAssets: MediaAsset[]) => void;
    multiSelect?: boolean;
    columns?: number;
    gap?: string;
    showLayoutToggle?: boolean;
    selectedAssetIds?: number[]; // IDs of assets that are already selected/added (controlled from parent)
}

interface AssetItemProps {
    asset: MediaAsset;
    layout: 'grid' | 'masonry';
    preset: ComponentPreset;
    isSelected: boolean;
    onToggleSelection: (asset: MediaAsset) => void;
    onAssetClick: (asset: MediaAsset) => void;
    getTypeIcon: (type: string) => React.ReactNode;
    icons?: MediaGridIcons;
}

const AssetItem: React.FC<AssetItemProps> = ({
    asset,
    layout,
    preset,
    isSelected,
    onToggleSelection,
    onAssetClick,
    getTypeIcon,
    icons
}) => {
    const { Card, Image, Skeleton } = preset;
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            style={layout === 'masonry' ? {
                breakInside: 'avoid',
                marginBottom: 0,
                padding: 0
            } : {}}
        >
            <Card
                onClick={() => onToggleSelection(asset)}
                selected={isSelected}
                style={{
                    position: 'relative',
                    cursor: 'pointer',
                    padding: 0,
                    overflow: 'hidden',
                    border: layout === 'masonry' ? 'none' : undefined,
                    borderRadius: layout === 'masonry' ? 0 : undefined,
                    // Add border highlight for selected items
                    ...(isSelected && layout !== 'masonry' ? {
                        border: '2px solid #2563eb',
                        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)'
                    } : {})
                }}
            >
                <div
                    style={{
                        position: 'relative',
                        background: layout === 'masonry' ? 'transparent' : '#f3f4f6',
                        overflow: 'hidden',
                        ...(layout === 'grid' ? { aspectRatio: '1 / 1' } : {})
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => {
                        // Prevent triggering the card's selection toggle when clicking the image area if needed,
                        // but usually clicking the image IS clicking the card.
                        // If we want clicking the image to select, we don't need to stop propagation here unless
                        // the image click was previously doing something else.
                        // Previously it was onAssetClick(asset). Now we want it to bubble to Card's onClick (selection).
                    }}
                >
                    {asset.fileType === 'image' && asset.previewUrl ? (
                        <div style={{ width: '100%', height: '100%', border: layout === 'masonry' ? 'none' : '1px solid #e5e7eb', borderRadius: layout === 'masonry' ? 0 : undefined, overflow: 'hidden', position: 'relative' }}>
                            {!isImageLoaded && (
                                <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
                                    <Skeleton className="w-full h-full" />
                                </div>
                            )}
                            <Image
                                src={asset.previewUrl}
                                alt={asset.fileName}
                                onLoad={() => setIsImageLoaded(true)}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isImageLoaded ? 1 : 0, transition: 'opacity 0.2s' }}
                            />
                        </div>
                    ) : (
                        <div style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#9ca3af',
                            ...(layout === 'grid' ? { height: '100%' } : { height: '128px' })
                        }}>
                            {getTypeIcon(asset.fileType)}
                        </div>
                    )}

                    {/* View/Zoom Button - Top Right */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            zIndex: 10,
                            transition: 'opacity 0.2s',
                            cursor: 'pointer',
                            opacity: isHovered ? 1 : 0,
                        }}
                        className="group-hover:opacity-100" // We might need a way to handle hover if we can't use classes.
                    // Since we are using inline styles and React, we can use onMouseEnter/Leave on the parent container
                    // or just rely on the existing hover handlers if they work.
                    // The previous code had onMouseEnter on the button itself.
                    // We need the button to appear when hovering the CARD/Image.
                    // The parent div (line 68) wraps everything. We can add state for hover or use CSS if possible.
                    // But let's stick to the previous pattern: The previous button was "Always visible if selected".
                    // Now this is a "View" button. It should probably be visible on hover.
                    // Let's use a simple approach: The parent div needs to handle hover state?
                    // Or we can just make it always visible? No, that clutters.
                    // Let's try to use the `opacity` logic but based on a local hover state of the Item?
                    // `AssetItem` doesn't track hover.
                    // But we can add `opacity: 0` and `hover: { opacity: 1 }` if we were using CSS-in-JS or classes.
                    // Since we are using inline styles, we might need `onMouseEnter` on the parent.
                    >
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.9)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAssetClick(asset);
                            }}
                            title="View Image"
                        >
                            {renderIcon(icons?.zoomIn || icons?.search, 16, { style: { color: '#374151' } })}
                        </div>
                    </div>

                    {/* Selection Indicator - Top Left */}
                    {isSelected && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '0.5rem',
                                left: '0.5rem',
                                zIndex: 10,
                            }}
                        >
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
                                {renderIcon(icons?.check, 14, { style: { color: '#ffffff' } })}
                            </div>
                        </div>
                    )}

                    {/* Selected State Overlay - More visible for selected items */}
                    {isSelected && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(37, 99, 235, 0.25)',
                            border: '2px solid #2563eb',
                            borderRadius: layout === 'masonry' ? '0.5rem' : undefined,
                            pointerEvents: 'none',
                            zIndex: 1
                        }} />
                    )}
                </div>
            </Card>
        </div>
    );
};

/**
 * RecentMediaGrid - A lightweight media grid component for selecting recent media
 * 
 * Features:
 * - Displays recent media items
 * - Single or multi-select mode
 * - Integrated media viewer (readonly)
 * - Callback for selection changes
 * - Customizable via presets
 * - Toggleable Grid/Masonry layout
 * 
 * Perfect for mounting in other apps where users need to select media!
 */
export const RecentMediaGrid: React.FC<RecentMediaGridProps> = ({
    preset,
    icons = {},
    maxItems = 12,
    onSelectionChange,
    multiSelect = true,
    columns = 4,
    gap = '1rem',
    showLayoutToggle = true,
    selectedAssetIds = [],
}) => {
    const { assets, deleteAsset, uploadFiles, isDragging, draggedItemCount, pendingUploads, loading } = useMediaLibraryContext();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [viewerAssetId, setViewerAssetId] = useState<number | null>(null);
    const [layout, setLayout] = useState<'grid' | 'masonry'>('grid');

    const { EmptyState, Skeleton } = preset;

    // Note: We don't sync selectedIds with selectedAssetIds in a useEffect
    // Instead, we check both in the isSelected calculation below
    // This ensures items in selectedAssetIds (already added to post) always show as selected
    // while still allowing local selection state for user interactions

    // Get recent assets (sorted by createdAt, descending)
    const recentAssets = useMemo(() => {
        return [...assets]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, maxItems);
    }, [assets, maxItems]);

    // Handle selection toggle
    const toggleSelection = (asset: MediaAsset) => {
        if (!asset.id) return;

        setSelectedIds((prev) => {
            const newSet = new Set(prev);

            if (multiSelect) {
                // Multi-select mode: toggle the item
                if (newSet.has(asset.id!)) {
                    newSet.delete(asset.id!);
                } else {
                    newSet.add(asset.id!);
                }
            } else {
                // Single-select mode: replace selection
                if (newSet.has(asset.id!)) {
                    newSet.clear();
                } else {
                    newSet.clear();
                    newSet.add(asset.id!);
                }
            }

            // Notify parent of selection change
            if (onSelectionChange) {
                const selectedAssets = assets.filter((a) => a.id && newSet.has(a.id));
                onSelectionChange(selectedAssets);
            }

            return newSet;
        });
    };

    // Handle asset click - open viewer
    const handleAssetClick = (asset: MediaAsset) => {
        if (asset.id) {
            setViewerAssetId(asset.id);
        }
    };

    // Get type icon
    const getTypeIcon = (type: string) => {
        const iconMap: Record<string, MediaGridIcons[keyof MediaGridIcons] | undefined> = {
            image: icons?.photo,
            video: icons?.video,
            audio: icons?.audio,
            document: icons?.document,
        };
        return renderIcon(iconMap[type] || icons?.file, 48);
    };

    if (loading) {
        return (
            <div
                style={layout === 'grid' ? {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap,
                } : {
                    columnCount: columns,
                    columnGap: 0,
                }}
            >
                {Array.from({ length: maxItems }).map((_, i) => (
                    <div
                        key={`loading-skeleton-${i}`}
                        style={layout === 'masonry' ? {
                            breakInside: 'avoid',
                            marginBottom: '1rem',
                            padding: 0,
                            height: '200px',
                            width: '100%'
                        } : {
                            aspectRatio: '1/1',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <Skeleton className="w-full h-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (recentAssets.length === 0 && !isDragging && pendingUploads === 0) {
        return (
            <EmptyState
                icon={renderIcon(icons?.photo, 48)}
                message="No media files yet. Upload some to get started!"
            />
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {showLayoutToggle && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '0.5rem', padding: '0.25rem', gap: '0.25rem' }}>
                        <button
                            onClick={() => setLayout('grid')}
                            aria-label="Grid view"
                            style={{
                                padding: '0.375rem',
                                borderRadius: '0.375rem',
                                transition: 'all 0.2s',
                                ...(layout === 'grid' ? {
                                    background: '#ffffff',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                    color: '#2563eb'
                                } : {
                                    color: '#6b7280',
                                    background: 'transparent'
                                })
                            }}
                            title="Grid View"
                        >
                            {renderIcon(icons?.layoutGrid, 16, undefined, 'Grid')}
                        </button>
                        <button
                            onClick={() => setLayout('masonry')}
                            aria-label="Masonry view"
                            style={{
                                padding: '0.375rem',
                                borderRadius: '0.375rem',
                                transition: 'all 0.2s',
                                ...(layout === 'masonry' ? {
                                    background: '#ffffff',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                    color: '#2563eb'
                                } : {
                                    color: '#6b7280',
                                    background: 'transparent'
                                })
                            }}
                            title="Masonry View"
                        >
                            {renderIcon(icons?.columns, 16, undefined, 'Masonry')}
                        </button>
                    </div>
                </div>
            )}

            <div
                style={layout === 'grid' ? {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap,
                } : {
                    columnCount: columns,
                    columnGap: 0, // Masonry has no gap as requested
                }}
            >
                {isDragging && Array.from({ length: Math.max(1, draggedItemCount) }).map((_, i) => (
                    <div
                        key={`drag-skeleton-${i}`}
                        style={layout === 'masonry' ? {
                            breakInside: 'avoid',
                            marginBottom: 0,
                            padding: 0,
                            height: '200px', // Fixed height for masonry skeleton to avoid collapse
                            width: '100%'
                        } : {
                            aspectRatio: '1/1',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <Skeleton className="w-full h-full" />
                    </div>
                ))}

                {Array.from({ length: pendingUploads }).map((_, i) => (
                    <div
                        key={`upload-skeleton-${i}`}
                        style={layout === 'masonry' ? {
                            breakInside: 'avoid',
                            marginBottom: 0,
                            padding: 0,
                            height: '200px', // Fixed height for masonry skeleton
                            width: '100%'
                        } : {
                            aspectRatio: '1/1',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <Skeleton className="w-full h-full" />
                    </div>
                ))}

                {recentAssets.map((asset) => {
                    // Item is selected if it's in selectedIds (current selection) OR in selectedAssetIds (already added)
                    const isSelected = asset.id ? (selectedIds.has(asset.id) || selectedAssetIds.includes(asset.id)) : false;
                    return (
                        <AssetItem
                            key={asset.id}
                            asset={asset}
                            layout={layout}
                            preset={preset}
                            isSelected={isSelected}
                            onToggleSelection={toggleSelection}
                            onAssetClick={handleAssetClick}
                            getTypeIcon={getTypeIcon}
                            icons={icons}
                        />
                    );
                })}
            </div>

            {/* Media Viewer - Readonly */}
            <MediaViewer
                isOpen={viewerAssetId !== null}
                onClose={() => setViewerAssetId(null)}
                initialAssetId={viewerAssetId}
                assets={recentAssets}
                preset={preset}
                onDelete={deleteAsset}
                onSave={uploadFiles}
                readonly={true}
                icons={icons}
            />
        </div>
    );
};
