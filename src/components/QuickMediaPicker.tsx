'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MediaLibraryProvider } from './MediaLibraryProvider';
import { RecentMediaGrid } from './RecentMediaGrid';
import { renderIcon } from '../utils/renderIcon';
import type { QuickMediaPickerProps, PexelsImage } from '../types';

export function QuickMediaPicker({
    onSelectMedia,
    onSelectPexels,
    onClose,
    preset,
    icons,
    pexels,
    width = 280,
    scrollHeight = 200,
    maxItems = 12,
    columns = 3,
    gap = '6px',
    className,
    style,
}: QuickMediaPickerProps) {
    const [activeTab, setActiveTab] = useState<'library' | 'pexels'>('library');
    const [pexelsImages, setPexelsImages] = useState<PexelsImage[]>([]);
    const [pexelsLoading, setPexelsLoading] = useState(false);

    const hasPexels = pexels !== undefined;

    const loadPexels = useCallback(async () => {
        if (!pexels) return;
        if (Array.isArray(pexels)) {
            setPexelsImages(pexels);
            return;
        }
        setPexelsLoading(true);
        try {
            const images = await pexels();
            setPexelsImages(images);
        } catch (error) {
            console.error('Error loading pexels:', error);
        } finally {
            setPexelsLoading(false);
        }
    }, [pexels]);

    // Sync when array prop changes
    useEffect(() => {
        if (Array.isArray(pexels)) {
            setPexelsImages(pexels);
        }
    }, [pexels]);

    // Lazy-load pexels when tab activates
    useEffect(() => {
        if (activeTab !== 'pexels') return;
        if (pexelsImages.length > 0) return;
        if (Array.isArray(pexels)) return;
        void loadPexels();
    }, [activeTab, loadPexels, pexelsImages.length, pexels]);

    const handlePexelsClick = (url: string) => {
        onSelectPexels?.(url);
        onClose();
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        flex: 1,
        padding: '8px 12px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? '#7c3aed' : '#868e96',
        borderBottom: active ? '2px solid #7c3aed' : '2px solid transparent',
        transition: 'all 0.15s',
    });

    return (
        <div
            className={className}
            style={{
                width,
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                ...style,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {hasPexels && (
                <div style={{ display: 'flex', borderBottom: '1px solid #e9ecef' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('library')}
                        style={tabStyle(activeTab === 'library')}
                    >
                        {renderIcon(icons?.photo, 14)}
                        Library
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('pexels')}
                        style={tabStyle(activeTab === 'pexels')}
                    >
                        {renderIcon(icons?.cloud, 14)}
                        Pexels
                    </button>
                </div>
            )}

            <div style={{ height: scrollHeight, overflowY: 'auto' }}>
                {activeTab === 'library' && (
                    <div style={{ padding: 6 }}>
                        <MediaLibraryProvider enableDragDrop={false}>
                            <RecentMediaGrid
                                preset={preset}
                                icons={icons}
                                maxItems={maxItems}
                                columns={columns}
                                gap={gap}
                                showLayoutToggle={false}
                                multiSelect={false}
                                onSelectionChange={(selected) => {
                                    const id = selected[0]?.id;
                                    if (typeof id === 'number') {
                                        onSelectMedia(id);
                                        onClose();
                                    }
                                }}
                            />
                        </MediaLibraryProvider>
                    </div>
                )}

                {activeTab === 'pexels' && hasPexels && (
                    <div style={{ padding: 6 }}>
                        {pexelsLoading ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 24,
                            }}>
                                <preset.Loader size="sm" />
                            </div>
                        ) : pexelsImages.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 16,
                                color: '#868e96',
                                fontSize: 12,
                            }}>
                                No pexels images
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                                gap,
                            }}>
                                {pexelsImages.map((img) => (
                                    <div
                                        key={img.url}
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: '1px solid #e9ecef',
                                            transition: 'all 0.15s',
                                        }}
                                        onClick={() => handlePexelsClick(img.url)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#667eea';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e9ecef';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
