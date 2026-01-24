/**
 * Next.js App Router route handlers for media assets
 *
 * **Authentication-agnostic**: This package doesn't depend on any specific auth library.
 * It only requires a `getUserId` callback that can integrate with any auth system.
 *
 * **Database-optional**: Routes work with or without a database.
 * - With DB: Full metadata storage, fast queries, thumbnail tracking
 * - Without DB: Files stored on filesystem, metadata derived from files
 *
 * **Sharp-optional**: Image processing is optional.
 * - With sharp: Dimension extraction, server-side thumbnails
 * - Without sharp: Uploads work, dimensions/thumbnails skipped
 *
 * Usage in a Next.js app:
 * - Create: app/api/media/assets/route.ts
 * - Re-export: export const { POST, GET } = createMediaAssetsRoutes(config)
 *
 * The returned handlers handle:
 * - POST /api/media/assets (upload) - requires authentication
 * - GET  /api/media/assets (list) - requires authentication
 *
 * All routes return 401 Unauthorized if `getUserId` returns null.
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveMediaFile, readMediaFile, deleteMediaFile, saveThumbnail, listUserFiles } from '../storage';
import { processImage, isSupportedImageType } from '../image-processing';

export interface MediaAssetsRoutesConfig {
    /**
     * Get the current user ID from your authentication system
     *
     * This callback is authentication-agnostic - it can integrate with any auth library:
     * - BetterAuth: `auth.api.getSession()`
     * - NextAuth: `getServerSession(authOptions)`
     * - Clerk: `auth()`
     * - Custom: Your own auth logic
     *
     * Should return:
     * - A non-empty string (user ID) if authenticated
     * - `null` if not authenticated (routes will return 401)
     */
    getUserId: () => Promise<string | null>;

    /**
     * Database instance (Drizzle) - OPTIONAL
     * If not provided, metadata is derived from filesystem
     */
    db?: any;

    /**
     * Media assets table from Drizzle schema - OPTIONAL
     * Required only if db is provided
     */
    mediaAssetsTable?: any;

    /**
     * Optional: Custom error handler
     */
    onError?: (error: Error, context: string) => void;

    /**
     * Optional: Enable/disable image processing (default: true if sharp available)
     */
    enableImageProcessing?: boolean;

    /**
     * Optional: Thumbnail size in pixels (default: 200)
     */
    thumbnailSize?: number;
}

/**
 * Create Next.js route handlers for /api/media/assets
 *
 * Usage with database:
 * ```ts
 * // app/api/media/assets/route.ts
 * import { createMediaAssetsRoutes } from '@reactkits.dev/react-media-library/server/nextjs/routes';
 * import { db } from '@/db';
 * import { mediaAssets } from '@/db/schema';
 *
 * export const { POST, GET } = createMediaAssetsRoutes({
 *   getUserId: async () => {
 *     const session = await auth.api.getSession({ headers: await headers() });
 *     return session?.user?.id || null;
 *   },
 *   db,
 *   mediaAssetsTable: mediaAssets,
 * });
 * ```
 *
 * Usage without database (filesystem only):
 * ```ts
 * export const { POST, GET } = createMediaAssetsRoutes({
 *   getUserId: async () => session?.user?.id || null,
 *   // No db or mediaAssetsTable - files stored on filesystem only
 * });
 * ```
 */
