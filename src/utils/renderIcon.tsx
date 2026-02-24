import React from 'react';
import type { IconComponent } from '../types';

/**
 * Helper function to render an icon with optional text fallback
 * Supports both React components (with size prop) and ReactNode
 */
export const renderIcon = (
    icon: IconComponent | React.ReactNode | undefined,
    size: number | string = 16,
    props?: Record<string, any>,
    fallbackText?: string
): React.ReactNode => {
    if (!icon) {
        // Return text fallback if provided, otherwise null
        return fallbackText ? <span>{fallbackText}</span> : null;
    }

    // If it's already a ReactNode/element (instance), return it as-is
    if (React.isValidElement(icon)) {
        return icon;
    }

    // If it's a function (component) or object (forwardRef/memo/etc), render it with size
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
        const IconComponent = icon as any;
        try {
            // Check if it's a component type by seeing if it's NOT a React element instance
            // React.isValidElement already handled that above.
            return React.createElement(IconComponent, { size, stroke: 1.5, ...props });
        } catch (e) {
            return fallbackText ? <span>{fallbackText}</span> : null;
        }
    }

    // If it's a string or number, return as-is (valid React children)
    if (typeof icon === 'string' || typeof icon === 'number') {
        return icon;
    }

    // Fallback to text if provided, otherwise null
    return fallbackText ? <span>{fallbackText}</span> : null;
};

