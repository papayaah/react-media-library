/**
 * Next.js App Router route handlers for media library
 * 
 * Provides factory functions that create route handlers, similar to better-auth-connect.
 */

export {
    createMediaAssetsRoutes,
    createMediaAssetByIdRoutes,
    createMediaThumbnailRoute,
} from './routes';
export type { MediaAssetsRoutesConfig } from './routes';
