'use client';

import React, { useState } from 'react';
import { MediaAsset, ComponentPreset, MediaGridIcons } from '../../types';
import { renderIcon } from '../../utils/renderIcon';
import { formatFileSize, formatTimestamp } from './utils';

export interface GridAssetItemProps {
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

export const GridAssetItem: React.FC<GridAssetItemProps> = ({
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
                        background: 'rgba(255,255,255,0.4)',
                        backdropFilter: 'blur(2px)',
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
