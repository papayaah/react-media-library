import { useState, useEffect, useCallback, useRef } from 'react';
import {
    initDB,
    listAssetsFromDB,
    deleteAssetFromDB,
    getFileFromOpfs,
    deleteFileFromOpfs,
    importFileToLibrary,
    updateAssetInDB,
    addAssetToDB,
    saveFileToOpfs,
} from '../services/storage';
import { MediaSyncService } from '../services/sync';
import { MediaAIGenerateRequest, MediaAIGenerator, MediaAsset, MediaPexelsProvider, PexelsImage, MediaFreepikProvider, FreepikContent, MediaSyncConfig } from '../types';

export const useMediaLibrary = (options?: {
    ai?: MediaAIGenerator;
    pexels?: MediaPexelsProvider;
    freepik?: MediaFreepikProvider;
    sync?: MediaSyncConfig;
}) => {
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

    // Freepik state
    const [freepikContent, setFreepikContent] = useState<FreepikContent[]>([]);
    const [freepikLoading, setFreepikLoading] = useState(false);
    const [freepikSelected, setFreepikSelected] = useState<Set<string>>(new Set());
    const [freepikImporting, setFreepikImporting] = useState(false);
    const [freepikSearchQuery, setFreepikSearchQuery] = useState('');
    const [freepikOrder, setFreepikOrder] = useState<'relevance' | 'popularity' | 'date'>('relevance');

    const assetsRef = useRef<MediaAsset[]>([]);
    const setAssetsTracked = useCallback((updater: MediaAsset[] | ((prev: MediaAsset[]) => MediaAsset[])) => {
        setAssets((prev) => {
            const next = typeof updater === 'function' ? (updater as (p: MediaAsset[]) => MediaAsset[])(prev) : updater;
            assetsRef.current = next;
            return next;
        });
    }, []);

    // Sync service instance (created once if sync config provided)
    const syncServiceRef = useRef<MediaSyncService | null>(null);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
    const hasPulledCloudAssets = useRef(false);

    // Initialize sync service
    useEffect(() => {
        if (options?.sync && !syncServiceRef.current) {
            syncServiceRef.current = new MediaSyncService({
                apiBaseUrl: options.sync.apiBaseUrl,
                getUserId: options.sync.getUserId,
                autoSync: options.sync.autoSync ?? true,
                syncInterval: options.sync.syncInterval ?? 30000,
            });
        }

        return () => {
            if (syncServiceRef.current) {
                syncServiceRef.current.stopAutoSync();
            }
        };
    }, [options?.sync]);

    // Helper to upload asset to server (background, non-blocking)
    const syncAssetToServer = useCallback(async (asset: MediaAsset) => {
        const syncService = syncServiceRef.current;
        if (!syncService || !options?.sync) return;

        try {
            const userId = await options.sync.getUserId();
            if (!userId) return; // Not authenticated, skip sync

            setSyncStatus('syncing');
            options.sync.onSyncStatusChange?.('syncing');

            const syncedAsset = await syncService.uploadAsset(asset);

            // Update asset in IndexedDB with cloud fields
            if (syncedAsset.id) {
                await updateAssetInDB(syncedAsset.id, {
                    cloudId: syncedAsset.cloudId,
                    cloudUrl: syncedAsset.cloudUrl,
                    userId: syncedAsset.userId,
                    syncStatus: syncedAsset.syncStatus,
                    syncedAt: syncedAsset.syncedAt,
                    syncError: syncedAsset.syncError,
                });

                // Update in-memory state
                setAssetsTracked((prev) =>
                    prev.map((a) => (a.id === syncedAsset.id ? { ...a, ...syncedAsset } : a))
                );
            }

            setSyncStatus('synced');
            options.sync.onSyncStatusChange?.('synced');
        } catch (err) {
            console.error('[MediaLibrary] Sync error:', err);
            setSyncStatus('error');
            options.sync.onSyncStatusChange?.('error');
            options.sync.onSyncError?.(err instanceof Error ? err : new Error(String(err)));
        }
    }, [options?.sync, setAssetsTracked]);

    // Pull cloud assets on login (merge with local, download files to OPFS, sync deletions)
    const pullCloudAssets = useCallback(async () => {
        const syncService = syncServiceRef.current;
        if (!syncService || !options?.sync || hasPulledCloudAssets.current) return;

        try {
            const userId = await options.sync.getUserId();
            if (!userId) return; // Not authenticated, skip

            hasPulledCloudAssets.current = true;

            const result = await syncService.pullCloudAssets(
                // Get local assets
                async () => listAssetsFromDB(),
                // Add cloud asset to local DB (download file to OPFS)
                async (cloudAsset: MediaAsset) => {
                    try {
                        // Download file from server
                        const file = await syncService.downloadAssetFile(cloudAsset);
                        if (!file) {
                            console.warn('[MediaLibrary] Failed to download file for asset:', cloudAsset.cloudId);
                            return;
                        }

                        // Save to OPFS
                        const handleName = await saveFileToOpfs(file, undefined, { nameHint: cloudAsset.fileName });

                        // Save to IndexedDB with local handle
                        const localAsset: Omit<MediaAsset, 'id'> = {
                            ...cloudAsset,
                            handleName,
                            syncStatus: 'synced',
                            syncedAt: Date.now(),
                        };
                        const id = await addAssetToDB(localAsset);

                        // Generate preview URL
                        let previewUrl: string | undefined;
                        if (cloudAsset.fileType === 'image') {
                            previewUrl = URL.createObjectURL(file);
                        }

                        // Add to in-memory state
                        setAssetsTracked((prev) => [{ ...localAsset, id, previewUrl }, ...prev]);
                    } catch (err) {
                        console.error('[MediaLibrary] Failed to add cloud asset locally:', err);
                    }
                },
                // Remove local asset that was deleted on server (sync deletions)
                async (deletedAsset: MediaAsset) => {
                    try {
                        // Delete from local storage (IndexedDB + OPFS)
                        if (deletedAsset.id) {
                            await deleteAssetFromDB(deletedAsset.id);
                        }
                        await deleteFileFromOpfs(deletedAsset.handleName);
                        if (deletedAsset.thumbnailHandleName) {
                            await deleteFileFromOpfs(deletedAsset.thumbnailHandleName);
                        }
                        if (deletedAsset.previewUrl) {
                            URL.revokeObjectURL(deletedAsset.previewUrl);
                        }

                        // Remove from in-memory state
                        setAssetsTracked((prev) => prev.filter((a) => a.id !== deletedAsset.id));
                        console.log('[MediaLibrary] Removed locally deleted asset:', deletedAsset.cloudId, deletedAsset.fileName);
                    } catch (err) {
                        console.error('[MediaLibrary] Failed to remove deleted asset:', err);
                    }
                }
            );

            if (result.added > 0 || result.removed > 0) {
                console.log(`[MediaLibrary] Sync complete: ${result.added} added, ${result.removed} removed`);
            }
        } catch (err) {
            console.error('[MediaLibrary] Pull cloud assets error:', err);
        }
    }, [options?.sync, setAssetsTracked]);

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
        const init = async () => {
            await loadAssets();
            // After local assets are loaded, pull cloud assets if authenticated
            pullCloudAssets().catch((err) => {
                console.error('[MediaLibrary] Failed to pull cloud assets:', err);
            });
        };
        init();
        return () => {
            // Cleanup object URLs
            assetsRef.current.forEach((asset) => {
                if (asset.previewUrl) {
                    URL.revokeObjectURL(asset.previewUrl);
                }
            });
        };
    }, [loadAssets, pullCloudAssets]);

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

                // Background sync to server (non-blocking)
                if (syncServiceRef.current && options?.sync) {
                    syncAssetToServer(newAsset).catch((err) => {
                        console.error('[MediaLibrary] Background sync failed:', err);
                    });
                }
            }
        } catch (err) {
            setError('Failed to upload files.');
        } finally {
            setUploading(false);
            setPendingUploads(0);
        }
    }, [setAssetsTracked, syncAssetToServer, options?.sync]);

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
            // Delete from local storage (IndexedDB + OPFS)
            await deleteAssetFromDB(asset.id);
            await deleteFileFromOpfs(asset.handleName);
            if (asset.thumbnailHandleName) {
                await deleteFileFromOpfs(asset.thumbnailHandleName);
            }
            if (asset.previewUrl) {
                URL.revokeObjectURL(asset.previewUrl);
            }
            setAssetsTracked((prev) => prev.filter((a) => a.id !== asset.id));

            // If user is logged in and asset is synced to server, delete from server too
            const syncService = syncServiceRef.current;
            if (syncService && asset.cloudId) {
                try {
                    await syncService.deleteAsset(asset.cloudId);
                } catch (serverErr) {
                    // Log but don't fail - local deletion succeeded
                    console.error('[MediaLibrary] Failed to delete from server:', serverErr);
                }
            }
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

    // Freepik methods
    const searchFreepikIcons = useCallback(async () => {
        const freepik = options?.freepik;
        if (!freepik) return;

        setFreepikLoading(true);
        try {
            const results = await freepik.searchIcons({
                query: freepikSearchQuery || undefined,
                order: freepikOrder,
            });
            setFreepikContent(results);
        } catch (err) {
            setError('Failed to search Freepik icons.');
        } finally {
            setFreepikLoading(false);
        }
    }, [options?.freepik, freepikSearchQuery, freepikOrder]);

    const toggleFreepikSelect = useCallback((id: string) => {
        setFreepikSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAllFreepik = useCallback(() => {
        setFreepikSelected(new Set(freepikContent.map((c) => c.id)));
    }, [freepikContent]);

    const deselectAllFreepik = useCallback(() => {
        setFreepikSelected(new Set());
    }, []);

    const importFreepikContent = useCallback(async () => {
        const freepik = options?.freepik;
        if (freepikSelected.size === 0 || !freepik) return;

        setFreepikImporting(true);
        try {
            const files: File[] = [];
            for (const id of Array.from(freepikSelected)) {
                const content = freepikContent.find((c) => c.id === id);
                if (!content) continue;
                // Download SVG by default (no pngSize) for better quality and scalability
                const file = await freepik.downloadContent(content);
                files.push(file);
            }
            await uploadFiles(files);
            setFreepikSelected(new Set());
        } catch (err) {
            setError('Failed to import Freepik content.');
        } finally {
            setFreepikImporting(false);
        }
    }, [freepikSelected, freepikContent, options?.freepik, uploadFiles]);

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
        // Freepik
        freepikAvailable: Boolean(options?.freepik),
        freepikContent,
        freepikLoading,
        freepikSelected,
        freepikImporting,
        freepikSearchQuery,
        setFreepikSearchQuery,
        freepikOrder,
        setFreepikOrder,
        searchFreepikIcons,
        toggleFreepikSelect,
        selectAllFreepik,
        deselectAllFreepik,
        importFreepikContent,
        deleteAsset,
        refresh: loadAssets,
        // Sync
        syncAvailable: Boolean(options?.sync),
        syncStatus,
    };
};
