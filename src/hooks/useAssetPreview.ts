import { useState, useEffect, useRef } from 'react';
import { MediaAsset } from '../types';
import { getFileFromOpfs } from '../services/storage';

const blobCache = new Map<string, string>();

/**
 * Hook to lazily resolve a preview URL for a media asset.
 * If the asset already has a previewUrl (e.g. cloud URL), it uses it immediately.
 * Otherwise, it stays null until 'enabled' is true, at which point it loads from OPFS.
 */
export function useAssetPreview(asset: MediaAsset, enabled: boolean = true) {
    const [url, setUrl] = useState<string | undefined>(asset.previewUrl);
    const loadingRef = useRef(false);

    useEffect(() => {
        // If we have a URL (or it's already loading/disabled), nothing to do
        if (!enabled || url || loadingRef.current) return;

        const handle = asset.thumbnailHandleName || asset.handleName;
        if (!handle) return;

        // Check global cache first to prevent re-reading from OPFS if we already have a blob for this handle
        if (blobCache.has(handle)) {
            setUrl(blobCache.get(handle));
            return;
        }

        loadingRef.current = true;
        getFileFromOpfs(handle).then(file => {
            if (file) {
                const objectUrl = URL.createObjectURL(file);
                blobCache.set(handle, objectUrl);
                setUrl(objectUrl);
            }
        }).catch(err => {
            console.error('[useAssetPreview] Failed to load local asset:', err);
        }).finally(() => {
            loadingRef.current = false;
        });
    }, [asset.id, enabled, url]);

    // If the asset.previewUrl changes (e.g. cloud sync), sync our local state
    useEffect(() => {
        if (asset.previewUrl && asset.previewUrl !== url) {
            setUrl(asset.previewUrl);
        }
    }, [asset.previewUrl]);

    return url;
}
