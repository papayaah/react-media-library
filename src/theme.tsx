'use client';

import {
    createContext,
    useContext,
    type CSSProperties,
    type ReactNode,
} from 'react';

export type MediaThemeMode = 'light' | 'dark' | 'system' | 'inherit';

export interface MediaThemeTokens {
    background: string;
    surface: string;
    surfaceMuted: string;
    foreground: string;
    muted: string;
    border: string;
    accent: string;
    accentSoft: string;
    danger: string;
    dangerSoft: string;
    warning: string;
}

type MediaThemeStyle = CSSProperties & Partial<Record<`--rml-${string}`, string>>;

const lightDark = (light: string, dark: string) => `light-dark(${light}, ${dark})`;

function createTokenStyle(tokens: Partial<MediaThemeTokens>): MediaThemeStyle {
    return {
        ...(tokens.background && { '--rml-background': tokens.background }),
        ...(tokens.surface && { '--rml-surface': tokens.surface }),
        ...(tokens.surfaceMuted && { '--rml-surface-muted': tokens.surfaceMuted }),
        ...(tokens.foreground && { '--rml-foreground': tokens.foreground }),
        ...(tokens.muted && { '--rml-muted': tokens.muted }),
        ...(tokens.border && { '--rml-border': tokens.border }),
        ...(tokens.accent && { '--rml-accent': tokens.accent }),
        ...(tokens.accentSoft && { '--rml-accent-soft': tokens.accentSoft }),
        ...(tokens.danger && { '--rml-danger': tokens.danger }),
        ...(tokens.dangerSoft && { '--rml-danger-soft': tokens.dangerSoft }),
        ...(tokens.warning && { '--rml-warning': tokens.warning }),
    };
}

export function createMediaThemeStyle(
    mode: MediaThemeMode = 'system',
    tokens: Partial<MediaThemeTokens> = {},
): MediaThemeStyle {
    if (mode === 'inherit') {
        return {
            colorScheme: 'inherit',
            ...createTokenStyle(tokens),
        };
    }

    const colorScheme = mode === 'system' ? 'light dark' : mode;
    const defaults: MediaThemeTokens = {
        background: lightDark('#ffffff', '#0b0e17'),
        surface: lightDark('#ffffff', '#151c2c'),
        surfaceMuted: lightDark('#f8fafc', '#1e293b'),
        foreground: lightDark('#111827', '#e5e7eb'),
        muted: lightDark('#64748b', '#9ca3af'),
        border: lightDark('#e2e8f0', '#334155'),
        accent: lightDark('#6366f1', '#818cf8'),
        accentSoft: lightDark('#eef2ff', 'rgba(99, 102, 241, 0.16)'),
        danger: lightDark('#dc2626', '#f87171'),
        dangerSoft: lightDark('#fef2f2', 'rgba(248, 113, 113, 0.12)'),
        warning: lightDark('#d97706', '#fbbf24'),
    };
    const resolved = { ...defaults, ...tokens };

    return {
        colorScheme,
        color: resolved.foreground,
        ...createTokenStyle(resolved),
    };
}

const MediaThemeContext = createContext<CSSProperties>({});

export function MediaThemeScope({
    style,
    children,
}: {
    style: CSSProperties;
    children: ReactNode;
}) {
    return (
        <MediaThemeContext.Provider value={style}>
            {children}
        </MediaThemeContext.Provider>
    );
}

export function useMediaThemeStyle() {
    return useContext(MediaThemeContext);
}
