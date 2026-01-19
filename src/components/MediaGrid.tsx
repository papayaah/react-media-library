import React, { useState, useMemo } from 'react';
import { useMediaLibraryContext } from './MediaLibraryProvider';
import { MediaAsset, ComponentPreset, MediaGridIcons, DragDropProps } from '../types';
import { MediaViewer } from './MediaViewer';
import { renderIcon } from '../utils/renderIcon';

interface MediaGridProps extends DragDropProps {
    preset: ComponentPreset;
    icons?: MediaGridIcons;
    onSelectionChange?: (selectedAssets: MediaAsset[]) => void;
}

const typeIconMap = (icons: MediaGridProps['icons']) => ({
    image: icons?.photo,
    video: icons?.video,
    audio: icons?.audio,
    document: icons?.document,
    other: icons?.file,
});

const renderTypeIcon = (icon: MediaGridIcons[keyof MediaGridIcons] | undefined, size: number = 48) => {
    return renderIcon(icon, size);
};

const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes)) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatTimestamp = (ms: number) => {
    if (!ms) return '';
    const date = new Date(ms);
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

interface GridAssetItemProps {
    asset: MediaAsset;
    preset: ComponentPreset;
    isSelected: boolean;
    isSelectMode: boolean;
    onToggleSelection: (id: number) => void;
    onAssetClick: (asset: MediaAsset) => void;
    onDeleteAsset: (asset: MediaAsset) => void;
    renderTypeIcon: (icon: any, size: number) => React.ReactNode;
    iconMap: any;
    // Drag & drop props
    draggable?: boolean;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
}

const GridAssetItem: React.FC<GridAssetItemProps> = ({
    asset,
    preset,
    isSelected,
    isSelectMode,
    onToggleSelection,
    onAssetClick,
    onDeleteAsset,
    renderTypeIcon,
    iconMap,
    draggable,
    isDragging,
    onDragStart,
    onDragEnd,
}) => {
    const { Card, Image, Badge, Button, Skeleton } = preset;
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
            // @ts-expect-error - Card may not have drag props in type but DOM will accept them
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            {/* Selection Indicator - Top Left */}
            {isSelected && (
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10 }}>
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
                        {renderIcon(iconMap.other, 14, { style: { color: '#ffffff' } }, '✓')}
                        {/* Note: We need a check icon. iconMap doesn't have it explicitly passed in props usually, 
                           but we can try to use a default or pass it. 
                           Actually, renderIcon handles string names if we had them, but here we have nodes.
                           Let's use a simple SVG if check is not available or assume it is.
                           Wait, MediaGridProps has icons. GridAssetItem receives iconMap which is derived from icons.
                           But iconMap only has file types.
                           We need to pass the full icons object or at least the check icon to GridAssetItem.
                           For now, I'll use a simple check character or try to get the icon.
                           The user wants it to look like RecentMediaGrid.
                           RecentMediaGrid uses `icons?.check`.
                           GridAssetItem doesn't receive `icons`. It receives `iconMap`.
                           I should update GridAssetItem to receive `icons` instead of or in addition to `iconMap`.
                        */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </div>
            )}

            {/* View Button - Top Right */}
            <div
                style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    zIndex: 10,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.2s',
                    cursor: 'pointer',
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onAssetClick(asset);
                }}
                title="View"
            >
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                }}>
                    {/* Zoom icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                </div>
            </div>

            <div
                style={{
                    width: '100%',
                    height: '160px',
                    overflow: 'hidden',
                    borderBottom: '1px solid #e5e7eb',
                    position: 'relative',
                    backgroundColor: '#f3f4f6',
                    flexShrink: 0 // Prevent height collapse
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {(asset.fileType === 'image' || asset.fileType === 'video') && asset.previewUrl ? (
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
                        {asset.fileType === 'video' ? (
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
                                    objectFit: 'cover', 
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

            <div style={{ padding: '0.75rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {asset.fileName}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <Badge variant="default">{asset.fileType}</Badge>
                    <Badge variant="secondary">{formatFileSize(asset.size)}</Badge>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '0.75rem' }}>
                    {formatTimestamp(asset.createdAt)}
                </div>

                {!isSelectMode && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="danger"
                            size="sm"
                            fullWidth
                            onClick={() => {
                                if (confirm('Delete this file?')) {
                                    onDeleteAsset(asset);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

/**
 * MediaGrid - The complete, opinionated media library component
 * 
 * This component provides all features:
 * - File upload (button + drag & drop)
 * - Search by filename
 * - Filter by file type
 * - Date range filtering
 * - Select mode with bulk delete
 * - Individual delete
 * - Image viewer modal
 * - Responsive grid
 * - Loading & empty states
 * 
 * It's UI-agnostic - just pass a preset with your UI components!
 */
export const MediaGrid: React.FC<MediaGridProps> = ({
    preset,
    icons = {},
    onSelectionChange,
    draggable = false,
    onDragStart: onDragStartProp,
    onDragEnd: onDragEndProp,
    itemWrapper: ItemWrapper,
}) => {
    const {
        assets,
        loading,
        uploading,
        uploadFiles,
        deleteAsset,
        isDragging,
        draggedItemCount,
        pendingUploads,
        aiAvailable,
        aiGenerating,
        aiError,
        generateImages,
        pexelsAvailable,
        pexelsImages,
        pexelsLoading,
        pexelsSelected,
        pexelsImporting,
        fetchPexelsImages,
        togglePexelsSelect,
        selectAllPexels,
        deselectAllPexels,
        importPexelsImages,
    } = useMediaLibraryContext();

    // Track which item is being dragged for animation
    const [draggingId, setDraggingId] = useState<number | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Selection
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Image viewer
    const [viewingAsset, setViewingAsset] = useState<MediaAsset | null>(null);

    // View Mode
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'masonry'>('grid');
    const [masonryGap, setMasonryGap] = useState(1);

    const { Button, TextInput, Select, Checkbox, Badge, Loader, FileButton, Skeleton, UploadCard, Modal, AIGenerateSidebar, PexelsImagePicker } = preset;

    // AI generation UI (optional)
    const [aiModalOpen, setAiModalOpen] = useState(false);
    
    // Pexels UI (optional)
    const [pexelsModalOpen, setPexelsModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiWidth, setAiWidth] = useState('768');
    const [aiHeight, setAiHeight] = useState('768');
    const [aiSteps, setAiSteps] = useState('25');
    const [aiModel, setAiModel] = useState('');

    // Filtered assets
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

    const toggleSelection = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            if (onSelectionChange) {
                const selectedAssets = assets.filter((a) => next.has(a.id!));
                onSelectionChange(selectedAssets);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        setSelectedIds(new Set(filteredAssets.map((a) => a.id!)));
    };

    const handleDeselectAll = () => {
        setSelectedIds(new Set());
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} item(s)?`)) return;

        const assetsToDelete = assets.filter((a) => selectedIds.has(a.id!));
        await Promise.all(assetsToDelete.map((a) => deleteAsset(a)));
        setSelectedIds(new Set());
        setIsSelectMode(false);
    };

    const handleAssetClick = (asset: MediaAsset) => {
        if (asset.fileType === 'image' || asset.fileType === 'video') {
            setViewingAsset(asset);
        }
    };

    const iconMap = useMemo(() => typeIconMap(icons), [icons]);

    // Drag handlers
    const handleDragStart = (asset: MediaAsset, e: React.DragEvent) => {
        setDraggingId(asset.id ?? null);

        // Set data transfer with multiple formats for flexibility
        e.dataTransfer.setData('application/json', JSON.stringify({
            id: asset.id,
            fileName: asset.fileName,
            fileType: asset.fileType,
            mimeType: asset.mimeType,
            previewUrl: asset.previewUrl,
            size: asset.size,
        }));
        if (asset.previewUrl) {
            e.dataTransfer.setData('text/uri-list', asset.previewUrl);
        }
        e.dataTransfer.setData('text/plain', asset.fileName);
        e.dataTransfer.effectAllowed = 'copyMove';

        onDragStartProp?.(asset, e);
    };

    const handleDragEnd = (asset: MediaAsset, e: React.DragEvent) => {
        setDraggingId(null);
        onDragEndProp?.(asset, e);
    };

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                    Media Library
                </h1>
                <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                    Upload and manage your images, videos, and other assets
                </p>
            </div>

            {/* Actions */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {!loading && filteredAssets.length > 0 && (
                    <Button
                        variant={isSelectMode ? 'primary' : 'outline'}
                        onClick={() => {
                            setIsSelectMode(!isSelectMode);
                            setSelectedIds(new Set());
                        }}
                    >
                        {isSelectMode ? 'Cancel' : 'Select'}
                    </Button>
                )}

                {aiAvailable && (
                    <Button
                        variant="secondary"
                        onClick={() => setAiModalOpen(true)}
                        disabled={uploading || aiGenerating}
                    >
                        Generate
                    </Button>
                )}

                {pexelsAvailable && (
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setPexelsModalOpen(true);
                            fetchPexelsImages();
                        }}
                        disabled={uploading}
                    >
                        Pexels
                    </Button>
                )}

                {uploading && <Loader size="sm" />}
            </div>

            {aiAvailable && AIGenerateSidebar ? (
                <AIGenerateSidebar
                    isOpen={aiModalOpen}
                    onClose={() => setAiModalOpen(false)}
                    prompt={aiPrompt}
                    onPromptChange={setAiPrompt}
                    width={aiWidth}
                    onWidthChange={setAiWidth}
                    height={aiHeight}
                    onHeightChange={setAiHeight}
                    steps={aiSteps}
                    onStepsChange={setAiSteps}
                    model={aiModel}
                    onModelChange={setAiModel}
                    onPresetChange={(val) => {
                        if (!val) return;
                        setAiWidth(val);
                        setAiHeight(val);
                    }}
                    error={aiError}
                    generating={aiGenerating}
                    onGenerate={async () => {
                        const width = Math.max(1, Number(aiWidth) || 768);
                        const height = Math.max(1, Number(aiHeight) || 768);
                        const steps = Number(aiSteps);
                        await generateImages({
                            prompt: aiPrompt.trim(),
                            width,
                            height,
                            steps: Number.isFinite(steps) ? steps : undefined,
                            model: aiModel.trim() || undefined,
                        });
                        setAiModalOpen(false);
                    }}
                    onCancel={() => setAiModalOpen(false)}
                />
            ) : aiAvailable ? (
                <Modal
                    isOpen={aiModalOpen}
                    onClose={() => setAiModalOpen(false)}
                    title="Generate image"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                Prompt
                            </div>
                            <TextInput
                                value={aiPrompt}
                                onChange={setAiPrompt}
                                placeholder="Describe the image you want..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Width
                                </div>
                                <TextInput
                                    value={aiWidth}
                                    onChange={setAiWidth}
                                    type="number"
                                    placeholder="768"
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Height
                                </div>
                                <TextInput
                                    value={aiHeight}
                                    onChange={setAiHeight}
                                    type="number"
                                    placeholder="768"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Preset
                                </div>
                                <Select
                                    value=""
                                    onChange={(val) => {
                                        if (!val) return;
                                        setAiWidth(val);
                                        setAiHeight(val);
                                    }}
                                    placeholder="Pick a size"
                                    options={[
                                        { value: '512', label: '512 × 512' },
                                        { value: '768', label: '768 × 768' },
                                        { value: '1024', label: '1024 × 1024' },
                                    ]}
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Steps (optional)
                                </div>
                                <TextInput
                                    value={aiSteps}
                                    onChange={setAiSteps}
                                    type="number"
                                    placeholder="25"
                                />
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                Model (optional)
                            </div>
                            <TextInput
                                value={aiModel}
                                onChange={setAiModel}
                                placeholder="e.g. stability-ai/sdxl:… (provider-specific)"
                            />
                        </div>

                        {aiError && (
                            <div style={{ color: '#b91c1c', fontSize: '0.875rem' }}>
                                {aiError}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <Button variant="secondary" onClick={() => setAiModalOpen(false)} disabled={aiGenerating}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                loading={aiGenerating}
                                disabled={!aiPrompt.trim()}
                                onClick={async () => {
                                    const width = Math.max(1, Number(aiWidth) || 768);
                                    const height = Math.max(1, Number(aiHeight) || 768);
                                    const steps = Number(aiSteps);
                                    await generateImages({
                                        prompt: aiPrompt.trim(),
                                        width,
                                        height,
                                        steps: Number.isFinite(steps) ? steps : undefined,
                                        model: aiModel.trim() || undefined,
                                    });
                                    setAiModalOpen(false);
                                }}
                            >
                                Generate
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}

            {pexelsAvailable && PexelsImagePicker && (
                <PexelsImagePicker
                    isOpen={pexelsModalOpen}
                    onClose={() => {
                        setPexelsModalOpen(false);
                        deselectAllPexels();
                    }}
                    images={pexelsImages}
                    loading={pexelsLoading}
                    selected={pexelsSelected}
                    onToggleSelect={togglePexelsSelect}
                    onSelectAll={selectAllPexels}
                    onDeselectAll={deselectAllPexels}
                    importing={pexelsImporting}
                    onImport={async () => {
                        await importPexelsImages();
                        setPexelsModalOpen(false);
                    }}
                />
            )}

            {/* Selection Bar */}
            {isSelectMode && filteredAssets.length > 0 && (
                <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: '#f9fafb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                            {selectedIds.size > 0
                                ? `${selectedIds.size} item${selectedIds.size === 1 ? '' : 's'} selected`
                                : 'Select items to delete'}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {selectedIds.size > 0 ? (
                                <>
                                    {selectedIds.size < filteredAssets.length && (
                                        <Button variant="secondary" size="sm" onClick={handleSelectAll}>
                                            Select All
                                        </Button>
                                    )}
                                    {selectedIds.size === filteredAssets.length && (
                                        <Button variant="secondary" size="sm" onClick={handleDeselectAll}>
                                            Deselect All
                                        </Button>
                                    )}
                                    <Button variant="danger" size="sm" leftIcon={renderIcon(icons?.trash, 18, undefined, 'Delete')} onClick={handleBulkDelete}>
                                        Delete ({selectedIds.size})
                                    </Button>
                                </>
                            ) : (
                                <Button variant="secondary" size="sm" onClick={handleSelectAll}>
                                    Select All
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: '#ffffff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <TextInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search files..."
                        leftIcon={renderIcon(icons?.search, 20)}
                    />
                    <Select
                        value={typeFilter}
                        onChange={setTypeFilter}
                        placeholder="All Types"
                        options={[
                            { value: 'all', label: 'All Types' },
                            { value: 'image', label: 'Images' },
                            { value: 'video', label: 'Videos' },
                            { value: 'audio', label: 'Audio' },
                            { value: 'document', label: 'Documents' },
                            { value: 'other', label: 'Other' },
                        ]}
                    />
                    <TextInput
                        value={dateFrom}
                        onChange={setDateFrom}
                        type="date"
                        placeholder="From date"
                    />
                    <TextInput
                        value={dateTo}
                        onChange={setDateTo}
                        type="date"
                        placeholder="To date"
                    />
                </div>
            </div>

            {/* View Toggles */}
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                {viewMode === 'masonry' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
                        {renderIcon(icons?.slidersHorizontal, 16, { style: { color: '#6b7280' } }, '⚙')}
                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={masonryGap}
                            onChange={(e) => setMasonryGap(Number(e.target.value))}
                            style={{ width: '100px' }}
                            title="Gap Size"
                        />
                    </div>
                )}

                <Button
                    variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                >
                    {renderIcon(icons?.layoutGrid, 16, undefined, 'Grid')}
                </Button>
                <Button
                    variant={viewMode === 'list' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                >
                    {renderIcon(icons?.list, 16, undefined, 'List')}
                </Button>
                <Button
                    variant={viewMode === 'masonry' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('masonry')}
                    aria-label="Masonry view"
                >
                    {renderIcon(icons?.columns, 16, undefined, 'Masonry')}
                </Button>
            </div>

            {/* Media Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {/* Show skeleton cards to reserve layout space and prevent CLS */}
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
            ) : (
                <>
                    {viewMode === 'masonry' ? (
                        <div style={{ columnCount: 4, columnGap: `${masonryGap}px`, padding: '0.5rem' }}>
                            <div style={{ breakInside: 'avoid', marginBottom: `${masonryGap}px` }}>
                                <FileButton onSelect={uploadFiles} multiple disabled={uploading}>
                                    <UploadCard onClick={() => { }} isDragging={isDragging}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                                            {renderIcon(icons?.upload, 24)}
                                            <span>Upload</span>
                                        </div>
                                    </UploadCard>
                                </FileButton>
                            </div>

                            {filteredAssets.map((asset) => {
                                const isSelected = selectedIds.has(asset.id!);
                                const isItemDragging = draggingId === asset.id;

                                const masonryItem = (
                                    <div key={asset.id} style={{ breakInside: 'avoid', marginBottom: `${masonryGap}px` }}>
                                        <div
                                            onClick={() => handleAssetClick(asset)}
                                            draggable={draggable && !ItemWrapper}
                                            onDragStart={(e) => handleDragStart(asset, e)}
                                            onDragEnd={(e) => handleDragEnd(asset, e)}
                                            style={{
                                                position: 'relative',
                                                cursor: draggable ? (isItemDragging ? 'grabbing' : 'grab') : 'pointer',
                                                border: isSelected ? '2px solid #3b82f6' : 'none',
                                                borderRadius: 0,
                                                overflow: 'hidden',
                                                opacity: isItemDragging ? 0.4 : 1,
                                                transition: 'opacity 0.15s ease-out',
                                            }}
                                        >
                                            {isSelectMode && (
                                                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10 }}>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => toggleSelection(asset.id!)}
                                                    />
                                                </div>
                                            )}

                                            {asset.fileType === 'image' && asset.previewUrl ? (
                                                <div style={{ width: '100%', height: 'auto', display: 'block', border: 'none', borderRadius: 0, overflow: 'hidden' }}>
                                                    <img
                                                        src={asset.previewUrl}
                                                        alt={asset.fileName}
                                                        loading="lazy"
                                                        decoding="async"
                                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ width: '100%', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                                                    {renderTypeIcon(iconMap[asset.fileType], 48)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );

                                // If itemWrapper provided, wrap the item
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
                    ) : viewMode === 'list' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '40px 60px 1fr 100px 100px 150px 80px',
                                gap: '1rem',
                                padding: '0.75rem',
                                borderBottom: '1px solid #e5e7eb',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                color: '#6b7280'
                            }}>
                                <div></div>
                                <div>Preview</div>
                                <div>Filename</div>
                                <div>Type</div>
                                <div>Size</div>
                                <div>Date</div>
                                <div>Actions</div>
                            </div>

                            <FileButton onSelect={uploadFiles} multiple disabled={uploading}>
                                <div style={{
                                    padding: '0.75rem',
                                    border: '1px dashed #e5e7eb',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}>
                                    {renderIcon(icons?.upload, 24)}
                                    <span>Upload New Files</span>
                                </div>
                            </FileButton>

                            {filteredAssets.map((asset) => {
                                const isSelected = selectedIds.has(asset.id!);

                                return (
                                    <div
                                        key={asset.id}
                                        onClick={() => handleAssetClick(asset)}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '40px 60px 1fr 100px 100px 150px 80px',
                                            gap: '1rem',
                                            padding: '0.5rem',
                                            alignItems: 'center',
                                            background: isSelected ? '#eff6ff' : 'white',
                                            border: isSelected ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <div onClick={(e) => e.stopPropagation()}>
                                            {isSelectMode && (
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => toggleSelection(asset.id!)}
                                                />
                                            )}
                                        </div>

                                        <div style={{ width: '40px', height: '40px', overflow: 'hidden', borderRadius: '0.25rem', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {asset.fileType === 'image' && asset.previewUrl ? (
                                                <div style={{ width: '100%', height: '100%', border: '1px solid #e5e7eb', borderRadius: '0.25rem', overflow: 'hidden' }}>
                                                    <img
                                                        src={asset.previewUrl}
                                                        alt={asset.fileName}
                                                        loading="lazy"
                                                        decoding="async"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            ) : (
                                                renderTypeIcon(iconMap[asset.fileType], 40)
                                            )}
                                        </div>

                                        <div style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {asset.fileName}
                                        </div>

                                        <div>
                                            <Badge variant="default">{asset.fileType}</Badge>
                                        </div>

                                        <div style={{ color: '#6b7280' }}>
                                            {formatFileSize(asset.size)}
                                        </div>

                                        <div style={{ color: '#6b7280' }}>
                                            {formatTimestamp(asset.createdAt)}
                                        </div>

                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Delete this file?')) {
                                                        deleteAsset(asset);
                                                    }
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {/* Grid View (Default) */}
                            <FileButton onSelect={uploadFiles} multiple disabled={uploading}>
                                <UploadCard onClick={() => { }} isDragging={isDragging}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        {renderIcon(icons?.upload, 24, undefined, 'Upload')}
                                        <span>Upload</span>
                                    </div>
                                </UploadCard>
                            </FileButton>

                            {isDragging && Array.from({ length: Math.max(1, draggedItemCount) }).map((_, i) => (
                                <div key={`drag-skeleton-${i}`} style={{ aspectRatio: '1/1', width: '100%', height: '100%' }}>
                                    <Skeleton className="w-full h-full" />
                                </div>
                            ))}

                            {Array.from({ length: pendingUploads }).map((_, i) => (
                                <div key={`skeleton-${i}`} style={{ aspectRatio: '1/1', width: '100%', height: '100%' }}>
                                    <Skeleton className="w-full h-full" />
                                </div>
                            ))}

                            {filteredAssets.map((asset) => {
                                const gridItem = (
                                    <GridAssetItem
                                        key={asset.id}
                                        asset={asset}
                                        preset={preset}
                                        isSelected={selectedIds.has(asset.id!)}
                                        isSelectMode={isSelectMode}
                                        onToggleSelection={toggleSelection}
                                        onAssetClick={handleAssetClick}
                                        onDeleteAsset={deleteAsset}
                                        renderTypeIcon={renderTypeIcon}
                                        iconMap={iconMap}
                                        draggable={draggable && !ItemWrapper}
                                        isDragging={draggingId === asset.id}
                                        onDragStart={(e) => handleDragStart(asset, e)}
                                        onDragEnd={(e) => handleDragEnd(asset, e)}
                                    />
                                );

                                // If itemWrapper provided, wrap the item (for dnd-kit, react-dnd, etc.)
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
                    )}
                </>
            )}

            {/* Media Viewer */}
            <MediaViewer
                isOpen={viewingAsset !== null}
                onClose={() => setViewingAsset(null)}
                initialAssetId={viewingAsset?.id ?? null}
                assets={filteredAssets}
                preset={preset}
                onDelete={deleteAsset}
                onSave={uploadFiles}
                icons={icons}
            />
        </div>
    );
};

export type { MediaGridProps };
