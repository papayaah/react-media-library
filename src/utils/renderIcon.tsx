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
    
    // If it's already a ReactNode/element, return it as-is
    if (React.isValidElement(icon)) {
        return icon;
    }
    
    // If it's a function (component) or object (forwardRef/memo), render it with size
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
        // It might be a component type (function/object) or a React Element (object)
        // React.isValidElement(icon) handled above checks for Elements (instances)
        // so here we assume it's a Component Type if it's an object
        
        const IconComponent = icon as any;
        try {
            return React.createElement(IconComponent, { size, ...props });
        } catch (e) {
            // If creation fails, it might have been a plain object or invalid component
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

