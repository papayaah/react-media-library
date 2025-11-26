import { useEffect, useRef, useState } from 'react';

export const useMediaDragDrop = (onDrop: (files: File[]) => void, disabled: boolean = false) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    useEffect(() => {
        if (disabled) return;

        const hasFileItems = (event: DragEvent) => {
            const types = Array.from(event.dataTransfer?.types || []);
            return types.includes('Files');
        };

        const handleDragEnter = (event: DragEvent) => {
            if (!hasFileItems(event)) return;
            event.preventDefault();
            dragCounter.current += 1;
            setIsDragging(true);
        };

        const handleDragOver = (event: DragEvent) => {
            if (!hasFileItems(event)) return;
            event.preventDefault();
        };

        const handleDragLeave = (event: DragEvent) => {
            if (!hasFileItems(event)) return;
            event.preventDefault();
            dragCounter.current = Math.max(dragCounter.current - 1, 0);
            if (dragCounter.current === 0) {
                setIsDragging(false);
            }
        };

        const handleDrop = (event: DragEvent) => {
            if (!hasFileItems(event)) return;
            event.preventDefault();
            dragCounter.current = 0;
            setIsDragging(false);

            const files = Array.from(event.dataTransfer?.files || []);
            if (files.length > 0) {
                onDrop(files);
            }
        };

        window.addEventListener('dragenter', handleDragEnter);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragenter', handleDragEnter);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('drop', handleDrop);
            dragCounter.current = 0;
            setIsDragging(false);
        };
    }, [onDrop, disabled]);

    return { isDragging };
};
