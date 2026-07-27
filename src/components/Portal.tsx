'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMediaThemeStyle } from '../theme';

interface PortalProps {
    children: React.ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    const themeStyle = useMediaThemeStyle();

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    // Only render on client
    if (!mounted) return null;

    // Create portal into document body
    return createPortal(
        <div style={{ ...themeStyle, display: 'contents' }}>{children}</div>,
        document.body,
    );
};
