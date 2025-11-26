import { ReactNode } from 'react';

export interface MediaAsset {
    id?: number;
    handleName: string;
    fileName: string;
    fileType: MediaType;
    mimeType: string;
    size: number;
    createdAt: number;
    updatedAt: number;
    previewUrl?: string;
}

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface MediaLibraryConfig {
    dbName?: string;
    opfsDirectory?: string;
}

// Component Preset Types
export interface CardProps {
    children: ReactNode;
    onClick?: () => void;
    selected?: boolean;
    className?: string;
}

export interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    disabled?: boolean;
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    leftIcon?: ReactNode;
    className?: string;
}

export interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    leftIcon?: ReactNode;
    className?: string;
}

export interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    className?: string;
}

export interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    className?: string;
}

export interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'primary' | 'secondary';
    className?: string;
}

export interface ImageProps {
    src: string;
    alt: string;
    className?: string;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export interface EmptyStateProps {
    icon?: ReactNode;
    message: string;
    className?: string;
}

export interface FileButtonProps {
    onSelect: (files: File[]) => void;
    multiple?: boolean;
    disabled?: boolean;
    children: ReactNode;
}

export interface GridProps {
    children: ReactNode;
    columns?: number;
    gap?: string;
    className?: string;
}

export interface SkeletonProps {
    className?: string;
}

export interface UploadCardProps {
    onClick: () => void;
    isDragging: boolean;
    className?: string;
    children?: ReactNode;
}

export interface ViewerProps {
    isOpen: boolean;
    onClose: () => void;
    main: React.ReactNode;
    sidebar: React.ReactNode;
    actions: React.ReactNode;
}

export interface ViewerThumbnailProps {
    src: string;
    alt: string;
    selected: boolean;
    onClick: () => void;
}

// Component Preset Interface
export interface ComponentPreset {
    Card: React.FC<CardProps>;
    Button: React.FC<ButtonProps>;
    TextInput: React.FC<TextInputProps>;
    Select: React.FC<SelectProps>;
    Checkbox: React.FC<CheckboxProps>;
    Badge: React.FC<BadgeProps>;
    Image: React.FC<ImageProps>;
    Modal: React.FC<ModalProps>;
    Loader: React.FC<LoaderProps>;
    EmptyState: React.FC<EmptyStateProps>;
    FileButton: React.FC<FileButtonProps>;
    Grid: React.FC<GridProps>;
    Skeleton: React.FC<SkeletonProps>;
    UploadCard: React.FC<UploadCardProps>;
    Viewer: React.FC<ViewerProps>;
    ViewerThumbnail: React.FC<ViewerThumbnailProps>;
}
