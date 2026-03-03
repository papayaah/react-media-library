'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useAssetThumbnails } from '../hooks/useAssetThumbnails';
import { importFileToLibrary } from '../services/storage';
import { MediaGridIcons } from '../types';
import { renderIcon } from '../utils/renderIcon';

export interface MediaAttachmentStripProps {
    /** Array of media asset IDs to display */
    assetIds: number[];
    /** Called when a new file is uploaded and added to the library */
    onAdd: (assetId: number) => void;
    /** Called when the remove button is clicked on a thumbnail */
    onRemove: (assetId: number) => void;
    /** File type filter for the file picker (default: 'image/*') */
    accept?: string;
    /** Thumbnail size in px (default: 64) */
    size?: number;
    /** Border radius in px (default: 8) */
    borderRadius?: number;
    /** Gap between items in px (default: 8) */
    gap?: number;
    /** Icon set for add/remove/view buttons */
    icons?: MediaGridIcons;
    /** Optional class name for the outer container */
    className?: string;
    /** Optional inline style for the outer container */
    style?: React.CSSProperties;
}

/**
 * Compact inline media attachment strip.
 *
 * Renders a horizontal row of thumbnail images with:
 * - Click to add (file picker)
 * - Drag & drop to add
 * - Hover overlay with view-fullsize and remove buttons
 * - Fullscreen image viewer
 *
 * Uses the media library's storage (IndexedDB + OPFS) under the hood.
 * Pair with your own state management for the `assetIds` array.
 */
export function MediaAttachmentStrip({
    assetIds,
    onAdd,
    onRemove,
    accept = 'image/*',
    size = 64,
    borderRadius = 8,
    gap = 8,
    icons,
    className,
    style,
}: MediaAttachmentStripProps) {
    const { thumbnails, getFullUrl } = useAssetThumbnails(assetIds);
    const [isDragging, setIsDragging] = useState(false);
    const [viewingUrl, setViewingUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounterRef = useRef(0);

    const importFiles = useCallback(
        async (files: File[]) => {
            const acceptType = accept.replace('/*', '/');
            const filtered = accept === '*'
                ? files
                : files.filter((f) => f.type.startsWith(acceptType) || accept.includes(f.name.split('.').pop() || ''));
            for (const file of filtered) {
                const assetId = await importFileToLibrary(file);
                onAdd(assetId);
            }
        },
        [onAdd, accept]
    );

    const handleFileSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files) return;
            await importFiles(Array.from(files));
            e.target.value = '';
        },
        [importFiles]
    );

    // Element-scoped drag & drop handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current++;
        if (e.dataTransfer.types.includes('Files')) {
            setIsDragging(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounterRef.current = 0;
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                importFiles(files);
            }
        },
        [importFiles]
    );

    const handleViewFull = useCallback(
        async (assetIndex: number) => {
            const thumb = thumbnails[assetIndex];
            if (!thumb) return;
            const url = await getFullUrl(thumb.asset);
            if (url) setViewingUrl(url);
        },
        [thumbnails, getFullUrl]
    );

    const closeViewer = useCallback(() => {
        if (viewingUrl) {
            URL.revokeObjectURL(viewingUrl);
            setViewingUrl(null);
        }
    }, [viewingUrl]);

    return (
        <>
            <div
                className={className}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap,
                    flexWrap: 'wrap',
                    padding: 4,
                    margin: -4,
                    borderRadius,
                    transition: 'box-shadow 0.15s, background-color 0.15s',
                    ...(isDragging
                        ? { backgroundColor: 'rgba(99,102,241,0.08)', boxShadow: 'inset 0 0 0 2px rgba(99,102,241,0.4)' }
                        : {}),
                    ...style,
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {thumbnails.map(({ asset, url }, index) => (
                    <div
                        key={asset.id}
                        style={{
                            position: 'relative',
                            width: size,
                            height: size,
                            borderRadius,
                            overflow: 'hidden',
                            border: '1px solid rgba(128,128,128,0.2)',
                        }}
                    >
                        <img
                            src={url}
                            alt={asset.fileName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        {/* Hover overlay */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.5)',
                                opacity: 0,
                                transition: 'opacity 0.15s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                        >
                            <button
                                type="button"
                                onClick={() => handleViewFull(index)}
                                style={overlayButtonStyle}
                                title="View full size"
                            >
                                {renderIcon(icons?.zoomIn, 14, {}, '\u26F6')}
                            </button>
                            <button
                                type="button"
                                onClick={() => onRemove(asset.id!)}
                                style={overlayButtonStyle}
                                title="Remove"
                            >
                                {renderIcon(icons?.x, 14, {}, '\u00D7')}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        width: size,
                        height: size,
                        borderRadius,
                        border: `2px dashed ${isDragging ? 'rgba(99,102,241,0.8)' : 'rgba(128,128,128,0.3)'}`,
                        background: isDragging ? 'rgba(99,102,241,0.05)' : 'transparent',
                        color: isDragging ? 'rgb(99,102,241)' : 'rgba(128,128,128,0.6)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'border-color 0.15s, color 0.15s, background-color 0.15s',
                        padding: 0,
                    }}
                    title="Add file (or drag & drop)"
                >
                    {renderIcon(icons?.upload, 18, {}, '+')}
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Fullscreen viewer */}
            {viewingUrl && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 32,
                        cursor: 'pointer',
                    }}
                    onClick={closeViewer}
                >
                    <button
                        type="button"
                        onClick={closeViewer}
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: 24,
                            cursor: 'pointer',
                            padding: 8,
                        }}
                    >
                        {renderIcon(icons?.x, 24, {}, '\u00D7')}
                    </button>
                    <img
                        src={viewingUrl}
                        alt="Full size"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: 8,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}

const overlayButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};
