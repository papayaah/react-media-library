import React, { useState, useMemo } from 'react';
import { useMediaLibraryContext } from './MediaLibraryProvider';
import { MediaAsset, ComponentPreset } from '../types';
import { MediaViewer } from './MediaViewer';
import { Check } from 'lucide-react';

export interface RecentMediaGridProps {
    preset: ComponentPreset;
    icons?: {
        photo?: React.ReactNode;
        video?: React.ReactNode;
        audio?: React.ReactNode;
        document?: React.ReactNode;
        file?: React.ReactNode;
    };
    maxItems?: number;
    onSelectionChange?: (selectedAssets: MediaAsset[]) => void;
    multiSelect?: boolean;
    columns?: number;
    gap?: string;
    showLayoutToggle?: boolean;
}

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
}) => {
    const { assets, deleteAsset, uploadFiles } = useMediaLibraryContext();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [viewerAssetId, setViewerAssetId] = useState<number | null>(null);
    const [layout, setLayout] = useState<'grid' | 'masonry'>('grid');

    const { Card, Image, EmptyState } = preset;

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
        const iconMap: Record<string, React.ReactNode> = {
            image: icons.photo,
            video: icons.video,
            audio: icons.audio,
            document: icons.document,
        };
        return iconMap[type] || icons.file;
    };

    if (recentAssets.length === 0) {
        return (
            <EmptyState
                icon={icons.photo}
                message="No media files yet. Upload some to get started!"
            />
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {showLayoutToggle && (
                <div className="flex justify-end">
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                        <button
                            onClick={() => setLayout('grid')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${layout === 'grid'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setLayout('masonry')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${layout === 'masonry'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            Masonry
                        </button>
                    </div>
                </div>
            )}

            <div
                className="recent-media-grid"
                style={layout === 'grid' ? {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap,
                } : {
                    columnCount: columns,
                    columnGap: 0, // Masonry has no gap as requested
                }}
            >
                {recentAssets.map((asset) => {
                    const isSelected = asset.id ? selectedIds.has(asset.id) : false;

                    return (
                        <div
                            key={asset.id}
                            style={layout === 'masonry' ? {
                                breakInside: 'avoid',
                                marginBottom: 0,
                                padding: 0
                            } : {}}
                        >
                            <Card
                                onClick={() => { }} // We handle clicks on the image/overlay
                                selected={isSelected}
                                className={`relative group cursor-pointer !p-0 overflow-hidden ${layout === 'masonry' ? '!border-0 !rounded-none' : ''}`}
                            >
                                {/* Preview Image */}
                                <div
                                    className={`relative bg-gray-100 dark:bg-gray-800 overflow-hidden ${layout === 'grid' ? 'aspect-square' : ''}`}
                                    onClick={() => handleAssetClick(asset)}
                                >
                                    {asset.fileType === 'image' && asset.previewUrl ? (
                                        <Image
                                            src={asset.previewUrl}
                                            alt={asset.fileName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-full flex items-center justify-center text-gray-400 ${layout === 'grid' ? 'h-full' : 'h-32'}`}>
                                            {getTypeIcon(asset.fileType)}
                                        </div>
                                    )}

                                    {/* Selection Button */}
                                    <div
                                        className={`absolute top-2 right-2 z-10 transition-opacity cursor-pointer ${isSelected
                                                ? 'opacity-100'
                                                : 'opacity-0 group-hover:opacity-100'
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelection(asset);
                                        }}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-sm transition-colors ${isSelected
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'bg-black/20 border-white hover:bg-black/40'
                                            }`}>
                                            {isSelected && <Check size={14} className="text-white" />}
                                        </div>
                                    </div>

                                    {/* Selected State Overlay (Visual only, pointer-events-none) */}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-blue-500/20 pointer-events-none" />
                                    )}
                                </div>
                            </Card>
                        </div>
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
            />
        </div>
    );
};
