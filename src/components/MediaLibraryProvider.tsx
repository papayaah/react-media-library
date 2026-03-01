'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { useMediaDragDrop } from '../hooks/useMediaDragDrop';
import { MediaAIGenerator, MediaPexelsProvider, MediaFreepikProvider, MediaSyncConfig, MediaLibraryAssetsProvider, MediaLibraryContextValue } from '../types';

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
      * When provided, media will be automatically synced to server when user is authenticated.
      */
    sync?: MediaSyncConfig;
    /** Optional storage limit in bytes. Defaults to 50MB. */
    storageLimit?: number;
}

export const MediaLibraryProvider: React.FC<MediaLibraryProviderProps> = ({
    children,
    enableDragDrop = true,
    ai,
    pexels,
    freepik,
    library,
    sync,
    storageLimit,
}) => {
    const mediaLibrary = useMediaLibrary({ ai, pexels, freepik, library, sync, storageLimit });
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
