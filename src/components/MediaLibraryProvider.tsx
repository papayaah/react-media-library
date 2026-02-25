'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { useMediaDragDrop } from '../hooks/useMediaDragDrop';
import { MediaAIGenerateRequest, MediaAsset, MediaAIGenerator, MediaPexelsProvider, MediaFreepikProvider, FreepikContent, MediaSyncConfig, MediaLibraryAssetsProvider, LibraryAssetCategory, LibraryAsset } from '../types';

interface MediaLibraryContextValue {
    assets: MediaAsset[];
    loading: boolean;
    uploading: boolean;
    error: string | null;
    uploadFiles: (files: File[]) => Promise<void>;
    aiAvailable: boolean;
    aiGenerating: boolean;
    aiError: string | null;
    generateImages: (req: MediaAIGenerateRequest) => Promise<void>;
    pexelsAvailable: boolean;
    pexelsImages: import('../types').PexelsImage[];
    pexelsLoading: boolean;
    pexelsSelected: Set<string>;
    pexelsImporting: boolean;
    fetchPexelsImages: () => Promise<void>;
    togglePexelsSelect: (url: string) => void;
    selectAllPexels: () => void;
    deselectAllPexels: () => void;
    importPexelsImages: () => Promise<void>;
    // Freepik
    freepikAvailable: boolean;
    freepikContent: FreepikContent[];
    freepikLoading: boolean;
    freepikSelected: Set<string>;
    freepikImporting: boolean;
    freepikSearchQuery: string;
    setFreepikSearchQuery: (query: string) => void;
    freepikOrder: 'relevance' | 'popularity' | 'date';
    setFreepikOrder: (order: 'relevance' | 'popularity' | 'date') => void;
    searchFreepikIcons: () => Promise<void>;
    toggleFreepikSelect: (id: string) => void;
    selectAllFreepik: () => void;
    deselectAllFreepik: () => void;
    importFreepikContent: () => Promise<void>;
    // Library
    libraryAvailable: boolean;
    libraryCategories: LibraryAssetCategory[];
    libraryAssets: LibraryAsset[];
    libraryLoading: boolean;
    librarySelectedCategory: string | null;
    librarySelected: Set<string>;
    libraryImporting: boolean;
    fetchLibraryCategories: () => Promise<void>;
    fetchLibraryAssets: (categoryId: string) => Promise<void>;
    libraryBack: () => void;
    toggleLibrarySelect: (id: string) => void;
    selectAllLibrary: () => void;
    deselectAllLibrary: () => void;
    importLibraryAssets: () => Promise<void>;
    importSingleLibraryAsset: (assetId: string) => Promise<MediaAsset | null>;
    deleteAsset: (asset: MediaAsset) => Promise<void>;
    refresh: () => Promise<void>;
    isDragging: boolean;
    draggedItemCount: number;
    pendingUploads: number;
}

const MediaLibraryContext = createContext<MediaLibraryContextValue | null>(null);

export const useMediaLibraryContext = () => {
    const context = useContext(MediaLibraryContext);
    if (!context) {
        throw new Error('useMediaLibraryContext must be used within MediaLibraryProvider');
    }
    return context;
};

export interface MediaLibraryProviderProps {
    children: ReactNode;
    enableDragDrop?: boolean;
    ai?: MediaAIGenerator;
    pexels?: MediaPexelsProvider;
    freepik?: MediaFreepikProvider;
    library?: MediaLibraryAssetsProvider;
    /**
     * Optional sync configuration for server-side media storage.
     * When provided, media will be automatically synced to server when user is authenticated.
     */
    sync?: MediaSyncConfig;
}

export const MediaLibraryProvider: React.FC<MediaLibraryProviderProps> = ({
    children,
    enableDragDrop = true,
    ai,
    pexels,
    freepik,
    library,
    sync,
}) => {
    const mediaLibrary = useMediaLibrary({ ai, pexels, freepik, library, sync });
    const { isDragging, draggedItemCount } = useMediaDragDrop(
        mediaLibrary.uploadFiles,
        !enableDragDrop || mediaLibrary.uploading
    );

    return (
        <MediaLibraryContext.Provider value={{ ...mediaLibrary, isDragging, draggedItemCount }}>
            {children}
        </MediaLibraryContext.Provider>
    );
};
