// @ts-nocheck - cropperjs web components
import React, { useRef, useEffect, useState } from 'react';
import { MediaGridIcons } from '../types';
import { renderIcon } from '../utils/renderIcon';

interface ImageEditorProps {
    src: string;
    onSave: (blob: Blob) => void;
    onCancel: () => void;
    icons?: MediaGridIcons;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ src, onSave, onCancel, icons = {} }) => {
    const canvasRef = useRef<any>(null);
    const selectionRef = useRef<any>(null);
    const imageRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [scaleX, setScaleX] = useState(1);
    const [scaleY, setScaleY] = useState(1);
    const [mode, setMode] = useState<'crop' | 'pan'>('crop');
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState(0);
    const rotationRef = useRef(0);
    const [imageKey, setImageKey] = useState(0); // Key to force remount on reset
    const zoomLevelRef = useRef(0); // Track cumulative zoom level

    useEffect(() => {
        // Dynamically import cropperjs only when this component is mounted
        import('cropperjs').then(() => {
            setIsReady(true);
        }).catch(err => {
            console.error("Failed to load cropperjs", err);
        });
    }, []);

    const updatePreview = async () => {
        if (!isReady || !selectionRef.current || !previewCanvasRef.current) return;

        try {
            // Use the selection element to get the cropped canvas
            const canvas = await selectionRef.current.$toCanvas({
                width: 300, // Limit preview size for performance
                height: 300,
            });

            const ctx = previewCanvasRef.current?.getContext('2d');
            if (ctx && canvas) {
                previewCanvasRef.current.width = canvas.width;
                previewCanvasRef.current.height = canvas.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(canvas, 0, 0);
            }
        } catch (e) {
            // Ignore errors during fast interaction
        }
    };

    // Update preview when interacting
    useEffect(() => {
        if (!isReady || !canvasRef.current) return;

        const element = canvasRef.current;
        // Listen to specific cropper events for real-time updates
        element.addEventListener('change', updatePreview);
        element.addEventListener('action', updatePreview); // 'action' might be the event for dragging

        // Initial update
        setTimeout(updatePreview, 500);

        return () => {
            element.removeEventListener('change', updatePreview);
            element.removeEventListener('action', updatePreview);
        };
    }, [isReady]);

    const handleSave = async () => {
        if (selectionRef.current) {
            try {
                // IMPORTANT: Call $toCanvas on the SELECTION element to get the cropped area
                const canvas = await selectionRef.current.$toCanvas();
                canvas.toBlob((blob: Blob | null) => {
                    if (blob) {
                        onSave(blob);
                    }
                }, 'image/png');
            } catch (error) {
                console.error('Failed to crop image:', error);
            }
        }
    };

    const handleRotate = (degree: number, absolute = false) => {
        if (imageRef.current) {
            let newRotation = rotationRef.current;

            if (absolute) {
                newRotation = degree;
            } else {
                newRotation = newRotation + degree;
            }

            // Normalize to 0-360
            newRotation = newRotation % 360;
            if (newRotation < 0) newRotation += 360;

            // Calculate diff to apply to the cropper
            // The cropper accumulates rotation, so we need to pass the difference
            // BUT, if we are setting absolute rotation, we might need to reset and rotate?
            // Or just keep track of current rotation and rotate by difference.
            const diff = newRotation - rotationRef.current;

            if (diff !== 0) {
                imageRef.current.$rotate(diff);
                rotationRef.current = newRotation;
                setRotation(newRotation);
                setIsDirty(true);
                // Force preview update after rotation
                setTimeout(updatePreview, 50);
            }
        }
    };

    const snapRotate = (direction: 'left' | 'right') => {
        const current = rotationRef.current;
        let target;

        if (direction === 'right') {
            // Next 90 degree mark
            target = (Math.floor(current / 90) + 1) * 90;
        } else {
            // Previous 90 degree mark
            target = (Math.ceil(current / 90) - 1) * 90;
        }

        // Normalize target to 0-360 before passing
        target = target % 360;
        if (target < 0) target += 360;

        handleRotate(target, true);
    };

    const handleFlip = (axis: 'x' | 'y') => {
        if (imageRef.current) {
            if (axis === 'x') {
                const newScale = scaleX * -1;
                setScaleX(newScale);
                imageRef.current.$scale(newScale, scaleY);
            } else {
                const newScale = scaleY * -1;
                setScaleY(newScale);
                imageRef.current.$scale(scaleX, newScale);
            }
            setIsDirty(true);
        }
    };

    const handleZoom = (ratio: number) => {
        if (imageRef.current) {
            imageRef.current.$zoom(ratio);
            zoomLevelRef.current += ratio; // Track zoom level
            setIsDirty(true);
        }
    };

    const handleReset = () => {
        // Reset all state variables
        rotationRef.current = 0;
        setRotation(0);
        setScaleX(1);
        setScaleY(1);
        zoomLevelRef.current = 0;
        setAspectRatio(null);
        setIsDirty(false);
        
        // Force remount of cropper-image by changing key - this completely resets all transformations
        // This is the cleanest way to ensure rotation, flip, zoom, and position are all reset
        // The useEffect hook will handle resetting the selection after the image remounts
        setImageKey(prev => prev + 1);
    };

    const onInteract = () => {
        if (!isDirty) setIsDirty(true);
        // Also update preview on any interaction
        updatePreview();
    };

    const [aspectRatio, setAspectRatio] = useState<number | null>(null);

    const presets = [
        { label: 'Free', value: null, icon: renderIcon(icons?.crop, 20, undefined, 'Crop') },
        { label: '1:1', value: 1, icon: <div style={{ border: '2px solid white', width: '20px', height: '20px', borderRadius: '2px' }} /> },
        { label: '9:16', value: 9 / 16, icon: <div style={{ border: '2px solid white', width: '12px', height: '20px', borderRadius: '2px' }} /> },
        { label: '16:9', value: 16 / 9, icon: <div style={{ border: '2px solid white', width: '20px', height: '12px', borderRadius: '2px' }} /> },
        { label: '4:5', value: 4 / 5, icon: <div style={{ border: '2px solid white', width: '16px', height: '20px', borderRadius: '2px' }} /> },
        { label: '5:4', value: 5 / 4, icon: <div style={{ border: '2px solid white', width: '20px', height: '16px', borderRadius: '2px' }} /> },
        { label: '3:4', value: 3 / 4, icon: <div style={{ border: '2px solid white', width: '12px', height: '16px', borderRadius: '2px' }} /> },
        { label: '4:3', value: 4 / 3, icon: <div style={{ border: '2px solid white', width: '16px', height: '12px', borderRadius: '2px' }} /> },
    ];

    const handleAspectRatio = (ratio: number | null) => {
        setAspectRatio(ratio);
        setMode('crop');

        // Reset selection to center with new aspect ratio
        if (selectionRef.current && imageRef.current) {
            const imageRect = imageRef.current.getBoundingClientRect();
            // We can't easily get the exact image dimensions from the web component ref directly in a standard way 
            // without querying the internal cropper instance, but we can try to reset the selection.

            // A simple way is to reset the selection to center
            selectionRef.current.$center();
        }
    };

    // When aspect ratio changes, we want to ensure the selection is valid and visible
    useEffect(() => {
        if (selectionRef.current && isReady) {
            // This forces the selection to re-evaluate its constraints
            selectionRef.current.aspectRatio = aspectRatio;
            if (aspectRatio) {
                // If we have a specific ratio, try to maximize the selection or center it
                // The web component API for this is a bit experimental, but $center() usually works
                setTimeout(() => {
                    selectionRef.current?.$center();
                }, 10);
            }
        }
    }, [aspectRatio, isReady]);

    // Reset selection when image key changes (after image remount)
    useEffect(() => {
        if (imageKey > 0 && isReady) {
            // Wait for the image and selection to be fully initialized after remount
            const resetSelection = () => {
                if (imageRef.current && selectionRef.current) {
                    selectionRef.current.hidden = false;
                    selectionRef.current.aspectRatio = null;
                    selectionRef.current.$center();
                    // Update preview after reset
                    setTimeout(updatePreview, 50);
                    return true;
                }
                return false;
            };
            
            // Try immediately, then retry with delays if refs aren't ready yet
            if (!resetSelection()) {
                const timeout1 = setTimeout(() => {
                    if (!resetSelection()) {
                        setTimeout(resetSelection, 100);
                    }
                }, 50);
                return () => clearTimeout(timeout1);
            }
        }
    }, [imageKey, isReady]);

    // Joystick/Dial Component
    const RotationJoystick = () => {
        const dialRef = useRef<HTMLDivElement>(null);
        const [isDragging, setIsDragging] = useState(false);
        const [dragRotation, setDragRotation] = useState(rotation);

        // Sync drag rotation with actual rotation when not dragging
        useEffect(() => {
            if (!isDragging) {
                setDragRotation(rotation);
            }
        }, [rotation, isDragging]);

        const updateAngle = (clientX: number, clientY: number) => {
            if (!dialRef.current) return;
            const rect = dialRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const x = clientX - centerX;
            const y = clientY - centerY;

            // Calculate angle from positive X axis (Right is 0)
            let angleRad = Math.atan2(y, x);
            let angleDeg = angleRad * (180 / Math.PI);

            // Convert to Clockwise from Top (Top is 0)
            // atan2: Right=0, Bottom=90, Left=180, Top=-90
            // We want: Top=0, Right=90, Bottom=180, Left=270

            angleDeg += 90;

            // Normalize to 0-360
            if (angleDeg < 0) angleDeg += 360;
            if (angleDeg >= 360) angleDeg -= 360;

            setDragRotation(angleDeg);
            handleRotate(angleDeg, true);
        };

        useEffect(() => {
            const onMove = (e: MouseEvent) => {
                if (isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                    updateAngle(e.clientX, e.clientY);
                }
            };

            const onUp = () => {
                setIsDragging(false);
                document.body.style.cursor = '';
            };

            if (isDragging) {
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
                document.body.style.cursor = 'grabbing';
            }

            return () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.body.style.cursor = '';
            };
        }, [isDragging]);

        const handleMouseDown = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
            // Immediate update on click
            updateAngle(e.clientX, e.clientY);
        };

        // Calculate knob position based on rotation
        const radius = 24; // Distance from center
        const displayRotation = isDragging ? dragRotation : rotation;

        // Convert displayRotation (Top=0) back to trig angle (Right=0) for positioning
        // Top(0) -> -90
        // Right(90) -> 0
        const angleRad = (displayRotation - 90) * (Math.PI / 180);
        const knobX = Math.cos(angleRad) * radius;
        const knobY = Math.sin(angleRad) * radius;

        return (
            <div
                style={{
                    position: 'relative',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.05)',
                    transition: 'background-color 0.2s',
                    touchAction: 'none',
                    userSelect: 'none'
                }}
                ref={dialRef}
                onMouseDown={handleMouseDown}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
            >
                {/* Center dot */}
                <div style={{ width: '6px', height: '6px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '50%', position: 'absolute' }} />

                {/* Line from center to knob */}
                <div
                    style={{
                        position: 'absolute',
                        height: '2px',
                        background: 'rgba(59, 130, 246, 0.5)',
                        transformOrigin: 'left',
                        pointerEvents: 'none',
                        width: '24px',
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${displayRotation - 90}deg)`
                    }}
                />

                {/* Knob */}
                <div
                    style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        position: 'absolute',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'transform 0.075s',
                        background: isDragging ? '#60a5fa' : '#3b82f6',
                        transform: `translate(${knobX}px, ${knobY}px) ${isDragging ? 'scale(1.1)' : 'scale(1)'}`
                    }}
                />

                {/* Markers */}
                <div style={{ position: 'absolute', top: '4px', width: '2px', height: '6px', background: 'rgba(255, 255, 255, 0.2)' }} />
                <div style={{ position: 'absolute', bottom: '4px', width: '2px', height: '6px', background: 'rgba(255, 255, 255, 0.2)' }} />
                <div style={{ position: 'absolute', left: '4px', width: '6px', height: '2px', background: 'rgba(255, 255, 255, 0.2)' }} />
                <div style={{ position: 'absolute', right: '4px', width: '6px', height: '2px', background: 'rgba(255, 255, 255, 0.2)' }} />
            </div>
        );
    };

    if (!isReady) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#000000', color: '#ffffff' }}>
                Loading editor...
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000000', display: 'flex' }}>
            {/* Left Sidebar - Expanded */}
            <div style={{ width: '288px', background: '#171717', borderRight: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', zIndex: 50, height: '100%' }}>

                {/* Preview Section */}
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview</span>
                    <div style={{ width: '100%', aspectRatio: '16 / 9', background: '#0a0a0a', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdzNOs8b5z-VR1X84w7Fk88_fET23_ugb17acQ=")', opacity: 0.05, backgroundPosition: 'center', backgroundSize: 'cover' }}></div>
                        <canvas ref={previewCanvasRef} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', position: 'relative', zIndex: 10 }} />
                    </div>
                </div>

                {/* Rotation Section */}
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rotation</span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.1)', padding: '0.125rem 0.5rem', borderRadius: '0.25rem' }}>{Math.round(rotation)}°</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => snapRotate('left')}
                            style={{ padding: '0.5rem', borderRadius: '50%', color: '#9ca3af', transition: 'all 0.2s', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#9ca3af';
                            }}
                        >
                            {renderIcon(icons?.rotateCcw, 16, undefined, 'CCW')}
                        </button>

                        <RotationJoystick />

                        <button
                            onClick={() => snapRotate('right')}
                            style={{ padding: '0.5rem', borderRadius: '50%', color: '#9ca3af', transition: 'all 0.2s', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#9ca3af';
                            }}
                        >
                            {renderIcon(icons?.rotateCw, 16, undefined, 'CW')}
                        </button>
                    </div>
                </div>

                {/* Presets Section */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Crop Presets</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {presets.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => handleAspectRatio(preset.value)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid',
                                    transition: 'all 0.2s',
                                    ...(aspectRatio === preset.value ? {
                                        background: 'rgba(37, 99, 235, 0.2)',
                                        borderColor: '#3b82f6',
                                        color: '#60a5fa'
                                    } : {
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderColor: 'transparent',
                                        color: '#9ca3af'
                                    })
                                }}
                                onMouseEnter={(e) => {
                                    if (aspectRatio !== preset.value) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.color = '#ffffff';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (aspectRatio !== preset.value) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.color = '#9ca3af';
                                    }
                                }}
                                title={preset.label}
                            >
                                {preset.icon}
                                <span style={{ fontSize: '10px', fontWeight: '500' }}>{preset.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
                {/* Top Bar */}
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 50, display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(23, 23, 23, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '9999px',
                            color: '#ffffff',
                            transition: 'all 0.2s',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            backdropFilter: 'blur(12px)',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(38, 38, 38, 0.8)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(23, 23, 23, 0.8)';
                        }}
                    >
                        Cancel
                    </button>
                    {isDirty && (
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#2563eb',
                                borderRadius: '9999px',
                                color: '#ffffff',
                                transition: 'all 0.2s',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                border: 'none'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#1d4ed8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#2563eb';
                            }}
                        >
                            {renderIcon(icons?.check, 16, undefined, 'Save')}
                            Save
                        </button>
                    )}
                </div>

                {/* Main Editor */}
                <div style={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden', background: '#0a0a0a', position: 'relative' }}>
                    <cropper-canvas
                        ref={canvasRef}
                        background
                        style={{ width: '100%', height: '100%' }}
                        onAction={onInteract}
                        onChange={onInteract}
                    >
                        <cropper-image
                            key={imageKey}
                            ref={imageRef}
                            src={src}
                            alt="Edit"
                            rotatable
                            scalable
                            skewable
                            translatable
                        ></cropper-image>
                        <cropper-shade hidden></cropper-shade>

                        {mode === 'crop' && (
                            <cropper-handle action="select" plain></cropper-handle>
                        )}
                        {mode === 'pan' && (
                            <cropper-handle action="move" plain></cropper-handle>
                        )}

                        <cropper-selection
                            id="cropper-selection"
                            ref={selectionRef}
                            key={aspectRatio || 'free'}
                            movable
                            resizable
                            aspect-ratio={aspectRatio}
                            initial-coverage="0.9"
                        >
                            <cropper-grid role="grid" covered></cropper-grid>
                            <cropper-crosshair centered></cropper-crosshair>
                            <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>
                            <cropper-handle action="n-resize"></cropper-handle>
                            <cropper-handle action="e-resize"></cropper-handle>
                            <cropper-handle action="s-resize"></cropper-handle>
                            <cropper-handle action="w-resize"></cropper-handle>
                            <cropper-handle action="ne-resize"></cropper-handle>
                            <cropper-handle action="nw-resize"></cropper-handle>
                            <cropper-handle action="se-resize"></cropper-handle>
                            <cropper-handle action="sw-resize"></cropper-handle>
                        </cropper-selection>
                    </cropper-canvas>
                </div>

                {/* Bottom Toolbar - Simplified since we moved rotation */}
                <div style={{ height: '64px', background: '#171717', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '0 1rem', zIndex: 50 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '0.25rem' }}>
                        <button
                            onClick={() => setMode('pan')}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '0.25rem',
                                color: '#ffffff',
                                transition: 'background-color 0.2s',
                                background: mode === 'pan' ? '#3b82f6' : 'transparent',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                if (mode !== 'pan') {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (mode !== 'pan') {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                            title="Pan Mode"
                        >
                            {renderIcon(icons?.hand, 18, undefined, 'Pan')}
                        </button>
                        <button
                            onClick={() => setMode('crop')}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '0.25rem',
                                color: '#ffffff',
                                transition: 'background-color 0.2s',
                                background: mode === 'crop' ? '#3b82f6' : 'transparent',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                if (mode !== 'crop') {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (mode !== 'crop') {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                            title="Crop Mode"
                        >
                            {renderIcon(icons?.crop, 18, undefined, 'Crop')}
                        </button>
                    </div>

                    <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.1)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '0.25rem' }}>
                        <button
                            onClick={() => handleFlip('x')}
                            style={{ padding: '0.5rem', borderRadius: '0.25rem', color: '#ffffff', transition: 'background-color 0.2s', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                            title="Flip Horizontal"
                        >
                            {renderIcon(icons?.flipHorizontal, 18, undefined, 'H')}
                        </button>
                        <button
                            onClick={() => handleFlip('y')}
                            style={{ padding: '0.5rem', borderRadius: '0.25rem', color: '#ffffff', transition: 'background-color 0.2s', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                            title="Flip Vertical"
                        >
                            {renderIcon(icons?.flipVertical, 18, undefined, 'V')}
                        </button>
                    </div>

                    <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.1)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '0.25rem' }}>
                        <button
                            onClick={() => handleZoom(0.1)}
                            style={{ padding: '0.5rem', borderRadius: '0.25rem', color: '#ffffff', transition: 'background-color 0.2s', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                            title="Zoom In"
                        >
                            {renderIcon(icons?.zoomIn, 18, undefined, '+')}
                        </button>
                        <button
                            onClick={() => handleZoom(-0.1)}
                            style={{ padding: '0.5rem', borderRadius: '0.25rem', color: '#ffffff', transition: 'background-color 0.2s', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                            title="Zoom Out"
                        >
                            {renderIcon(icons?.zoomOut, 18, undefined, '-')}
                        </button>
                    </div>

                    <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.1)' }} />

                    <button
                        onClick={handleReset}
                        style={{ padding: '0.5rem', borderRadius: '0.25rem', color: '#ffffff', transition: 'all 0.2s', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.color = '#f87171';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        title="Reset"
                    >
                        {renderIcon(icons?.undo, 18, undefined, 'Reset')}
                    </button>
                </div>
            </div>
        </div>
    );
};