export function createMediaAssetsRoutes(config: MediaAssetsRoutesConfig) {
    const {
        getUserId,
        db,
        mediaAssetsTable,
        onError,
        enableImageProcessing = true,
        thumbnailSize = 200,
    } = config;

    const useDatabase = db && mediaAssetsTable;

    const handleError = (error: any, context: string) => {
        console.error(`[Media API ${context}] Error:`, error);
        if (onError) {
            onError(error instanceof Error ? error : new Error(String(error)), context);
        }
    };

    /**
     * POST /api/media/assets
     * Upload a new media file
     */
    async function POST(request: NextRequest) {
        try {
            const userId = await getUserId();
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const formData = await request.formData();
            const file = formData.get('file') as File;

            if (!file) {
                return NextResponse.json({ error: 'No file provided' }, { status: 400 });
            }

            // Determine file type from MIME type
            const mimeType = file.type;
            const fileType = mimeType.startsWith('image/')
                ? 'image'
                : mimeType.startsWith('video/')
                  ? 'video'
                  : mimeType.startsWith('audio/')
                    ? 'audio'
                    : mimeType.includes('pdf') || mimeType.includes('document')
                      ? 'document'
                      : 'other';

            // Save file to local storage
            const relativePath = await saveMediaFile(userId, file, file.name);

            // Image processing (optional - requires sharp)
            let width: number | undefined;
            let height: number | undefined;
            let thumbnailPath: string | undefined;

            if (enableImageProcessing && isSupportedImageType(mimeType)) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const result = await processImage(buffer, mimeType, {
                    generateThumbnail: true,
                    thumbnailSize,
                });

                if (result.metadata) {
                    width = result.metadata.width;
                    height = result.metadata.height;
                }

                if (result.thumbnail) {
                    thumbnailPath = await saveThumbnail(
                        userId,
                        result.thumbnail.buffer,
                        file.name
                    );
                }
            }

            // Build response object
            const assetData = {
                userId,
                fileName: file.name,
                fileType,
                mimeType,
                size: file.size,
                width,
                height,
                path: relativePath,
                thumbnailPath,
            };

            // Save to database if configured
            if (useDatabase) {
                const [asset] = await db
                    .insert(mediaAssetsTable)
                    .values(assetData)
                    .returning();

                return NextResponse.json({
                    id: asset.id,
                    fileName: asset.fileName,
                    fileType: asset.fileType,
                    mimeType: asset.mimeType,
                    size: asset.size,
                    width: asset.width,
                    height: asset.height,
                    path: asset.path,
                    thumbnailPath: asset.thumbnailPath,
                    createdAt: asset.createdAt,
                    updatedAt: asset.updatedAt,
                });
            }

            // No database - return filesystem-based response
            return NextResponse.json({
                id: relativePath, // Use path as ID when no database
                fileName: file.name,
                fileType,
                mimeType,
                size: file.size,
                width,
                height,
                path: relativePath,
                thumbnailPath,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        } catch (error: any) {
            handleError(error, 'POST');
            return NextResponse.json(
                { error: 'Failed to upload media', details: error?.message },
                { status: 500 }
            );
        }
    }

    /**
     * GET /api/media/assets
     * List all media assets for the current user
     */
    async function GET(request: NextRequest) {
        try {
            const userId = await getUserId();
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            // With database - query for assets
            if (useDatabase) {
                const { eq, desc } = await import('drizzle-orm');

                const assets = await db
                    .select()
                    .from(mediaAssetsTable)
                    .where(eq(mediaAssetsTable.userId, userId))
                    .orderBy(desc(mediaAssetsTable.createdAt));

                return NextResponse.json(
                    assets.map((asset: any) => ({
                        id: asset.id,
                        fileName: asset.fileName,
                        fileType: asset.fileType,
                        mimeType: asset.mimeType,
                        size: asset.size,
                        width: asset.width,
                        height: asset.height,
                        path: asset.path,
                        thumbnailPath: asset.thumbnailPath,
                        createdAt: asset.createdAt,
                        updatedAt: asset.updatedAt,
                    }))
                );
            }

            // Without database - list files from filesystem
            const files = await listUserFiles(userId);
            return NextResponse.json(files);
        } catch (error: any) {
            handleError(error, 'GET');
            return NextResponse.json(
                { error: 'Failed to list media', details: error?.message },
                { status: 500 }
            );
        }
    }

    return { POST, GET };
}

/**
 * Create Next.js route handlers for /api/media/assets/[id]
 *
 * With database: ID is the UUID from the database
 * Without database: ID is the file path (userId/filename)
 *
 * Usage:
 * ```ts
 * // app/api/media/assets/[id]/route.ts
 * import { createMediaAssetByIdRoutes } from '@reactkits.dev/react-media-library/server/nextjs/routes';
 *
 * export const { GET, DELETE } = createMediaAssetByIdRoutes(config);
 * ```
 */
export function createMediaAssetByIdRoutes(config: MediaAssetsRoutesConfig) {
    const { getUserId, db, mediaAssetsTable, onError } = config;

    const useDatabase = db && mediaAssetsTable;

    const handleError = (error: any, context: string) => {
        console.error(`[Media API ${context}] Error:`, error);
        if (onError) {
            onError(error instanceof Error ? error : new Error(String(error)), context);
        }
    };

    /**
     * GET /api/media/assets/[id]
     * Download a media file
     */
    async function GET(
        request: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) {
        try {
            const userId = await getUserId();
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const { id } = await context.params;

            let filePath: string;
            let mimeType: string;
            let fileName: string;

            if (useDatabase) {
                // With database - look up by ID
                const { eq } = await import('drizzle-orm');

                const [asset] = await db
                    .select()
                    .from(mediaAssetsTable)
                    .where(eq(mediaAssetsTable.id, id))
                    .limit(1);

                if (!asset) {
                    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
                }

                if (asset.userId !== userId) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }

                filePath = asset.path;
                mimeType = asset.mimeType;
                fileName = asset.fileName;
            } else {
                // Without database - ID is the path
                // Decode the ID (it might be URL encoded)
                filePath = decodeURIComponent(id);

                // Security: verify path belongs to user
                if (!filePath.startsWith(userId + '/')) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }

                // Extract filename and determine MIME type
                const parts = filePath.split('/');
                fileName = parts[parts.length - 1];
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
                    pdf: 'application/pdf',
                };
                mimeType = mimeTypes[ext] || 'application/octet-stream';
            }

            // Read file from storage
            const fileBuffer = await readMediaFile(filePath);

            return new NextResponse(new Uint8Array(fileBuffer), {
                headers: {
                    'Content-Type': mimeType,
                    'Content-Disposition': `inline; filename="${fileName}"`,
                    'Content-Length': fileBuffer.length.toString(),
                },
            });
        } catch (error: any) {
            if (error.message === 'File not found') {
                return NextResponse.json({ error: 'File not found' }, { status: 404 });
            }
            handleError(error, 'GET by ID');
            return NextResponse.json(
                { error: 'Failed to download media', details: error?.message },
                { status: 500 }
            );
        }
    }

    /**
     * DELETE /api/media/assets/[id]
     * Delete a media file
     */
    async function DELETE(
        request: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) {
        try {
            const userId = await getUserId();
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const { id } = await context.params;

            if (useDatabase) {
                // With database - look up by ID
                const { eq } = await import('drizzle-orm');

                const [asset] = await db
                    .select()
                    .from(mediaAssetsTable)
                    .where(eq(mediaAssetsTable.id, id))
                    .limit(1);

                if (!asset) {
                    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
                }

                if (asset.userId !== userId) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }

                // Delete file from storage
                await deleteMediaFile(asset.path);
                if (asset.thumbnailPath) {
                    await deleteMediaFile(asset.thumbnailPath);
                }

                // Delete from database
                await db.delete(mediaAssetsTable).where(eq(mediaAssetsTable.id, id));
            } else {
                // Without database - ID is the path
                const filePath = decodeURIComponent(id);

                // Security: verify path belongs to user
                if (!filePath.startsWith(userId + '/')) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }

                // Delete file
                await deleteMediaFile(filePath);

                // Try to delete thumbnail if it exists
                const parts = filePath.split('/');
                const fileName = parts[parts.length - 1];
                const timestampMatch = fileName.match(/^(\d+)-/);
                if (timestampMatch) {
                    const thumbPath = `${userId}/thumb-${timestampMatch[1]}-${fileName.slice(timestampMatch[0].length)}`;
                    try {
                        await deleteMediaFile(thumbPath.replace(/\.[^.]+$/, '.jpg'));
                    } catch {
                        // Thumbnail might not exist
                    }
                }
            }

            return NextResponse.json({ success: true });
        } catch (error: any) {
            handleError(error, 'DELETE');
            return NextResponse.json(
                { error: 'Failed to delete media', details: error?.message },
                { status: 500 }
            );
        }
    }

    return { GET, DELETE };
}

