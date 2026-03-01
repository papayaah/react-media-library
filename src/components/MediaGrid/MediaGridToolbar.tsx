'use client';

import React from 'react';
import { MediaAsset, ComponentPreset, MediaGridIcons } from '../../types';
import { renderIcon } from '../../utils/renderIcon';

interface MediaGridToolbarProps {
    preset: ComponentPreset;
    icons: MediaGridIcons;

    // State
    loading: boolean;
    uploading: boolean;
    isSelectMode: boolean;
    setIsSelectMode: (mode: boolean) => void;
    selectedIds: Set<number>;
    setSelectedIds: (ids: Set<number>) => void;
    bulkDeleteConfirm: boolean;
    setBulkDeleteConfirm: (confirm: boolean) => void;

    // Filters
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    typeFilter: string;
    setTypeFilter: (filter: string) => void;
    dateFrom: string;
    setDateFrom: (date: string) => void;
    dateTo: string;
    setDateTo: (date: string) => void;
    colorFilter: string;
    setColorFilter: (color: string) => void;
    orientationFilter: import('../../types').MediaOrientation;
    setOrientationFilter: (orientation: import('../../types').MediaOrientation) => void;

    // View Mode
    viewMode: 'grid' | 'list' | 'masonry';
    setViewMode: (mode: 'grid' | 'list' | 'masonry') => void;

    // External Tools Availability
    aiAvailable: boolean;
    aiGenerating: boolean;
    setAiModalOpen: (open: boolean) => void;
    pexelsAvailable: boolean;
    setPexelsModalOpen: (open: boolean) => void;
    fetchPexelsImages: () => Promise<void>;
    freepikAvailable: boolean;
    setFreepikModalOpen: (open: boolean) => void;
    searchFreepikIcons: () => Promise<void>;

    // Actions
    uploadFiles: (files: FileList | File[]) => Promise<void>;
    handleSelectAll: () => void;
    handleDeselectAll: () => void;
    handleBulkDelete: () => Promise<void>;
    cancelBulkDelete: () => void;

    // Data
    filteredAssets: MediaAsset[];
}

