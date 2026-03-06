import React, { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import { MediaAsset, ComponentPreset, MediaGridIcons } from '../types';
import { renderIcon } from '../utils/renderIcon';
import { useAssetPreview } from '../hooks/useAssetPreview';

// Lazy load ImageEditor - only loads when crop button is clicked
const ImageEditor = lazy(() => import('./ImageEditor').then(module => ({ default: module.ImageEditor })));

interface MediaViewerProps {
    isOpen: boolean;
    onClose: () => void;
    initialAssetId: number | null;
    assets: MediaAsset[];
    preset: ComponentPreset;
    onDelete: (asset: MediaAsset) => Promise<void>;
    onSave?: (files: File[]) => Promise<void>;
    readonly?: boolean;
    icons?: MediaGridIcons;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
    isOpen,
    onClose,
    initialAssetId,
    assets,
    preset,
    onDelete,
    onSave,
    readonly = false,
    icons = {},
}) => {
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);

    const { Viewer, ViewerThumbnail, Image, Button, Loader } = preset;

    // Initialize index when opening
    useEffect(() => {
        if (isOpen && initialAssetId !== null) {
            const index = assets.findIndex((a) => a.id === initialAssetId);
            if (index !== -1) {
                setCurrentIndex(index);
            }
        }
        setIsDeleteConfirming(false);
        setIsEditing(false);
        setZoomLevel(1);
        setIsLoaded(false);
    }, [isOpen, initialAssetId, assets]);

    const handleNext = useCallback(() => {
        if (currentIndex < assets.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setIsDeleteConfirming(false);
            setIsEditing(false);
            setZoomLevel(1);
            setIsLoaded(false);
        }
    }, [currentIndex, assets.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setIsDeleteConfirming(false);
            setIsEditing(false);
            setZoomLevel(1);
            setIsLoaded(false);
        }
    }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isEditing) return; // Disable navigation while editing
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleNext, handlePrev, onClose, isEditing]);

    const currentAsset = assets[currentIndex];
    const resolvedUrl = useAssetPreview(currentAsset, isOpen, true);

    // The final URL we want to display. useAssetPreview handles the logic of 
    // preferring cloud vs local based on our arguments.
    const displayUrl = resolvedUrl || '';

    // Reset loading state when the URL changes
    useEffect(() => {
        setIsLoaded(false);
    }, [displayUrl, currentAsset?.id]);

    const handleSelect = useCallback((index: number) => {
        setCurrentIndex(index);
        setIsDeleteConfirming(false);
        setIsEditing(false);
        setZoomLevel(1);
        setIsLoaded(false);
    }, []);

    if (!isOpen || currentIndex === -1) return null;

    const handleDeleteClick = async () => {
        if (isDeleteConfirming) {
            await onDelete(currentAsset);
            setIsDeleteConfirming(false);
            // If we deleted the last item, close or move back
            if (assets.length <= 1) {
                onClose();
            } else if (currentIndex === assets.length - 1) {
                setCurrentIndex((prev) => prev - 1);
            }
            // If not last, index stays same but points to next item naturally
        } else {
            setIsDeleteConfirming(true);
        }
    };

    const handleSaveCrop = async (blob: Blob) => {
        if (!onSave || !currentAsset) return;

        try {
            // Create a new file from the blob
            const fileName = currentAsset.fileName.replace(/(\.[\w\d_-]+)$/i, '_edited$1');
            const file = new File([blob], fileName, { type: blob.type });

            // Upload the new file
            await onSave([file]);

            // Close editor and viewer
            setIsEditing(false);
            onClose();
        } catch (error) {
            // Silently fail
        }
    };

    return (
        <Viewer
            isOpen={isOpen}
            onClose={onClose}
            main={
                isEditing && currentAsset.fileType === 'image' && displayUrl ? (
                    <div style={{ width: '100%', height: '100%' }}>
                        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#000000', color: '#ffffff' }}>Loading editor...</div>}>
                            <ImageEditor
                                src={displayUrl}
                                onSave={handleSaveCrop}
                                onCancel={() => setIsEditing(false)}
                                icons={icons}
                            />
                        </Suspense>
                    </div>
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: zoomLevel > 1 ? 'auto' : 'hidden',
                            position: 'relative',
                            backgroundColor: '#050505',
                            backgroundImage: 'linear-gradient(45deg, #0a0a0a 25%, transparent 25%), linear-gradient(-45deg, #0a0a0a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #0a0a0a 75%), linear-gradient(-45deg, transparent 75%, #0a0a0a 75%)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                        }}
                        onClick={() => {
                            if (currentAsset.fileType === 'image') {
                                setZoomLevel(prev => prev === 1 ? 2 : 1);
                            }
                        }}
                    >
                        {(!isLoaded || !displayUrl) && (currentAsset.fileType === 'image' || currentAsset.fileType === 'video') && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                <Loader size="lg" />
                            </div>
                        )}

                        {currentAsset.fileType === 'image' ? (
                            displayUrl ? (
                                <Image
                                    key={`${currentAsset.id}-${displayUrl}`}
                                    src={displayUrl}
                                    alt={currentAsset.fileName}
                                    onLoad={() => setIsLoaded(true)}
                                    style={{
                                        maxHeight: zoomLevel > 1 ? 'none' : '100%',
                                        maxWidth: zoomLevel > 1 ? 'none' : '100%',
                                        width: zoomLevel > 1 ? 'auto' : '100%',
                                        height: zoomLevel > 1 ? 'auto' : '100%',
                                        objectFit: zoomLevel > 1 ? 'none' : 'contain',
                                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s',
                                        transform: `scale(${zoomLevel})`,
                                        cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in',
                                        transformOrigin: 'center center',
                                        opacity: isLoaded ? 1 : 0,
                                        position: isLoaded ? 'relative' : 'absolute',
                                    }}
                                    loading="eager"
                                    decoding="async"
                                />
                            ) : null
                        ) : currentAsset.fileType === 'video' ? (
                            displayUrl ? (
                                <video
                                    key={`${currentAsset.id}-${displayUrl}`}
                                    src={displayUrl}
                                    controls
                                    autoPlay
                                    style={{
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                        outline: 'none',
                                        opacity: isLoaded ? 1 : 0,
                                        position: isLoaded ? 'relative' : 'absolute',
                                    }}
                                    onLoadedData={() => setIsLoaded(true)}
                                />
                            ) : null
                        ) : (
                            <div style={{ color: '#ffffff', fontSize: '1.25rem' }}>{currentAsset.fileName}</div>
                        )}
                    </div>
                )
            }
            sidebar={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', height: '100%', overflowY: 'auto' }}>
                    {assets.map((asset, index) => (
                        <SidebarThumbnail
                            key={asset.id}
                            asset={asset}
                            index={index}
                            currentIndex={currentIndex}
                            onSelect={handleSelect}
                            ViewerThumbnail={ViewerThumbnail}
                        />
                    ))}
                </div>
            }
            actions={
                !isEditing && (
                    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '12px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {currentAsset.fileType === 'image' && (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.5))}
                                    size="sm"
                                    aria-label="Zoom Out"
                                    style={{ background: 'transparent', border: 'none', width: '32px', height: '32px', color: '#fff' }}
                                >
                                    {renderIcon(icons?.zoomOut, 18)}
                                </Button>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff', width: '32px', textAlign: 'center', opacity: 0.8 }}>
                                    {Math.round(zoomLevel * 100)}%
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => setZoomLevel(prev => Math.min(5, prev + 0.5))}
                                    size="sm"
                                    aria-label="Zoom In"
                                    style={{ background: 'transparent', border: 'none', width: '32px', height: '32px', color: '#fff' }}
                                >
                                    {renderIcon(icons?.zoomIn, 18)}
                                </Button>
                                <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                                {!readonly && (
                                    <Button variant="secondary" onClick={() => setIsEditing(true)} size="sm" aria-label="Crop" style={{ background: 'transparent', border: 'none', width: '32px', height: '32px', color: '#fff' }}>
                                        {renderIcon(icons?.crop, 18, undefined, 'Crop')}
                                    </Button>
                                )}
                            </>
                        )}

                        {!readonly && (
                            isDeleteConfirming ? (
                                <>
                                    <Button variant="secondary" onClick={() => setIsDeleteConfirming(false)} size="sm" aria-label="Cancel" style={{ background: 'transparent', border: 'none', width: '32px', height: '32px', color: '#fff' }}>
                                        {renderIcon(icons?.x, 18, undefined, 'Cancel')}
                                    </Button>
                                    <Button variant="danger" onClick={handleDeleteClick} size="sm" aria-label="Confirm Delete" style={{ height: '32px' }}>
                                        {renderIcon(icons?.check, 18, undefined, 'Confirm')}
                                    </Button>
                                </>
                            ) : (
                                <Button variant="secondary" onClick={() => setIsDeleteConfirming(true)} size="sm" aria-label="Delete" style={{ background: 'transparent', border: 'none', width: '32px', height: '32px', color: '#fff' }}>
                                    {renderIcon(icons?.trash, 18, undefined, 'Delete')}
                                </Button>
                            )
                        )}

                        <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

                        <Button variant="secondary" onClick={onClose} size="sm" aria-label="Close" style={{ background: 'transparent', border: 'none', width: '32px', height: '32px', color: '#fff' }}>
                            {renderIcon(icons?.x, 18, undefined, 'Close')}
                        </Button>
                    </div>
                )
            }
        />
    );
};

const SidebarThumbnail: React.FC<{
    asset: MediaAsset;
    index: number;
    currentIndex: number;
    onSelect: (idx: number) => void;
    ViewerThumbnail: any;
}> = ({ asset, index, currentIndex, onSelect, ViewerThumbnail }) => {
    const resolvedUrl = useAssetPreview(asset, true);
    const ref = useRef<HTMLDivElement>(null);
    const isSelected = index === currentIndex;

    useEffect(() => {
        if (isSelected && ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isSelected]);

    if (asset.fileType !== 'image' && asset.fileType !== 'video') return null;

    const src = asset.thumbnailUrl || asset.previewUrl || resolvedUrl;
    if (!src) return null;

    return (
        <div ref={ref} style={{ flexShrink: 0, width: '100%', height: 'auto', aspectRatio: '1/1' }}>
            <ViewerThumbnail
                src={src}
                alt={asset.fileName}
                selected={isSelected}
                onClick={() => onSelect(index)}
            />
        </div>
    );
};
