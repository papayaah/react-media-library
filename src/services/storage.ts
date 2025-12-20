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

let dbPromise: Promise<IDBPDatabase<MediaLibraryDB>> | null = null;

export const initDB = (dbName: string = DEFAULT_DB_NAME) => {
    if (!dbPromise) {
        dbPromise = openDB<MediaLibraryDB>(dbName, 3, {
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
    directory: string = DEFAULT_OPFS_DIR
): Promise<string> => {
    const dirHandle = await getOpfsDirectory(directory);
    const ext = file.name.split('.').pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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

export const getAssetType = (mimeType: string): MediaType => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('text/') || mimeType.includes('pdf')) return 'document';
    return 'other';
};