export const MediaGridToolbar: React.FC<MediaGridToolbarProps> = ({
    preset,
    icons,
    loading,
    uploading,
    isSelectMode,
    setIsSelectMode,
    selectedIds,
    setSelectedIds,
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    viewMode,
    setViewMode,
    aiAvailable,
    aiGenerating,
    setAiModalOpen,
    pexelsAvailable,
    setPexelsModalOpen,
    fetchPexelsImages,
    freepikAvailable,
    setFreepikModalOpen,
    searchFreepikIcons,
    uploadFiles,
    handleSelectAll,
    handleDeselectAll,
    handleBulkDelete,
    cancelBulkDelete,
    filteredAssets,
    colorFilter,
    setColorFilter,
    orientationFilter,
    setOrientationFilter,
}) => {
    const { Button, TextInput, Select, Loader, FileButton } = preset;

    return (
        <>
            {/* Top Actions */}
            <div style={{
                marginBottom: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '0.6rem',
                alignItems: 'center'
            }}>
                {!loading && filteredAssets.length > 0 && (
                    <Button
                        variant={isSelectMode ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => {
                            setIsSelectMode(!isSelectMode);
                            setSelectedIds(new Set());
                            setBulkDeleteConfirm(false);
                        }}
                        leftIcon={renderIcon(isSelectMode ? icons?.x : icons?.check, 16)}
                    >
                        {isSelectMode ? 'Cancel' : 'Select'}
                    </Button>
                )}

                {aiAvailable && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setAiModalOpen(true)}
                        disabled={uploading || aiGenerating}
                        leftIcon={renderIcon(icons?.photo, 16)}
                    >
                        Generate
                    </Button>
                )}

                {pexelsAvailable && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setPexelsModalOpen(true);
                            fetchPexelsImages();
                        }}
                        disabled={uploading}
                        leftIcon={renderIcon(icons?.photo, 16)}
                    >
                        Pexels
                    </Button>
                )}

                {freepikAvailable && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setFreepikModalOpen(true);
                            searchFreepikIcons();
                        }}
                        disabled={uploading}
                        leftIcon={renderIcon(icons?.photo, 16)}
                    >
                        Freepik
                    </Button>
                )}

                {uploading && <Loader size="sm" />}
            </div>

            {/* Selection Bar */}
            {isSelectMode && filteredAssets.length > 0 && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.875rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    background: '#f9fafb',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <span style={{
                            fontSize: '0.813rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            whiteSpace: 'nowrap'
                        }}>
                            {selectedIds.size > 0
                                ? `${selectedIds.size} selected`
                                : 'Select items'}
                        </span>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flex: '1 1 auto',
                            justifyContent: 'flex-end',
                            minWidth: 'fit-content'
                        }}>
                            {selectedIds.size > 0 ? (
                                <>
                                    {selectedIds.size < filteredAssets.length && (
                                        <Button variant="secondary" size="sm" onClick={handleSelectAll} style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}>
                                            All
                                        </Button>
                                    )}
                                    {selectedIds.size === filteredAssets.length && !bulkDeleteConfirm && (
                                        <Button variant="secondary" size="sm" onClick={handleDeselectAll} style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}>
                                            None
                                        </Button>
                                    )}
                                    {bulkDeleteConfirm ? (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <Button variant="danger" size="sm" onClick={handleBulkDelete} style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}>
                                                Confirm
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={cancelBulkDelete} style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}>
                                                No
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            leftIcon={renderIcon(icons?.trash, 14)}
                                            onClick={handleBulkDelete}
                                            style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}
                                        >
                                            Delete
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Button variant="secondary" size="sm" onClick={handleSelectAll} style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}>
                                    Select All
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Search and Type Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <TextInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search files..."
                            leftIcon={renderIcon(icons?.search, 18, { stroke: 1.5, style: { opacity: 0.6 } })}
                            className="media-filter-search"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                    </div>
                </div>

                {/* Date Range Row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#667eea' }}></div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
                        <TextInput
                            value={dateFrom}
                            onChange={setDateFrom}
                            type="date"
                            placeholder="From"
                            className="media-filter-date"
                            style={{ fontSize: '12px' }}
                        />
                        <TextInput
                            value={dateTo}
                            onChange={setDateTo}
                            type="date"
                            placeholder="To"
                            className="media-filter-date"
                            style={{ fontSize: '12px' }}
                        />
                    </div>
                </div>

                {/* Canva-style Filters: Color and Orientation */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Color Filter - Hidden for now
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {renderIcon(icons?.palette, 16, { style: { color: '#6b7280' } })}
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #dee2e6', borderRadius: '2rem', padding: '2px 8px 2px 4px', cursor: 'pointer' }}>
                            <div
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: colorFilter || 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)',
                                    border: '1px solid #eee'
                                }}
                                onClick={() => {
                                    // Toggle logic or open color picker - for now just clear if set
                                    if (colorFilter) setColorFilter('');
                                }}
                            />
                            <Select
                                value={colorFilter}
                                onChange={setColorFilter}
                                options={[
                                    { value: '', label: 'Any Color' },
                                    { value: '#ef4444', label: 'Red' },
                                    { value: '#f97316', label: 'Orange' },
                                    { value: '#eab308', label: 'Yellow' },
                                    { value: '#22c55e', label: 'Green' },
                                    { value: '#3b82f6', label: 'Blue' },
                                    { value: '#a855f7', label: 'Purple' },
                                    { value: '#ec4899', label: 'Pink' },
                                    { value: '#ffffff', label: 'White' },
                                    { value: '#000000', label: 'Black' },
                                    { value: '#71717a', label: 'Grey' },
                                ]}
                                style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '12px', height: '24px', width: 'auto', minWidth: '80px' }}
                            />
                        </div>
                    </div>
                    */}

                    {/* Orientation Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {renderIcon(icons?.layers, 16, { style: { color: '#6b7280' } })}
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orientation</span>
                        </div>
                        <Select
                            value={orientationFilter}
                            onChange={(val) => setOrientationFilter(val as any)}
                            options={[
                                { value: 'all', label: 'All Orientations' },
                                { value: 'horizontal', label: 'Horizontal' },
                                { value: 'vertical', label: 'Vertical' },
                                { value: 'square', label: 'Square' },
                            ]}
                            style={{ fontSize: '12px', height: '28px', borderRadius: '2rem', minWidth: '120px' }}
                        />
                    </div>
                </div>
            </div>

            {/* View Toggles & Upload */}
            <div style={{
                marginBottom: '1rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <FileButton onSelect={uploadFiles} multiple disabled={uploading}>
                    <Button
                        variant="primary"
                        size="sm"
                        leftIcon={renderIcon(icons?.upload, 16)}
                        style={{
                            paddingLeft: '0.75rem',
                            paddingRight: '1rem',
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                            flexShrink: 0
                        }}
                    >
                        Upload
                    </Button>
                </FileButton>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Button
                        variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        aria-label="Grid view"
                        style={{ padding: '0 0.5rem', minWidth: '36px' }}
                    >
                        {renderIcon(icons?.layoutGrid, 18, undefined, 'Grid')}
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        aria-label="List view"
                        style={{ padding: '0 0.5rem', minWidth: '36px' }}
                    >
                        {renderIcon(icons?.list, 18, undefined, 'List')}
                    </Button>
                    <Button
                        variant={viewMode === 'masonry' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setViewMode('masonry')}
                        aria-label="Masonry view"
                        style={{ padding: '0 0.5rem', minWidth: '36px' }}
                    >
                        {renderIcon(icons?.columns, 18, undefined, 'Masonry')}
                    </Button>
                </div>
            </div>
        </>
    );
};
