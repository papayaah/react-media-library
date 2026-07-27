'use client';

import React from 'react';

export const MediaGridHeader: React.FC = () => {
    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--rml-foreground)' }}>
                Media Library
            </h1>
            <p style={{ color: 'var(--rml-muted)', fontSize: '0.875rem' }}>
                Upload and manage your images, videos, and other assets
            </p>
        </div>
    );
};
