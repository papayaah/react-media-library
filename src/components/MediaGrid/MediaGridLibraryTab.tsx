'use client';

import { ComponentPreset, LibraryAsset, MediaGridIcons } from '../../types';
import { renderIcon } from '../../utils/renderIcon';

interface MediaGridLibraryTabProps {
    preset: ComponentPreset;
    icons: MediaGridIcons;
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
    icons,
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

    const getCategoryFallbackIcon = (name: string): React.ReactNode => {
        // Simple internal SVGs for common categories as fallbacks
        const style = { width: 24, height: 24 };
        if (name.includes('back') || name.includes('scen')) {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            );
        }
        if (name.includes('peop') || name.includes('life')) {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );
        }
        if (name.includes('tech') || name.includes('dev')) {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
                    <rect width="20" height="16" x="2" y="4" rx="2" ry="2" /><path d="M6 8h.01" /><path d="M10 8h.01" /><path d="M14 8h.01" /><path d="M18 8h.01" /><path d="M8 12h.01" /><path d="M12 12h.01" /><path d="M16 12h.01" /><path d="M7 16h10" />
                </svg>
            );
        }
        if (name.includes('food') || name.includes('drink')) {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
                    <path d="M6 2v20" /><path d="M18 2v20" /><path d="M6 12h12" /><path d="M6 7h12" /><path d="M6 17h12" />
                </svg>
            );
        }
        if (name.includes('health') || name.includes('fit')) {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
            );
        }
        if (name.includes('trave') || name.includes('place')) {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
            );
        }
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
            </svg>
        );
    };

    const getCategoryIcon = (catName: string): React.ReactNode => {
        const name = catName.toLowerCase();
        let icon: any = null;

        if (name.includes('back') || name.includes('scen')) icon = icons?.photo;
        else if (name.includes('peop') || name.includes('life')) icon = icons?.photo; // photo as fallback for people
        else if (name.includes('tech') || name.includes('dev')) icon = icons?.columns;
        else if (name.includes('food') || name.includes('drink')) icon = icons?.palette;
        else if (name.includes('health') || name.includes('fit')) icon = icons?.rotateCw;
        else if (name.includes('trave') || name.includes('place')) icon = icons?.layoutGrid;

        if (icon) return renderIcon(icon, 24);
        return getCategoryFallbackIcon(name);
    };

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
                            <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: 4,
                                background: '#f8fafc',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6366f1',
                                flexShrink: 0
                            }}>
                                {getCategoryIcon(cat.name)}
                            </div>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
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
