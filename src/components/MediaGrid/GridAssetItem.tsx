'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAssetPreview } from '../../hooks/useAssetPreview';
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
    const { Card, Image, Button, Skeleton, Menu } = preset;
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const resolvedUrl = useAssetPreview(asset, isVisible);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '200px' });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [asset.id]);

    return (
        <div ref={containerRef} style={{ height: '100%' }}>
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
                    height: '100%',
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
                            {renderIcon(icons?.zoomIn, 14, { color: '#374151' }, 'View')}
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
                                            if (resolvedUrl) {
                                                const link = document.createElement('a');
                                                link.href = resolvedUrl;
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
                        minHeight: viewMode === 'masonry' ? 80 : (variant === 'minimal' ? undefined : (viewMode === 'grid' ? '120px' : '160px')),
                        // Force square in grid mode, otherwise use original aspect ratio for masonry (capped at 3:4 portrait)
                        aspectRatio: viewMode === 'grid' ? '1 / 1' : (variant === 'minimal' && asset.width && asset.height
                            ? `${asset.width} / ${Math.min(asset.height, asset.width * (4 / 3))}`
                            : '4 / 5'), // Default to 4:5 if no metadata yet
                        overflow: 'hidden',
                        borderBottom: variant === 'minimal' ? 'none' : '1px solid #e5e7eb',
                        position: 'relative',
                        // Always use a light background with subtle checkerboard to show transparency
                        backgroundColor: '#ffffff',
                        backgroundImage: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)',
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        flexShrink: 0, // Prevent height collapse
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {resolvedUrl ? (
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
                            {/* Local-only indicator (Cloud quota exceeded) */}
                            {asset.syncStatus === 'local-only' && (
                                <div
                                    title="Local Only - Cloud Storage Full"
                                    style={{
                                        position: 'absolute',
                                        top: '0.375rem',
                                        left: isSelected && isSelectMode ? '2.25rem' : '0.375rem',
                                        zIndex: 12,
                                        background: 'rgba(245, 158, 11, 0.95)',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '9px',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        transition: 'left 0.2s ease-out'
                                    }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    LOCAL ONLY
                                </div>
                            )}
                            {asset.fileType === 'video' || (asset.fileType === 'other' && asset.fileName?.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/)) ? (
                                <video
                                    src={resolvedUrl}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block' // Remove inline spacing
                                    }}
                                    className="media-item-content"
                                    onLoadedMetadata={() => setIsImageLoaded(true)}
                                    muted
                                    playsInline
                                    loop
                                    onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                                    onMouseOut={(e) => {
                                        const v = e.target as HTMLVideoElement;
                                        v.pause();
                                        v.currentTime = 0;
                                    }}
                                />
                            ) : (
                                <Image
                                    className="w-full h-full media-item-content"
                                    src={resolvedUrl || ''}
                                    alt={asset.fileName}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block', // Remove inline spacing
                                        transition: 'transform 0.3s ease',
                                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                    onLoad={() => setIsImageLoaded(true)}
                                />
                            )}
                        </>
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f9fafb',
                            color: '#e5e7eb',
                        }}>
                            {/* Icon fallback while not visible or no preview */}
                            {renderTypeIcon(iconMap[asset.fileType], 32)}
                        </div>
                    )}
                </div>

                {variant !== 'minimal' && (
                    <div style={{ padding: '0.75rem', minWidth: 0 }}>
                        <div style={{
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            color: '#111827',
                            marginBottom: '0.25rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {asset.fileName}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
                                <div style={{ color: '#6b7280', flexShrink: 0 }}>
                                    {renderTypeIcon(iconMap[asset.fileType], 12)}
                                </div>
                                <div style={{
                                    fontSize: '0.688rem',
                                    color: '#6b7280',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {formatFileSize(asset.size)}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.688rem', color: '#9ca3af', flexShrink: 0 }}>
                                {formatTimestamp(asset.createdAt || 0)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Info and overlays for deletion */}
                {!isSelectMode && isDeleteConfirm && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(255,255,255,0.95)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            zIndex: 20
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.75rem', textAlign: 'center' }}>
                            Delete this file?
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                            <Button
                                variant="danger"
                                size="sm"
                                style={{ flex: 1 }}
                                onClick={() => {
                                    onDeleteAsset(asset);
                                    onDeleteConfirmChange(null);
                                }}
                            >
                                Delete
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                style={{ flex: 1 }}
                                onClick={() => onDeleteConfirmChange(null)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
