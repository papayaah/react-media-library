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
} from '../services/storage';
import { MediaSyncService } from '../services/sync';
import { MediaAIGenerateRequest, MediaAIGenerator, MediaAsset, MediaPexelsProvider, PexelsImage, MediaFreepikProvider, FreepikContent, MediaSyncConfig, MediaLibraryAssetsProvider, LibraryAssetCategory, LibraryAsset } from '../types';

export const useMediaLibrary = (options?: {
    ai?: MediaAIGenerator;
    pexels?: MediaPexelsProvider;
    freepik?: MediaFreepikProvider;
    library?: MediaLibraryAssetsProvider;
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

    // Library state
    const [libraryCategories, setLibraryCategories] = useState<LibraryAssetCategory[]>([]);
    const [libraryAssets, setLibraryAssets] = useState<LibraryAsset[]>([]);
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [librarySelectedCategory, setLibrarySelectedCategory] = useState<string | null>(null);
    const [librarySelected, setLibrarySelected] = useState<Set<string>>(new Set());
    const [libraryImporting, setLibraryImporting] = useState(false);

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

    // Flag to suppress loadAssets during cloud pull (prevents flicker from per-asset event dispatch)
    const isPullingCloudAssetsRef = useRef(false);

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
            // Suppress loadAssets during pull to prevent per-asset event-driven reloads
            isPullingCloudAssetsRef.current = true;

            // Collect assets for batch state update (avoids N re-renders during pull)
            const newCloudAssets: MediaAsset[] = [];
            const removedAssetIds: number[] = [];

            const result = await syncService.pullCloudAssets(
                // Get local assets
                async () => listAssetsFromDB(),
                // Add cloud asset to local DB (lazy download - don't hit server for blob yet)
                async (cloudAsset: MediaAsset) => {
                    try {
                        // Save metadata to IndexedDB immediately without downloading file
                        const id = await addAssetToDB(cloudAsset);

                        // If it's an image/video, we can use the cloudUrl for an immediate preview
                        let previewUrl: string | undefined;
                        if (cloudAsset.cloudUrl && (cloudAsset.fileType === 'image' || cloudAsset.fileType === 'video')) {
                            previewUrl = cloudAsset.cloudUrl.startsWith('http') || cloudAsset.cloudUrl.startsWith('/')
                                ? cloudAsset.cloudUrl
                                : `${options?.sync?.apiBaseUrl || ''}/api/media/files/${cloudAsset.cloudUrl}`;
                        }

                        // Collect for batch state update instead of updating per-asset
                        newCloudAssets.push({ ...cloudAsset, id, previewUrl });
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
                            removedAssetIds.push(deletedAsset.id);
                        }
                        await deleteFileFromOpfs(deletedAsset.handleName);
                        if (deletedAsset.thumbnailHandleName) {
                            await deleteFileFromOpfs(deletedAsset.thumbnailHandleName);
                        }
                        if (deletedAsset.previewUrl) {
                            URL.revokeObjectURL(deletedAsset.previewUrl);
                        }
                    } catch (err) {
                        console.error('[MediaLibrary] Failed to remove deleted asset:', err);
                    }
                }
            );

            // Single batch state update — one render instead of N
            if (newCloudAssets.length > 0 || removedAssetIds.length > 0) {
                setAssetsTracked((prev) => {
                    let next = prev;
                    if (removedAssetIds.length > 0) {
                        const removedSet = new Set(removedAssetIds);
                        next = next.filter((a) => !removedSet.has(a.id!));
                    }
                    if (newCloudAssets.length > 0) {
                        next = [...newCloudAssets, ...next];
                    }
                    return next;
                });
            }

            isPullingCloudAssetsRef.current = false;

            if (result.added > 0 || result.removed > 0) {
                console.log(`[MediaLibrary] Sync complete: ${result.added} added, ${result.removed} removed`);
            }
        } catch (err) {
            isPullingCloudAssetsRef.current = false;
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

            // Generate preview URLs for images and anything with a thumbnail
            const assetsWithPreviews = await Promise.all(
                reversedAssets.map(async (asset) => {
                    const hasThumbnail = !!asset.thumbnailHandleName;
                    const isMedia = asset.fileType === 'image' || asset.fileType === 'video';

                    // Fallback for incorrectly typed assets
                    let shouldTryPreview = hasThumbnail || isMedia;
                    if (!shouldTryPreview && asset.fileType === 'other' && asset.fileName) {
                        const ext = asset.fileName.split('.').pop()?.toLowerCase();
                        const mediaExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'heic', 'heif', 'mp4', 'webm', 'mov'];
                        if (ext && mediaExts.includes(ext)) {
                            shouldTryPreview = true;
                        }
                    }

                    if (shouldTryPreview) {
                        const thumbFile = asset.thumbnailHandleName ? await getFileFromOpfs(asset.thumbnailHandleName) : null;
                        const mainFile = asset.handleName ? await getFileFromOpfs(asset.handleName) : null;

                        let previewUrl = asset.previewUrl;
                        let fullUrl = asset.fullUrl;
                        let thumbnailUrl = asset.thumbnailUrl;

                        // 1. Handle local files (OPFS)
                        if (thumbFile) {
                            thumbnailUrl = URL.createObjectURL(thumbFile);
                            previewUrl = thumbnailUrl; // Default preview to thumb for fast loading
                        }

                        if (mainFile) {
                            fullUrl = URL.createObjectURL(mainFile);
                            if (!previewUrl) previewUrl = fullUrl; // Fallback if no thumb
                        }

                        // 2. Handle cloud fallbacks (Mirror)
                        if (asset.cloudUrl) {
                            const cloudBaseUrl = options?.sync?.apiBaseUrl || '';
                            const cloudFileUrl = asset.cloudUrl.startsWith('http') || asset.cloudUrl.startsWith('/')
                                ? asset.cloudUrl
                                : `${cloudBaseUrl}/api/media/files/${asset.cloudUrl}`;

                            if (!fullUrl) fullUrl = cloudFileUrl;
                            if (!previewUrl) previewUrl = cloudFileUrl;
                            if (!thumbnailUrl) thumbnailUrl = cloudFileUrl;
                        }

                        return { ...asset, previewUrl, fullUrl, thumbnailUrl };
                    }
                    return asset;
                })
            );

            // Cleanup old blob: object URLs to avoid leaks when reloading list
            assetsRef.current.forEach((a) => {
                if (a.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(a.previewUrl);
                if (a.fullUrl?.startsWith('blob:')) URL.revokeObjectURL(a.fullUrl);
                if (a.thumbnailUrl?.startsWith('blob:')) URL.revokeObjectURL(a.thumbnailUrl);
            });
            setAssetsTracked(assetsWithPreviews);
        } catch (err) {
            setError('Failed to load media library.');
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const init = async () => {
            await loadAssets();
            // After local assets are loaded, pull cloud assets if authenticated
            pullCloudAssets().catch((err) => {
                console.error('[MediaLibrary] Failed to pull cloud assets:', err);
            });
        };
        init();

        const handleUpdate = () => {
            // Suppress during cloud pull — pull already manages state in a single batch
            if (isPullingCloudAssetsRef.current) return;
            if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = setTimeout(() => {
                loadAssets();
            }, 100);
        };

        window.addEventListener('media-library-updated', handleUpdate);

        return () => {
            window.removeEventListener('media-library-updated', handleUpdate);
            if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
            // Cleanup blob: object URLs only
            assetsRef.current.forEach((asset) => {
                if (asset.previewUrl && asset.previewUrl.startsWith('blob:')) {
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
                let fullUrl: string | undefined;
                let thumbnailUrl: string | undefined;

                const isMedia = stored?.fileType === 'image' || stored?.fileType === 'video';
                if (isMedia || stored?.thumbnailHandleName) {
                    const thumbFile = stored?.thumbnailHandleName ? await getFileFromOpfs(stored.thumbnailHandleName) : null;
                    const mainFile = stored?.handleName ? await getFileFromOpfs(stored.handleName) : null;

                    if (thumbFile) {
                        thumbnailUrl = URL.createObjectURL(thumbFile);
                        previewUrl = thumbnailUrl;
                    }
                    if (mainFile) {
                        fullUrl = URL.createObjectURL(mainFile);
                        if (!previewUrl) previewUrl = fullUrl;
                    }
                }

                const newAsset = stored
                    ? { ...stored, id, previewUrl, fullUrl, thumbnailUrl }
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
                        fullUrl,
                        thumbnailUrl,
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
            if (asset.handleName) {
                await deleteFileFromOpfs(asset.handleName);
            }
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

    // Library methods
    const fetchLibraryCategories = useCallback(async () => {
        const library = options?.library;
        if (!library) return;
        setLibraryLoading(true);
        try {
            const categories = await library.getCategories();
            setLibraryCategories(categories);
        } catch (err) {
            setError('Failed to load library categories.');
        } finally {
            setLibraryLoading(false);
        }
    }, [options?.library]);

    const fetchLibraryAssets = useCallback(async (categoryId: string) => {
        const library = options?.library;
        if (!library) return;
        setLibraryLoading(true);
        setLibrarySelectedCategory(categoryId);
        try {
            const result = await library.getAssets(categoryId);
            setLibraryAssets(result);
        } catch (err) {
            setError('Failed to load library assets.');
        } finally {
            setLibraryLoading(false);
        }
    }, [options?.library]);

    const libraryBack = useCallback(() => {
        setLibrarySelectedCategory(null);
        setLibraryAssets([]);
        setLibrarySelected(new Set());
    }, []);

    const toggleLibrarySelect = useCallback((id: string) => {
        setLibrarySelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAllLibrary = useCallback(() => {
        setLibrarySelected(new Set(libraryAssets.map((a) => a.id)));
    }, [libraryAssets]);

    const deselectAllLibrary = useCallback(() => {
        setLibrarySelected(new Set());
    }, []);

    // Import a single library asset and return the resulting MediaAsset (with numeric id).
    // Used for click-to-apply: user clicks a library thumbnail → auto-import → apply to frame.
    const importSingleLibraryAsset = useCallback(async (assetId: string): Promise<MediaAsset | null> => {
        const library = options?.library;
        if (!library) return null;
        const asset = libraryAssets.find((a) => a.id === assetId);
        if (!asset) return null;
        try {
            const file = await library.downloadAsset(asset);
            const id = await importFileToLibrary(file);
            const db = await initDB();
            const stored = await db.get('assets', id);

            let previewUrl: string | undefined;
            let fullUrl: string | undefined;
            let thumbnailUrl: string | undefined;

            const isMedia = stored?.fileType === 'image' || stored?.fileType === 'video';
            if (isMedia || stored?.thumbnailHandleName) {
                const thumbFile = stored?.thumbnailHandleName ? await getFileFromOpfs(stored.thumbnailHandleName) : null;
                const mainFile = stored?.handleName ? await getFileFromOpfs(stored.handleName) : null;
                if (thumbFile) {
                    thumbnailUrl = URL.createObjectURL(thumbFile);
                    previewUrl = thumbnailUrl;
                }
                if (mainFile) {
                    fullUrl = URL.createObjectURL(mainFile);
                    if (!previewUrl) previewUrl = fullUrl;
                }
            }

            const newAsset: MediaAsset = stored
                ? { ...stored, id, previewUrl, fullUrl, thumbnailUrl }
                : {
                    id,
                    handleName: '',
                    fileName: file.name,
                    fileType: 'image',
                    mimeType: file.type,
                    size: file.size,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    previewUrl,
                    fullUrl,
                    thumbnailUrl,
                } as MediaAsset;

            setAssetsTracked((prev) => [newAsset, ...prev]);

            // Background sync
            if (syncServiceRef.current && options?.sync) {
                syncAssetToServer(newAsset).catch(() => {});
            }

            return newAsset;
        } catch {
            return null;
        }
    }, [libraryAssets, options?.library, options?.sync, setAssetsTracked, syncAssetToServer]);

    const importLibraryAssets = useCallback(async () => {
        const library = options?.library;
        if (librarySelected.size === 0 || !library) return;
        setLibraryImporting(true);
        try {
            const files: File[] = [];
            const ids = Array.from(librarySelected);
            for (let i = 0; i < ids.length; i++) {
                const asset = libraryAssets.find((a) => a.id === ids[i]);
                if (!asset) continue;
                const file = await library.downloadAsset(asset);
                files.push(file);
            }
            await uploadFiles(files);
            setLibrarySelected(new Set());
        } catch (err) {
            setError('Failed to import library assets.');
        } finally {
            setLibraryImporting(false);
        }
    }, [librarySelected, libraryAssets, options?.library, uploadFiles]);

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
        // Library
        libraryAvailable: Boolean(options?.library),
        libraryCategories,
        libraryAssets,
        libraryLoading,
        librarySelectedCategory,
        librarySelected,
        libraryImporting,
        fetchLibraryCategories,
        fetchLibraryAssets,
        libraryBack,
        toggleLibrarySelect,
        selectAllLibrary,
        deselectAllLibrary,
        importLibraryAssets,
        importSingleLibraryAsset,
        deleteAsset,
        refresh: loadAssets,
        // Sync
        syncAvailable: Boolean(options?.sync),
        syncStatus,
    };
};
