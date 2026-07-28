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

    const fileExt = (asset.fileName?.split('.').pop() || '').toLowerCase();
    const isVideo = asset.fileType === 'video' || (asset.mimeType?.startsWith('video/')) || Boolean(asset.fileName?.toLowerCase().match(/\.(mp4|webm|mov|ogg|mkv|avi)$/));
    const isImage = asset.fileType === 'image' || (asset.mimeType?.startsWith('image/')) || Boolean(asset.fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg|avif|heic|heif)$/));
    const isVisualMedia = (isImage || isVideo) && Boolean(resolvedUrl);

    const isCsvOrSpreadsheet = ['csv', 'tsv', 'xls', 'xlsx'].includes(fileExt);
    const isCodeOrData = ['json', 'xml', 'tlg', 'log'].includes(fileExt);
    const isDocument = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(fileExt);

    return (
        <div ref={containerRef} style={{ height: '100%' }}>
            <Card
                onClick={() => onToggleSelection(asset.id!)}
                selected={isSelected}
                style={{
                    padding: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    border: isSelected ? '2px solid var(--rml-accent)' : undefined,
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
                            background: 'var(--rml-accent)',
                            border: '2px solid var(--rml-surface)',
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
                                background: 'color-mix(in srgb, var(--rml-surface) 90%, transparent)',
                                display: 'flex',
                                itemsAlign: 'center',
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
                            {renderIcon(icons?.zoomIn, 14, { color: 'var(--rml-foreground)' }, 'View')}
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
                                            background: 'color-mix(in srgb, var(--rml-surface) 90%, transparent)',
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
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rml-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                        color: 'var(--rml-danger)',
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
                        aspectRatio: viewMode === 'grid' ? '1 / 1' : (variant === 'minimal' && asset.width && asset.height
                            ? `${asset.width} / ${Math.min(asset.height, asset.width * (4 / 3))}`
                            : '4 / 5'),
                        overflow: 'hidden',
                        borderBottom: variant === 'minimal' ? 'none' : '1px solid var(--rml-border)',
                        position: 'relative',
                        backgroundColor: 'var(--rml-surface)',
                        backgroundImage: isVisualMedia
                            ? 'linear-gradient(45deg, var(--rml-surface-muted) 25%, transparent 25%), linear-gradient(-45deg, var(--rml-surface-muted) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--rml-surface-muted) 75%), linear-gradient(-45deg, transparent 75%, var(--rml-surface-muted) 75%)'
                            : undefined,
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        flexShrink: 0,
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {isVisualMedia ? (
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
                            {/* Local-only indicator */}
                            {asset.syncStatus === 'local-only' && (
                                <div
                                    title="Local Only - Cloud Storage Full"
                                    style={{
                                        position: 'absolute',
                                        top: '0.375rem',
                                        left: isSelected && isSelectMode ? '2.25rem' : '0.375rem',
                                        zIndex: 12,
                                        background: 'rgba(245, 158, 11, 0.95)',
                                        color: 'var(--rml-surface)',
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
                            {isVideo ? (
                                <video
                                    src={resolvedUrl}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block'
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
                                        display: 'block',
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
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'var(--rml-surface-muted)',
                            color: 'var(--rml-muted)',
                            gap: '0.5rem',
                            position: 'relative',
                            padding: '0.75rem',
                        }}>
                            {/* Distinct visual SVG icon based on file type */}
                            {isCsvOrSpreadsheet ? (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--rml-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                                    <rect x="3" y="3" width="18" height="18" rx="2.5"/>
                                    <line x1="3" y1="9" x2="21" y2="9"/>
                                    <line x1="3" y1="15" x2="21" y2="15"/>
                                    <line x1="9" y1="3" x2="9" y2="21"/>
                                    <line x1="15" y1="3" x2="15" y2="21"/>
                                </svg>
                            ) : isCodeOrData ? (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--rml-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                                    <polyline points="16 18 22 12 16 6"/>
                                    <polyline points="8 6 2 12 8 18"/>
                                </svg>
                            ) : isDocument ? (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--rml-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                </svg>
                            ) : (
                                renderTypeIcon(iconMap[asset.fileType], 28) || (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                )
                            )}

                            {/* Format Extension Pill */}
                            <span style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                background: 'color-mix(in srgb, var(--rml-surface) 85%, transparent)',
                                border: '1px solid var(--rml-border)',
                                color: 'var(--rml-foreground)',
                                padding: '2px 7px',
                                borderRadius: '4px',
                            }}>
                                {fileExt || asset.fileType || 'DATA'}
                            </span>
                        </div>
                    )}
                </div>

                {variant !== 'minimal' && (
                    <div style={{ padding: '0.75rem', minWidth: 0 }}>
                        <div style={{
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            color: 'var(--rml-foreground)',
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
                                <div style={{ color: 'var(--rml-muted)', flexShrink: 0 }}>
                                    {renderTypeIcon(iconMap[asset.fileType], 12)}
                                </div>
                                <div style={{
                                    fontSize: '0.688rem',
                                    color: 'var(--rml-muted)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {formatFileSize(asset.size)}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.688rem', color: 'var(--rml-muted)', flexShrink: 0 }}>
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
                            background: 'color-mix(in srgb, var(--rml-surface) 95%, transparent)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            zIndex: 20
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--rml-danger)', marginBottom: '0.75rem', textAlign: 'center' }}>
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
