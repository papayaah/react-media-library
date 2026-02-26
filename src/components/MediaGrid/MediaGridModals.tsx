'use client';

import React from 'react';
import { MediaAsset, ComponentPreset, MediaGridIcons } from '../../types';
import { MediaViewer } from '../MediaViewer';

interface MediaGridModalsProps {
    preset: ComponentPreset;
    icons: MediaGridIcons;

    // AI Modal
    aiAvailable: boolean;
    aiModalOpen: boolean;
    setAiModalOpen: (open: boolean) => void;
    aiPrompt: string;
    setAiPrompt: (prompt: string) => void;
    aiWidth: string;
    setAiWidth: (width: string) => void;
    aiHeight: string;
    setAiHeight: (height: string) => void;
    aiSteps: string;
    setAiSteps: (steps: string) => void;
    aiModel: string;
    setAiModel: (model: string) => void;
    aiError: string | null;
    aiGenerating: boolean;
    generateImages: (params: any) => Promise<void>;

    // Pexels
    pexelsAvailable: boolean;
    pexelsModalOpen: boolean;
    setPexelsModalOpen: (open: boolean) => void;
    pexelsImages: any[];
    pexelsLoading: boolean;
    pexelsSelected: Set<string>;
    togglePexelsSelect: (id: string) => void;
    selectAllPexels: () => void;
    deselectAllPexels: () => void;
    pexelsImporting: boolean;
    importPexelsImages: () => Promise<void>;

    // Freepik
    freepikAvailable: boolean;
    freepikModalOpen: boolean;
    setFreepikModalOpen: (open: boolean) => void;
    freepikContent: any[];
    freepikLoading: boolean;
    freepikSearchQuery: string;
    setFreepikSearchQuery: (query: string) => void;
    searchFreepikIcons: (query?: string) => Promise<void>;
    freepikSelected: Set<string>;
    toggleFreepikSelect: (id: string) => void;
    selectAllFreepik: () => void;
    deselectAllFreepik: () => void;
    freepikImporting: boolean;
    importFreepikContent: () => Promise<void>;
    freepikOrder: 'relevance' | 'popularity' | 'date';
    setFreepikOrder: (order: 'relevance' | 'popularity' | 'date') => void;

    // Library
    libraryModalOpen: boolean;
    setLibraryModalOpen: (open: boolean) => void;
    libraryCategories: any[];
    libraryAssets: any[];
    libraryLoading: boolean;
    librarySelectedCategory: string | null;
    fetchLibraryAssets: (categoryId: string) => Promise<void>;
    libraryBack: () => void;
    librarySelected: Set<string>;
    toggleLibrarySelect: (id: string) => void;
    selectAllLibrary: () => void;
    deselectAllLibrary: () => void;
    libraryImporting: boolean;
    importLibraryAssets: () => Promise<void>;

    // Viewer
    viewingAsset: MediaAsset | null;
    setViewingAsset: (asset: MediaAsset | null) => void;
    filteredAssets: MediaAsset[];
    deleteAsset: (asset: MediaAsset) => Promise<void>;
    uploadFiles: (files: FileList | File[]) => Promise<void>;
}

