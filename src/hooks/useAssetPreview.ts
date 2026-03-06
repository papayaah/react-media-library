import { useState, useEffect, useRef } from 'react';
import { MediaAsset } from '../types';
import { getFileFromOpfs } from '../services/storage';

const blobCache = new Map<string, string>();

/**
 * Hook to lazily resolve a preview URL for a media asset.
 * If the asset already has a previewUrl (e.g. cloud URL), it uses it immediately.
 * Otherwise, it stays null until 'enabled' is true, at which point it loads from OPFS.
 */
export function useAssetPreview(asset: MediaAsset | null | undefined, enabled: boolean = true, preferFull: boolean = false) {
    const [url, setUrl] = useState<string | undefined>(undefined);
    const loadingRef = useRef<string | null>(null);

    useEffect(() => {
        if (!enabled || !asset) {
            setUrl(undefined);
            return;
        }

        const handle = preferFull ? (asset.handleName || asset.thumbnailHandleName) : (asset.thumbnailHandleName || asset.handleName);
        const cloudUrl = preferFull ? (asset.fullUrl || asset.previewUrl) : asset.previewUrl;

        // 1. Determine the best immediate URL (Cache > Cloud > undefined)
        const cachedUrl = handle ? blobCache.get(handle) : undefined;
        const targetUrl = cachedUrl || cloudUrl;

        // Update state if it doesn't match the target for the current asset
        if (url !== targetUrl) {
            setUrl(targetUrl);
        }

        // 2. Trigger load from OPFS if handle exists and isn't cached/loading
        if (handle && !blobCache.has(handle) && loadingRef.current !== handle) {
            loadingRef.current = handle;
            getFileFromOpfs(handle).then(file => {
                if (file) {
                    const objectUrl = URL.createObjectURL(file);
                    blobCache.set(handle, objectUrl);
                    // Only update if we haven't switched to a different handle/asset
                    if (loadingRef.current === handle) {
                        setUrl(objectUrl);
                    }
                }
            }).catch(err => {
                console.error('[useAssetPreview] Failed to load local asset:', err);
            }).finally(() => {
                if (loadingRef.current === handle) {
                    loadingRef.current = null;
                }
            });
        }
    }, [asset?.id, asset?.handleName, asset?.thumbnailHandleName, asset?.previewUrl, asset?.fullUrl, enabled, preferFull]);

    return url;
}
