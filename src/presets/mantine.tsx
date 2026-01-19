import {
    Box,
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
    SimpleGrid,
    Group,
} from '@mantine/core';
import { ComponentPreset, CardProps, ButtonProps, TextInputProps, SelectProps, CheckboxProps, BadgeProps, ImageProps, ModalProps, LoaderProps, EmptyStateProps, FileButtonProps, GridProps, ViewerProps, ViewerThumbnailProps, PexelsImagePickerProps, FreepikContentPickerProps } from '../types';

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
    }: PexelsImagePickerProps) => (
        <MantineModal
            opened={isOpen}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <Text fw={600}>Pexels Images</Text>
                </Group>
            }
            size="lg"
            styles={{
                body: { padding: 0 },
            }}
        >
            <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        {images.length} images available • {selected.size} selected
                    </Text>
                    <Group gap="xs">
                        <MantineButton variant="subtle" size="xs" onClick={selected.size === images.length ? onDeselectAll : onSelectAll}>
                            {selected.size === images.length ? 'Deselect All' : 'Select All'}
                        </MantineButton>
                    </Group>
                </Group>
            </Box>

            <Box p="md" style={{ maxHeight: 400, overflowY: 'auto' }}>
                {loading ? (
                    <Center p="xl">
                        <MantineLoader size="sm" />
                    </Center>
                ) : images.length === 0 ? (
                    <Center p="xl">
                        <Text c="dimmed">No images found</Text>
                    </Center>
                ) : (
                    <SimpleGrid cols={3} spacing="sm">
                        {images.map((img) => (
                            <Box
                                key={img.url}
                                style={{
                                    position: 'relative',
                                    aspectRatio: '1',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: selected.has(img.url) ? '3px solid #667eea' : '1px solid #dee2e6',
                                    transition: 'all 0.15s',
                                }}
                                onClick={() => onToggleSelect(img.url)}
                            >
                                <img
                                    src={img.url}
                                    alt={img.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                                <MantineCheckbox
                                    checked={selected.has(img.url)}
                                    onChange={() => onToggleSelect(img.url)}
                                    style={{
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                    }}
                                    styles={{
                                        input: {
                                            backgroundColor: selected.has(img.url) ? '#667eea' : 'rgba(255,255,255,0.9)',
                                            borderColor: selected.has(img.url) ? '#667eea' : '#dee2e6',
                                        },
                                    }}
                                />
                                <Box
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: 6,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                    }}
                                >
                                    <Text
                                        size="xs"
                                        c="white"
                                        style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {img.name}
                                    </Text>
                                </Box>
                            </Box>
                        ))}
                    </SimpleGrid>
                )}
            </Box>

            <Box p="md" style={{ borderTop: '1px solid #e9ecef' }}>
                <Group justify="flex-end" gap="sm">
                    <MantineButton variant="subtle" onClick={onClose}>
                        Cancel
                    </MantineButton>
                    <MantineButton
                        onClick={onImport}
                        loading={importing}
                        disabled={selected.size === 0}
                    >
                        Import {selected.size > 0 ? `(${selected.size})` : ''}
                    </MantineButton>
                </Group>
            </Box>
        </MantineModal>
    ),

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
    }: FreepikContentPickerProps) => (
        <MantineModal
            opened={isOpen}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <Text fw={600}>Freepik Icons</Text>
                </Group>
            }
            size="lg"
            styles={{
                body: { padding: 0 },
            }}
        >
            {/* Search & Filters */}
            <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
                <Group gap="sm" mb="sm">
                    <MantineTextInput
                        placeholder="Search icons..."
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        style={{ flex: 1 }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onSearch();
                        }}
                    />
                    <MantineSelect
                        value={order}
                        onChange={(val) => onOrderChange((val as 'relevance' | 'popularity' | 'date') || 'relevance')}
                        data={[
                            { value: 'relevance', label: 'Relevance' },
                            { value: 'popularity', label: 'Popular' },
                            { value: 'date', label: 'Newest' },
                        ]}
                        style={{ width: 120 }}
                    />
                    <MantineButton onClick={onSearch} disabled={loading}>
                        Search
                    </MantineButton>
                </Group>
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        {content.length} icons found • {selected.size} selected
                    </Text>
                    <Group gap="xs">
                        <MantineButton
                            variant="subtle"
                            size="xs"
                            onClick={selected.size === content.length && content.length > 0 ? onDeselectAll : onSelectAll}
                            disabled={content.length === 0}
                        >
                            {selected.size === content.length && content.length > 0 ? 'Deselect All' : 'Select All'}
                        </MantineButton>
                    </Group>
                </Group>
            </Box>

            {/* Content Grid */}
            <Box p="md" style={{ maxHeight: 400, overflowY: 'auto' }}>
                {loading ? (
                    <Center p="xl">
                        <MantineLoader size="sm" />
                    </Center>
                ) : content.length === 0 ? (
                    <Center p="xl">
                        <Text c="dimmed">No icons found. Try a different search term.</Text>
                    </Center>
                ) : (
                    <SimpleGrid cols={4} spacing="sm">
                        {content.map((item) => (
                            <Box
                                key={item.id}
                                style={{
                                    position: 'relative',
                                    aspectRatio: '1',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: selected.has(item.id) ? '3px solid #667eea' : '1px solid #dee2e6',
                                    transition: 'all 0.15s',
                                    backgroundColor: '#f8f9fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 8,
                                }}
                                onClick={() => onToggleSelect(item.id)}
                            >
                                <img
                                    src={item.thumbnailUrl}
                                    alt={item.name}
                                    style={{
                                        maxWidth: '80%',
                                        maxHeight: '80%',
                                        objectFit: 'contain',
                                    }}
                                />
                                <MantineCheckbox
                                    checked={selected.has(item.id)}
                                    onChange={() => onToggleSelect(item.id)}
                                    style={{
                                        position: 'absolute',
                                        top: 6,
                                        left: 6,
                                    }}
                                    styles={{
                                        input: {
                                            backgroundColor: selected.has(item.id) ? '#667eea' : 'rgba(255,255,255,0.9)',
                                            borderColor: selected.has(item.id) ? '#667eea' : '#dee2e6',
                                        },
                                    }}
                                />
                                {item.isFree && (
                                    <MantineBadge
                                        size="xs"
                                        color="green"
                                        style={{
                                            position: 'absolute',
                                            top: 6,
                                            right: 6,
                                        }}
                                    >
                                        Free
                                    </MantineBadge>
                                )}
                                <Box
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: 4,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                                    }}
                                >
                                    <Text
                                        size="xs"
                                        c="white"
                                        style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontSize: 10,
                                        }}
                                    >
                                        {item.name}
                                    </Text>
                                </Box>
                            </Box>
                        ))}
                    </SimpleGrid>
                )}
            </Box>

            {/* Footer */}
            <Box p="md" style={{ borderTop: '1px solid #e9ecef' }}>
                <Group justify="flex-end" gap="sm">
                    <MantineButton variant="subtle" onClick={onClose}>
                        Cancel
                    </MantineButton>
                    <MantineButton
                        onClick={onImport}
                        loading={importing}
                        disabled={selected.size === 0}
                    >
                        Import {selected.size > 0 ? `(${selected.size})` : ''}
                    </MantineButton>
                </Group>
            </Box>
        </MantineModal>
    ),
};
