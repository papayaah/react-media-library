import React from 'react';
import { Portal } from '../components/Portal';
import { ComponentPreset, CardProps, ButtonProps, TextInputProps, SelectProps, CheckboxProps, BadgeProps, ImageProps, ModalProps, LoaderProps, EmptyStateProps, FileButtonProps, GridProps, ViewerProps, ViewerThumbnailProps, TextProps } from '../types';

/**
 * Default Component Preset
 * A neutral preset using standard HTML elements and semantic theme variables.
 * Useful when no specific UI library is available and fully overrideable via props.
 */
export const defaultPreset: ComponentPreset = {
    Card: ({ children, onClick, selected, className = '', style }: CardProps) => (
        <div
            onClick={onClick}
            style={{
                border: selected ? '2px solid var(--rml-accent)' : '1px solid var(--rml-border)',
                borderRadius: '0.5rem',
                padding: '1rem',
                cursor: onClick ? 'pointer' : 'default',
                backgroundColor: 'var(--rml-surface)',
                color: 'var(--rml-foreground)',
                transition: 'all 0.2s',
                boxShadow: onClick ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
                ...style,
            }}
            className={className}
        >
            {children}
        </div>
    ),

    Button: ({ children, onClick, variant = 'primary', disabled, loading, size = 'md', fullWidth, leftIcon, className = '', style }: ButtonProps) => {
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
            primary: { backgroundColor: 'var(--rml-accent)', color: '#ffffff' },
            secondary: { backgroundColor: 'var(--rml-surface-muted)', color: 'var(--rml-foreground)', borderColor: 'var(--rml-border)' },
            danger: { backgroundColor: 'var(--rml-danger)', color: '#ffffff' },
            outline: { backgroundColor: 'transparent', color: 'var(--rml-foreground)', borderColor: 'var(--rml-border)' },
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled || loading}
                style={{ ...baseStyle, ...variantStyles[variant], ...style }}
                className={className}
            >
                {leftIcon && <span>{leftIcon}</span>}
                {loading ? 'Loading...' : children}
            </button>
        );
    },

    TextInput: ({ value, onChange, placeholder, type = 'text', leftIcon, className = '', style }: TextInputProps) => (
        <div style={{ position: 'relative', width: '100%' }} className={className}>
            {leftIcon && (
                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--rml-muted)' }}>
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
                    border: '1px solid var(--rml-border)',
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'var(--rml-surface)',
                    color: 'var(--rml-foreground)',
                    ...style,
                }}
            />
        </div>
    ),

    Select: ({ value, onChange, options, placeholder, label, className = '', style }: SelectProps) => (
        <div style={{ width: '100%' }} className={className}>
            {label && <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>{label}</label>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--rml-border)',
                    fontSize: '1rem',
                    outline: 'none',
                    backgroundColor: 'var(--rml-surface)',
                    color: 'var(--rml-foreground)',
                    ...style,
                }}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    ),

    Checkbox: ({ checked, onChange, label, className = '', style }: CheckboxProps) => (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--rml-foreground)', ...style }} className={className}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--rml-accent)' }}
            />
            {label && <span style={{ fontSize: '0.875rem' }}>{label}</span>}
        </label>
    ),

    Badge: ({ children, variant = 'default', className = '', style }: BadgeProps) => {
        const styles: Record<string, React.CSSProperties> = {
            default: { backgroundColor: 'var(--rml-surface-muted)', color: 'var(--rml-foreground)' },
            primary: { backgroundColor: 'var(--rml-accent-soft)', color: 'var(--rml-accent)' },
            secondary: { backgroundColor: 'var(--rml-surface-muted)', color: 'var(--rml-muted)' },
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
                    ...styles[variant],
                    ...style,
                }}
                className={className}
            >
                {children}
            </span>
        );
    },

    Image: ({ src, alt, className = '', loading, onLoad, style }: ImageProps) => (
        <img
            src={src}
            alt={alt}
            loading={loading || 'lazy'}
            onLoad={onLoad}
            style={{ width: '100%', height: '100%', objectFit: 'contain', ...style }}
            className={className}
        />
    ),

    Modal: ({ isOpen, onClose, title, children }: ModalProps) => {
        if (!isOpen) return null;
        return (
            <Portal>
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'
                }}>
                    <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
                    <div style={{
                        position: 'relative', backgroundColor: 'var(--rml-surface)', color: 'var(--rml-foreground)', borderRadius: '0.5rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        maxWidth: '42rem', width: '100%', margin: '1rem', maxHeight: '90vh', overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--rml-border)' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
                            <button onClick={onClose} style={{ fontSize: '1.5rem', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rml-muted)' }}>×</button>
                        </div>
                        <div style={{ padding: '1rem' }}>{children}</div>
                    </div>
                </div>
            </Portal>
        );
    },

    Loader: ({ size = 'md', className = '' }: LoaderProps) => (
        <div
            style={{
                width: size === 'sm' ? '1rem' : size === 'lg' ? '3rem' : '2rem',
                height: size === 'sm' ? '1rem' : size === 'lg' ? '3rem' : '2rem',
                border: '2px solid var(--rml-border)',
                borderTopColor: 'var(--rml-accent)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
            }}
            className={className}
        />
    ),

    EmptyState: ({ icon, message, className = '' }: EmptyStateProps) => (
        <div style={{ textAlign: 'center', padding: '3rem 0' }} className={className}>
            {icon && <div style={{ marginBottom: '1rem', color: 'var(--rml-muted)', display: 'flex', justifyContent: 'center' }}>{icon}</div>}
            <p style={{ color: 'var(--rml-muted)' }}>{message}</p>
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
            backgroundColor: 'var(--rml-surface-muted)',
            borderRadius: '0.5rem',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }} className={className} />
    ),

    UploadCard: ({ onClick, isDragging, className = '', children }: { onClick: () => void; isDragging: boolean; className?: string; children?: React.ReactNode }) => (
        <div
            onClick={onClick}
            style={{
                border: `2px dashed ${isDragging ? 'var(--rml-accent)' : 'var(--rml-border)'}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                minHeight: '300px',
                backgroundColor: isDragging ? 'var(--rml-accent-soft)' : 'var(--rml-surface)',
                color: 'var(--rml-foreground)',
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
            <Portal>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', backgroundColor: '#000000' }}>
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#000000' }}>
                        {main}
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10000 }}>
                            {actions}
                            <button
                                onClick={onClose}
                                style={{
                                    width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                                    color: '#ffffff', fontSize: '1.5rem', backdropFilter: 'blur(8px)'
                                }}
                                title="Close"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                    <div style={{ width: '16rem', borderLeft: '1px solid var(--rml-border)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--rml-surface)', color: 'var(--rml-foreground)' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--rml-border)' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 500 }}>Library</h3>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                            {sidebar}
                        </div>
                    </div>
                </div>
            </Portal>
        );
    },

    ViewerThumbnail: ({ src, alt, selected, onClick }: ViewerThumbnailProps) => (
        <div
            onClick={onClick}
            style={{
                flexShrink: 0,
                aspectRatio: '1/1',
                borderRadius: '0.375rem',
                overflow: 'hidden',
                cursor: 'pointer',
                border: selected ? '2px solid var(--rml-accent)' : '2px solid transparent',
                background: 'var(--rml-surface-muted)',
                opacity: selected ? 1 : 0.6,
                transition: 'all 0.2s',
            }}
        >
            <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
    ),

    Text: ({ children, size = 'md', fw, c, mb, className = '', style }: TextProps) => {
        const sizeMap = {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem'
        };

        return (
            <div
                style={{
                    fontSize: sizeMap[size as keyof typeof sizeMap] || sizeMap.md,
                    fontWeight: fw as React.CSSProperties['fontWeight'],
                    color: c || 'var(--rml-foreground)',
                    marginBottom: typeof mb === 'number' ? `${mb}px` : mb,
                    ...style
                }}
                className={className}
            >
                {children}
            </div>
        );
    },
};
