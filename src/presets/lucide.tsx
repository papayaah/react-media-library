import type { MediaGridIcons } from '../types';
import {
    Upload,
    Search,
    Trash2,
    Image,
    Video,
    Music,
    FileText,
    File,
    LayoutGrid,
    List,
    Columns,
    SlidersHorizontal,
    Check,
    X,
    Crop,
    RotateCw,
    RotateCcw,
    FlipHorizontal,
    FlipVertical,
    ZoomIn,
    ZoomOut,
    Undo,
    Hand,
} from 'lucide-react';

/**
 * Lucide React Icons Preset
 * 
 * This preset provides Lucide React icon components for use with MediaGrid.
 * 
 * IMPORTANT: lucide-react must be installed in devDependencies for Storybook/demo.
 * For production use, install lucide-react in your project:
 *   npm install lucide-react
 * 
 * Usage:
 *   import { lucideIcons } from '@buzzer/media-library';
 *   <MediaGrid icons={lucideIcons} />
 */
export const lucideIcons: MediaGridIcons = {
    upload: Upload,
    search: Search,
    trash: Trash2,
    photo: Image,
    video: Video,
    audio: Music,
    document: FileText,
    file: File,
    layoutGrid: LayoutGrid,
    list: List,
    columns: Columns,
    slidersHorizontal: SlidersHorizontal,
    check: Check,
    x: X,
    crop: Crop,
    rotateCw: RotateCw,
    rotateCcw: RotateCcw,
    flipHorizontal: FlipHorizontal,
    flipVertical: FlipVertical,
    zoomIn: ZoomIn,
    zoomOut: ZoomOut,
    undo: Undo,
    hand: Hand,
};

// Debug: Verify icons are loaded (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[LucideIcons] Icons loaded:', {
        upload: typeof lucideIcons.upload,
        search: typeof lucideIcons.search,
        trash: typeof lucideIcons.trash,
        totalKeys: Object.keys(lucideIcons).length
    });
}