export const MediaGridModals: React.FC<MediaGridModalsProps> = ({
    preset,
    icons,
    aiAvailable,
    aiModalOpen,
    setAiModalOpen,
    aiPrompt,
    setAiPrompt,
    aiWidth,
    setAiWidth,
    aiHeight,
    setAiHeight,
    aiSteps,
    setAiSteps,
    aiModel,
    setAiModel,
    aiError,
    aiGenerating,
    generateImages,
    pexelsAvailable,
    pexelsModalOpen,
    setPexelsModalOpen,
    pexelsImages,
    pexelsLoading,
    pexelsSelected,
    togglePexelsSelect,
    selectAllPexels,
    deselectAllPexels,
    pexelsImporting,
    importPexelsImages,
    freepikAvailable,
    freepikModalOpen,
    setFreepikModalOpen,
    freepikContent,
    freepikLoading,
    freepikSearchQuery,
    setFreepikSearchQuery,
    searchFreepikIcons,
    freepikSelected,
    toggleFreepikSelect,
    selectAllFreepik,
    deselectAllFreepik,
    freepikImporting,
    importFreepikContent,
    freepikOrder,
    setFreepikOrder,
    libraryModalOpen,
    setLibraryModalOpen,
    libraryCategories,
    libraryAssets,
    libraryLoading,
    librarySelectedCategory,
    fetchLibraryAssets,
    libraryBack,
    librarySelected,
    toggleLibrarySelect,
    selectAllLibrary,
    deselectAllLibrary,
    libraryImporting,
    importLibraryAssets,
    viewingAsset,
    setViewingAsset,
    filteredAssets,
    deleteAsset,
    uploadFiles,
}) => {
    const { Modal, TextInput, Select, Button, AIGenerateSidebar, PexelsImagePicker, FreepikContentPicker, LibraryAssetPicker } = preset;

    return (
        <>
            {aiAvailable && AIGenerateSidebar ? (
                <AIGenerateSidebar
                    isOpen={aiModalOpen}
                    onClose={() => setAiModalOpen(false)}
                    prompt={aiPrompt}
                    onPromptChange={setAiPrompt}
                    width={aiWidth}
                    onWidthChange={setAiWidth}
                    height={aiHeight}
                    onHeightChange={setAiHeight}
                    steps={aiSteps}
                    onStepsChange={setAiSteps}
                    model={aiModel}
                    onModelChange={setAiModel}
                    onPresetChange={(val) => {
                        if (!val) return;
                        setAiWidth(val);
                        setAiHeight(val);
                    }}
                    error={aiError}
                    generating={aiGenerating}
                    onGenerate={async () => {
                        const width = Math.max(1, Number(aiWidth) || 768);
                        const height = Math.max(1, Number(aiHeight) || 768);
                        const steps = Number(aiSteps);
                        await generateImages({
                            prompt: aiPrompt.trim(),
                            width,
                            height,
                            steps: Number.isFinite(steps) ? steps : undefined,
                            model: aiModel.trim() || undefined,
                        });
                        setAiModalOpen(false);
                    }}
                    onCancel={() => setAiModalOpen(false)}
                />
            ) : aiAvailable ? (
                <Modal
                    isOpen={aiModalOpen}
                    onClose={() => setAiModalOpen(false)}
                    title="Generate image"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                Prompt
                            </div>
                            <TextInput
                                value={aiPrompt}
                                onChange={setAiPrompt}
                                placeholder="Describe the image you want..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Width
                                </div>
                                <TextInput
                                    value={aiWidth}
                                    onChange={setAiWidth}
                                    type="number"
                                    placeholder="768"
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Height
                                </div>
                                <TextInput
                                    value={aiHeight}
                                    onChange={setAiHeight}
                                    type="number"
                                    placeholder="768"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Preset
                                </div>
                                <Select
                                    value=""
                                    onChange={(val) => {
                                        if (!val) return;
                                        setAiWidth(val);
                                        setAiHeight(val);
                                    }}
                                    placeholder="Pick a size"
                                    options={[
                                        { value: '512', label: '512 × 512' },
                                        { value: '768', label: '768 × 768' },
                                        { value: '1024', label: '1024 × 1024' },
                                    ]}
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    Steps (optional)
                                </div>
                                <TextInput
                                    value={aiSteps}
                                    onChange={setAiSteps}
                                    type="number"
                                    placeholder="25"
                                />
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                Model (optional)
                            </div>
                            <TextInput
                                value={aiModel}
                                onChange={setAiModel}
                                placeholder="e.g. stability-ai/sdxl:… (provider-specific)"
                            />
                        </div>

                        {aiError && (
                            <div style={{ color: '#b91c1c', fontSize: '0.875rem' }}>
                                {aiError}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <Button variant="secondary" onClick={() => setAiModalOpen(false)} disabled={aiGenerating}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                loading={aiGenerating}
                                disabled={!aiPrompt.trim()}
                                onClick={async () => {
                                    const width = Math.max(1, Number(aiWidth) || 768);
                                    const height = Math.max(1, Number(aiHeight) || 768);
                                    const steps = Number(aiSteps);
                                    await generateImages({
                                        prompt: aiPrompt.trim(),
                                        width,
                                        height,
                                        steps: Number.isFinite(steps) ? steps : undefined,
                                        model: aiModel.trim() || undefined,
                                    });
                                    setAiModalOpen(false);
                                }}
                            >
                                Generate
                            </Button>
                        </div>
                    </div>
                </Modal>
            ) : null}

            {pexelsAvailable && PexelsImagePicker && (
                <PexelsImagePicker
                    isOpen={pexelsModalOpen}
                    onClose={() => {
                        setPexelsModalOpen(false);
                        deselectAllPexels();
                    }}
                    images={pexelsImages}
                    loading={pexelsLoading}
                    selected={pexelsSelected}
                    onToggleSelect={togglePexelsSelect}
                    onSelectAll={selectAllPexels}
                    onDeselectAll={deselectAllPexels}
                    importing={pexelsImporting}
                    onImport={async () => {
                        await importPexelsImages();
                        setPexelsModalOpen(false);
                    }}
                />
            )}

            {freepikAvailable && FreepikContentPicker && (
                <FreepikContentPicker
                    isOpen={freepikModalOpen}
                    onClose={() => {
                        setFreepikModalOpen(false);
                        deselectAllFreepik();
                    }}
                    content={freepikContent}
                    loading={freepikLoading}
                    searchQuery={freepikSearchQuery}
                    onSearchQueryChange={setFreepikSearchQuery}
                    onSearch={searchFreepikIcons}
                    selected={freepikSelected}
                    onToggleSelect={toggleFreepikSelect}
                    onSelectAll={selectAllFreepik}
                    onDeselectAll={deselectAllFreepik}
                    importing={freepikImporting}
                    onImport={async () => {
                        await importFreepikContent();
                        setFreepikModalOpen(false);
                    }}
                    order={freepikOrder}
                    onOrderChange={setFreepikOrder}
                />
            )}

            {LibraryAssetPicker && libraryModalOpen && (
                <LibraryAssetPicker
                    isOpen={libraryModalOpen}
                    onClose={() => {
                        setLibraryModalOpen(false);
                        deselectAllLibrary();
                    }}
                    categories={libraryCategories}
                    assets={libraryAssets}
                    loading={libraryLoading}
                    selectedCategory={librarySelectedCategory}
                    onCategorySelect={(categoryId) => {
                        fetchLibraryAssets(categoryId);
                    }}
                    onBack={libraryBack}
                    selected={librarySelected}
                    onToggleSelect={toggleLibrarySelect}
                    onSelectAll={selectAllLibrary}
                    onDeselectAll={deselectAllLibrary}
                    importing={libraryImporting}
                    onImport={async () => {
                        await importLibraryAssets();
                        setLibraryModalOpen(false);
                    }}
                />
            )}

            <MediaViewer
                isOpen={viewingAsset !== null}
                onClose={() => setViewingAsset(null)}
                initialAssetId={viewingAsset?.id ?? null}
                assets={filteredAssets}
                preset={preset}
                onDelete={deleteAsset}
                onSave={uploadFiles}
                icons={icons}
            />
        </>
    );
};
