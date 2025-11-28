import React from 'react';
import { ComponentPreset, CardProps, ButtonProps, TextInputProps, SelectProps, CheckboxProps, BadgeProps, ImageProps, ModalProps, LoaderProps, EmptyStateProps, FileButtonProps, GridProps, ViewerProps, ViewerThumbnailProps } from '../types';

/**
 * Default Component Preset
 * A neutral, unstyled preset using standard HTML elements and inline styles.
 * Useful when no specific UI library is available.
 */
export const defaultPreset: ComponentPreset = {
    Card: ({ children, onClick, selected, className = '', style }: CardProps) => (
        <div
            onClick={onClick}
            style={{
                border: selected ? '2px solid #2563eb' : '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem',
                cursor: onClick ? 'pointer' : 'default',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s',
                boxShadow: onClick ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
                ...style,
            }}
            className={className}
        >
            {children}
        </div>
    ),

    Button: ({ children, onClick, variant = 'primary', disabled, loading, size = 'md', fullWidth, leftIcon, className = '' }: ButtonProps) => {
        const baseStyle: React.CSSProperties = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: size === 'sm' ? '0.375rem 0.75rem' : size === 'lg' ? '0.75rem 1.5rem' : '0.5rem 1rem',
            fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
            borderRadius: '0.375rem',
            border: '1px solid transparent',
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            opacity: disabled || loading ? 0.6 : 1,
            width: fullWidth ? '100%' : 'auto',
            transition: 'background-color 0.2s',
        };

        const variantStyles: Record<string, React.CSSProperties> = {
            primary: { backgroundColor: '#2563eb', color: '#ffffff' },
            secondary: { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' },
            danger: { backgroundColor: '#dc2626', color: '#ffffff' },
            outline: { backgroundColor: 'transparent', color: '#374151', borderColor: '#d1d5db' },
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled || loading}
                style={{ ...baseStyle, ...variantStyles[variant] }}
                className={className}
            >
                {leftIcon && <span>{leftIcon}</span>}
                {loading ? 'Loading...' : children}
            </button>
        );
    },

    TextInput: ({ value, onChange, placeholder, type = 'text', leftIcon, className = '' }: TextInputProps) => (
        <div style={{ position: 'relative', width: '100%' }} className={className}>
            {leftIcon && (
                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                    {leftIcon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    paddingLeft: leftIcon ? '2.5rem' : '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem',
                    outline: 'none',
                }}
            />
        </div>
    ),

    Select: ({ value, onChange, options, placeholder, label, className = '' }: SelectProps) => (
        <div style={{ width: '100%' }} className={className}>
            {label && <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>{label}</label>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                }}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    ),

    Checkbox: ({ checked, onChange, label, className = '' }: CheckboxProps) => (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} className={className}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                style={{ width: '1rem', height: '1rem' }}
            />
            {label && <span style={{ fontSize: '0.875rem' }}>{label}</span>}
        </label>
    ),

    Badge: ({ children, variant = 'default', className = '' }: BadgeProps) => {
        const styles: Record<string, React.CSSProperties> = {
            default: { backgroundColor: '#f3f4f6', color: '#1f2937' },
            primary: { backgroundColor: '#dbeafe', color: '#1e40af' },
            secondary: { backgroundColor: '#f3e8ff', color: '#6b21a8' },
        };
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    ...styles[variant]
                }}
                className={className}
            >
                {children}
            </span>
        );
    },

    Image: ({ src, alt, className = '', loading, onLoad }: ImageProps) => (
        <img
            src={src}
            alt={alt}
            loading={loading || 'lazy'}
            onLoad={onLoad}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            className={className}
        />
    ),

    Modal: ({ isOpen, onClose, title, children }: ModalProps) => {
        if (!isOpen) return null;
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
                <div style={{
                    position: 'relative', backgroundColor: '#ffffff', borderRadius: '0.5rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    maxWidth: '42rem', width: '100%', margin: '1rem', maxHeight: '90vh', overflow: 'auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
                        <button onClick={onClose} style={{ fontSize: '1.5rem', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>×</button>
                    </div>
                    <div style={{ padding: '1rem' }}>{children}</div>
                </div>
            </div>
        );
    },

    Loader: ({ size = 'md', className = '' }: LoaderProps) => (
        <div
            style={{
                width: size === 'sm' ? '1rem' : size === 'lg' ? '3rem' : '2rem',
                height: size === 'sm' ? '1rem' : size === 'lg' ? '3rem' : '2rem',
                border: '2px solid #e5e7eb',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
            }}
            className={className}
        />
    ),

    EmptyState: ({ icon, message, className = '' }: EmptyStateProps) => (
        <div style={{ textAlign: 'center', padding: '3rem 0' }} className={className}>
            {icon && <div style={{ marginBottom: '1rem', color: '#9ca3af', display: 'flex', justifyContent: 'center' }}>{icon}</div>}
            <p style={{ color: '#6b7280' }}>{message}</p>
        </div>
    ),

    FileButton: ({ onSelect, multiple, disabled, children }: FileButtonProps) => (
        <label style={{ display: 'inline-block', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
            <input
                type="file"
                multiple={multiple}
                disabled={disabled}
                onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) onSelect(files);
                }}
                style={{ display: 'none' }}
            />
            {children}
        </label>
    ),

    Grid: ({ children, gap = '1rem', className = '' }: GridProps) => (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap,
            }}
            className={className}
        >
            {children}
        </div>
    ),

    Skeleton: ({ className = '' }: { className?: string }) => (
        <div style={{
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }} className={className} />
    ),

    UploadCard: ({ onClick, isDragging, className = '', children }: { onClick: () => void; isDragging: boolean; className?: string; children?: React.ReactNode }) => (
        <div
            onClick={onClick}
            style={{
                border: `2px dashed ${isDragging ? '#2563eb' : '#d1d5db'}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                minHeight: '300px',
                backgroundColor: isDragging ? '#eff6ff' : 'transparent',
                transition: 'all 0.2s',
            }}
            className={className}
        >
            {children}
        </div>
    ),

    Viewer: ({ isOpen, onClose, main, sidebar, actions }: ViewerProps) => {
        if (!isOpen) return null;
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', backgroundColor: '#ffffff' }}>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
                    {main}
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                        {actions}
                        <button
                            onClick={onClose}
                            style={{
                                width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer'
                            }}
                            title="Close"
                        >
                            ×
                        </button>
                    </div>
                </div>
                <div style={{ width: '16rem', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 500 }}>Library</h3>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                        {sidebar}
                    </div>
                </div>
            </div>
        );
    },

    ViewerThumbnail: ({ src, alt, selected, onClick }: ViewerThumbnailProps) => (
        <div
            onClick={onClick}
            style={{
                aspectRatio: '1/1',
                borderRadius: '0.375rem',
                overflow: 'hidden',
                cursor: 'pointer',
                border: selected ? '2px solid #2563eb' : '2px solid transparent',
                opacity: selected ? 1 : 0.6,
                transition: 'all 0.2s',
            }}
        >
            <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
    ),
};
