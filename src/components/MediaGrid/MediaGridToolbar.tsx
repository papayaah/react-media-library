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

    // Filters
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    typeFilter: string;
    setTypeFilter: (filter: string) => void;
    dateFrom: string;
    setDateFrom: (date: string) => void;
    dateTo: string;
    setDateTo: (date: string) => void;
    orientationFilter: import('../../types').MediaOrientation;
    setOrientationFilter: (orientation: import('../../types').MediaOrientation) => void;

    // View Mode
    viewMode: 'grid' | 'list' | 'masonry';
    setViewMode: (mode: 'grid' | 'list' | 'masonry') => void;

    // Actions
    uploadFiles: (files: FileList | File[]) => Promise<void>;

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
    uploadFiles,
    filteredAssets,
    orientationFilter,
    setOrientationFilter,
}) => {
    const { Button, TextInput, Select, Loader, FileButton } = preset;

    return (
        <>
            {/* Consolidated top buttons moved to tabs/filters */}

            {/* Selection Bar moved to MediaGrid for closer proximity to assets */}

            {/* Filters */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Search and Type Row */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <TextInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search..."
                            leftIcon={renderIcon(icons?.search, 16, { style: { opacity: 0.5 } })}
                            style={{ height: '36px', fontSize: '13px' }}
                        />
                    </div>

                    <div style={{ width: '120px' }}>
                        <Select
                            value={typeFilter}
                            onChange={setTypeFilter}
                            options={[
                                { value: 'all', label: 'All' },
                                { value: 'image', label: 'Images' },
                                { value: 'video', label: 'Videos' },
                            ]}
                            style={{ height: '36px', fontSize: '13px' }}
                        />
                    </div>

                    {!loading && filteredAssets.length > 0 && (
                        <Button
                            variant={isSelectMode ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => {
                                setIsSelectMode(!isSelectMode);
                            }}
                            leftIcon={renderIcon(isSelectMode ? icons?.x : icons?.check, 16)}
                            style={{ height: '36px', borderRadius: '8px', minWidth: '90px', padding: '0 0.75rem' }}
                        >
                            {isSelectMode ? 'Cancel' : 'Select'}
                        </Button>
                    )}
                </div>

                {/* Orientation Row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#7c3aed' }}></div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orientation</span>
                    </div>
                    <div style={{ display: 'flex', background: '#f8fafc', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                        {[
                            {
                                id: 'all', label: 'All', icon: (
                                    <g>
                                        <rect width="7" height="7" x="3" y="3" rx="1" strokeWidth="2" />
                                        <rect width="7" height="7" x="14" y="3" rx="1" strokeWidth="2" />
                                        <rect width="7" height="7" x="3" y="14" rx="1" strokeWidth="2" />
                                        <rect width="7" height="7" x="14" y="14" rx="1" strokeWidth="2" />
                                    </g>
                                )
                            },
                            { id: 'horizontal', label: 'Landscape', icon: <rect width="20" height="12" x="2" y="6" rx="1.5" strokeWidth="2" /> },
                            { id: 'vertical', label: 'Portrait', icon: <rect width="12" height="20" x="6" y="2" rx="1.5" strokeWidth="2" /> },
                            { id: 'square', label: 'Square', icon: <rect width="16" height="16" x="4" y="4" rx="1" strokeWidth="2.5" /> }
                        ].map(opt => {
                            const active = orientationFilter === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setOrientationFilter(opt.id as any)}
                                    title={opt.label}
                                    style={{
                                        width: '40px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: active ? '#fff' : 'transparent',
                                        color: active ? '#7c3aed' : '#94a3b8',
                                        cursor: 'pointer',
                                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.1s'
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                        {opt.icon}
                                    </svg>
                                </button>
                            );
                        })}
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

                <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                    {uploading && <Loader size="sm" />}
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
            </div>
        </>
    );
};
