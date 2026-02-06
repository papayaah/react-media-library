/**
 * Next.js API route handlers for media assets
 * 
 * These are template functions that can be used to create API routes.
 * They handle authentication, file uploads, and database operations.
 * 
 * **Authentication-agnostic**: This package doesn't depend on any specific auth library.
 * It only requires a `getUserId` callback that can integrate with any auth system.
 * 
 * Usage:
 * ```ts
 * // app/api/media/assets/route.ts
 * import { createMediaRoutes } from '@reactkits.dev/react-media-library/server/routes';
 * 
 * export const { POST, GET } = createMediaRoutes({
 *   getUserId: async () => {
 *     // Integrate with your auth system (BetterAuth, NextAuth, Clerk, custom, etc.)
 *     const session = await auth.api.getSession({ headers: await headers() });
 *     return session?.user?.id || null; // Return null if not authenticated
 *   },
 *   db: yourDbInstance,
 *   mediaAssetsTable: yourMediaAssetsTable,
 * });
 * ```
 * 
 * All routes require authentication - they will return 401 Unauthorized if `getUserId` returns null.
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveMediaFile, readMediaFile, deleteMediaFile } from './storage';

export interface MediaRoutesConfig {
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
     * Database instance (Drizzle)
     */
    db: any;
    
    /**
     * Media assets table from Drizzle schema
     */
    mediaAssetsTable: any;
    
    /**
     * Optional: Custom error handler
     */
    onError?: (error: Error, context: string) => void;
}

/**
 * Create media API route handlers
 */
export function createMediaRoutes(config: MediaRoutesConfig) {
    const { getUserId, db, mediaAssetsTable, onError } = config;

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
            const fileType = mimeType.startsWith('image/') ? 'image'
                : mimeType.startsWith('video/') ? 'video'
                : mimeType.startsWith('audio/') ? 'audio'
                : mimeType.includes('pdf') || mimeType.includes('document') ? 'document'
                : 'other';

            // Save file to local storage
            const relativePath = await saveMediaFile(userId, file, file.name);

            // Extract dimensions for images (optional - can be added later with sharp or similar)
            let width: number | undefined;
            let height: number | undefined;
            let thumbnailPath: string | undefined;

            // TODO: Add image dimension extraction and thumbnail generation using 'sharp' if needed

            // Save metadata to database
            const [asset] = await db
                .insert(mediaAssetsTable)
                .values({
                    userId,
                    fileName: file.name,
                    fileType,
                    mimeType,
                    size: file.size,
                    width,
                    height,
                    path: relativePath,
                    thumbnailPath,
                })
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

            // Import eq and desc from drizzle-orm
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
 * Create media asset by ID route handlers
 */
export function createMediaAssetByIdRoutes(config: MediaRoutesConfig) {
    const { getUserId, db, mediaAssetsTable, onError } = config;

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

            // Import eq from drizzle-orm
            const { eq } = await import('drizzle-orm');

            // Get asset from database
            const [asset] = await db
                .select()
                .from(mediaAssetsTable)
                .where(eq(mediaAssetsTable.id, id))
                .limit(1);

            if (!asset) {
                return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
            }

            // Verify ownership
            if (asset.userId !== userId) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            // Read file from storage
            const fileBuffer = await readMediaFile(asset.path);

            // Return file with appropriate headers
            return new NextResponse(new Uint8Array(fileBuffer), {
                headers: {
                    'Content-Type': asset.mimeType,
                    'Content-Disposition': `inline; filename="${asset.fileName}"`,
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

            // Import eq from drizzle-orm
            const { eq } = await import('drizzle-orm');

            // Get asset from database
            const [asset] = await db
                .select()
                .from(mediaAssetsTable)
                .where(eq(mediaAssetsTable.id, id))
                .limit(1);

            if (!asset) {
                return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
            }

            // Verify ownership
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
 * Create thumbnail route handler
 */
export function createThumbnailRoute(config: MediaRoutesConfig) {
    const { getUserId, db, mediaAssetsTable, onError } = config;

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

            // Import eq from drizzle-orm
            const { eq } = await import('drizzle-orm');

            // Get asset from database
            const [asset] = await db
                .select()
                .from(mediaAssetsTable)
                .where(eq(mediaAssetsTable.id, id))
                .limit(1);

            if (!asset) {
                return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
            }

            // Verify ownership
            if (asset.userId !== userId) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            // Use thumbnail if available, otherwise fall back to original
            const path = asset.thumbnailPath || asset.path;
            const fileBuffer = await readMediaFile(path);

            return new NextResponse(new Uint8Array(fileBuffer), {
                headers: {
                    'Content-Type': asset.thumbnailPath ? 'image/jpeg' : asset.mimeType,
                    'Content-Disposition': `inline; filename="thumb-${asset.fileName}"`,
                    'Content-Length': fileBuffer.length.toString(),
                },
            });
        } catch (error: any) {
            handleError(error, 'GET thumbnail');
            return NextResponse.json(
                { error: 'Failed to get thumbnail', details: error?.message },
                { status: 500 }
            );
        }
    }

    return { GET };
}
