'use client';

import React from 'react';
import { ComponentPreset, LibraryAsset } from '../../types';

interface MediaGridLibraryTabProps {
    preset: ComponentPreset;
    libraryAvailable: boolean;
    libraryInlineOpen: boolean;
    librarySelectedCategory: string | null;
    libraryCategories: any[];
    libraryBack: () => void;
    libraryLoading: boolean;
    fetchLibraryAssets: (categoryId: string) => Promise<void>;
    libraryAssets: any[];
    draggable: boolean;
    onLibraryDragStart: (asset: LibraryAsset, event: React.DragEvent) => void;
    onLibraryAssetSelect: (asset: LibraryAsset) => void;
}

export const MediaGridLibraryTab: React.FC<MediaGridLibraryTabProps> = ({
    preset,
    libraryAvailable,
    libraryInlineOpen,
    librarySelectedCategory,
    libraryCategories,
    libraryBack,
    libraryLoading,
    fetchLibraryAssets,
    libraryAssets,
    draggable,
    onLibraryDragStart,
    onLibraryAssetSelect,
}) => {
    const { Button, Loader } = preset;

    if (!libraryAvailable || !libraryInlineOpen) return null;

    return (
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
                                        onLibraryDragStart?.(asset, e);
                                    }}
                                    onClick={() => {
                                        onLibraryAssetSelect?.(asset);
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
    );
};
