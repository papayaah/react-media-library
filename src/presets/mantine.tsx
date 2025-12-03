import {
    Card as MantineCard,
    Image as MantineImage,
    Text,
    Button as MantineButton,
    FileButton as MantineFileButton,
    TextInput as MantineTextInput,
    Select as MantineSelect,
    Badge as MantineBadge,
    Modal as MantineModal,
    Checkbox as MantineCheckbox,
    Loader as MantineLoader,
    Skeleton as MantineSkeleton,
    Center,
    Stack,
    UnstyledButton,
    Group,
} from '@mantine/core';
import { ComponentPreset, CardProps, ButtonProps, TextInputProps, SelectProps, CheckboxProps, BadgeProps, ImageProps, ModalProps, LoaderProps, EmptyStateProps, FileButtonProps, GridProps, ViewerProps, ViewerThumbnailProps } from '../types';

/**
 * Mantine UI Component Preset
 * Full-featured preset using Mantine components
 */
export const mantinePreset: ComponentPreset = {
    Card: ({ children, onClick, selected, className, style }: CardProps) => (
        <MantineCard
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            onClick={onClick}
            className={className}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                borderColor: selected ? 'var(--mantine-color-blue-6)' : undefined,
                borderWidth: selected ? 2 : 1,
                transition: 'all 0.2s',
                ...style,
            }}
        >
            {children}
        </MantineCard>
    ),

    Button: ({ children, onClick, variant = 'primary', disabled, loading, size = 'md', fullWidth, leftIcon, className }: ButtonProps) => {
        const variantMap = {
            primary: 'filled',
            secondary: 'light',
            danger: 'filled',
            outline: 'outline',
        } as const;

        return (
            <MantineButton
                onClick={onClick}
                variant={variantMap[variant]}
                color={variant === 'danger' ? 'red' : 'blue'}
                disabled={disabled}
                loading={loading}
                size={size}
                fullWidth={fullWidth}
                leftSection={leftIcon}
                className={className}
            >
                {children}
            </MantineButton>
        );
    },

    TextInput: ({ value, onChange, placeholder, type, leftIcon, className }: TextInputProps) => (
        <MantineTextInput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            type={type}
            leftSection={leftIcon}
            className={className}
        />
    ),

    Select: ({ value, onChange, options, placeholder, label, 'aria-label': ariaLabel, className }: SelectProps) => (
        <MantineSelect
            value={value}
            onChange={(val) => onChange(val || '')}
            placeholder={placeholder}
            label={label}
            aria-label={!label ? (ariaLabel || placeholder) : undefined}
            data={options}
            className={className}
        />
    ),

    Checkbox: ({ checked, onChange, label, className }: CheckboxProps) => (
        <MantineCheckbox
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            label={label}
            className={className}
        />
    ),

    Badge: ({ children, variant = 'default', className }: BadgeProps) => {
        const variantMap = {
            default: 'light',
            primary: 'filled',
            secondary: 'outline',
        } as const;

        return (
            <MantineBadge variant={variantMap[variant]} size="sm" className={className}>
                {children}
            </MantineBadge>
        );
    },

    Image: ({ src, alt, className, onLoad, style }: ImageProps) => (
        <MantineImage src={src} alt={alt} className={className} style={style} fit="cover" w="100%" h="100%" onLoad={onLoad} />
    ),

    Modal: ({ isOpen, onClose, title, children }: ModalProps) => (
        <MantineModal opened={isOpen} onClose={onClose} title={title} size="xl">
            {children}
        </MantineModal>
    ),

    Loader: ({ size = 'md', className }: LoaderProps) => (
        <MantineLoader size={size} className={className} />
    ),

    EmptyState: ({ icon, message, className }: EmptyStateProps) => (
        <Center p="xl" className={className}>
            <Stack align="center" gap="md">
                {icon}
                <Text c="dimmed">{message}</Text>
            </Stack>
        </Center>
    ),

    FileButton: ({ onSelect, multiple, disabled, children }: FileButtonProps) => (
        <MantineFileButton onChange={(files) => files && onSelect(Array.isArray(files) ? files : [files])} multiple={multiple} disabled={disabled}>
            {(props) => <div {...props}>{children}</div>}
        </MantineFileButton>
    ),

    Grid: ({ children, className }: GridProps) => (
        <div
            className={className}
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem',
            }}
        >
            {children}
        </div>
    ),

    Skeleton: ({ className }: { className?: string }) => (
        <MantineSkeleton className={className} style={{ width: '100%', height: '100%' }} />
    ),

    UploadCard: ({ onClick, isDragging, className, children }: { onClick: () => void; isDragging: boolean; className?: string; children?: React.ReactNode }) => (
        <UnstyledButton
            onClick={onClick}
            className={className}
            style={{
                height: '100%',
                width: '100%',
                minHeight: '300px',
                border: `2px dashed ${isDragging ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-4)'}`,
                borderRadius: 'var(--mantine-radius-md)',
                backgroundColor: isDragging ? 'var(--mantine-color-blue-0)' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {children}
        </UnstyledButton>
    ),

    Viewer: ({ isOpen, onClose, main, sidebar, actions }: ViewerProps) => (
        <MantineModal
            opened={isOpen}
            onClose={onClose}
            fullScreen
            withCloseButton={false}
            padding={0}
            styles={{ body: { height: '100vh', display: 'flex' } }}
        >
            <div style={{ flex: 1, position: 'relative', backgroundColor: 'var(--mantine-color-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {main}
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                    {actions}
                </div>
            </div>
            <div style={{ width: '250px', borderLeft: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))', backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))' }}>
                    <Text fw={500} c="dimmed" size="sm">Library</Text>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    {sidebar}
                </div>
            </div>
        </MantineModal>
    ),

    ViewerThumbnail: ({ src, alt, selected, onClick }: ViewerThumbnailProps) => (
        <UnstyledButton
            onClick={onClick}
            style={{
                width: '100%',
                aspectRatio: '1/1',
                borderRadius: 'var(--mantine-radius-md)',
                overflow: 'hidden',
                border: selected ? '2px solid var(--mantine-color-blue-6)' : '2px solid transparent',
                opacity: selected ? 1 : 0.6,
                transition: 'all 0.2s',
                backgroundColor: 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))',
            }}
        >
            <MantineImage src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </UnstyledButton>
    ),
};
