/**
 * Server-side file storage utilities for media assets
 * 
 * Stores files on the server's filesystem instead of S3.
 * Files are organized by user ID and date for easier management.
 * 
 * Usage:
 * ```ts
 * import { saveMediaFile, readMediaFile, deleteMediaFile } from '@reactkits.dev/react-media-library/server/storage';
 * ```
 */

import { mkdir, writeFile, readFile, unlink, stat, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DEFAULT_MEDIA_STORAGE_PATH = '/srv/appframes/media';
const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export interface MediaStorageConfig {
    storagePath?: string;
    maxFileSize?: number;
}

let config: MediaStorageConfig = {
    storagePath: process.env.MEDIA_STORAGE_PATH || DEFAULT_MEDIA_STORAGE_PATH,
    maxFileSize: DEFAULT_MAX_FILE_SIZE,
};

/**
 * Configure media storage settings
 */
export function configureMediaStorage(newConfig: MediaStorageConfig): void {
    config = { ...config, ...newConfig };
}

/**
 * Get the storage path for a user's media files
 */
export function getUserMediaPath(userId: string): string {
    return join(config.storagePath!, userId);
}

/**
 * Generate a unique filename with extension
 */
export function generateMediaFilename(
    originalFileName: string,
    userId: string,
    timestamp: number = Date.now()
): string {
    const ext = originalFileName.split('.').pop() || 'bin';
    const sanitized = originalFileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 50);
    return `${timestamp}-${sanitized}.${ext}`;
}

/**
 * Save a file to local storage
 * Returns the relative path (from MEDIA_STORAGE_PATH)
 * 
 * @param userId - Required: User ID for authentication. Must be a non-empty string.
 * @param file - File or Buffer to save
 * @param originalFileName - Original filename
 * @throws Error if userId is missing or invalid
 */
export async function saveMediaFile(
    userId: string,
    file: File | Buffer,
    originalFileName: string
): Promise<string> {
    // Validate userId - required for authentication
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('User ID is required to save files. User must be authenticated.');
    }
    
    // Security: prevent path traversal
    if (userId.includes('..') || userId.includes('/') || userId.includes('\\')) {
        throw new Error('Invalid user ID format');
    }
    
    const userPath = getUserMediaPath(userId);
    await mkdir(userPath, { recursive: true });

    const filename = generateMediaFilename(originalFileName, userId);
    const filePath = join(userPath, filename);
    const relativePath = `${userId}/${filename}`;

    // Convert File to Buffer if needed
    const buffer = file instanceof File
        ? Buffer.from(await file.arrayBuffer())
        : file;

    // Check file size
    if (buffer.length > (config.maxFileSize || DEFAULT_MAX_FILE_SIZE)) {
        throw new Error(`File size exceeds maximum of ${(config.maxFileSize || DEFAULT_MAX_FILE_SIZE) / 1024 / 1024}MB`);
    }

    await writeFile(filePath, buffer);
    return relativePath;
}

/**
 * Read a media file from storage
 */
export async function readMediaFile(relativePath: string): Promise<Buffer> {
    const fullPath = join(config.storagePath!, relativePath);
    
    // Security: ensure path is within MEDIA_STORAGE_PATH
    const resolvedPath = join(config.storagePath!, relativePath);
    if (!resolvedPath.startsWith(config.storagePath!)) {
        throw new Error('Invalid file path');
    }

    if (!existsSync(fullPath)) {
        throw new Error('File not found');
    }

    return readFile(fullPath);
}

/**
 * Delete a media file from storage
 */
export async function deleteMediaFile(relativePath: string): Promise<void> {
    const fullPath = join(config.storagePath!, relativePath);
    
    // Security: ensure path is within MEDIA_STORAGE_PATH
    const resolvedPath = join(config.storagePath!, relativePath);
    if (!resolvedPath.startsWith(config.storagePath!)) {
        throw new Error('Invalid file path');
    }

    if (existsSync(fullPath)) {
        await unlink(fullPath);
    }
}

/**
 * Get file stats (size, etc.)
 */
export async function getMediaFileStats(relativePath: string) {
    const fullPath = join(config.storagePath!, relativePath);
    
    // Security: ensure path is within MEDIA_STORAGE_PATH
    const resolvedPath = join(config.storagePath!, relativePath);
    if (!resolvedPath.startsWith(config.storagePath!)) {
        throw new Error('Invalid file path');
    }

    return stat(fullPath);
}

