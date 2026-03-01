'use client';

import React, { useState, useMemo } from 'react';
import { useMediaLibraryContext } from '../MediaLibraryProvider';
import { MediaAsset, ComponentPreset, MediaGridIcons, DragDropProps, LibraryAsset } from '../../types';
import { renderIcon } from '../../utils/renderIcon';
import { MediaGridHeader } from './MediaGridHeader';
import { MediaGridToolbar } from './MediaGridToolbar';
import { MediaGridContent } from './MediaGridContent';
import { MediaGridModals } from './MediaGridModals';
import { MediaGridLibraryTab } from './MediaGridLibraryTab';
import { typeIconMap } from './utils';

export interface MediaGridProps extends DragDropProps {
    preset: ComponentPreset;
    icons?: MediaGridIcons;
    onSelectionChange?: (selectedAssets: MediaAsset[], isSelectMode: boolean) => void;
    onLibraryAssetSelect?: (asset: LibraryAsset) => void;
    onLibraryDragStart?: (asset: LibraryAsset, event: React.DragEvent) => void;
    defaultViewMode?: 'grid' | 'list' | 'masonry';
    defaultItemVariant?: 'default' | 'minimal';
    masonryColumns?: number;
}

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
    const context = useMediaLibraryContext();
    const {
        assets, loading, uploading, uploadFiles, deleteAsset, isDragging: isGlobalDragging,
        aiAvailable, aiGenerating, aiError, generateImages,
        pexelsAvailable, pexelsImages, pexelsLoading, pexelsSelected, pexelsImporting,
        togglePexelsSelect, selectAllPexels, deselectAllPexels, importPexelsImages,
        freepikAvailable, freepikContent, freepikLoading, freepikSelected, freepikImporting,
        freepikSearchQuery, setFreepikSearchQuery, freepikOrder, setFreepikOrder,
        searchFreepikIcons, toggleFreepikSelect, selectAllFreepik, deselectAllFreepik, importFreepikContent,
        libraryAvailable, libraryCategories, libraryAssets, libraryLoading,
        librarySelectedCategory, librarySelected, libraryImporting,
        fetchLibraryCategories, fetchLibraryAssets, libraryBack,
        toggleLibrarySelect, selectAllLibrary, deselectAllLibrary, importLibraryAssets,
        searchQuery, setSearchQuery, typeFilter, setTypeFilter,
        orientationFilter, setOrientationFilter,
        dateFrom, setDateFrom, dateTo, setDateTo,
    } = context;
    const { Button } = preset;

    // Local State
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [viewingAsset, setViewingAsset] = useState<MediaAsset | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'masonry'>(defaultViewMode);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [pexelsModalOpen, setPexelsModalOpen] = useState(false);
    const [freepikModalOpen, setFreepikModalOpen] = useState(false);
    const [libraryModalOpen, setLibraryModalOpen] = useState(false);
    const [libraryInlineOpen, setLibraryInlineOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiWidth, setAiWidth] = useState('768');
    const [aiHeight, setAiHeight] = useState('768');
    const [aiSteps, setAiSteps] = useState('25');
    const [aiModel, setAiModel] = useState('');

    const iconMap = useMemo(() => typeIconMap(icons), [icons]);

    // Computed
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

            let matchesOrientation = true;
            if (orientationFilter !== 'all' && (asset.fileType === 'image' || asset.fileType === 'video')) {
                const width = asset.width || 0;
                const height = asset.height || 0;
                if (width > 0 && height > 0) {
                    if (orientationFilter === 'horizontal') matchesOrientation = width > height;
                    else if (orientationFilter === 'vertical') matchesOrientation = height > width;
                    else if (orientationFilter === 'square') matchesOrientation = Math.abs(width - height) < (Math.max(width, height) * 0.05); // 5% tolerance
                }
            }

            return matchesType && matchesSearch && matchesFrom && matchesTo && matchesOrientation;
        });
    }, [assets, searchQuery, typeFilter, dateFrom, dateTo, orientationFilter]);

    // Handlers
    const toggleSelection = (idArg: number | string) => {
        const id = Number(idArg);
        if (isNaN(id)) return;
        setSelectedIds((prev) => {
            const next = isSelectMode ? new Set(prev) : new Set<number>();
            if (isSelectMode) {
                if (next.has(id)) next.delete(id);
                else next.add(id);
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
        if (onSelectionChange) onSelectionChange([], isSelectMode);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
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

    const handleDragStart = (asset: MediaAsset, e: React.DragEvent) => {
        setDraggingId(asset.id != null ? Number(asset.id) : null);
        e.dataTransfer.setData('application/json', JSON.stringify({
            id: asset.id, fileName: asset.fileName, fileType: asset.fileType,
            mimeType: asset.mimeType, previewUrl: asset.previewUrl, size: asset.size,
        }));
        if (asset.previewUrl) e.dataTransfer.setData('text/uri-list', asset.previewUrl);
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
            <MediaGridHeader />

            {libraryAvailable && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flex: 1, borderRadius: 8, overflow: 'hidden', border: '1px solid #dee2e6' }}>
                        <button onClick={() => { setLibraryInlineOpen(false); deselectAllLibrary(); }} style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.813rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: !libraryInlineOpen ? '#7c3aed' : 'transparent', color: !libraryInlineOpen ? '#fff' : '#6b7280', transition: 'all 0.15s' }}>Uploads</button>
                        <button onClick={() => { if (!libraryInlineOpen) fetchLibraryCategories(); setLibraryInlineOpen(true); }} style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.813rem', fontWeight: 600, border: 'none', borderLeft: '1px solid #dee2e6', cursor: 'pointer', background: libraryInlineOpen ? '#7c3aed' : 'transparent', color: libraryInlineOpen ? '#fff' : '#6b7280', transition: 'all 0.15s' }}>Library</button>
                    </div>
                    {aiAvailable && (
                        <button
                            onClick={() => setAiModalOpen(true)}
                            disabled={uploading || aiGenerating}
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6',
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#7c3aed',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                flexShrink: 0
                            }}
                            title="Generate with AI"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
                        </button>
                    )}
                </div>
            )}

            {!libraryInlineOpen && (
                <>
                    <MediaGridToolbar
                        preset={preset} icons={icons} loading={loading} uploading={uploading}
                        isSelectMode={isSelectMode} setIsSelectMode={setIsSelectMode}
                        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                        dateFrom={dateFrom} setDateFrom={setDateFrom}
                        dateTo={dateTo} setDateTo={setDateTo}
                        orientationFilter={orientationFilter} setOrientationFilter={setOrientationFilter}
                        viewMode={viewMode} setViewMode={setViewMode}
                        filteredAssets={filteredAssets}
                        uploadFiles={uploadFiles}
                    />

                    {/* Compact Selection Bar positioned "immediately above the images" */}
                    {isSelectMode && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.625rem 0.875rem',
                            backgroundColor: '#fff',
                            borderBottom: '1px solid #e2e8f0',
                            marginBottom: '0.75rem',
                            borderRadius: '10px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            position: 'sticky',
                            top: 0,
                            zIndex: 50,
                            gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedIds.size > 0 ? '#3b82f6' : '#e2e8f0' }}></div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                                    {selectedIds.size} selected
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {selectedIds.size > 0 ? (
                                    <>
                                        {bulkDeleteConfirm ? (
                                            <div style={{ display: 'flex', gap: '4px', background: '#fef2f2', padding: '2px', borderRadius: '6px' }}>
                                                <Button variant="danger" size="sm" onClick={handleBulkDelete} style={{ height: '28px', fontSize: '11px' }}>Confirm Delete</Button>
                                                <Button variant="secondary" size="sm" onClick={() => setBulkDeleteConfirm(false)} style={{ height: '28px', fontSize: '11px' }}>Cancel</Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                leftIcon={renderIcon(icons?.trash, 14)}
                                                onClick={() => setBulkDeleteConfirm(true)}
                                                style={{ height: '28px', fontSize: '11px' }}
                                            >
                                                Delete Selected
                                            </Button>
                                        )}
                                        <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 4px' }}></div>
                                    </>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={handleSelectAll} style={{ height: '28px', fontSize: '11px' }}>Select All</Button>
                                )}
                                {selectedIds.size > 0 && (
                                    <Button variant="secondary" size="sm" onClick={handleDeselectAll} style={{ height: '28px', fontSize: '11px', color: '#64748b', background: 'transparent', border: 'none' }}>Clear Selection</Button>
                                )}
                            </div>
                        </div>
                    )}
                    <div style={{ position: 'relative' }}>
                        {isGlobalDragging && (
                            <div style={{ position: 'absolute', inset: '-0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '2px dashed #3b82f6', borderRadius: '16px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', backdropFilter: 'blur(4px)', pointerEvents: 'none' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>{renderIcon(icons?.upload, 32)}</div>
                                <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1.125rem' }}>Drop to Upload</div></div>
                            </div>
                        )}
                        <MediaGridContent
                            preset={preset} icons={icons} loading={loading} filteredAssets={filteredAssets} viewMode={viewMode} masonryColumns={masonryColumns}
                            selectedIds={selectedIds} isSelectMode={isSelectMode} toggleSelection={toggleSelection} handleAssetClick={(a: MediaAsset) => (a.fileType === 'image' || a.fileType === 'video') && setViewingAsset(a)}
                            deleteAsset={deleteAsset} deleteConfirmId={deleteConfirmId} setDeleteConfirmId={setDeleteConfirmId} draggable={draggable}
                            draggingId={draggingId} handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} itemWrapper={ItemWrapper} itemVariant={defaultItemVariant} iconMap={iconMap}
                        />
                    </div>

                    {/* Storage Usage at the bottom */}
                    <div style={{
                        marginTop: '2.5rem',
                        padding: '1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '0.75rem',
                        border: '1px solid #f1f5f9'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: context.storageUsage.isCloudFull ? '#f59e0b' : (context.storageUsage.percent > 90 ? '#ef4444' : '#7c3aed') }}></div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                                    {context.storageUsage.isCloudFull ? 'Cloud Full (Local Mode)' : 'Storage Usage'}
                                </span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: context.storageUsage.isCloudFull ? '#f59e0b' : (context.storageUsage.percent > 90 ? '#ef4444' : '#7c3aed') }}>{context.storageUsage.percent}%</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{
                                height: '100%',
                                width: `${context.storageUsage.percent}%`,
                                background: context.storageUsage.isCloudFull
                                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                    : (context.storageUsage.percent > 90
                                        ? 'linear-gradient(90deg, #ef4444, #f87171)'
                                        : 'linear-gradient(90deg, #7c3aed, #a78bfa)'),
                                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                borderRadius: '4px'
                            }} />
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
                                {(() => {
                                    const bytes = context.storageUsage.used;
                                    if (bytes === 0) return '0 B';
                                    const k = 1024;
                                    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
                                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                                    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
                                })()} used
                            </span>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                {(() => {
                                    const bytes = context.storageUsage.limit;
                                    const k = 1024;
                                    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
                                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                                    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
                                })()} {Boolean(context.syncAvailable) ? 'plan limit' : 'limit'}
                            </span>
                        </div>
                    </div>
                </>
            )}

            <MediaGridLibraryTab
                preset={preset} icons={icons} libraryAvailable={libraryAvailable} libraryInlineOpen={libraryInlineOpen} librarySelectedCategory={librarySelectedCategory}
                libraryCategories={libraryCategories} libraryBack={libraryBack} libraryLoading={libraryLoading} fetchLibraryAssets={fetchLibraryAssets}
                libraryAssets={libraryAssets} draggable={draggable} onLibraryDragStart={onLibraryDragStartProp!} onLibraryAssetSelect={onLibraryAssetSelectProp!}
            />

            <MediaGridModals
                preset={preset} icons={icons} aiAvailable={aiAvailable} aiModalOpen={aiModalOpen} setAiModalOpen={setAiModalOpen}
                aiPrompt={aiPrompt} setAiPrompt={setAiPrompt} aiWidth={aiWidth} setAiWidth={setAiWidth} aiHeight={aiHeight} setAiHeight={setAiHeight}
                aiSteps={aiSteps} setAiSteps={setAiSteps} aiModel={aiModel} setAiModel={setAiModel} aiError={aiError} aiGenerating={aiGenerating} generateImages={generateImages}
                pexelsAvailable={pexelsAvailable} pexelsModalOpen={pexelsModalOpen} setPexelsModalOpen={setPexelsModalOpen} pexelsImages={pexelsImages} pexelsLoading={pexelsLoading}
                pexelsSelected={pexelsSelected} togglePexelsSelect={togglePexelsSelect} selectAllPexels={selectAllPexels} deselectAllPexels={deselectAllPexels} pexelsImporting={pexelsImporting} importPexelsImages={importPexelsImages}
                freepikAvailable={freepikAvailable} freepikModalOpen={freepikModalOpen} setFreepikModalOpen={setFreepikModalOpen} freepikContent={freepikContent} freepikLoading={freepikLoading}
                freepikSearchQuery={freepikSearchQuery} setFreepikSearchQuery={setFreepikSearchQuery} searchFreepikIcons={searchFreepikIcons} freepikSelected={freepikSelected} toggleFreepikSelect={toggleFreepikSelect}
                selectAllFreepik={selectAllFreepik} deselectAllFreepik={deselectAllFreepik} freepikImporting={freepikImporting} importFreepikContent={importFreepikContent} freepikOrder={freepikOrder} setFreepikOrder={setFreepikOrder}
                libraryModalOpen={libraryModalOpen} setLibraryModalOpen={setLibraryModalOpen} libraryCategories={libraryCategories} libraryAssets={libraryAssets} libraryLoading={libraryLoading}
                librarySelectedCategory={librarySelectedCategory} fetchLibraryAssets={fetchLibraryAssets} libraryBack={libraryBack} librarySelected={librarySelected} toggleLibrarySelect={toggleLibrarySelect}
                selectAllLibrary={selectAllLibrary} deselectAllLibrary={deselectAllLibrary} libraryImporting={libraryImporting} importLibraryAssets={importLibraryAssets}
                viewingAsset={viewingAsset} setViewingAsset={setViewingAsset} filteredAssets={filteredAssets} deleteAsset={deleteAsset} uploadFiles={uploadFiles}
            />
        </div>
    );
};
