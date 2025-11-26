import React, { useState, useMemo } from 'react';
import { useMediaLibraryContext } from './MediaLibraryProvider';
import { MediaAsset, ComponentPreset } from '../types';
import { MediaViewer } from './MediaViewer';
import { LayoutGrid, List, Columns, SlidersHorizontal } from 'lucide-react';

interface MediaGridProps {
    preset: ComponentPreset;
    icons?: {
        upload?: React.ReactNode;
        search?: React.ReactNode;
        trash?: React.ReactNode;
        photo?: React.ReactNode;
        video?: React.ReactNode;
        audio?: React.ReactNode;
        document?: React.ReactNode;
        file?: React.ReactNode;
    };
}

const typeIconMap = (icons: MediaGridProps['icons']) => ({
    image: icons?.photo,
    video: icons?.video,
    audio: icons?.audio,
    document: icons?.document,
    other: icons?.file,
});

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
export const MediaGrid: React.FC<MediaGridProps> = ({ preset, icons = {} }) => {
    const { assets, loading, uploading, uploadFiles, deleteAsset, isDragging, pendingUploads } = useMediaLibraryContext();

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

    const { Card, Button, TextInput, Select, Checkbox, Badge, Image, Loader, FileButton, Skeleton, UploadCard } = preset;

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
        if (isSelectMode) {
            toggleSelection(asset.id!);
        } else if (asset.fileType === 'image') {
            setViewingAsset(asset);
        }
    };

    const iconMap = typeIconMap(icons);

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Media Library
                </h1>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
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

                {uploading && <Loader size="sm" />}
            </div>

            {/* Selection Bar */}
            {isSelectMode && filteredAssets.length > 0 && (
                <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
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
                                    <Button variant="danger" size="sm" leftIcon={icons.trash} onClick={handleBulkDelete}>
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
            <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <TextInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search files..."
                        leftIcon={icons.search}
                    />
                    <Select
                        value={typeFilter}
                        onChange={setTypeFilter}
                        placeholder="File type"
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
                        <SlidersHorizontal size={16} className="text-gray-500" />
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
                >
                    <LayoutGrid size={16} />
                </Button>
                <Button
                    variant={viewMode === 'list' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                >
                    <List size={16} />
                </Button>
                <Button
                    variant={viewMode === 'masonry' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('masonry')}
                >
                    <Columns size={16} />
                </Button>
            </div>

            {/* Media Grid */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
                    <Loader size="lg" />
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading your media assets…</p>
                </div>
            ) : (
                <>
                    {viewMode === 'masonry' ? (
                        <div style={{ columnCount: 4, columnGap: `${masonryGap}px`, padding: '0.5rem' }}>
                            <div style={{ breakInside: 'avoid', marginBottom: `${masonryGap}px` }}>
                                <FileButton onSelect={uploadFiles} multiple disabled={uploading}>
                                    <UploadCard onClick={() => { }} isDragging={isDragging}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                                            {icons.upload}
                                            <span>Upload</span>
                                        </div>
                                    </UploadCard>
                                </FileButton>
                            </div>

                            {filteredAssets.map((asset) => {
                                const Icon = iconMap[asset.fileType];
                                const isSelected = selectedIds.has(asset.id!);

                                return (
                                    <div key={asset.id} style={{ breakInside: 'avoid', marginBottom: `${masonryGap}px` }}>
                                        <div
                                            onClick={() => handleAssetClick(asset)}
                                            style={{
                                                position: 'relative',
                                                cursor: 'pointer',
                                                border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                overflow: 'hidden'
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
                                                <img
                                                    src={asset.previewUrl}
                                                    alt={asset.fileName}
                                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                                                    {Icon}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
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
                                    {icons.upload}
                                    <span>Upload New Files</span>
                                </div>
                            </FileButton>

                            {filteredAssets.map((asset) => {
                                const Icon = iconMap[asset.fileType];
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
                                                <img src={asset.previewUrl} alt={asset.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                Icon
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
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1rem'
                        }}>
                            {/* Grid View (Default) */}
                            <FileButton onSelect={uploadFiles} multiple disabled={uploading}>
                                <UploadCard onClick={() => { }} isDragging={isDragging}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        {icons.upload}
                                        <span>Upload</span>
                                    </div>
                                </UploadCard>
                            </FileButton>

                            {isDragging && Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={`drag-skeleton-${i}`} />
                            ))}

                            {Array.from({ length: pendingUploads }).map((_, i) => (
                                <Skeleton key={`skeleton-${i}`} />
                            ))}

                            {filteredAssets.map((asset) => {
                                const Icon = iconMap[asset.fileType];
                                const isSelected = selectedIds.has(asset.id!);

                                return (
                                    <Card key={asset.id} onClick={() => handleAssetClick(asset)} selected={isSelected}>
                                        {isSelectMode && (
                                            <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10 }}>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => toggleSelection(asset.id!)}
                                                />
                                            </div>
                                        )}

                                        {asset.fileType === 'image' && asset.previewUrl ? (
                                            <div style={{
                                                width: '100%',
                                                height: '160px',
                                                overflow: 'hidden',
                                                borderRadius: '0.5rem',
                                                marginBottom: '0.75rem'
                                            }}>
                                                <Image src={asset.previewUrl} alt={asset.fileName} />
                                            </div>
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '160px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#f3f4f6',
                                                borderRadius: '0.5rem',
                                                marginBottom: '0.75rem'
                                            }}>
                                                {Icon}
                                            </div>
                                        )}

                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {asset.fileName}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                            <Badge variant="default">{asset.fileType}</Badge>
                                            <Badge variant="secondary">{formatFileSize(asset.size)}</Badge>
                                        </div>

                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>
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
                                                            deleteAsset(asset);
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </Card>
                                );
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
            />
        </div>
    );
};

export type { MediaGridProps };
