import type { CSSProperties } from 'react';
import { Portal } from '../components/Portal';
import { ComponentPreset, CardProps, ButtonProps, TextInputProps, SelectProps, CheckboxProps, BadgeProps, ImageProps, ModalProps, LoaderProps, EmptyStateProps, FileButtonProps, GridProps, ViewerProps, ViewerThumbnailProps, PexelsImagePickerProps, FreepikContentPickerProps, TextProps } from '../types';

/**
 * Tailwind CSS Component Preset
 * A structural Tailwind preset whose colors come from semantic theme variables.
 */
export const tailwindPreset: ComponentPreset = {
    Card: ({ children, onClick, selected, className = '', style }: CardProps) => (
        <div
            onClick={onClick}
            className={`
        border rounded-lg p-4 transition-all
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
        ${selected ? 'border-2 shadow-md' : ''}
        ${className}
            `}
            style={{
                background: 'var(--rml-surface)',
                color: 'var(--rml-foreground)',
                borderColor: selected ? 'var(--rml-accent)' : 'var(--rml-border)',
                ...style,
            }}
        >
            {children}
        </div>
    ),

    Button: ({ children, onClick, variant = 'primary', disabled, loading, size = 'md', fullWidth, leftIcon, className = '', style, 'aria-label': ariaLabel }: ButtonProps) => {
        const variants = {
            primary: '',
            secondary: '',
            danger: '',
            outline: 'border',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2',
            lg: 'px-6 py-3 text-lg',
        };
        const themeStyles = {
            primary: { background: 'var(--rml-accent)', color: '#fff' },
            secondary: { background: 'var(--rml-surface-muted)', color: 'var(--rml-foreground)' },
            danger: { background: 'var(--rml-danger)', color: '#fff' },
            outline: { background: 'transparent', color: 'var(--rml-foreground)', borderColor: 'var(--rml-border)' },
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled || loading}
                aria-label={ariaLabel}
                style={{ ...themeStyles[variant], ...style }}
                className={`
          rounded-md font-medium transition-colors
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
          flex items-center justify-center gap-2
          ${className}
        `}
            >
                {leftIcon && <span>{leftIcon}</span>}
                {loading ? 'Loading...' : children}
            </button>
        );
    },

    TextInput: ({ value, onChange, placeholder, type = 'text', leftIcon, className = '', style }: TextInputProps) => (
        <div className="relative">
            {leftIcon && (
                <div
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--rml-muted)' }}
                >
                    {leftIcon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    background: 'var(--rml-surface)',
                    color: 'var(--rml-foreground)',
                    borderColor: 'var(--rml-border)',
                    ...style,
                }}
                className={`
          w-full px-3 py-2 border rounded-md
          focus:outline-none focus:ring-2
          ${leftIcon ? 'pl-10' : ''}
          ${className}
        `}
            />
        </div>
    ),

    Select: ({ value, onChange, options, placeholder, label, 'aria-label': ariaLabel, className = '', style }: SelectProps) => {
        const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium mb-1"
                        style={{ color: 'var(--rml-foreground)' }}
                    >
                        {label}
                    </label>
                )}
                <select
                    id={selectId}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    aria-label={!label ? (ariaLabel || placeholder) : undefined}
                    style={{
                        background: 'var(--rml-surface)',
                        color: 'var(--rml-foreground)',
                        borderColor: 'var(--rml-border)',
                        ...style,
                    }}
                    className={`
            w-full px-3 py-2 border rounded-md
            focus:outline-none focus:ring-2
            ${className}
          `}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    },

    Checkbox: ({ checked, onChange, label, className = '', style }: CheckboxProps) => (
        <label className={`flex items-center gap-2 cursor-pointer ${className}`} style={{ color: 'var(--rml-foreground)', ...style }}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--rml-accent)' }}
            />
            {label && <span className="text-sm">{label}</span>}
        </label>
    ),

    Badge: ({ children, variant = 'default', className = '', style }: BadgeProps) => {
        const variants = {
            default: {
                background: 'var(--rml-surface-muted)',
                color: 'var(--rml-foreground)',
            },
            primary: {
                background: 'var(--rml-accent-soft)',
                color: 'var(--rml-accent)',
            },
            secondary: {
                background: 'var(--rml-surface-muted)',
                color: 'var(--rml-muted)',
            },
        };

        return (
            <span
                className={`px-2 py-1 text-xs rounded-full ${className}`}
                style={{ ...variants[variant], ...style }}
            >
                {children}
            </span>
        );
    },

    Image: ({ src, alt, className = '', loading, decoding, onLoad, style }: ImageProps) => (
        <img
            src={src}
            alt={alt}
            loading={loading || 'lazy'}
            decoding={decoding || 'async'}
            onLoad={onLoad}
            style={style}
            className={`${!style?.width ? 'w-full' : ''} ${!style?.height ? 'h-full' : ''} ${!style?.objectFit ? 'object-cover' : ''} ${className}`}
        />
    ),

    Modal: ({ isOpen, onClose, title, children }: ModalProps) => {
        if (!isOpen) return null;

        return (
            <Portal>
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                        onClick={onClose}
                        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    />
                    <div
                        className="relative rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto"
                        style={{ position: 'relative', maxWidth: '42rem', width: '100%', maxHeight: '90vh', overflow: 'auto', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', background: 'var(--rml-surface)', color: 'var(--rml-foreground)' }}
                    >
                        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--rml-border)' }}>
                            <h3 className="text-lg font-semibold">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-2xl leading-none"
                                style={{ color: 'var(--rml-muted)' }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4">{children}</div>
                    </div>
                </div>
            </Portal>
        );
    },

    Loader: ({ size = 'md', className = '' }: LoaderProps) => {
        const sizes = {
            sm: 'w-4 h-4 border-2',
            md: 'w-8 h-8 border-3',
            lg: 'w-12 h-12 border-4',
        };

        return (
            <div
                className={`
          ${sizes[size]}
          border-t-transparent
          rounded-full animate-spin
          ${className}
        `}
                style={{ borderColor: 'var(--rml-accent)', borderTopColor: 'transparent' }}
            />
        );
    },

    EmptyState: ({ icon, message, className = '' }: EmptyStateProps) => (
        <div className={`text-center py-12 ${className}`} style={{ color: 'var(--rml-muted)' }}>
            {icon && <div className="mb-4">{icon}</div>}
            <p>{message}</p>
        </div>
    ),

    FileButton: ({ onSelect, multiple, disabled, children }: FileButtonProps) => (
        <label className={`inline-block ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
                type="file"
                multiple={multiple}
                disabled={disabled}
                onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) onSelect(files);
                }}
                className="hidden"
            />
            {children}
        </label>
    ),

    Grid: ({ children, gap = '1rem', className = '' }: GridProps) => (
        <div
            className={className}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`,
                gap,
            }}
        >
            {children}
        </div>
    ),

    Skeleton: ({ className = '' }: { className?: string }) => (
        <div className={`animate-pulse rounded ${className}`} style={{ width: '100%', height: '100%', background: 'var(--rml-surface-muted)' }}>
            {/* Simple skeleton that fills its container */}
        </div>
    ),

    UploadCard: ({ onClick, isDragging, className = '', children }: { onClick: () => void; isDragging: boolean; className?: string; children?: React.ReactNode }) => (
        <div
            onClick={onClick}
            className={`
                border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center
                cursor-pointer transition-all h-full min-h-[300px]
                ${className}
            `}
            style={{
                background: isDragging ? 'var(--rml-accent-soft)' : 'var(--rml-surface)',
                borderColor: isDragging ? 'var(--rml-accent)' : 'var(--rml-border)',
                color: 'var(--rml-foreground)',
            }}
        >
            {children}
        </div>
    ),

    Viewer: ({ isOpen, onClose, main, sidebar, actions }: ViewerProps) => {
        if (!isOpen) return null;
        return (
            <Portal>
                <div
                    className="fixed inset-0 z-[9999] flex"
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', backgroundColor: '#000000' }}
                >
                    {/* Main Content Area */}
                    <div className="flex-1 relative overflow-hidden" style={{ background: '#000' }}>
                        {main}
                        {/* Actions Overlay */}
                        <div className="absolute top-4 right-4 flex gap-2 items-center z-[10000]">
                            {actions}
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 cursor-pointer transition-colors backdrop-blur-md"
                                title="Close"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div
                        className="w-64 border-l flex flex-col overflow-hidden"
                        style={{ width: '16rem', borderLeft: '1px solid var(--rml-border)', display: 'flex', flexDirection: 'column', background: 'var(--rml-surface)', color: 'var(--rml-foreground)' }}
                    >
                        <div className="p-4 border-b" style={{ borderColor: 'var(--rml-border)' }}>
                            <h3 className="font-medium text-sm">Library</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
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
            className={`
                shrink-0 aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all
                ${selected ? 'opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}
            `}
            style={{
                background: 'var(--rml-surface-muted)',
                borderColor: selected ? 'var(--rml-accent)' : 'transparent',
            }}
        >
            <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
            />
        </div>
    ),

    PexelsImagePicker: ({
        isOpen,
        onClose,
        images,
        loading,
        selected,
        onToggleSelect,
        onSelectAll,
        onDeselectAll,
        importing,
        onImport,
    }: PexelsImagePickerProps) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
                <div className="rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" style={{ background: 'var(--rml-surface)', color: 'var(--rml-foreground)' }}>
                    <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--rml-border)' }}>
                        <h2 className="text-lg font-semibold">Pexels Images</h2>
                        <button
                            onClick={onClose}
                            className="text-xl"
                            style={{ color: 'var(--rml-muted)' }}
                        >
                            ×
                        </button>
                    </div>
                    <div className="p-4 border-b flex items-center justify-between text-sm" style={{ borderColor: 'var(--rml-border)', color: 'var(--rml-muted)' }}>
                        <span>{images.length} images available • {selected.size} selected</span>
                        <button
                            onClick={selected.size === images.length ? onDeselectAll : onSelectAll}
                            style={{ color: 'var(--rml-accent)' }}
                        >
                            {selected.size === images.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 400 }}>
                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--rml-accent)' }}></div>
                            </div>
                        ) : images.length === 0 ? (
                            <div className="text-center p-8" style={{ color: 'var(--rml-muted)' }}>No images found</div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {images.map((img) => (
                                    <div
                                        key={img.url}
                                        onClick={() => onToggleSelect(img.url)}
                                        className={`
                                            relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                                        `}
                                        style={{ borderColor: selected.has(img.url) ? 'var(--rml-accent)' : 'var(--rml-border)' }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <input
                                            type="checkbox"
                                            checked={selected.has(img.url)}
                                            onChange={() => onToggleSelect(img.url)}
                                            className="absolute top-2 left-2 w-5 h-5"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                                            <p className="text-white text-xs truncate">{img.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--rml-border)' }}>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded"
                            style={{ color: 'var(--rml-foreground)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onImport}
                            disabled={selected.size === 0 || importing}
                            className={`
                                px-4 py-2 rounded font-medium
                                ${selected.size === 0 || importing ? 'cursor-not-allowed opacity-50' : ''}
                            `}
                            style={{ background: 'var(--rml-accent)', color: '#fff' }}
                        >
                            {importing ? 'Importing...' : `Import ${selected.size > 0 ? `(${selected.size})` : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        );
    },

    FreepikContentPicker: ({
        isOpen,
        onClose,
        content,
        loading,
        searchQuery,
        onSearchQueryChange,
        onSearch,
        selected,
        onToggleSelect,
        onSelectAll,
        onDeselectAll,
        importing,
        onImport,
        order,
        onOrderChange,
    }: FreepikContentPickerProps) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
                <div className="rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" style={{ background: 'var(--rml-surface)', color: 'var(--rml-foreground)' }}>
                    <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--rml-border)' }}>
                        <h2 className="text-lg font-semibold">Freepik Icons</h2>
                        <button
                            onClick={onClose}
                            className="text-xl"
                            style={{ color: 'var(--rml-muted)' }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="p-4 border-b" style={{ borderColor: 'var(--rml-border)' }}>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                placeholder="Search icons..."
                                value={searchQuery}
                                onChange={(e) => onSearchQueryChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onSearch();
                                }}
                                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                                style={{ background: 'var(--rml-surface)', borderColor: 'var(--rml-border)', color: 'var(--rml-foreground)' }}
                            />
                            <select
                                value={order}
                                onChange={(e) => onOrderChange(e.target.value as 'relevance' | 'popularity' | 'date')}
                                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                                style={{ background: 'var(--rml-surface)', borderColor: 'var(--rml-border)', color: 'var(--rml-foreground)' }}
                            >
                                <option value="relevance">Relevance</option>
                                <option value="popularity">Popular</option>
                                <option value="date">Newest</option>
                            </select>
                            <button
                                onClick={onSearch}
                                disabled={loading}
                                className="px-4 py-2 rounded-md disabled:opacity-50"
                                style={{ background: 'var(--rml-accent)', color: '#fff' }}
                            >
                                Search
                            </button>
                        </div>
                        <div className="flex items-center justify-between text-sm" style={{ color: 'var(--rml-muted)' }}>
                            <span>{content.length} icons found • {selected.size} selected</span>
                            <button
                                onClick={selected.size === content.length && content.length > 0 ? onDeselectAll : onSelectAll}
                                disabled={content.length === 0}
                                className="disabled:opacity-50"
                                style={{ color: 'var(--rml-accent)' }}
                            >
                                {selected.size === content.length && content.length > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 400 }}>
                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--rml-accent)' }}></div>
                            </div>
                        ) : content.length === 0 ? (
                            <div className="text-center p-8" style={{ color: 'var(--rml-muted)' }}>No icons found. Try a different search term.</div>
                        ) : (
                            <div className="grid grid-cols-4 gap-3">
                                {content.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => onToggleSelect(item.id)}
                                        className={`
                                            relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all flex items-center justify-center p-2
                                        `}
                                        style={{
                                            background: 'var(--rml-surface-muted)',
                                            borderColor: selected.has(item.id) ? 'var(--rml-accent)' : 'var(--rml-border)',
                                        }}
                                    >
                                        <img
                                            src={item.thumbnailUrl}
                                            alt={item.name}
                                            className="max-w-[80%] max-h-[80%] object-contain"
                                        />
                                        <input
                                            type="checkbox"
                                            checked={selected.has(item.id)}
                                            onChange={() => onToggleSelect(item.id)}
                                            className="absolute top-2 left-2 w-4 h-4"
                                        />
                                        {item.isFree && (
                                            <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] bg-green-500 text-white rounded">
                                                Free
                                            </span>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
                                            <p className="text-white text-[10px] truncate">{item.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--rml-border)' }}>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded"
                            style={{ color: 'var(--rml-foreground)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onImport}
                            disabled={selected.size === 0 || importing}
                            className={`
                                px-4 py-2 rounded font-medium
                                ${selected.size === 0 || importing ? 'cursor-not-allowed opacity-50' : ''}
                            `}
                            style={{ background: 'var(--rml-accent)', color: '#fff' }}
                        >
                            {importing ? 'Importing...' : `Import ${selected.size > 0 ? `(${selected.size})` : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        );
    },

    Text: ({ children, size = 'md', fw, c, mb, className = '', style }: TextProps) => {
        const sizeMap = {
            xs: 'text-xs',
            sm: 'text-sm',
            md: 'text-base',
            lg: 'text-lg',
            xl: 'text-xl'
        };

        return (
            <div
                className={`${sizeMap[size as keyof typeof sizeMap] || sizeMap.md} ${className}`}
                style={{
                    fontWeight: fw as CSSProperties['fontWeight'],
                    color: c || 'var(--rml-foreground)',
                    marginBottom: typeof mb === 'number' ? `${mb}px` : mb,
                    ...style
                }}
            >
                {children}
            </div>
        );
    },
};
