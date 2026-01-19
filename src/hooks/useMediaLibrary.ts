import { useState, useEffect, useCallback, useRef } from 'react';
import {
    initDB,
    listAssetsFromDB,
    deleteAssetFromDB,
    getFileFromOpfs,
    deleteFileFromOpfs,
    importFileToLibrary,
} from '../services/storage';
import { MediaAIGenerateRequest, MediaAIGenerator, MediaAsset, MediaPexelsProvider, PexelsImage } from '../types';

export const useMediaLibrary = (options?: { ai?: MediaAIGenerator; pexels?: MediaPexelsProvider }) => {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pendingUploads, setPendingUploads] = useState(0);

    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const [pexelsImages, setPexelsImages] = useState<PexelsImage[]>([]);
    const [pexelsLoading, setPexelsLoading] = useState(false);
    const [pexelsSelected, setPexelsSelected] = useState<Set<string>>(new Set());
    const [pexelsImporting, setPexelsImporting] = useState(false);

    const assetsRef = useRef<MediaAsset[]>([]);
    const setAssetsTracked = useCallback((updater: MediaAsset[] | ((prev: MediaAsset[]) => MediaAsset[])) => {
        setAssets((prev) => {
            const next = typeof updater === 'function' ? (updater as (p: MediaAsset[]) => MediaAsset[])(prev) : updater;
            assetsRef.current = next;
            return next;
        });
    }, []);

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
                        const file = asset.thumbnailHandleName
                            ? await getFileFromOpfs(asset.thumbnailHandleName)
                            : await getFileFromOpfs(asset.handleName);
                        if (file) {
                            return { ...asset, previewUrl: URL.createObjectURL(file) };
                        }
                    }
                    return asset;
                })
            );

            // Cleanup old object URLs to avoid leaks when reloading list
            assetsRef.current.forEach((a) => {
                if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
            });
            setAssetsTracked(assetsWithPreviews);
        } catch (err) {
            setError('Failed to load media library.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAssets();
        return () => {
            // Cleanup object URLs
            assetsRef.current.forEach((asset) => {
                if (asset.previewUrl) {
                    URL.revokeObjectURL(asset.previewUrl);
                }
            });
        };
    }, [loadAssets]);

    const uploadFiles = useCallback(async (files: File[]) => {
        setUploading(true);
        setPendingUploads(files.length);
        setError(null);
        try {
            for (const file of files) {
                const id = await importFileToLibrary(file);
                const db = await initDB();
                const stored = await db.get('assets', id);

                let previewUrl: string | undefined;
                if (stored?.fileType === 'image') {
                    const previewFile = stored.thumbnailHandleName
                        ? await getFileFromOpfs(stored.thumbnailHandleName)
                        : await getFileFromOpfs(stored.handleName);
                    if (previewFile) {
                        previewUrl = URL.createObjectURL(previewFile);
                    }
                }

                const newAsset = stored
                    ? { ...stored, id, previewUrl }
                    : ({
                        id,
                        handleName: '',
                        fileName: file.name,
                        fileType: 'other',
                        mimeType: file.type,
                        size: file.size,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        previewUrl,
                    } as MediaAsset);

                setAssetsTracked((prev) => [newAsset, ...prev]);
                setPendingUploads((prev) => Math.max(0, prev - 1));
            }
        } catch (err) {
            setError('Failed to upload files.');
        } finally {
            setUploading(false);
            setPendingUploads(0);
        }
    }, [setAssetsTracked]);

    const generateImages = useCallback(async (req: MediaAIGenerateRequest) => {
        const ai = options?.ai;
        if (!ai) {
            setAiError('AI generation is not configured.');
            return;
        }

        setAiGenerating(true);
        setAiError(null);
        try {
            const results = await ai.generateImages(req);
            const files = results.map((r) => r.file).filter(Boolean);
            if (files.length === 0) {
                setAiError('No images were generated.');
                return;
            }
            await uploadFiles(files);
        } catch {
            setAiError('AI generation failed.');
        } finally {
            setAiGenerating(false);
        }
    }, [options?.ai, uploadFiles]);

    const deleteAsset = useCallback(async (asset: MediaAsset) => {
        if (!asset.id) return;
        try {
            await deleteAssetFromDB(asset.id);
            await deleteFileFromOpfs(asset.handleName);
            if (asset.thumbnailHandleName) {
                await deleteFileFromOpfs(asset.thumbnailHandleName);
            }
            if (asset.previewUrl) {
                URL.revokeObjectURL(asset.previewUrl);
            }
            setAssetsTracked((prev) => prev.filter((a) => a.id !== asset.id));
        } catch (err) {
            setError('Failed to delete asset.');
        }
    }, [setAssetsTracked]);

    const fetchPexelsImages = useCallback(async () => {
        const pexels = options?.pexels;
        if (!pexels) return;

        setPexelsLoading(true);
        try {
            const images = await pexels.fetchImages();
            setPexelsImages(images);
        } catch (err) {
            setError('Failed to load Pexels images.');
        } finally {
            setPexelsLoading(false);
        }
    }, [options?.pexels]);

    const togglePexelsSelect = useCallback((url: string) => {
        setPexelsSelected((prev) => {
            const next = new Set(prev);
            if (next.has(url)) {
                next.delete(url);
            } else {
                next.add(url);
            }
            return next;
        });
    }, []);

    const selectAllPexels = useCallback(() => {
        setPexelsSelected(new Set(pexelsImages.map((img) => img.url)));
    }, [pexelsImages]);

    const deselectAllPexels = useCallback(() => {
        setPexelsSelected(new Set());
    }, []);

    const importPexelsImages = useCallback(async () => {
        if (pexelsSelected.size === 0) return;

        setPexelsImporting(true);
        try {
            const files: File[] = [];
            for (const url of Array.from(pexelsSelected)) {
                const res = await fetch(url);
                const blob = await res.blob();
                const fileName = url.split('/').pop() || 'image.jpg';
                const file = new File([blob], fileName, { type: blob.type });
                files.push(file);
            }
            await uploadFiles(files);
            setPexelsSelected(new Set());
        } catch (err) {
            setError('Failed to import Pexels images.');
        } finally {
            setPexelsImporting(false);
        }
    }, [pexelsSelected, uploadFiles]);

    return {
        assets,
        loading,
        uploading,
        pendingUploads,
        error,
        uploadFiles,
        aiAvailable: Boolean(options?.ai),
        aiGenerating,
        aiError,
        generateImages,
        pexelsAvailable: Boolean(options?.pexels),
        pexelsImages,
        pexelsLoading,
        pexelsSelected,
        pexelsImporting,
        fetchPexelsImages,
        togglePexelsSelect,
        selectAllPexels,
        deselectAllPexels,
        importPexelsImages,
        deleteAsset,
        refresh: loadAssets,
    };
};
