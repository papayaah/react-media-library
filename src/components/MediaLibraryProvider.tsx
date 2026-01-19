import React, { createContext, useContext, ReactNode } from 'react';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { useMediaDragDrop } from '../hooks/useMediaDragDrop';
import { MediaAIGenerateRequest, MediaAsset, MediaAIGenerator, MediaPexelsProvider } from '../types';

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

interface MediaLibraryProviderProps {
    children: ReactNode;
    enableDragDrop?: boolean;
    ai?: MediaAIGenerator;
    pexels?: MediaPexelsProvider;
}

export const MediaLibraryProvider: React.FC<MediaLibraryProviderProps> = ({
    children,
    enableDragDrop = true,
    ai,
    pexels,
}) => {
    const mediaLibrary = useMediaLibrary({ ai, pexels });
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
