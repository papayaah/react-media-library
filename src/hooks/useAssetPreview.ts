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

        const primaryHandle = preferFull 
            ? (asset.handleName || asset.thumbnailHandleName) 
            : (asset.thumbnailHandleName || asset.handleName);
        const secondaryHandle = preferFull 
            ? asset.thumbnailHandleName 
            : asset.handleName;
        const cloudUrl = preferFull 
            ? (asset.fullUrl || asset.previewUrl || (asset as any).url) 
            : (asset.previewUrl || asset.fullUrl || (asset as any).url);

        // 1. Determine immediate cached or cloud URL
        const cachedPrimary = primaryHandle ? blobCache.get(primaryHandle) : undefined;
        const cachedSecondary = secondaryHandle ? blobCache.get(secondaryHandle) : undefined;
        const targetUrl = cachedPrimary || cachedSecondary || cloudUrl;

        if (targetUrl) {
            setUrl(targetUrl);
            return;
        }

        // 2. Load from OPFS with handle fallback (primary -> secondary)
        const handleToLoad = primaryHandle || secondaryHandle;
        if (handleToLoad && loadingRef.current !== handleToLoad) {
            loadingRef.current = handleToLoad;
            getFileFromOpfs(handleToLoad).then(file => {
                if (file) {
                    const objectUrl = URL.createObjectURL(file);
                    blobCache.set(handleToLoad, objectUrl);
                    if (loadingRef.current === handleToLoad) {
                        setUrl(objectUrl);
                    }
                } else if (secondaryHandle && secondaryHandle !== handleToLoad) {
                    // Fallback to secondary handle if primary handle returned null
                    return getFileFromOpfs(secondaryHandle).then(fallbackFile => {
                        if (fallbackFile) {
                            const objectUrl = URL.createObjectURL(fallbackFile);
                            blobCache.set(secondaryHandle, objectUrl);
                            if (loadingRef.current === handleToLoad) {
                                setUrl(objectUrl);
                            }
                        }
                    });
                }
            }).catch(err => {
                console.error('[useAssetPreview] Failed to load local asset:', err);
            }).finally(() => {
                if (loadingRef.current === handleToLoad) {
                    loadingRef.current = null;
                }
            });
        }
    }, [asset?.id, asset?.handleName, asset?.thumbnailHandleName, asset?.previewUrl, asset?.fullUrl, enabled, preferFull]);

    return url;
}
