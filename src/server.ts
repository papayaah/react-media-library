// Server-only exports - safe to use in Next.js API routes
// This file does NOT import any React-dependent modules to avoid "use client" conflicts

/**
 * Freepik API Helper Functions
 *
 * These functions handle all Freepik API communication. Consumer apps use these
 * in their backend routes to proxy requests to Freepik's API.
 */

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
    pngSize?: number; // e.g., 512, 256, 128, 64
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
