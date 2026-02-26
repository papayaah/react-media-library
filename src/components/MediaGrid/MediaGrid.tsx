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
        fetchPexelsImages, togglePexelsSelect, selectAllPexels, deselectAllPexels, importPexelsImages,
        freepikAvailable, freepikContent, freepikLoading, freepikSelected, freepikImporting,
        freepikSearchQuery, setFreepikSearchQuery, freepikOrder, setFreepikOrder,
        searchFreepikIcons, toggleFreepikSelect, selectAllFreepik, deselectAllFreepik, importFreepikContent,
        libraryAvailable, libraryCategories, libraryAssets, libraryLoading,
        librarySelectedCategory, librarySelected, libraryImporting,
        fetchLibraryCategories, fetchLibraryAssets, libraryBack,
        toggleLibrarySelect, selectAllLibrary, deselectAllLibrary, importLibraryAssets,
    } = context;

    // Local State
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
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

            return matchesType && matchesSearch && matchesFrom && matchesTo;
        });
    }, [assets, searchQuery, typeFilter, dateFrom, dateTo]);

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
                <div style={{ display: 'flex', marginBottom: '1rem', borderRadius: 8, overflow: 'hidden', border: '1px solid #dee2e6' }}>
                    <button onClick={() => { setLibraryInlineOpen(false); deselectAllLibrary(); }} style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.813rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: !libraryInlineOpen ? '#7c3aed' : 'transparent', color: !libraryInlineOpen ? '#fff' : '#6b7280', transition: 'all 0.15s' }}>Uploads</button>
                    <button onClick={() => { if (!libraryInlineOpen) fetchLibraryCategories(); setLibraryInlineOpen(true); }} style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.813rem', fontWeight: 600, border: 'none', borderLeft: '1px solid #dee2e6', cursor: 'pointer', background: libraryInlineOpen ? '#7c3aed' : 'transparent', color: libraryInlineOpen ? '#fff' : '#6b7280', transition: 'all 0.15s' }}>Library</button>
                </div>
            )}

            {!libraryInlineOpen && (
                <>
                    <MediaGridToolbar
                        preset={preset} icons={icons} loading={loading} uploading={uploading}
                        isSelectMode={isSelectMode} setIsSelectMode={setIsSelectMode}
                        selectedIds={selectedIds} setSelectedIds={setSelectedIds}
                        bulkDeleteConfirm={bulkDeleteConfirm} setBulkDeleteConfirm={setBulkDeleteConfirm}
                        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                        dateFrom={dateFrom} setDateFrom={setDateFrom}
                        dateTo={dateTo} setDateTo={setDateTo}
                        viewMode={viewMode} setViewMode={setViewMode}
                        aiAvailable={aiAvailable} aiGenerating={aiGenerating} setAiModalOpen={setAiModalOpen}
                        pexelsAvailable={pexelsAvailable} setPexelsModalOpen={setPexelsModalOpen} fetchPexelsImages={fetchPexelsImages}
                        freepikAvailable={freepikAvailable} setFreepikModalOpen={setFreepikModalOpen} searchFreepikIcons={searchFreepikIcons}
                        uploadFiles={uploadFiles} handleSelectAll={handleSelectAll} handleDeselectAll={handleDeselectAll}
                        handleBulkDelete={handleBulkDelete} cancelBulkDelete={() => setBulkDeleteConfirm(false)}
                        filteredAssets={filteredAssets}
                    />
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
                </>
            )}

            <MediaGridLibraryTab
                preset={preset} libraryAvailable={libraryAvailable} libraryInlineOpen={libraryInlineOpen} librarySelectedCategory={librarySelectedCategory}
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
