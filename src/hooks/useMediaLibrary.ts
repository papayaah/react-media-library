import { useState, useEffect, useCallback } from 'react';
import {
    initDB,
    listAssetsFromDB,
    addAssetToDB,
    deleteAssetFromDB,
    saveFileToOpfs,
    getFileFromOpfs,
    deleteFileFromOpfs,
    getAssetType,
} from '../services/storage';
import { MediaAsset } from '../types';

export const useMediaLibrary = () => {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pendingUploads, setPendingUploads] = useState(0);

    const loadAssets = useCallback(async () => {
        setLoading(true);
        try {
            await initDB();
            const storedAssets = await listAssetsFromDB();
            // Reverse to show newest first
            const reversedAssets = storedAssets.reverse();

            // Generate preview URLs for images
            const assetsWithPreviews = await Promise.all(
                reversedAssets.map(async (asset) => {
                    if (asset.fileType === 'image') {
                        const file = await getFileFromOpfs(asset.handleName);
                        if (file) {
                            return { ...asset, previewUrl: URL.createObjectURL(file) };
                        }
                    }
                    return asset;
                })
            );

            setAssets(assetsWithPreviews);
        } catch (err) {
            console.error('Failed to load assets:', err);
            setError('Failed to load media library.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAssets();
        return () => {
            // Cleanup object URLs
            assets.forEach((asset) => {
                if (asset.previewUrl) {
                    URL.revokeObjectURL(asset.previewUrl);
                }
            });
        };
    }, []);

    const uploadFiles = useCallback(async (files: File[]) => {
        setUploading(true);
        setPendingUploads(files.length);
        setError(null);
        try {
            for (const file of files) {
                const handleName = await saveFileToOpfs(file);
                const asset: Omit<MediaAsset, 'id'> = {
                    handleName,
                    fileName: file.name,
                    fileType: getAssetType(file.type),
                    mimeType: file.type,
                    size: file.size,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                const id = await addAssetToDB(asset);

                let previewUrl: string | undefined;
                if (asset.fileType === 'image') {
                    previewUrl = URL.createObjectURL(file);
                }

                const newAsset = { ...asset, id, previewUrl };

                setAssets((prev) => [newAsset, ...prev]);
                setPendingUploads((prev) => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError('Failed to upload files.');
        } finally {
            setUploading(false);
            setPendingUploads(0);
        }
    }, []);

    const deleteAsset = useCallback(async (asset: MediaAsset) => {
        if (!asset.id) return;
        try {
            await deleteAssetFromDB(asset.id);
            await deleteFileFromOpfs(asset.handleName);
            if (asset.previewUrl) {
                URL.revokeObjectURL(asset.previewUrl);
            }
            setAssets((prev) => prev.filter((a) => a.id !== asset.id));
        } catch (err) {
            console.error('Delete failed:', err);
            setError('Failed to delete asset.');
        }
    }, []);

    return {
        assets,
        loading,
        uploading,
        pendingUploads,
        error,
        uploadFiles,
        deleteAsset,
        refresh: loadAssets,
    };
};
