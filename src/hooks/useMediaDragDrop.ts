import { useEffect, useRef, useState } from 'react';

export const useMediaDragDrop = (onDrop: (files: File[]) => void, disabled: boolean = false) => {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedItemCount, setDraggedItemCount] = useState(0);
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
            
            // Try to get the number of items being dragged
            if (event.dataTransfer?.items) {
                setDraggedItemCount(event.dataTransfer.items.length);
            }
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
                setDraggedItemCount(0);
            }
        };

        const handleDrop = (event: DragEvent) => {
            if (!hasFileItems(event)) return;
            event.preventDefault();
            dragCounter.current = 0;
            setIsDragging(false);
            setDraggedItemCount(0);

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
            setDraggedItemCount(0);
        };
    }, [onDrop, disabled]);

    return { isDragging, draggedItemCount };
};
