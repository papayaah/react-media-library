/**
 * Media Sync Service
 * 
 * Handles background sync of media assets from OPFS/IndexedDB to server.
 * Follows offline-first architecture: OPFS is authoritative, server is a mirror.
 * 
 * Based on specs/offline-first-persistence.md
 * 
 * Usage:
 * ```ts
 * import { MediaSyncService } from '@reactkits.dev/react-media-library/server';
 * 
 * const syncService = new MediaSyncService({
 *   apiBaseUrl: '/api',
 *   getUserId: async () => session?.user?.id || null,
 *   autoSync: true,
 * });
 * ```
 */

import { MediaAsset } from '../types';
import { getFileFromOpfs } from './storage';

export interface MediaSyncConfig {
    apiBaseUrl: string;
    getUserId: () => Promise<string | null>;
    autoSync?: boolean;
    syncInterval?: number; // milliseconds
}

export class MediaSyncService {
    private config: MediaSyncConfig;
    private syncIntervalId: NodeJS.Timeout | null = null;

    constructor(config: MediaSyncConfig) {
        this.config = {
            autoSync: true,
            syncInterval: 30000, // 30 seconds
            ...config,
        };
    }

    /**
     * Upload a single asset to server (background sync)
     * Asset must already be saved to OPFS/IndexedDB
     */
    async uploadAsset(asset: MediaAsset): Promise<MediaAsset> {
        if (!asset.handleName) {
            throw new Error('Asset must have handleName (OPFS file)');
        }

        const userId = await this.config.getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        // Get file from OPFS
        const file = await getFileFromOpfs(asset.handleName);
        if (!file) {
            throw new Error('File not found in OPFS');
        }

        // Update sync status
        const updatingAsset = {
            ...asset,
            syncStatus: 'syncing' as const,
        };

        try {
            // Upload to server
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', asset.fileName);
            formData.append('fileType', asset.fileType);
            formData.append('mimeType', asset.mimeType);
            if (asset.width) formData.append('width', asset.width.toString());
            if (asset.height) formData.append('height', asset.height.toString());

            const response = await fetch(`${this.config.apiBaseUrl}/api/media/assets`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const serverAsset = await response.json();

            // Return updated asset with cloud fields
            return {
                ...updatingAsset,
                cloudId: serverAsset.id,
                cloudUrl: serverAsset.path, // Server returns path, not URL
                userId,
                syncStatus: 'synced' as const,
                syncedAt: Date.now(),
                cloudCreatedAt: serverAsset.createdAt,
            };
        } catch (error: any) {
            return {
                ...updatingAsset,
                syncStatus: 'error' as const,
                syncError: error.message,
            };
        }
    }

    /**
     * Fetch asset metadata from server
     */
    async fetchAssetMetadata(cloudId: string): Promise<MediaAsset | null> {
        const userId = await this.config.getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/api/media/assets/${cloudId}`);
            if (!response.ok) {
                return null;
            }
            const serverAsset = await response.json();

            // Convert server format to MediaAsset format
            return {
                cloudId: serverAsset.id,
                userId: serverAsset.userId,
                cloudUrl: serverAsset.path,
                fileName: serverAsset.fileName,
                fileType: serverAsset.fileType as MediaAsset['fileType'],
                mimeType: serverAsset.mimeType,
                size: serverAsset.size,
                width: serverAsset.width,
                height: serverAsset.height,
                syncStatus: 'synced',
                syncedAt: Date.now(),
                cloudCreatedAt: serverAsset.createdAt,
                createdAt: new Date(serverAsset.createdAt).getTime(),
                updatedAt: new Date(serverAsset.updatedAt).getTime(),
                // Note: handleName will be set when file is downloaded to OPFS
            };
        } catch (error) {
            console.error('[MediaSync] Failed to fetch metadata:', error);
            return null;
        }
    }

    /**
     * Download asset file from server to OPFS
     */
    async downloadAssetFile(asset: MediaAsset): Promise<File | null> {
        if (!asset.cloudUrl && !asset.cloudId) {
            throw new Error('Asset has no cloud URL or ID');
        }

        const userId = await this.config.getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        try {
            const url = asset.cloudId
                ? `${this.config.apiBaseUrl}/api/media/assets/${asset.cloudId}`
                : `${this.config.apiBaseUrl}/api/media/files/${asset.cloudUrl}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }

            const blob = await response.blob();
            return new File([blob], asset.fileName, { type: asset.mimeType });
        } catch (error) {
            console.error('[MediaSync] Failed to download file:', error);
            return null;
        }
    }

    /**
     * Delete asset from server
     */
    async deleteAsset(cloudId: string): Promise<void> {
        const userId = await this.config.getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const response = await fetch(`${this.config.apiBaseUrl}/api/media/assets/${cloudId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Delete failed: ${response.statusText}`);
        }
    }

    /**
     * Sync pending assets in background
     * Called automatically if autoSync is enabled
     */
    async syncPendingAssets(
        getPendingAssets: () => Promise<MediaAsset[]>,
        updateAsset: (asset: MediaAsset) => Promise<void>
    ): Promise<void> {
        const pending = await getPendingAssets();
        
        for (const asset of pending) {
            if (asset.syncStatus === 'pending' || asset.syncStatus === 'error') {
                const synced = await this.uploadAsset(asset);
                await updateAsset(synced);
            }
        }
    }

    /**
     * Pull cloud assets on login
     * Merges with local assets (dedupe by cloudId)
     */
    async pullCloudAssets(
        getLocalAssets: () => Promise<MediaAsset[]>,
        addAsset: (asset: MediaAsset) => Promise<void>
    ): Promise<void> {
        const userId = await this.config.getUserId();
        if (!userId) {
            return;
        }

        try {
            // Fetch all assets from server
            const response = await fetch(`${this.config.apiBaseUrl}/api/media/assets`);
            if (!response.ok) {
                throw new Error('Failed to fetch cloud assets');
            }

            const serverAssets = await response.json();
            const localAssets = await getLocalAssets();
            const localCloudIds = new Set(
                localAssets
                    .filter((a) => a.cloudId)
                    .map((a) => a.cloudId!)
            );

            // Add assets that don't exist locally
            for (const serverAsset of serverAssets) {
                if (!localCloudIds.has(serverAsset.id)) {
                    // Convert server format to MediaAsset
                    const asset: MediaAsset = {
                        cloudId: serverAsset.id,
                        userId: serverAsset.userId,
                        cloudUrl: serverAsset.path,
                        fileName: serverAsset.fileName,
                        fileType: serverAsset.fileType,
                        mimeType: serverAsset.mimeType,
                        size: serverAsset.size,
                        width: serverAsset.width,
                        height: serverAsset.height,
                        syncStatus: 'synced',
                        syncedAt: Date.now(),
                        cloudCreatedAt: serverAsset.createdAt,
                        createdAt: new Date(serverAsset.createdAt).getTime(),
                        updatedAt: new Date(serverAsset.updatedAt).getTime(),
                        handleName: '', // Will be set when downloaded
                    };
                    await addAsset(asset);
                }
            }
        } catch (error) {
            console.error('[MediaSync] Failed to pull cloud assets:', error);
        }
    }

    /**
     * Start background sync (if autoSync is enabled)
     */
    startAutoSync(
        getPendingAssets: () => Promise<MediaAsset[]>,
        updateAsset: (asset: MediaAsset) => Promise<void>
    ): void {
        if (!this.config.autoSync) {
            return;
        }

        if (this.syncIntervalId) {
            this.stopAutoSync();
        }

        this.syncIntervalId = setInterval(() => {
            this.syncPendingAssets(getPendingAssets, updateAsset).catch((error) => {
                console.error('[MediaSync] Auto-sync error:', error);
            });
        }, this.config.syncInterval);
    }

    /**
     * Stop background sync
     */
    stopAutoSync(): void {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
            this.syncIntervalId = null;
        }
    }
}
