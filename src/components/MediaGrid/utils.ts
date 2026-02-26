import { MediaGridIcons } from '../../types';
import { renderIcon } from '../../utils/renderIcon';

export const typeIconMap = (icons: MediaGridIcons | undefined) => ({
    image: icons?.photo,
    video: icons?.video,
    audio: icons?.audio,
    document: icons?.document,
    other: icons?.file,
});

export const renderTypeIcon = (icon: MediaGridIcons[keyof MediaGridIcons] | undefined, size: number = 48) => {
    return renderIcon(icon, size);
};

export const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes)) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export const formatTimestamp = (ms: number | undefined) => {
    if (!ms) return '';
    const date = new Date(ms);
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
