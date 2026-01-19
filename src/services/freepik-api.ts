/**
 * Freepik API Helper Functions
 *
 * These functions handle all Freepik API communication. Consumer apps use these
 * in their backend routes to proxy requests to Freepik's API.
 */

import type { FreepikIconResponse, FreepikDownloadResponse } from '../types';

const FREEPIK_API_BASE = 'https://api.freepik.com/v1';

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