/**
 * Save a thumbnail file
 * 
 * @param userId - Required: User ID for authentication. Must be a non-empty string.
 * @param thumbnail - Thumbnail buffer to save
 * @param originalFileName - Original filename
 * @throws Error if userId is missing or invalid
 */
export async function saveThumbnail(
    userId: string,
    thumbnail: Buffer,
    originalFileName: string
): Promise<string> {
    // Validate userId - required for authentication
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('User ID is required to save files. User must be authenticated.');
    }
    
    // Security: prevent path traversal
    if (userId.includes('..') || userId.includes('/') || userId.includes('\\')) {
        throw new Error('Invalid user ID format');
    }
    
    const userPath = getUserMediaPath(userId);
    await mkdir(userPath, { recursive: true });

    const ext = 'jpg'; // Thumbnails are always JPG
    const timestamp = Date.now();
    const filename = `thumb-${timestamp}-${originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 30)}.${ext}`;
    const filePath = join(userPath, filename);
    const relativePath = `${userId}/${filename}`;

    await writeFile(filePath, thumbnail);
    return relativePath;
}

/**
 * List all files for a user (used when no database is configured)
 *
 * @param userId - User ID to list files for
 * @returns Array of file metadata derived from filesystem
 */
export async function listUserFiles(userId: string): Promise<
    Array<{
        id: string;
        fileName: string;
        fileType: string;
        mimeType: string;
        size: number;
        path: string;
        thumbnailPath?: string;
        createdAt: string;
        updatedAt: string;
    }>
> {
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('User ID is required');
    }

    // Security: prevent path traversal
    if (userId.includes('..') || userId.includes('/') || userId.includes('\\')) {
        throw new Error('Invalid user ID format');
    }

    const userPath = getUserMediaPath(userId);

    // Return empty array if directory doesn't exist
    if (!existsSync(userPath)) {
        return [];
    }

    const files = await readdir(userPath);

    // Filter out thumbnails and build file list
    const mediaFiles = files.filter((f) => !f.startsWith('thumb-'));
    const thumbnails = new Set(files.filter((f) => f.startsWith('thumb-')));

    const results = await Promise.all(
        mediaFiles.map(async (fileName) => {
            const relativePath = `${userId}/${fileName}`;
            const fullPath = join(userPath, fileName);

            try {
                const stats = await stat(fullPath);

                // Extract original filename from stored name (timestamp-name.ext)
                const parts = fileName.split('-');
                const timestamp = parseInt(parts[0], 10) || Date.now();
                const originalName = parts.slice(1).join('-') || fileName;

                // Determine MIME type from extension
                const ext = fileName.split('.').pop()?.toLowerCase() || '';
                const mimeTypes: Record<string, string> = {
                    jpg: 'image/jpeg',
                    jpeg: 'image/jpeg',
                    png: 'image/png',
                    gif: 'image/gif',
                    webp: 'image/webp',
                    svg: 'image/svg+xml',
                    mp4: 'video/mp4',
                    webm: 'video/webm',
                    mp3: 'audio/mpeg',
                    wav: 'audio/wav',
                    pdf: 'application/pdf',
                };
                const mimeType = mimeTypes[ext] || 'application/octet-stream';

                // Determine file type
                const fileType = mimeType.startsWith('image/')
                    ? 'image'
                    : mimeType.startsWith('video/')
                      ? 'video'
                      : mimeType.startsWith('audio/')
                        ? 'audio'
                        : mimeType.includes('pdf')
                          ? 'document'
                          : 'other';

                // Find matching thumbnail
                const thumbPattern = `thumb-${timestamp}-`;
                const thumbnailFile = Array.from(thumbnails).find((t) =>
                    t.startsWith(thumbPattern)
                );

                return {
                    id: relativePath, // Use path as ID
                    fileName: originalName,
                    fileType,
                    mimeType,
                    size: stats.size,
                    path: relativePath,
                    thumbnailPath: thumbnailFile
                        ? `${userId}/${thumbnailFile}`
                        : undefined,
                    createdAt: new Date(timestamp).toISOString(),
                    updatedAt: stats.mtime.toISOString(),
                };
            } catch {
                // Skip files that can't be read
                return null;
            }
        })
    );

    // Filter nulls and sort by creation date (newest first)
    return results
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
}