/**
 * Create Next.js route handler for /api/media/assets/[id]/thumbnail
 *
 * Usage:
 * ```ts
 * // app/api/media/assets/[id]/thumbnail/route.ts
 * import { createMediaThumbnailRoute } from '@reactkits.dev/react-media-library/server/nextjs/routes';
 *
 * export const { GET } = createMediaThumbnailRoute(config);
 * ```
 */
export function createMediaThumbnailRoute(config: MediaAssetsRoutesConfig) {
    const { getUserId, db, mediaAssetsTable, onError } = config;

    const useDatabase = db && mediaAssetsTable;

    const handleError = (error: any, context: string) => {
        console.error(`[Media API ${context}] Error:`, error);
        if (onError) {
            onError(error instanceof Error ? error : new Error(String(error)), context);
        }
    };

    /**
     * GET /api/media/assets/[id]/thumbnail
     * Get thumbnail for a media file
     */
    async function GET(
        request: NextRequest,
        context: { params: Promise<{ id: string }> }
    ) {
        try {
            const userId = await getUserId();
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const { id } = await context.params;

            let thumbnailPath: string | undefined;
            let originalPath: string;
            let mimeType: string;
            let fileName: string;

            if (useDatabase) {
                // With database - look up by ID
                const { eq } = await import('drizzle-orm');

                const [asset] = await db
                    .select()
                    .from(mediaAssetsTable)
                    .where(eq(mediaAssetsTable.id, id))
                    .limit(1);

                if (!asset) {
                    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
                }

                if (asset.userId !== userId) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }

                thumbnailPath = asset.thumbnailPath;
                originalPath = asset.path;
                mimeType = asset.mimeType;
                fileName = asset.fileName;
            } else {
                // Without database - ID is the path
                originalPath = decodeURIComponent(id);

                // Security: verify path belongs to user
                if (!originalPath.startsWith(userId + '/')) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }

                // Try to find thumbnail
                const parts = originalPath.split('/');
                fileName = parts[parts.length - 1];
                const timestampMatch = fileName.match(/^(\d+)-/);
                if (timestampMatch) {
                    const possibleThumbPath = `${userId}/thumb-${timestampMatch[1]}-${fileName.slice(timestampMatch[0].length).replace(/\.[^.]+$/, '.jpg')}`;
                    try {
                        await readMediaFile(possibleThumbPath);
                        thumbnailPath = possibleThumbPath;
                    } catch {
                        // Thumbnail doesn't exist
                    }
                }

                const ext = fileName.split('.').pop()?.toLowerCase() || '';
                const mimeTypes: Record<string, string> = {
                    jpg: 'image/jpeg',
                    jpeg: 'image/jpeg',
                    png: 'image/png',
                    gif: 'image/gif',
                    webp: 'image/webp',
                };
                mimeType = mimeTypes[ext] || 'image/jpeg';
            }

            // Use thumbnail if available, otherwise fall back to original
            const path = thumbnailPath || originalPath;
            const fileBuffer = await readMediaFile(path);

            return new NextResponse(new Uint8Array(fileBuffer), {
                headers: {
                    'Content-Type': thumbnailPath ? 'image/jpeg' : mimeType,
                    'Content-Disposition': `inline; filename="thumb-${fileName}"`,
                    'Content-Length': fileBuffer.length.toString(),
                },
            });
        } catch (error: any) {
            if (error.message === 'File not found') {
                return NextResponse.json({ error: 'File not found' }, { status: 404 });
            }
            handleError(error, 'GET thumbnail');
            return NextResponse.json(
                { error: 'Failed to get thumbnail', details: error?.message },
                { status: 500 }
            );
        }
    }

    return { GET };
}

