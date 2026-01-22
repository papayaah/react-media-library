/**
 * Server-side exports for media library
 * 
 * Provides utilities for server-side file storage and API route handlers.
 * Safe to use in Next.js API routes (no React dependencies).
 */

// Storage utilities
export {
    configureMediaStorage,
    getUserMediaPath,
    generateMediaFilename,
    saveMediaFile,
    readMediaFile,
    deleteMediaFile,
    getMediaFileStats,
    saveThumbnail,
} from './server/storage';
export type { MediaStorageConfig } from './server/storage';

// Next.js App Router route handlers (recommended)
export {
    createMediaAssetsRoutes,
    createMediaAssetByIdRoutes,
    createMediaThumbnailRoute,
    createMediaFileByPathRoutes,
} from './server/nextjs/routes';
export type { MediaAssetsRoutesConfig } from './server/nextjs/routes';

// Legacy route handlers (generic, can be used with any framework)
export {
    createMediaRoutes,
    createMediaAssetByIdRoutes as createMediaAssetByIdRoutesLegacy,
    createThumbnailRoute,
} from './server/routes';
export type { MediaRoutesConfig } from './server/routes';

// Sync service (client-side, but can be used in server components)
export { MediaSyncService } from './services/sync';
export type { MediaSyncConfig } from './services/sync';

// Freepik API Helper Functions
// These functions handle all Freepik API communication. Consumer apps use these
// in their backend routes to proxy requests to Freepik's API.

const FREEPIK_API_BASE = 'https://api.freepik.com/v1';

// ==========================================
// Types (inlined to avoid React dependency)
// ==========================================

export interface SearchFreepikIconsOptions {
    apiKey: string;
    query?: string;
    order?: 'relevance' | 'popularity' | 'date';
    page?: number;
    perPage?: number;
}

export interface DownloadFreepikIconOptions {
    apiKey: string;
    iconId: string;
    format?: 'svg' | 'png' | 'gif' | 'mp4' | 'aep' | 'json' | 'psd' | 'eps';
    pngSize?: number; // e.g., 512, 256, 128, 64, 32, 24, 16 - only applies when format is 'png'
}

export interface SearchFreepikResourcesOptions {
    apiKey: string;
    query?: string;
    type?: 'photo' | 'vector' | 'psd';
    order?: string;
    page?: number;
    perPage?: number;
}

export interface DownloadFreepikResourceOptions {
    apiKey: string;
    resourceId: string;
    format?: string;
}

// Freepik API response types (inlined)
export type FreepikIconResponse = {
    data: Array<{
        id: number;
        name: string;
        thumbnails: Array<{ url: string; width: number; height: number }>;
        author: { name: string; avatar: string };
        style: string;
        family: { id: number; name: string; slug: string };
        tags: string[];
        created: string;
        free_svg: boolean;
    }>;
    meta: {
        pagination: {
            total: number;
            count: number;
            per_page: number;
            current_page: number;
            total_pages: number;
        };
    };
};

export type FreepikDownloadResponse = {
    data: {
        url: string;
        filename: string;
    };
};

export type FreepikContent = {
    id: string;
    name: string;
    thumbnailUrl: string;
    type: 'icon' | 'photo' | 'vector';
    isFree: boolean;
    metadata?: {
        author?: { name: string; avatar: string };
        style?: string;
        family?: { id: number; name: string; slug: string };
        tags?: string[];
        created?: string;
    };
};

// ==========================================
// API Functions
// ==========================================

/**
 * Search for icons using the Freepik /v1/icons endpoint
 */
