'use client';

import React from 'react';
import { MediaAsset, ComponentPreset, MediaGridIcons } from '../../types';
import { GridAssetItem } from './GridAssetItem';
import { renderTypeIcon } from './utils';

interface MediaGridContentProps {
    preset: ComponentPreset;
    icons: MediaGridIcons;
    loading: boolean;
    filteredAssets: MediaAsset[];
    viewMode: 'grid' | 'list' | 'masonry';
    masonryColumns: number;
    selectedIds: Set<number>;
    isSelectMode: boolean;
    toggleSelection: (id: number) => void;
    handleAssetClick: (asset: MediaAsset) => void;
    deleteAsset: (asset: MediaAsset) => Promise<void>;
    deleteConfirmId: number | null;
    setDeleteConfirmId: (id: number | null) => void;
    draggable: boolean;
    draggingId: number | null;
    handleDragStart: (asset: MediaAsset, e: React.DragEvent) => void;
    handleDragEnd: (asset: MediaAsset, e: React.DragEvent) => void;
    itemWrapper?: React.ComponentType<{ asset: MediaAsset; children: React.ReactNode }>;
    itemVariant: 'default' | 'minimal';
    iconMap: any;
}

export const MediaGridContent: React.FC<MediaGridContentProps> = ({
    preset,
    icons,
    loading,
    filteredAssets,
    viewMode,
    masonryColumns,
    selectedIds,
    isSelectMode,
    toggleSelection,
    handleAssetClick,
    deleteAsset,
    deleteConfirmId,
    setDeleteConfirmId,
    draggable,
    draggingId,
    handleDragStart,
    handleDragEnd,
    itemWrapper: ItemWrapper,
    itemVariant,
    iconMap,
}) => {
    const { Skeleton } = preset;

    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
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
        );
    }

    if (filteredAssets.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                backgroundColor: '#f9fafb',
                borderRadius: '1rem',
                border: '2px dashed #e5e7eb'
            }}>
                <div style={{ color: '#9ca3af', marginBottom: '1rem' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>No assets found</h3>
                <p style={{ color: '#6b7280' }}>Try adjusting your filters or upload some new files.</p>
            </div>
        );
    }

    if (viewMode === 'masonry') {
        return (
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
                            variant={itemVariant === 'minimal' ? 'minimal' : (asset.fileType === 'image' ? 'minimal' : 'default')}
                            viewMode="masonry"
                        />
                    );

                    const masonryItem = (
                        <div key={asset.id} style={{ breakInside: 'avoid', marginBottom: '8px' }}>
                            {gridItem}
                        </div>
                    );

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
        );
    }

    if (viewMode === 'list') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                                transition: 'all 0.2s',
                                opacity: isItemDragging ? 0.5 : 1,
                                position: 'relative',
                            }}
                        >
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f3f4f6' }}>
                                {asset.previewUrl ? (
                                    <img src={asset.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                        {renderTypeIcon(iconMap[asset.fileType], 24)}
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.fileName}</div>
                                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                    {asset.fileType.toUpperCase()} • {asset.width}x{asset.height}
                                </div>
                            </div>
                            {isSelectMode && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelection(asset.id!);
                                        }}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            border: isSelected ? 'none' : '1.5px solid #d1d5db',
                                            background: isSelected ? '#3b82f6' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isSelected && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Default Grid view
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
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
                        variant={itemVariant}
                        viewMode="grid"
                    />
                );

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
    );
};
