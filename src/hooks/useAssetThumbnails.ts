import { useState, useEffect, useCallback, useRef } from 'react';
import { MediaAsset } from '../types';
import { getAssetFromDB, getFileFromOpfs } from '../services/storage';

export interface AssetThumbnail {
    asset: MediaAsset;
    /** Object URL for display (prefers thumbnail, falls back to full) */
    url: string;
}

/**
 * Hook to batch-load media assets by ID array and resolve preview URLs.
 * Manages object URL lifecycle (creates on load, revokes on unmount/change).
 *
 * Useful for attachment fields, inline image strips, or any UI that displays
 * a list of assets referenced by ID.
 */
export function useAssetThumbnails(assetIds: number[]) {
    const [thumbnails, setThumbnails] = useState<AssetThumbnail[]>([]);
    const [loading, setLoading] = useState(false);
    const urlsRef = useRef<string[]>([]);

    const revokeUrls = useCallback(() => {
        urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        urlsRef.current = [];
    }, []);

    const load = useCallback(async () => {
        revokeUrls();

        if (assetIds.length === 0) {
            setThumbnails([]);
            return;
        }

        setLoading(true);
        const loaded: AssetThumbnail[] = [];

        for (const id of assetIds) {
            const asset = await getAssetFromDB(id);
            if (!asset) continue;

            const handleName = asset.thumbnailHandleName || asset.handleName;
            const file = await getFileFromOpfs(handleName);
            if (!file) continue;

            const url = URL.createObjectURL(file);
            urlsRef.current.push(url);
            loaded.push({ asset, url });
        }

        setThumbnails(loaded);
        setLoading(false);
    }, [assetIds, revokeUrls]);

    useEffect(() => {
        load();
        return revokeUrls;
    }, [load, revokeUrls]);

    /**
     * Load the full-resolution URL for a specific asset (for viewer overlays).
     * Caller is responsible for revoking the returned URL.
     */
    const getFullUrl = useCallback(async (asset: MediaAsset): Promise<string | null> => {
        const file = await getFileFromOpfs(asset.handleName);
        return file ? URL.createObjectURL(file) : null;
    }, []);

    return { thumbnails, loading, getFullUrl };
}
