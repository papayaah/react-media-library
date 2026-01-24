/**
 * Server-side image processing utilities
 *
 * Uses sharp for image processing when available.
 * Falls back gracefully when sharp is not installed.
 *
 * Sharp is an OPTIONAL peer dependency - install it for:
 * - Image dimension extraction
 * - Server-side thumbnail generation
 *
 * Without sharp, uploads still work but dimensions and thumbnails are skipped.
 */

// Lazy-loaded sharp instance (undefined = not checked yet, null = not available)
let sharpModule: typeof import('sharp') | null | undefined = undefined;

/**
 * Try to load sharp dynamically
 * Returns null if sharp is not installed
 */
async function getSharp(): Promise<typeof import('sharp') | null> {
    if (sharpModule === undefined) {
        try {
            sharpModule = (await import('sharp')).default as unknown as typeof import('sharp');
        } catch {
            sharpModule = null;
        }
    }
    return sharpModule;
}

/**
 * Check if sharp is available
 */
export async function isSharpAvailable(): Promise<boolean> {
    return (await getSharp()) !== null;
}

export interface ImageMetadata {
    width: number;
    height: number;
    format?: string;
}

export interface ThumbnailResult {
    buffer: Buffer;
    width: number;
    height: number;
    mimeType: string;
}

export interface ProcessImageResult {
    metadata?: ImageMetadata;
    thumbnail?: ThumbnailResult;
}

export interface ProcessImageOptions {
    /** Generate thumbnail (default: true if sharp available) */
    generateThumbnail?: boolean;
    /** Max thumbnail dimension in pixels (default: 200) */
    thumbnailSize?: number;
    /** Thumbnail quality 1-100 (default: 80) */
    thumbnailQuality?: number;
}

/**
 * Process an image file to extract metadata and optionally generate a thumbnail
 *
 * @param buffer - Image file buffer
 * @param _mimeType - Original MIME type (reserved for future format-specific processing)
 * @param options - Processing options
 * @returns Metadata and thumbnail, or empty object if sharp unavailable
 */
export async function processImage(
    buffer: Buffer,
    _mimeType: string,
    options: ProcessImageOptions = {}
): Promise<ProcessImageResult> {
    const sharp = await getSharp();

    if (!sharp) {
        // Sharp not available - return empty result
        return {};
    }

    const {
        generateThumbnail = true,
        thumbnailSize = 200,
        thumbnailQuality = 80,
    } = options;

    const result: ProcessImageResult = {};

    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Extract dimensions
        if (metadata.width && metadata.height) {
            result.metadata = {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
            };
        }

        // Generate thumbnail
        if (generateThumbnail && metadata.width && metadata.height) {
            const thumbnailBuffer = await image
                .resize(thumbnailSize, thumbnailSize, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .jpeg({ quality: thumbnailQuality })
                .toBuffer();

            // Get thumbnail dimensions
            const thumbMeta = await sharp(thumbnailBuffer).metadata();

            result.thumbnail = {
                buffer: thumbnailBuffer,
                width: thumbMeta.width || thumbnailSize,
                height: thumbMeta.height || thumbnailSize,
                mimeType: 'image/jpeg',
            };
        }
    } catch (error) {
        // Log but don't throw - graceful degradation
        console.warn('[Image Processing] Failed to process image:', error);
    }

    return result;
}

/**
 * Check if a MIME type is a supported image format
 */
export function isSupportedImageType(mimeType: string): boolean {
    const supported = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/avif',
        'image/tiff',
    ];
    return supported.includes(mimeType);
}