export async function searchFreepikIcons(
    options: SearchFreepikIconsOptions
): Promise<FreepikIconResponse> {
    const params = new URLSearchParams();
    if (options.query) params.set('term', options.query); // API uses 'term', not 'q'
    if (options.order) params.set('order', options.order);
    if (options.page) params.set('page', String(options.page));
    if (options.perPage) params.set('per_page', String(options.perPage));

    const url = `${FREEPIK_API_BASE}/icons?${params}`;

    const res = await fetch(url, {
        headers: {
            'x-freepik-api-key': options.apiKey,
            Accept: 'application/json',
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Freepik API error (${res.status}): ${errorText}`);
    }

    return res.json();
}

/**
 * Download an icon using the Freepik /v1/icons/{id}/download endpoint
 */
export async function downloadFreepikIcon(
    options: DownloadFreepikIconOptions
): Promise<FreepikDownloadResponse> {
    const params = new URLSearchParams();
    // Default to SVG for best quality and transparency support
    if (options.format) params.set('format', options.format);
    if (options.pngSize) params.set('png_size', String(options.pngSize));

    const url = `${FREEPIK_API_BASE}/icons/${options.iconId}/download?${params}`;

    const res = await fetch(url, {
        headers: {
            'x-freepik-api-key': options.apiKey,
            Accept: 'application/json',
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Freepik download error (${res.status}): ${errorText}`);
    }

    return res.json();
}

/**
 * Search for resources (photos, vectors, PSDs) using the Freepik /v1/resources endpoint
 */
export async function searchFreepikResources(
    options: SearchFreepikResourcesOptions
): Promise<any> {
    const params = new URLSearchParams();
    if (options.query) params.set('term', options.query);
    if (options.type) {
        // Map to Freepik's filter format
        const filterMap: Record<string, string> = {
            photo: 'photo',
            vector: 'vector',
            psd: 'psd',
        };
        if (filterMap[options.type]) {
            params.set('filters[content_type][' + filterMap[options.type] + ']', '1');
        }
    }
    if (options.order) params.set('order', options.order);
    if (options.page) params.set('page', String(options.page));
    if (options.perPage) params.set('per_page', String(options.perPage));

    const url = `${FREEPIK_API_BASE}/resources?${params}`;

    const res = await fetch(url, {
        headers: {
            'x-freepik-api-key': options.apiKey,
            Accept: 'application/json',
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Freepik API error (${res.status}): ${errorText}`);
    }

    return res.json();
}

/**
 * Download a resource using the Freepik /v1/resources/{id}/download endpoint
 */
export async function downloadFreepikResource(
    options: DownloadFreepikResourceOptions
): Promise<FreepikDownloadResponse> {
    const params = new URLSearchParams();
    if (options.format) params.set('format', options.format);

    const url = `${FREEPIK_API_BASE}/resources/${options.resourceId}/download?${params}`;

    const res = await fetch(url, {
        headers: {
            'x-freepik-api-key': options.apiKey,
            Accept: 'application/json',
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Freepik download error (${res.status}): ${errorText}`);
    }

    return res.json();
}

// ==========================================
// Next.js Route Handler Factories
// ==========================================

/**
 * Creates a Next.js route handler for Freepik icon search.
 *
 * Usage in your app/api/freepik/icons/route.ts:
 * ```ts
 * import { createFreepikIconsHandler } from '@reactkits.dev/react-media-library/server';
 * export const GET = createFreepikIconsHandler();
 * ```
 */
export function createFreepikIconsHandler(options?: { apiKey?: string }) {
    return async function GET(request: Request) {
        const apiKey = options?.apiKey || process.env.FREEPIK_API_KEY;
        if (!apiKey) {
            return Response.json({ error: 'Freepik API key not configured' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('term') || undefined;
        const order = (searchParams.get('order') as 'relevance' | 'popularity' | 'date') || 'relevance';
        const page = Number(searchParams.get('page')) || 1;
        const perPage = Number(searchParams.get('per_page')) || 20;

        try {
            const result = await searchFreepikIcons({
                apiKey,
                query,
                order,
                page,
                perPage,
            });

            // Normalize to FreepikContent format
            const content = result.data.map((item) => ({
                id: String(item.id),
                name: item.name,
                thumbnailUrl: item.thumbnails[0]?.url || '',
                type: 'icon' as const,
                isFree: item.free_svg,
                metadata: {
                    author: item.author,
                    style: item.style,
                    family: item.family,
                    tags: item.tags,
                    created: item.created,
                },
            }));

            return Response.json({ content, pagination: result.meta.pagination });
        } catch (error: any) {
            console.error('Freepik API error:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }
    };
}

/**
 * Creates a Next.js route handler for Freepik icon download.
 * This proxies the download request through your server to handle CORS and authentication.
 *
 * Usage in your app/api/freepik/icons/[id]/download/route.ts:
 * ```ts
 * import { createFreepikIconDownloadHandler } from '@reactkits.dev/react-media-library/server';
 * export const GET = createFreepikIconDownloadHandler();
 * ```
 */
export function createFreepikIconDownloadHandler(options?: { apiKey?: string }) {
    return async function GET(
        request: Request,
        { params }: { params: Promise<{ id: string }> }
    ) {
        const apiKey = options?.apiKey || process.env.FREEPIK_API_KEY;
        if (!apiKey) {
            return Response.json({ error: 'Freepik API key not configured' }, { status: 500 });
        }

        const { id: iconId } = await params;
        if (!iconId) {
            return Response.json({ error: 'Icon ID is required' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const format = (searchParams.get('format') as DownloadFreepikIconOptions['format']) || 'svg';
        const pngSize = searchParams.get('png_size') ? Number(searchParams.get('png_size')) : undefined;

        try {
            // Get the download URL from Freepik API
            const downloadInfo = await downloadFreepikIcon({
                apiKey,
                iconId,
                format,
                pngSize,
            });

            // Fetch the actual file from Freepik's CDN
            const fileRes = await fetch(downloadInfo.data.url);
            if (!fileRes.ok) {
                throw new Error(`Failed to fetch file from Freepik CDN: ${fileRes.status}`);
            }

            const blob = await fileRes.blob();
            const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';

            // Return the file with proper headers
            return new Response(blob, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${downloadInfo.data.filename}"`,
                },
            });
        } catch (error: any) {
            console.error('Freepik download error:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }
    };
}
