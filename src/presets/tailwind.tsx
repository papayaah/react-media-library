import { ComponentPreset, CardProps, ButtonProps, TextInputProps, SelectProps, CheckboxProps, BadgeProps, ImageProps, ModalProps, LoaderProps, EmptyStateProps, FileButtonProps, GridProps, ViewerProps, ViewerThumbnailProps } from '../types';

/**
 * Tailwind CSS Component Preset
 * A minimal, unstyled preset using Tailwind CSS classes
 */
export const tailwindPreset: ComponentPreset = {
    Card: ({ children, onClick, selected, className = '' }: CardProps) => (
        <div
            onClick={onClick}
            className={`
        border rounded-lg p-4 transition-all
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
        ${selected ? 'border-blue-500 border-2 shadow-md' : 'border-gray-200'}
        ${className}
      `}
        >
            {children}
        </div>
    ),

    Button: ({ children, onClick, variant = 'primary', disabled, loading, size = 'md', fullWidth, leftIcon, className = '' }: ButtonProps) => {
        const variants = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700',
            secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
            danger: 'bg-red-600 text-white hover:bg-red-700',
            outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2',
            lg: 'px-6 py-3 text-lg',
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled || loading}
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

    TextInput: ({ value, onChange, placeholder, type = 'text', leftIcon, className = '' }: TextInputProps) => (
        <div className="relative">
            {leftIcon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {leftIcon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`
          w-full px-3 py-2 border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${leftIcon ? 'pl-10' : ''}
          ${className}
        `}
            />
        </div>
    ),

    Select: ({ value, onChange, options, placeholder, className = '' }: SelectProps) => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`
        w-full px-3 py-2 border border-gray-300 rounded-md
        focus:outline-none focus:ring-2 focus:ring-blue-500
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
    ),

    Checkbox: ({ checked, onChange, label, className = '' }: CheckboxProps) => (
        <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            {label && <span className="text-sm">{label}</span>}
        </label>
    ),

    Badge: ({ children, variant = 'default', className = '' }: BadgeProps) => {
        const variants = {
            default: 'bg-gray-100 text-gray-800',
            primary: 'bg-blue-100 text-blue-800',
            secondary: 'bg-purple-100 text-purple-800',
        };

        return (
            <span className={`px-2 py-1 text-xs rounded-full ${variants[variant]} ${className}`}>
                {children}
            </span>
        );
    },

    Image: ({ src, alt, className = '' }: ImageProps) => (
        <img src={src} alt={alt} className={`w-full h-full object-contain ${className}`} />
    ),

    Modal: ({ isOpen, onClose, title, children }: ModalProps) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>
                    <div className="p-4">{children}</div>
                </div>
            </div>
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
          border-blue-600 border-t-transparent
          rounded-full animate-spin
          ${className}
        `}
            />
        );
    },

    EmptyState: ({ icon, message, className = '' }: EmptyStateProps) => (
        <div className={`text-center py-12 ${className}`}>
            {icon && <div className="mb-4 text-gray-400">{icon}</div>}
            <p className="text-gray-500">{message}</p>
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
        <div className={`animate-pulse border rounded-lg p-4 border-gray-200 ${className}`}>
            <div className="w-full h-[160px] bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="flex gap-2 mb-2">
                <div className="h-5 bg-gray-200 rounded w-12"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
    ),

    UploadCard: ({ onClick, isDragging, className = '', children }: { onClick: () => void; isDragging: boolean; className?: string; children?: React.ReactNode }) => (
        <div
            onClick={onClick}
            className={`
                border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center
                cursor-pointer transition-all h-full min-h-[300px]
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
                ${className}
            `}
        >
            {children}
        </div>
    ),

    Viewer: ({ isOpen, onClose, main, sidebar, actions }: ViewerProps) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-black flex">
                {/* Main Content Area */}
                <div className="flex-1 relative flex items-center justify-center bg-gray-100 dark:bg-black/90 p-4">
                    {main}
                    {/* Actions Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        {actions}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-gray-900 dark:text-white font-medium text-sm">Library</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {sidebar}
                    </div>
                </div>
            </div>
        );
    },

    ViewerThumbnail: ({ src, alt, selected, onClick }: ViewerThumbnailProps) => (
        <div
            onClick={onClick}
            className={`
                aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all bg-gray-100 dark:bg-gray-800
                ${selected ? 'border-blue-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}
            `}
        >
            <img src={src} alt={alt} className="w-full h-full object-contain" />
        </div>
    ),
};
