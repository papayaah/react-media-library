import React, { useState, useEffect, useCallback } from 'react';
import { MediaAsset, ComponentPreset } from '../types';
import { Trash2, X, Check, Crop } from 'lucide-react';
import { ImageEditor } from './ImageEditor';

interface MediaViewerProps {
    isOpen: boolean;
    onClose: () => void;
    initialAssetId: number | null;
    assets: MediaAsset[];
    preset: ComponentPreset;
    onDelete: (asset: MediaAsset) => Promise<void>;
    onSave?: (files: File[]) => Promise<void>;
    readonly?: boolean;
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
            console.error('Failed to save cropped image:', error);
        }
    };

    return (
        <Viewer
            isOpen={isOpen}
            onClose={onClose}
            main={
                isEditing && currentAsset.fileType === 'image' && currentAsset.previewUrl ? (
                    <div style={{ width: '100%', height: '100%' }}>
                        <ImageEditor
                            src={currentAsset.previewUrl}
                            onSave={handleSaveCrop}
                            onCancel={() => setIsEditing(false)}
                        />
                    </div>
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {currentAsset.fileType === 'image' && currentAsset.previewUrl ? (
                            <Image
                                src={currentAsset.previewUrl}
                                alt={currentAsset.fileName}
                                className="max-h-full max-w-full object-contain"
                            />
                        ) : (
                            <div className="text-white text-xl">{currentAsset.fileName}</div>
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
                    ))}
                </div>
            }
            actions={
                !isEditing && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {!readonly && currentAsset.fileType === 'image' && (
                            <Button variant="secondary" onClick={() => setIsEditing(true)} size="sm">
                                <Crop size={18} />
                            </Button>
                        )}

                        {!readonly && (
                            isDeleteConfirming ? (
                                <>
                                    <Button variant="secondary" onClick={() => setIsDeleteConfirming(false)} size="sm">
                                        <X size={18} />
                                    </Button>
                                    <Button variant="danger" onClick={handleDeleteClick} size="sm">
                                        <Check size={18} />
                                    </Button>
                                </>
                            ) : (
                                <Button variant="secondary" onClick={() => setIsDeleteConfirming(true)} size="sm">
                                    <Trash2 size={18} />
                                </Button>
                            )
                        )}

                        {!readonly && <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />}

                        <Button variant="secondary" onClick={onClose} size="sm">
                            <X size={18} />
                        </Button>
                    </div>
                )
            }
        />
    );
};
