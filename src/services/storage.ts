import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MediaAsset, MediaType } from '../types';

interface MediaLibraryDB extends DBSchema {
    assets: {
        key: number;
        value: MediaAsset;
        indexes: { 'by-date': number };
    };
}

const DEFAULT_DB_NAME = 'MediaLibrary';
const DEFAULT_OPFS_DIR = 'media-library';
const DEFAULT_THUMB_MAX_DIMENSION = 200;

let dbPromise: Promise<IDBPDatabase<MediaLibraryDB>> | null = null;

export const initDB = (dbName: string = DEFAULT_DB_NAME) => {
    if (!dbPromise) {
        dbPromise = openDB<MediaLibraryDB>(dbName, 4, {
            upgrade(db, oldVersion, newVersion, transaction) {
                let store;
                if (!db.objectStoreNames.contains('assets')) {
                    store = db.createObjectStore('assets', {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                } else {
                    store = transaction.objectStore('assets');
                }

                if (!store.indexNames.contains('by-date')) {
                    store.createIndex('by-date', 'createdAt');
                }
            },
        });
    }
    return dbPromise;
};

// OPFS Helpers
const getOpfsDirectory = async (directoryName: string) => {
    const root = await navigator.storage.getDirectory();
    return await root.getDirectoryHandle(directoryName, { create: true });
};

export const saveFileToOpfs = async (
    file: File,
    directory: string = DEFAULT_OPFS_DIR,
    options?: { extension?: string; nameHint?: string }
): Promise<string> => {
    const dirHandle = await getOpfsDirectory(directory);
    const ext =
        (options?.extension || file.name.split('.').pop() || 'bin')
            .replace(/^\./, '')
            .toLowerCase();
    const hint = (options?.nameHint || 'file').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40);
    const uniqueName = `${Date.now()}-${hint}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileHandle = await dirHandle.getFileHandle(uniqueName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();
    return uniqueName;
};

export const getFileFromOpfs = async (
    fileName: string,
    directory: string = DEFAULT_OPFS_DIR
): Promise<File | null> => {
    try {
        const dirHandle = await getOpfsDirectory(directory);
        const fileHandle = await dirHandle.getFileHandle(fileName);
        return await fileHandle.getFile();
    } catch (error) {
        return null;
    }
};

export const deleteFileFromOpfs = async (
    fileName: string,
    directory: string = DEFAULT_OPFS_DIR
): Promise<void> => {
    try {
        const dirHandle = await getOpfsDirectory(directory);
        await dirHandle.removeEntry(fileName);
    } catch (error) {
        // Silently fail - file may not exist
    }
};

const fileToObjectUrl = (file: Blob) => URL.createObjectURL(file);

const loadImageFromFile = (file: File) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        const url = fileToObjectUrl(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        img.decoding = 'async';
        img.src = url;
    });

// Check if the image has transparency by drawing it and checking alpha channel
const hasTransparency = (img: HTMLImageElement, ctx: CanvasRenderingContext2D, w: number, h: number): boolean => {
    try {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        // Check alpha channel (every 4th byte starting at index 3)
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) return true;
        }
        return false;
    } catch {
        // If getImageData fails (e.g., CORS), assume transparency for SVG
        return false;
    }
};

const toThumbnailBlob = async (
    img: HTMLImageElement,
    maxDim: number,
    sourceMimeType?: string,
): Promise<{ blob: Blob; width: number; height: number; mimeType: string } | null> => {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (!width || !height) return null;

    const scale = Math.min(1, maxDim / Math.max(width, height));
    const outW = Math.max(1, Math.round(width * scale));
    const outH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, outW, outH);

    // Check if source format supports transparency
    const transparentFormats = ['image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    const sourceSupportsTransparency = sourceMimeType && transparentFormats.includes(sourceMimeType);

    // Use PNG for formats that support transparency, JPEG otherwise
    // PNG preserves transparency, JPEG is smaller but no alpha channel
    let mimeType: string;
    let quality: number | undefined;

    if (sourceSupportsTransparency) {
        // Check if image actually has transparency
        const hasAlpha = hasTransparency(img, ctx, outW, outH);
        if (hasAlpha) {
            mimeType = 'image/png';
            quality = undefined; // PNG doesn't use quality parameter
        } else {
            mimeType = 'image/jpeg';
            quality = 0.85;
        }
    } else {
        mimeType = 'image/jpeg';
        quality = 0.85;
    }

    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), mimeType, quality);
    });
    if (!blob) return null;
    return { blob, width, height, mimeType };
};

// DB Helpers
export const addAssetToDB = async (asset: Omit<MediaAsset, 'id'>) => {
    const db = await initDB();
    return db.add('assets', asset as MediaAsset);
};

export const listAssetsFromDB = async () => {
    const db = await initDB();
    const assets = await db.getAllFromIndex('assets', 'by-date');
    return assets;
};

export const deleteAssetFromDB = async (id: number) => {
    const db = await initDB();
    return db.delete('assets', id);
};

export const importFileToLibrary = async (
    file: File,
    options?: {
        opfsDirectory?: string;
        thumbnailMaxDimension?: number;
    },
): Promise<number> => {
    const directory = options?.opfsDirectory || DEFAULT_OPFS_DIR;
    const fileType = getAssetType(file.type);

    let width: number | undefined;
    let height: number | undefined;
    let thumbnailHandleName: string | undefined;
    let thumbnailMimeType: string | undefined;
    let thumbnailSize: number | undefined;

    if (fileType === 'image' && typeof window !== 'undefined' && typeof document !== 'undefined') {
        try {
            const img = await loadImageFromFile(file);
            width = img.naturalWidth || img.width;
            height = img.naturalHeight || img.height;

            const thumb = await toThumbnailBlob(
                img,
                options?.thumbnailMaxDimension ?? DEFAULT_THUMB_MAX_DIMENSION,
                file.type, // Pass source mime type to preserve transparency
            );
            if (thumb) {
                // Use correct extension based on thumbnail format
                const thumbExtension = thumb.mimeType === 'image/png' ? 'png' : 'jpg';
                const thumbFile = new File([thumb.blob], `thumb.${thumbExtension}`, { type: thumb.mimeType });
                thumbnailHandleName = await saveFileToOpfs(thumbFile, directory, {
                    extension: thumbExtension,
                    nameHint: 'thumb',
                });
                thumbnailMimeType = thumb.mimeType;
                thumbnailSize = thumb.blob.size;
            }
        } catch {
            // Best-effort: still import the original file even if thumbnail/dimensions fail.
        }
    }

    const handleName = await saveFileToOpfs(file, directory, { nameHint: file.name || 'upload' });
    const asset: Omit<MediaAsset, 'id'> = {
        handleName,
        thumbnailHandleName,
        thumbnailMimeType,
        thumbnailSize,
        fileName: file.name,
        fileType,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    const id = await addAssetToDB(asset);
    return typeof id === 'number' ? id : Number(id);
};

export const getAssetType = (mimeType: string): MediaType => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('text/') || mimeType.includes('pdf')) return 'document';
    return 'other';
};
