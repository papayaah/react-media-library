import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { MediaAsset, ComponentPreset, MediaGridIcons } from '../types';
import { renderIcon } from '../utils/renderIcon';

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

    const { Viewer, ViewerThumbnail, Image, Button } = preset;

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
    }, [isOpen, initialAssetId, assets]);

    const handleNext = useCallback(() => {
        if (currentIndex < assets.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setIsDeleteConfirming(false);
            setIsEditing(false);
        }
    }, [currentIndex, assets.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setIsDeleteConfirming(false);
            setIsEditing(false);
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

    if (!isOpen || currentIndex === -1) return null;

    const currentAsset = assets[currentIndex];

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
            // We'll append '_edited' to the filename to avoid conflicts or clarify it's a new version
            // If the user wants to overwrite, we'd need a different logic, but usually safe to create new
            const fileName = currentAsset.fileName.replace(/(\.[\w\d_-]+)$/i, '_edited$1');
            const file = new File([blob], fileName, { type: blob.type });

            // Upload the new file
            await onSave([file]);

            // Close editor and viewer
            setIsEditing(false);
            onClose();
        } catch (error) {
            // Silently fail - error handling can be added by parent component if needed
        }
    };

    return (
        <Viewer
            isOpen={isOpen}
            onClose={onClose}
            main={
                isEditing && currentAsset.fileType === 'image' && currentAsset.previewUrl ? (
                    <div style={{ width: '100%', height: '100%' }}>
                        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#000000', color: '#ffffff' }}>Loading editor...</div>}>
                            <ImageEditor
                                src={currentAsset.previewUrl}
                                onSave={handleSaveCrop}
                                onCancel={() => setIsEditing(false)}
                                icons={icons}
                            />
                        </Suspense>
                    </div>
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {currentAsset.fileType === 'image' && currentAsset.previewUrl ? (
                            <Image
                                src={currentAsset.previewUrl}
                                alt={currentAsset.fileName}
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                loading="eager"
                                decoding="async"
                            />
                        ) : currentAsset.fileType === 'video' && currentAsset.previewUrl ? (
                            <video
                                src={currentAsset.previewUrl}
                                controls
                                autoPlay
                                style={{ maxHeight: '100%', maxWidth: '100%', outline: 'none' }}
                            />
                        ) : (
                            <div style={{ color: '#ffffff', fontSize: '1.25rem' }}>{currentAsset.fileName}</div>
                        )}
                    </div>
                )
            }
            sidebar={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', height: '100%', overflowY: 'auto' }}>
                    {assets.map((asset, index) => (
                        asset.fileType === 'image' && asset.previewUrl ? (
                            <ViewerThumbnail
                                key={asset.id}
                                src={asset.previewUrl}
                                alt={asset.fileName}
                                selected={index === currentIndex}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setIsDeleteConfirming(false);
                                    setIsEditing(false);
                                }}
                            />
                        ) : null
                    )).filter(Boolean)}
                </div>
            }
            actions={
                !isEditing && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {!readonly && currentAsset.fileType === 'image' && (
                            <Button variant="secondary" onClick={() => setIsEditing(true)} size="sm" aria-label="Crop">
                                {renderIcon(icons?.crop, 18, undefined, 'Crop')}
                            </Button>
                        )}

                        {!readonly && (
                            isDeleteConfirming ? (
                                <>
                                    <Button variant="secondary" onClick={() => setIsDeleteConfirming(false)} size="sm" aria-label="Cancel">
                                        {renderIcon(icons?.x, 18, undefined, 'Cancel')}
                                    </Button>
                                    <Button variant="danger" onClick={handleDeleteClick} size="sm" aria-label="Confirm Delete">
                                        {renderIcon(icons?.check, 18, undefined, 'Confirm')}
                                    </Button>
                                </>
                            ) : (
                                <Button variant="secondary" onClick={() => setIsDeleteConfirming(true)} size="sm" aria-label="Delete">
                                    {renderIcon(icons?.trash, 18, undefined, 'Delete')}
                                </Button>
                            )
                        )}

                        {!readonly && <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />}

                        <Button variant="secondary" onClick={onClose} size="sm" aria-label="Close">
                            {renderIcon(icons?.x, 18, undefined, 'Close')}
                        </Button>
                    </div>
                )
            }
        />
    );
};