/**
 * Create Next.js route handler for /api/media/files/[...path]
 * 
 * Simplified version - Download/Delete by path (no database needed)
 * 
 * Usage:
 * ```ts
 * // app/api/media/files/[...path]/route.ts
 * import { createMediaFileByPathRoutes } from '@reactkits.dev/react-media-library/server/nextjs/routes';
 * 
 * export const { GET, DELETE } = createMediaFileByPathRoutes({
 *   getUserId: async () => {
 *     const session = await auth.api.getSession({ headers: await headers() });
 *     return session?.user?.id || null;
 *   },
 * });
 * ```
 * 
 * Security: Verifies the userId in the path matches the current session
 */
export function createMediaFileByPathRoutes(config: Pick<MediaAssetsRoutesConfig, 'getUserId' | 'onError'>) {
    const { getUserId, onError } = config;

    const handleError = (error: any, context: string) => {
        console.error(`[Media API ${context}] Error:`, error);
        if (onError) {
            onError(error instanceof Error ? error : new Error(String(error)), context);
        }
    };

    /**
     * GET /api/media/files/[...path]
     * Download a file by path
     */
    async function GET(
        request: NextRequest,
        context: { params: Promise<{ path: string[] }> }
    ) {
        try {
            const userId = await getUserId();
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const { path: pathArray } = await context.params;
            const relativePath = pathArray.join('/');

            // Security: Verify the path starts with the current user's ID
            if (!relativePath.startsWith(userId + '/')) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            // Read file
            const fileBuffer = await readMediaFile(relativePath);

            // Extract filename from path
            const fileName = pathArray[pathArray.length - 1];

            // Determine MIME type from extension
            const ext = fileName.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                gif: 'image/gif',
                webp: 'image/webp',
                mp4: 'video/mp4',
                pdf: 'application/pdf',
            };
            const mimeType = mimeTypes[ext || ''] || 'application/octet-stream';

            return new NextResponse(new Uint8Array(fileBuffer), {
                headers: {
                    'Content-Type': mimeType,
                    'Content-Disposition': `inline; filename="${fileName}"`,
                    'Content-Length': fileBuffer.length.toString(),
                },
            });
        } catch (error: any) {
            if (error.message === 'File not found') {
                return NextResponse.json({ error: 'File not found' }, { status: 404 });
            }
            handleError(error, 'GET by path');
            return NextResponse.json(
                { error: 'Failed to download media', details: error?.message },
                { status: 500 }
            );
        }
    }

    /**
     * DELETE /api/media/files/[...path]
     * Delete a file by path
     */
    async function DELETE(
        request: NextRequest,
        context: { params: Promise<{ path: string[] }> }
    ) {
        try {
            const userId = await getUserId();
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const { path: pathArray } = await context.params;
            const relativePath = pathArray.join('/');

            // Security: Verify the path starts with the current user's ID
            if (!relativePath.startsWith(userId + '/')) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            // Delete file
            await deleteMediaFile(relativePath);

            return NextResponse.json({ success: true });
        } catch (error: any) {
            handleError(error, 'DELETE by path');
            return NextResponse.json(
                { error: 'Failed to delete media', details: error?.message },
                { status: 500 }
            );
        }
    }

    return { GET, DELETE };
}
